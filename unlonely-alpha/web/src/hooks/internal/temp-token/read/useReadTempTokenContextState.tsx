import { useCallback, useEffect, useMemo } from "react";
import { Contract, NULL_ADDRESS } from "../../../../constants";
import { getContractFromNetwork } from "../../../../utils/contract";
import { useNetworkContext } from "../../../context/useNetwork";
import { useLazyQuery } from "@apollo/client";
import { isAddressEqual } from "viem";
import { usePublicClient } from "wagmi";
import { GET_TEMP_TOKENS_QUERY } from "../../../../constants/queries";
import {
  GetTempTokensQuery,
  TempToken,
  TempTokenType,
  TempTokenWithBalance,
} from "../../../../generated/graphql";
import TempTokenAbi from "../../../../constants/abi/TempTokenV1.json";
import { ContractData } from "../../../../constants/types";
import useUpdateTempTokenHasRemainingFundsForCreator from "../../../server/temp-token/useUpdateTempTokenHasRemainingFundsForCreator";
import {
  UseReadTempTokenTxsType,
  useReadTempTokenTxs,
  useReadTempTokenTxsInitial,
} from "./useReadTempTokenTxs";
import { useChannelContext } from "../../../context/useChannel";
import {
  UseReadTempTokenGlobalStateType,
  useReadTempTokenGlobalState,
  useReadTempTokenGlobalStateInitial,
} from "./useReadTempTokenGlobalState";

export type UseReadTempTokenContextStateType = {
  gameState: UseReadTempTokenGlobalStateType;
  currentTempTokenContract: ContractData;
  lastInactiveTempTokenContract: ContractData;
  onMintEvent: (totalSupply: bigint, highestTotalSupply: bigint) => void;
  onBurnEvent: (totalSupply: bigint) => void;
  onReachThresholdEvent: (newEndTimestamp: bigint) => void;
  onSendRemainingFundsToWinnerEvent: (
    tokenAddress: string,
    tokenIsCurrentlyActive: boolean
  ) => void;
} & UseReadTempTokenTxsType;

export const useReadTempTokenInitialState: UseReadTempTokenContextStateType = {
  gameState: useReadTempTokenGlobalStateInitial,
  currentTempTokenContract: {
    address: NULL_ADDRESS,
    abi: undefined,
    chainId: 0,
  },
  lastInactiveTempTokenContract: {
    address: NULL_ADDRESS,
    abi: undefined,
    chainId: 0,
  },
  onMintEvent: () => undefined,
  onBurnEvent: () => undefined,
  onReachThresholdEvent: () => undefined,
  onSendRemainingFundsToWinnerEvent: () => undefined,
  ...useReadTempTokenTxsInitial,
};

export const useReadTempTokenContextState = () => {
  const { channel } = useChannelContext();
  const { channelQueryData, isOwner } = channel;
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const publicClient = usePublicClient();
  const globalState = useReadTempTokenGlobalState();

  const factoryContract = getContractFromNetwork(
    Contract.TEMP_TOKEN_FACTORY_V1,
    localNetwork
  );

  const tempTokenContract: ContractData = useMemo(() => {
    if (globalState.currentActiveTokenAddress === NULL_ADDRESS) {
      return {
        address: NULL_ADDRESS,
        abi: undefined,
        chainId: localNetwork.config.chainId,
      };
    }
    return {
      address: globalState.currentActiveTokenAddress as `0x${string}`,
      abi: TempTokenAbi,
      chainId: localNetwork.config.chainId,
    };
  }, [globalState.currentActiveTokenAddress, localNetwork.config.chainId]);

  const lastInactiveTempTokenContract: ContractData = useMemo(() => {
    if (globalState.lastInactiveTokenAddress === NULL_ADDRESS) {
      return {
        address: NULL_ADDRESS,
        abi: undefined,
        chainId: localNetwork.config.chainId,
      };
    }
    return {
      address: globalState.lastInactiveTokenAddress as `0x${string}`,
      abi: TempTokenAbi,
      chainId: localNetwork.config.chainId,
    };
  }, [globalState.lastInactiveTokenAddress, localNetwork.config.chainId]);

  /**
   * functions to run when specific events are detected, not exposed outside of this hook,
   */
  const onMintEvent = useCallback(
    async (totalSupply: bigint, highestTotalSupply: bigint) => {
      globalState.handleCurrentActiveTokenTotalSupply(totalSupply);
      globalState.handleCurrentActiveTokenHighestTotalSupply(
        highestTotalSupply
      );
    },
    []
  );

  const onBurnEvent = useCallback(async (totalSupply: bigint) => {
    globalState.handleCurrentActiveTokenTotalSupply(totalSupply);
  }, []);

  const onReachThresholdEvent = useCallback(async (newEndTimestamp: bigint) => {
    globalState.handleCurrentActiveTokenHasHitTotalSupplyThreshold(true);
    globalState.handleCurrentActiveTokenEndTimestamp(newEndTimestamp);
    globalState.handleIsGameSuccess(true);
    globalState.handleIsSuccessGameModalOpen(true);
  }, []);

  /**
   * function to run when sending remaining funds to winner
   * ideally to be called on an inactive token to reset the state and allow for normal token creation flow
   * but if a current token had just turned inactive and the funds have or have not been sent, what does the ui look like?
   */
  const onSendRemainingFundsToWinnerEvent = useCallback(
    async (tokenAddress: string, tokenIsCurrentlyActive: boolean) => {
      if (
        tokenIsCurrentlyActive &&
        isAddressEqual(
          tokenAddress as `0x${string}`,
          globalState.currentActiveTokenAddress as `0x${string}`
        )
      ) {
        globalState.handleCurrentActiveTokenSymbol("");
        globalState.handleCurrentActiveTokenAddress(NULL_ADDRESS);
        globalState.handleCurrentActiveTokenEndTimestamp(undefined);
        globalState.handleCurrentActiveTokenTotalSupply(BigInt(0));
        globalState.handleCurrentActiveTokenHasHitTotalSupplyThreshold(false);
        globalState.handleCurrentActiveTokenTotalSupplyThreshold(BigInt(0));
        globalState.handleCurrentActiveTokenIsAlwaysTradable(false);
        globalState.handleCurrentActiveTokenHighestTotalSupply(BigInt(0));
        globalState.handleCurrentActiveTokenCreationBlockNumber(BigInt(0));
      }
      if (
        !tokenIsCurrentlyActive &&
        isAddressEqual(
          tokenAddress as `0x${string}`,
          globalState.lastInactiveTokenAddress as `0x${string}`
        )
      ) {
        globalState.handleLastInactiveTokenAddress(NULL_ADDRESS);
        globalState.handleLastInactiveTokenBalance(BigInt(0));
        globalState.handleLastInactiveTokenSymbol("");
      }
    },
    [
      globalState.currentActiveTokenAddress,
      globalState.lastInactiveTokenAddress,
    ]
  );

  const readTempTokenTxs = useReadTempTokenTxs({
    tokenCreationBlockNumber: globalState.currentActiveTokenCreationBlockNumber,
    baseClient: publicClient,
    tempTokenContract,
  });

  /**
   * read for channel's temp token data on mount
   */
  const [getTempTokensQuery] = useLazyQuery<GetTempTokensQuery>(
    GET_TEMP_TOKENS_QUERY,
    {
      fetchPolicy: "network-only",
    }
  );

  const { updateTempTokenHasRemainingFundsForCreator } =
    useUpdateTempTokenHasRemainingFundsForCreator({});

  useEffect(() => {
    const init = async () => {
      if (!(Number(channelQueryData?.id ?? "0") > 0)) return;
      try {
        const getTempTokenQueryRes = await getTempTokensQuery({
          variables: {
            data: {
              channelId: Number(channelQueryData?.id ?? "0"),
              chainId: localNetwork.config.chainId,
              tokenType: TempTokenType.SingleMode,
              factoryAddress: factoryContract.address as `0x${string}`,
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
        const latestActiveToken = activeTokens?.[0];
        if (latestActiveToken) {
          globalState.handleCurrentActiveTokenCreationBlockNumber(
            BigInt(latestActiveToken.creationBlockNumber)
          );
          globalState.handleCurrentActiveTokenSymbol(latestActiveToken.symbol);
          const [
            endTimestamp,
            totalSupply,
            highestTotalSupply,
            totalSupplyThreshold,
            isAlwaysTradeable,
            hasHitTotalSupplyThreshold,
          ] = await Promise.all([
            publicClient.readContract({
              address: latestActiveToken.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "endTimestamp",
            }),
            publicClient.readContract({
              address: latestActiveToken.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "totalSupply",
            }),
            publicClient.readContract({
              address: latestActiveToken.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "highestTotalSupply",
            }),
            publicClient.readContract({
              address: latestActiveToken.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "totalSupplyThreshold",
            }),
            publicClient.readContract({
              address: latestActiveToken.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "isAlwaysTradeable",
            }),
            publicClient.readContract({
              address: latestActiveToken.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "hasHitTotalSupplyThreshold",
            }),
          ]);
          console.log(
            "latestActiveToken",
            latestActiveToken,
            endTimestamp,
            totalSupply,
            highestTotalSupply,
            totalSupplyThreshold,
            isAlwaysTradeable,
            hasHitTotalSupplyThreshold
          );
          globalState.handleCurrentActiveTokenEndTimestamp(
            BigInt(String(endTimestamp))
          );
          globalState.handleCurrentActiveTokenAddress(
            latestActiveToken.tokenAddress
          );
          globalState.handleCurrentActiveTokenTotalSupply(
            BigInt(String(totalSupply))
          );
          globalState.handleCurrentActiveTokenTotalSupplyThreshold(
            BigInt(String(totalSupplyThreshold))
          );
          globalState.handleCurrentActiveTokenIsAlwaysTradable(
            Boolean(isAlwaysTradeable)
          );
          globalState.handleCurrentActiveTokenHasHitTotalSupplyThreshold(
            Boolean(hasHitTotalSupplyThreshold)
          );
          globalState.handleCurrentActiveTokenHighestTotalSupply(
            BigInt(String(highestTotalSupply))
          );
        }
      } catch (e) {
        console.error("getTempTokensQuery", e);
      }
    };
    init();
  }, [channelQueryData?.id, localNetwork.config.chainId]);

  useEffect(() => {
    const init = async () => {
      if (Number(channelQueryData?.id ?? "0") > 0 && isOwner) {
        const res = await updateTempTokenHasRemainingFundsForCreator({
          channelId: Number(channelQueryData?.id ?? "0"),
          chainId: localNetwork.config.chainId,
          tokenType: TempTokenType.SingleMode,
        });
        const tempTokensWithNonZeroBalances = res?.res;

        const nonNullListOfTokensWithNonZeroBalances =
          tempTokensWithNonZeroBalances?.filter(
            (token): token is TempTokenWithBalance => token !== null
          );
        if (
          nonNullListOfTokensWithNonZeroBalances &&
          nonNullListOfTokensWithNonZeroBalances.length > 0 &&
          isOwner
        ) {
          const lastInactiveTokenWithBalance =
            nonNullListOfTokensWithNonZeroBalances[0];
          if (lastInactiveTokenWithBalance.isAlwaysTradeable) return;
          globalState.handleLastInactiveTokenAddress(
            lastInactiveTokenWithBalance.tokenAddress
          );
          globalState.handleLastInactiveTokenSymbol(
            lastInactiveTokenWithBalance.symbol
          );
          globalState.handleLastInactiveTokenBalance(
            BigInt(lastInactiveTokenWithBalance.balance)
          );
        }
      }
    };
    init();
  }, [channelQueryData?.id, localNetwork.config.chainId, isOwner]);

  return {
    gameState: globalState,
    currentTempTokenContract: tempTokenContract,
    lastInactiveTempTokenContract: lastInactiveTempTokenContract,
    onMintEvent,
    onBurnEvent,
    onReachThresholdEvent,
    onSendRemainingFundsToWinnerEvent,
    ...readTempTokenTxs,
  };
};
