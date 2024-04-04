import { useCallback, useEffect, useMemo, useState } from "react";
import { Contract, NULL_ADDRESS } from "../../../constants";
import { getContractFromNetwork } from "../../../utils/contract";
import { useNetworkContext } from "../../context/useNetwork";
import { useLazyQuery } from "@apollo/client";
import { Log, isAddressEqual } from "viem";
import { useContractEvent, usePublicClient } from "wagmi";
import { GET_TEMP_TOKENS_QUERY } from "../../../constants/queries";
import { GetTempTokensQuery, TempToken, TempTokenWithBalance } from "../../../generated/graphql";
import { UseChannelDetailsType } from "../useChannelDetails";
import TempTokenAbi from "../../../constants/abi/TempTokenV1.json";
import { ContractData } from "../../../constants/types";
import useUpdateTempTokenHasRemainingFundsForCreator from "../../server/temp-token/useUpdateTempTokenHasRemainingFundsForCreator";
import { useUser } from "../../context/useUser";

export type UseReadTempTokenStateType = {
  currentActiveTokenSymbol: string;
  currentActiveTokenAddress: string;
  currentActiveTokenEndTimestamp?: bigint;
  currentActiveTokenTotalSupply: bigint;
  currentActiveTokenHasHitTotalSupplyThreshold: boolean;
  currentActiveTokenTotalSupplyThreshold: bigint;
  currentActiveTokenIsAlwaysTradable: boolean;
  currentActiveTokenHighestTotalSupply: bigint;
  currentActiveTokenCreationBlockNumber: bigint;
  lastInactiveTokenAddress: string;
  lastInactiveTokenBalance: bigint;
  currentTempTokenContract: ContractData;
  isPermanentGameModalOpen: boolean;
  isSuccessGameModalOpen: boolean;
  isFailedGameModalOpen: boolean;
  onMintEvent: (totalSupply: bigint, highestTotalSupply: bigint) => void;
  onBurnEvent: (totalSupply: bigint) => void;
  onReachThresholdEvent: (newEndTimestamp: bigint) => void;
  onDurationIncreaseEvent: (newEndTimestamp: bigint) => void;
  onAlwaysTradeableEvent: () => void;
  onThresholdUpdateEvent: (newThreshold: bigint) => void;
  onSendRemainingFundsToWinner: (tokenAddress: string, tokenIsCurrent: boolean) => void;
  handleIsPermanentGameModalOpen: (value: boolean) => void;
  handleIsSuccessGameModalOpen: (value: boolean) => void;
  handleIsFailedGameModalOpen: (value: boolean) => void;
};

export const useReadTempTokenInitialState: UseReadTempTokenStateType = {
  currentActiveTokenSymbol: "",
  currentActiveTokenAddress: NULL_ADDRESS,
  currentActiveTokenEndTimestamp: undefined,
  currentActiveTokenTotalSupply: BigInt(0),
  currentActiveTokenHasHitTotalSupplyThreshold: false,
  currentActiveTokenTotalSupplyThreshold: BigInt(0),
  currentActiveTokenIsAlwaysTradable: false,
  currentActiveTokenHighestTotalSupply: BigInt(0),
  currentActiveTokenCreationBlockNumber: BigInt(0),
  lastInactiveTokenAddress: NULL_ADDRESS,
  lastInactiveTokenBalance: BigInt(0),
  currentTempTokenContract: {
    address: NULL_ADDRESS,
    abi: undefined,
    chainId: 0,
  },
  isPermanentGameModalOpen: false,
  isSuccessGameModalOpen: false,
  isFailedGameModalOpen: false,
  onMintEvent: () => undefined,
  onBurnEvent: () => undefined,
  onReachThresholdEvent: () => undefined,
  onDurationIncreaseEvent: () => undefined,
  onAlwaysTradeableEvent: () => undefined,
  onThresholdUpdateEvent: () => undefined,
  onSendRemainingFundsToWinner: () => undefined,
  handleIsPermanentGameModalOpen: () => undefined,
  handleIsSuccessGameModalOpen: () => undefined,
  handleIsFailedGameModalOpen: () => undefined,
};

export const useReadTempTokenState = (  channelDetails: UseChannelDetailsType
    ): UseReadTempTokenStateType => {
      const { userAddress } = useUser();
      
    const { network } = useNetworkContext();
    const { localNetwork } = network;
    const publicClient = usePublicClient();

    // currentActiveTokenAddress is set on mount or by creation event
    const [currentActiveTokenAddress, setCurrentActiveTokenAddress] =
    useState<string>(NULL_ADDRESS);
  const [currentActiveTokenEndTimestamp, setCurrentActiveTokenEndTimestamp] =
    useState<bigint | undefined>(undefined);
  const [currentActiveTokenSymbol, setCurrentActiveTokenSymbol] = useState<string>("");
  const [
    currentActiveTokenCreationBlockNumber,
    setCurrentActiveTokenCreationBlockNumber,
  ] = useState<bigint>(BigInt(0));
  const [
    currentActiveTokenTotalSupply,
    setCurrentActiveTokenTotalSupply,
  ] = useState<bigint>(BigInt(0));
  const [
    currentActiveTokenHasHitTotalSupplyThreshold,
    setCurrentActiveTokenHasHitTotalSupplyThreshold,
  ] = useState<boolean>(false);
  const [
    currentActiveTokenTotalSupplyThreshold,
    setCurrentActiveTokenTotalSupplyThreshold,
  ] = useState<bigint>(BigInt(0));
  const [
    currentActiveTokenIsAlwaysTradable,
    setCurrentActiveTokenIsAlwaysTradable,
  ] = useState<boolean>(false);
  const [
    currentActiveTokenHighestTotalSupply,
    setCurrentActiveTokenHighestTotalSupply,
  ] = useState<bigint>(BigInt(0));

  const [lastInactiveTokenAddress, setLastInactiveTokenAddress] = useState<string>(NULL_ADDRESS);
  const [lastInactiveTokenBalance, setLastInactiveTokenBalance] = useState<bigint>(BigInt(0));

  const [isPermanentGameModalOpen, setIsPermanentGameModalOpen] = useState<boolean>(false); // when the token becomes always tradeable
  const [isSuccessGameModalOpen, setIsSuccessGameModalOpen] =
  useState<boolean>(false); // when the token hits the total supply threshold
const [isFailedGameModalOpen, setIsFailedGameModalOpen] =
  useState<boolean>(false); // when the token expires via countdown

  const isOwner = useMemo(() => userAddress === channelDetails?.channelQueryData?.owner.address, [userAddress, channelDetails?.channelQueryData?.owner.address])
    
  const factoryContract = getContractFromNetwork(
        Contract.TEMP_TOKEN_FACTORY_V1,
        localNetwork
      );

      const tempTokenContract: ContractData = useMemo(() => {
        if (!currentActiveTokenAddress) {
          return {
            address: NULL_ADDRESS,
            abi: undefined,
            chainId: localNetwork.config.chainId,
          };
        }
        return {
          address: currentActiveTokenAddress as `0x${string}`,
          abi: TempTokenAbi,
          chainId: localNetwork.config.chainId,
        };
      }, [currentActiveTokenAddress, localNetwork.config.chainId]);
    

      /**
       * listen for incoming temp token created events
       */
    
    const [incomingTempTokenCreatedLogs, setIncomingTempTokenCreatedLogs] = useState<Log[]>([]);

    useContractEvent({
        address: factoryContract.address,
        abi: factoryContract.abi,
        eventName: "TempTokenCreated",
        listener(logs) {
          console.log("detected TempTokenCreated event", logs);
          const init = async () => {
            setIncomingTempTokenCreatedLogs(logs);
          };
          init();
        },
      });
    
      useEffect(() => {
        if (incomingTempTokenCreatedLogs) handleTempTokenCreatedUpdate(incomingTempTokenCreatedLogs);
      }, [incomingTempTokenCreatedLogs]);
    
      const handleTempTokenCreatedUpdate = async (logs: Log[]) => {
        if (logs.length === 0) return;
        const filteredLogsByOwner = logs.filter(
          (log: any) =>
            isAddressEqual(log.args.owner as `0x${string}`, channelDetails.channelQueryData?.owner.address as `0x${string}`)
        );
        const sortedLogs = filteredLogsByOwner.sort(
          (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
        );
        if (sortedLogs.length === 0) return;
        const latestLog: any = sortedLogs[sortedLogs.length - 1];
        const newEndTimestamp = latestLog?.args.endTimestamp as bigint;
        const newTokenAddress = latestLog?.args.tokenAddress as `0x${string}`;
        const newTokenSymbol = latestLog?.args.symbol as string;
        const newTokenCreationBlockNumber = latestLog?.args.creationBlockNumber as bigint;
        const newTokenTotalSupplyThreshold = latestLog?.args.totalSupplyThreshold as bigint;

        setCurrentActiveTokenEndTimestamp(newEndTimestamp);
        setCurrentActiveTokenCreationBlockNumber(newTokenCreationBlockNumber);
        setCurrentActiveTokenAddress(newTokenAddress);
        setCurrentActiveTokenSymbol(newTokenSymbol);
        setCurrentActiveTokenTotalSupplyThreshold(newTokenTotalSupplyThreshold);
      };
    
      /**
       * read for channel's temp token data on mount
       */
      const [getTempTokensQuery] = useLazyQuery<GetTempTokensQuery>(
        GET_TEMP_TOKENS_QUERY,
        {
          fetchPolicy: "network-only",
        }
      );

      const { updateTempTokenHasRemainingFundsForCreator } = useUpdateTempTokenHasRemainingFundsForCreator({});

      useEffect(() => {
        const init = async () => {
          if (!(Number(channelDetails.channelQueryData?.id ?? "0") > 0)) return;
          try {
            const getTempTokenQueryRes = await getTempTokensQuery({
              variables: {
                data: {
                  channelId: Number(channelDetails.channelQueryData?.id ?? "0"),
                  chainId: localNetwork.config.chainId,
                  fulfillAllNotAnyConditions: true,
                },
              },
            });
            const listOfTokens = getTempTokenQueryRes.data?.getTempTokens;
            const nonNullListOfTokens = listOfTokens?.filter(
              (token): token is TempToken => token !== null
            );
            const activeTokens = nonNullListOfTokens?.filter(
              (token) => token.endUnixTimestamp > Math.floor(Date.now() / 1000)
            );
            const latestActiveToken = activeTokens?.[0]
            if (latestActiveToken) {
              setCurrentActiveTokenCreationBlockNumber(BigInt(latestActiveToken.creationBlockNumber));
              setCurrentActiveTokenSymbol(latestActiveToken.symbol);
              const [endTimestamp, totalSupply, highestTotalSupply, totalSupplyThreshold, isAlwaysTradeable, hasHitTotalSupplyThreshold] = await Promise.all([publicClient.readContract({
                address: latestActiveToken.tokenAddress as `0x${string}`,
                abi: TempTokenAbi,
                functionName: "endTimestamp"
              }),
              publicClient.readContract({
                address: latestActiveToken.tokenAddress as `0x${string}`,
                abi: TempTokenAbi,
                functionName: "totalSupply"
              }),
              publicClient.readContract({
                address: latestActiveToken.tokenAddress as `0x${string}`,
                abi: TempTokenAbi,
                functionName: "highestTotalSupply"
              }),
              publicClient.readContract({
                address: latestActiveToken.tokenAddress as `0x${string}`,
                abi: TempTokenAbi,
                functionName: "totalSupplyThreshold"
              }),
              publicClient.readContract({
                address: latestActiveToken.tokenAddress as `0x${string}`,
                abi: TempTokenAbi,
                functionName: "isAlwaysTradeable"
              }),
              publicClient.readContract({
                address: latestActiveToken.tokenAddress as `0x${string}`,
                abi: TempTokenAbi,
                functionName: "hasHitTotalSupplyThreshold"
              })]);
              console.log("latestActiveToken", latestActiveToken, endTimestamp, totalSupply, highestTotalSupply, totalSupplyThreshold, isAlwaysTradeable, hasHitTotalSupplyThreshold)
              setCurrentActiveTokenEndTimestamp(
                BigInt(String(endTimestamp))
              );
              setCurrentActiveTokenAddress(latestActiveToken.tokenAddress);
              setCurrentActiveTokenTotalSupply(BigInt(String(totalSupply)));
              setCurrentActiveTokenTotalSupplyThreshold(BigInt(String(totalSupplyThreshold)));
              setCurrentActiveTokenIsAlwaysTradable(Boolean(isAlwaysTradeable));
              setCurrentActiveTokenHasHitTotalSupplyThreshold(Boolean(hasHitTotalSupplyThreshold));
              setCurrentActiveTokenHighestTotalSupply(BigInt(String(highestTotalSupply)));
            }
          } catch (e) {
            console.error("getTempTokensQuery", e);
          }
        };
        init();
      }, [channelDetails.channelQueryData?.id, localNetwork.config.chainId]); // todo: make a new hook just for inactive tokens with non zero balances

      useEffect(() => {
        const init = async () => {
          if (Number(channelDetails.channelQueryData?.id ?? "0") > 0 && isOwner) {
            const res = await updateTempTokenHasRemainingFundsForCreator({
              channelId: Number(channelDetails.channelQueryData?.id ?? "0"),
              chainId: localNetwork.config.chainId,
            })
            const tempTokensWithNonZeroBalances = res?.res;
            console.log("tempTokensWithNonZeroBalances", tempTokensWithNonZeroBalances)
            const nonNullListOfTokensWithNonZeroBalances = tempTokensWithNonZeroBalances?.filter(
              (token): token is TempTokenWithBalance => token !== null
            );
            if (nonNullListOfTokensWithNonZeroBalances && nonNullListOfTokensWithNonZeroBalances.length > 0 && isOwner) {
              const lastInactiveTokenWithBalance = nonNullListOfTokensWithNonZeroBalances[0];
              if (lastInactiveTokenWithBalance.isAlwaysTradeable) return;
              setLastInactiveTokenAddress(lastInactiveTokenWithBalance.tokenAddress);
              setLastInactiveTokenBalance(BigInt(lastInactiveTokenWithBalance.balance));
            }
          }
        }
        init()
      }, [channelDetails.channelQueryData?.id, localNetwork.config.chainId, isOwner])
      /**
       * functions to run when specific events are detected
       */
      const onMintEvent = useCallback(async (totalSupply: bigint, highestTotalSupply: bigint) => {
        setCurrentActiveTokenTotalSupply(totalSupply);
        setCurrentActiveTokenHighestTotalSupply(highestTotalSupply);
      }, []);

      const onBurnEvent = useCallback(async (totalSupply: bigint) => {
        setCurrentActiveTokenTotalSupply(totalSupply);
      }, []);

      const onReachThresholdEvent = useCallback(async (newEndTimestamp: bigint) => {
        setCurrentActiveTokenHasHitTotalSupplyThreshold(true);
        setCurrentActiveTokenEndTimestamp(newEndTimestamp);
        setIsSuccessGameModalOpen(true);
      }, []);

      const onDurationIncreaseEvent = useCallback(async (newEndTimestamp: bigint) => {
        setCurrentActiveTokenEndTimestamp(newEndTimestamp);
      }, []);

      const onAlwaysTradeableEvent = useCallback(async () => {
        setCurrentActiveTokenIsAlwaysTradable(true);
      }, []);

      const onThresholdUpdateEvent = useCallback(async (newThreshold: bigint) => {
        setCurrentActiveTokenTotalSupplyThreshold(newThreshold);
        setCurrentActiveTokenHasHitTotalSupplyThreshold(false);
      }, []);

      /**
       * function to run when sending remaining funds to winner
       * ideally to be called on an inactive token to reset the state and allow for normal token creation flow
       * but if a current token had just turned inactive and the funds have or have not been sent, what does the ui look like?
       */
      const onSendRemainingFundsToWinner = useCallback(async (tokenAddress: string, tokenIsCurrent: boolean) => {
        if (tokenIsCurrent && tokenAddress === currentActiveTokenAddress) {
          setCurrentActiveTokenSymbol("");
          setCurrentActiveTokenAddress(NULL_ADDRESS);
          setCurrentActiveTokenEndTimestamp(undefined);
          setCurrentActiveTokenTotalSupply(BigInt(0));
          setCurrentActiveTokenHasHitTotalSupplyThreshold(false);
          setCurrentActiveTokenTotalSupplyThreshold(BigInt(0));
          setCurrentActiveTokenIsAlwaysTradable(false);
          setCurrentActiveTokenHighestTotalSupply(BigInt(0));
          setCurrentActiveTokenCreationBlockNumber(BigInt(0));
        }
        if (!tokenIsCurrent && tokenAddress === lastInactiveTokenAddress) {
          setLastInactiveTokenBalance(BigInt(0));
          setLastInactiveTokenAddress(NULL_ADDRESS);
        }
      }, [currentActiveTokenAddress]);

      /**
       * functions to handle modal state
       */

      const handleIsPermanentGameModalOpen = useCallback((value: boolean) => {
        setIsPermanentGameModalOpen(value);
      }, []);

      const handleIsSuccessGameModalOpen = useCallback((value: boolean) => {
        setIsSuccessGameModalOpen(value);
      }, []);

      const handleIsFailedGameModalOpen = useCallback((value: boolean) => {
        setIsFailedGameModalOpen(value);
      }, []);

      /**
       * listen for reach threshold event
       */

      const [incomingTempTokenTotalSupplyThresholdReachedLogs, setIncomingTempTokenTotalSupplyThresholdReachedLogs] = useState<Log[]>([]);

      useContractEvent({
        address: tempTokenContract.address,
        abi: tempTokenContract.abi,
        eventName: "TotalSupplyThresholdReached",
        listener(logs) {
          console.log("detected TotalSupplyThresholdReached event", logs);
          const init = async () => {
            setIncomingTempTokenTotalSupplyThresholdReachedLogs(logs);
          };
          init();
        }
      })
          
      useEffect(() => {
        if (incomingTempTokenTotalSupplyThresholdReachedLogs) handleTempTokenTotalSupplyThresholdReachedUpdate(incomingTempTokenTotalSupplyThresholdReachedLogs);
      }, [incomingTempTokenTotalSupplyThresholdReachedLogs]);

      const handleTempTokenTotalSupplyThresholdReachedUpdate = async (logs: Log[]) => {
        if (logs.length === 0) return;
        const filteredLogsByTokenAddress = logs.filter(
          (log: any) =>
          isAddressEqual((log.address as `0x${string}`), currentActiveTokenAddress as `0x${string}`)
        );
        const sortedLogs = filteredLogsByTokenAddress.sort(
          (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
        );
        if (sortedLogs.length === 0) return;
        const latestLog: any = sortedLogs[sortedLogs.length - 1];
        const newEndTimestamp = latestLog?.args.endTimestamp as bigint;
        onReachThresholdEvent(newEndTimestamp);
      };

      /**
       * listen for duration increase event
       */

      const [incomingTempTokenDurationExtendedLogs, setIncomingTempTokenDurationExtendedLogs] = useState<Log[]>([]);

      useContractEvent({
        address: tempTokenContract.address,
        abi: tempTokenContract.abi,
        eventName: "TokenDurationExtended",
        listener(logs) {
          console.log("detected TokenDurationExtended event", logs);
          const init = async () => {
            setIncomingTempTokenDurationExtendedLogs(logs);
          };
          init();
        }
      })

      useEffect(() => {
        if (incomingTempTokenDurationExtendedLogs) handleTempTokenDurationExtendedUpdate(incomingTempTokenDurationExtendedLogs);
      }, [incomingTempTokenDurationExtendedLogs]);

      const handleTempTokenDurationExtendedUpdate = async (logs: Log[]) => {
        if (logs.length === 0) return;
        const filteredLogsByTokenAddress = logs.filter(
          (log: any) =>
          isAddressEqual((log.address as `0x${string}`), currentActiveTokenAddress as `0x${string}`)
        );
        const sortedLogs = filteredLogsByTokenAddress.sort(
          (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
        );
        if (sortedLogs.length === 0) return;
        const latestLog: any = sortedLogs[sortedLogs.length - 1];
        const newEndTimestamp = latestLog?.args.endTimestamp as bigint;
        onDurationIncreaseEvent(newEndTimestamp);
      };

      /**
       * listen for always tradeable event
       */

      const [incomingTempTokenAlwaysTradeableSetLogs, setIncomingTempTokenAlwaysTradeableSetLogs] = useState<Log[]>([]);

      useContractEvent({
        address: tempTokenContract.address,
        abi: tempTokenContract.abi,
        eventName: "TokenAlwaysTradeableSet",
        listener(logs) {
          console.log("detected TokenAlwaysTradeableSet event", logs);
          const init = async () => {
            setIncomingTempTokenAlwaysTradeableSetLogs(logs);
          };
          init();
        }
      })

      useEffect(() => {
        if (incomingTempTokenAlwaysTradeableSetLogs) handleTempTokenAlwaysTradeableSetUpdate(incomingTempTokenAlwaysTradeableSetLogs);
      }, [incomingTempTokenAlwaysTradeableSetLogs]);

      const handleTempTokenAlwaysTradeableSetUpdate = async (logs: Log[]) => {
        if (logs.length === 0) return;
        const filteredLogsByTokenAddress = logs.filter(
          (log: any) =>
          isAddressEqual((log.address as `0x${string}`), currentActiveTokenAddress as `0x${string}`)
        );
        const sortedLogs = filteredLogsByTokenAddress.sort(
          (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
        );
        if (sortedLogs.length === 0) return;
        onAlwaysTradeableEvent();
      };

      /**
       * listen for threshold update event
       */

      const [incomingTempTokenTotalSupplyThresholdUpdatedLogs, setIncomingTempTokenTotalSupplyThresholdUpdatedLogs] = useState<Log[]>([]);

      useContractEvent({
        address: tempTokenContract.address,
        abi: tempTokenContract.abi,
        eventName: "TotalSupplyThresholdUpdated",
        listener(logs) {
          console.log("detected TotalSupplyThresholdUpdated event", logs);
          const init = async () => {
            setIncomingTempTokenTotalSupplyThresholdUpdatedLogs(logs);
          };
          init();
        }
      })

      useEffect(() => {
        if (incomingTempTokenTotalSupplyThresholdUpdatedLogs) handleTempTokenTotalSupplyThresholdUpdatedUpdate(incomingTempTokenTotalSupplyThresholdUpdatedLogs);
      }, [incomingTempTokenTotalSupplyThresholdUpdatedLogs]);

      const handleTempTokenTotalSupplyThresholdUpdatedUpdate = async (logs: Log[]) => {
        if (logs.length === 0) return;
        const filteredLogsByTokenAddress = logs.filter(
          (log: any) =>
          isAddressEqual((log.address as `0x${string}`), currentActiveTokenAddress as `0x${string}`)

        );
        const sortedLogs = filteredLogsByTokenAddress.sort(
          (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
        );
        if (sortedLogs.length === 0) return;
        const latestLog: any = sortedLogs[sortedLogs.length - 1];
        const newThreshold = latestLog?.args.totalSupplyThreshold as bigint;
        onThresholdUpdateEvent(newThreshold);
      }

    return {
        currentActiveTokenSymbol,
        currentActiveTokenAddress,
        currentActiveTokenEndTimestamp,
        currentActiveTokenTotalSupply,
        currentActiveTokenHasHitTotalSupplyThreshold,
        currentActiveTokenTotalSupplyThreshold,
        currentActiveTokenIsAlwaysTradable,
        currentActiveTokenHighestTotalSupply,
        currentActiveTokenCreationBlockNumber,
        lastInactiveTokenAddress,
        lastInactiveTokenBalance,
        currentTempTokenContract: tempTokenContract,
        isPermanentGameModalOpen,
        isSuccessGameModalOpen,
        isFailedGameModalOpen,
        onMintEvent,
        onBurnEvent,
        onReachThresholdEvent,
        onDurationIncreaseEvent,
        onAlwaysTradeableEvent,
        onThresholdUpdateEvent,
        onSendRemainingFundsToWinner,
        handleIsPermanentGameModalOpen,
        handleIsFailedGameModalOpen,
        handleIsSuccessGameModalOpen,
    };
}