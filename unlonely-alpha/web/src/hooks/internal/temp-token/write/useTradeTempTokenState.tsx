import {
  ContractData,
  FetchBalanceResult,
  TradeableTokenTx,
} from "../../../../constants/types";
import TempTokenAbi from "../../../../constants/abi/TempTokenV1.json";
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import {
  InteractionType,
  NULL_ADDRESS,
  DEFAULT_TOKEN_TRADE_AMOUNT,
  PRE_SALE_PRICE_PER_TOKEN,
  CHAKRA_UI_TX_TOAST_DURATION,
} from "../../../../constants";
import { useNetworkContext } from "../../../context/useNetwork";
import {
  useGetMintCostAfterFees,
  useGetBurnProceedsAfterFees,
  useMint,
  useBurn,
} from "../../../contracts/useTempTokenV1";
import useDebounce from "../../useDebounce";
import { Flex, Box, useToast, Text } from "@chakra-ui/react";
import Link from "next/link";
import { isAddress } from "viem";
import centerEllipses from "../../../../utils/centerEllipses";
import {
  burnErrors,
  mintErrors,
} from "../../../../components/chat/VibesTokenExchange";
import {
  filteredInput,
  formatIncompleteNumber,
} from "../../../../utils/validation/input";
import { useChannelContext } from "../../../context/useChannel";
import { useUser } from "../../../context/useUser";
import { useBalance } from "wagmi";
import useUpdateTempTokenHighestTotalSupply from "../../../server/temp-token/useUpdateTempTokenHighestTotalSupply";
import useUpdateTempTokenHasHitTotalSupplyThreshold from "../../../server/temp-token/useUpdateTempTokenHasHitTotalSupplyThreshold";
import { returnDecodedTopics } from "../../../../utils/contract";

export type UseTradeTempTokenStateType = {
  amount: string;
  mintCostAfterFees: bigint;
  mintCostAfterFeesLoading: boolean;
  burnProceedsAfterFees: bigint;
  burnProceedsAfterFeesLoading: boolean;
  mintTxLoading: boolean;
  isRefetchingMint: boolean;
  burnTxLoading: boolean;
  isRefetchingBurn: boolean;
  errorMessage: string;
  userEthBalance?: FetchBalanceResult;

  mint?: () => Promise<any>;
  refetchMint: () => void;
  burn?: () => Promise<any>;
  refetchBurn: () => void;
  handleAmount: (event: any) => void;
  handleAmountDirectly: (input: string) => void;
};

export const useTradeTempTokenState = ({
  tokenAddress,
  tokenSymbol,
  tokenTxs,
  isPreSaleOngoing,
  callbackOnMintTxSuccess,
  callbackOnBurnTxSuccess,
}: {
  tokenAddress: string;
  tokenSymbol: string;
  tokenTxs: TradeableTokenTx[];
  isPreSaleOngoing: boolean;
  callbackOnMintTxSuccess?: () => void;
  callbackOnBurnTxSuccess?: () => void;
}): UseTradeTempTokenStateType => {
  const { walletIsConnected, userAddress, user } = useUser();

  const { chat, channel } = useChannelContext();
  const { channelQueryData } = channel;
  const { addToChatbot: addToChatbotForTempToken } = chat;
  const { network } = useNetworkContext();
  const { localNetwork, explorerUrl, matchingChain } = network;
  const toast = useToast();

  const canAddToChatbot_mint = useRef(false);
  const canAddToChatbot_burn = useRef(false);
  const [amount, setAmount] = useState<string>(
    String(DEFAULT_TOKEN_TRADE_AMOUNT)
  );
  const debouncedAmount = useDebounce(amount, 300);
  const amount_bigint = useMemo(
    () => BigInt(debouncedAmount as `${number}`),
    [debouncedAmount]
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const fetching = useRef(false);

  const tempTokenContract: ContractData = useMemo(() => {
    if (!tokenAddress) {
      return {
        address: NULL_ADDRESS,
        abi: undefined,
        chainId: localNetwork.config.chainId,
      };
    }
    return {
      address: tokenAddress as `0x${string}`,
      abi: TempTokenAbi,
      chainId: localNetwork.config.chainId,
    };
  }, [tokenAddress, localNetwork.config.chainId]);

  /**
   * ETH balance for the user
   */

  const { data: userEthBalance, refetch: refetchUserEthBalance } = useBalance({
    address: userAddress as `0x${string}`,
    enabled: isAddress(userAddress as `0x${string}`),
  });

  const {
    updateTempTokenHighestTotalSupply: call_updateDb_highestTotalSupply,
  } = useUpdateTempTokenHighestTotalSupply({
    onError: (e) => {
      console.log("useUpdateTempTokenHighestTotalSupply error", e);
    },
  });

  const {
    updateTempTokenHasHitTotalSupplyThreshold:
      call_updateDb_hasHitTotalSupplyThreshold,
  } = useUpdateTempTokenHasHitTotalSupplyThreshold({
    onError: (e) => {
      console.log("useUpdateTempTokenHasHitTotalSupplyThreshold error", e);
    },
  });

  /**
   * Contract cost reading and MINT and BURN functions
   */

  const {
    mintCostAfterFees,
    refetch: refetchMintCostAfterFees,
    loading: mintCostAfterFeesLoading,
  } = useGetMintCostAfterFees(amount_bigint, tempTokenContract);

  const {
    burnProceedsAfterFees,
    refetch: refetchBurnProceedsAfterFees,
    loading: burnProceedsAfterFeesLoading,
  } = useGetBurnProceedsAfterFees(amount_bigint, tempTokenContract);

  const {
    mint,
    refetch: refetchMint,
    isRefetchingMint,
    mintTxLoading,
  } = useMint(
    {
      amount: amount_bigint,
      value: isPreSaleOngoing
        ? BigInt(PRE_SALE_PRICE_PER_TOKEN * Number(amount_bigint))
        : mintCostAfterFees,
    },
    tempTokenContract,
    {
      onWriteSuccess: (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#287ab0" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.hash}`}
                passHref
              >
                mint pending, click to view
              </Link>
            </Box>
          ),
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
        canAddToChatbot_mint.current = true;
      },
      onWriteError: (error) => {
        console.log("mint write error", error);
        toast({
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
          render: () => (
            <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
              mint cancelled
            </Box>
          ),
        });
        canAddToChatbot_mint.current = false;
      },
      onTxSuccess: async (data) => {
        if (!canAddToChatbot_mint.current) return;
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                mint success, click to view
              </Link>
            </Box>
          ),
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
        if (channelQueryData) {
          console.log("mint success data", data);
          const topics = returnDecodedTopics(
            data.logs,
            tempTokenContract.abi,
            "Mint"
          );
          if (!topics) {
            console.log("mint success topics not found");
            canAddToChatbot_mint.current = false;
            setAmount(String(DEFAULT_TOKEN_TRADE_AMOUNT));
            return;
          }
          const args: any = topics.args;
          console.log("mint success args", args);
          const hasHitTotalSupplyThreshold =
            args.hasHitTotalSupplyThreshold as boolean;
          const highestTotalSupply = args.highestTotalSupply as bigint;
          const totalSupply = args.totalSupply as bigint;
          const tokenAddress = args.tokenAddress as `0x${string}`;
          const endTimestamp = args.endTimestamp as bigint;
          const title = `${
            user?.username ?? centerEllipses(args.account as `0x${string}`, 15)
          } bought ${Number(args.amount as bigint)} $${tokenSymbol}!`;

          /**
           * perform a check to see data.logs.length is greater than 2 to determine
           * if the totalSupplyThresholdReached event was emitted, if so include returned value into ably message
           */
          const hasTotalSupplyThresholdReachedEvent = data.logs.length > 2;
          addToChatbotForTempToken({
            username: user?.username ?? "",
            address: userAddress ?? "",
            taskType: InteractionType.BUY_TEMP_TOKENS,
            title,
            description: `${userAddress}:${Number(
              args.amount as bigint
            )}:${String(data.blockNumber)}:${tokenAddress}:${String(
              totalSupply
            )}:${String(highestTotalSupply)}:${String(
              hasTotalSupplyThresholdReachedEvent
                ? hasHitTotalSupplyThreshold
                : false
            )}:${String(endTimestamp)}`,
          });
          const promises: any[] = [
            call_updateDb_highestTotalSupply({
              tokenAddresses: [tokenAddress],
              newTotalSupplies: [String(highestTotalSupply)],
              chainId: localNetwork.config.chainId,
            }),
          ];
          if (
            hasTotalSupplyThresholdReachedEvent &&
            hasHitTotalSupplyThreshold
          ) {
            promises.push(
              call_updateDb_hasHitTotalSupplyThreshold({
                tokenAddressesSetTrue: [tokenAddress],
                tokenAddressesSetFalse: [],
                chainId: localNetwork.config.chainId,
              })
            );
          }
          try {
            await Promise.all(promises);
          } catch (err) {
            console.log("cannot update db on mint", err);
          }
          setAmount(String(DEFAULT_TOKEN_TRADE_AMOUNT));
          if (
            hasTotalSupplyThresholdReachedEvent &&
            hasHitTotalSupplyThreshold
          ) {
            // wait few seconds
            await new Promise((res) => setTimeout(res, 4000));
            const _title = `The $${tokenSymbol} token has hit the price goal and survives for another 24 hours! 🎉`;
            addToChatbotForTempToken({
              username: user?.username ?? "",
              address: userAddress ?? "",
              taskType: InteractionType.TEMP_TOKEN_REACHED_THRESHOLD,
              title: _title,
              description: "",
            });
          }
          callbackOnMintTxSuccess?.();
          canAddToChatbot_mint.current = false;
        }
      },
      onTxError: (error) => {
        console.log("mint error", error);
        let message =
          "Unknown error, please check the explorer for more details";
        Object.keys(mintErrors).forEach((key) => {
          if (String(error).includes(key)) {
            message = mintErrors[key];
          }
        });
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" p={2}>
              <Flex direction="column">
                <Text>mint error</Text>
                <Text fontSize="15px">{message}</Text>
              </Flex>
            </Box>
          ),
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
        canAddToChatbot_mint.current = false;
      },
    }
  );

  const {
    burn,
    refetch: refetchBurn,
    isRefetchingBurn,
    burnTxLoading,
  } = useBurn(
    {
      amount: amount_bigint,
    },
    tempTokenContract,
    {
      onWriteSuccess: (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#287ab0" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.hash}`}
                passHref
              >
                burn pending, click to view
              </Link>
            </Box>
          ),
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
        canAddToChatbot_burn.current = true;
      },
      onWriteError: (error) => {
        console.log("burn write error", error);
        toast({
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
          render: () => (
            <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
              burn cancelled
            </Box>
          ),
        });
        canAddToChatbot_burn.current = false;
      },
      onTxSuccess: async (data) => {
        if (!canAddToChatbot_burn.current) return;
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                burn success, click to view
              </Link>
            </Box>
          ),
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
        if (channelQueryData) {
          console.log("burn success data", data);
          const topics = returnDecodedTopics(
            data.logs,
            tempTokenContract.abi,
            "Burn"
          );
          if (!topics) {
            console.log("burn success topics not found");
            canAddToChatbot_burn.current = false;
            setAmount(String(DEFAULT_TOKEN_TRADE_AMOUNT));
            return;
          }
          const args: any = topics.args;
          console.log("burn success args", args);
          const tokenAddress = args.tokenAddress as `0x${string}`;
          const totalSupply = args.totalSupply as bigint;
          const title = `${
            user?.username ?? centerEllipses(args.account as `0x${string}`, 15)
          } sold ${Number(args.amount as bigint)} $${tokenSymbol}!`;
          addToChatbotForTempToken({
            username: user?.username ?? "",
            address: userAddress ?? "",
            taskType: InteractionType.SELL_TEMP_TOKENS,
            title,
            description: `${userAddress}:${Number(
              args.amount as bigint
            )}:${String(data.blockNumber)}:${tokenAddress}:${String(
              totalSupply
            )}`,
          });
          callbackOnBurnTxSuccess?.();
          canAddToChatbot_burn.current = false;
          setAmount(String(DEFAULT_TOKEN_TRADE_AMOUNT));
        }
      },
      onTxError: (error) => {
        console.log("burn error", error);
        let message =
          "Unknown error, please check the explorer for more details";
        Object.keys(burnErrors).forEach((key) => {
          if (String(error).includes(key)) {
            message = burnErrors[key];
          }
        });
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" p={2}>
              <Flex direction="column">
                <Text>burn error</Text>
                <Text fontSize="15px">{message}</Text>
              </Flex>
            </Box>
          ),
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
        canAddToChatbot_burn.current = false;
      },
    }
  );

  const handleAmount = useCallback(
    (event: any) => {
      const input = event.target.value;
      const filtered = filteredInput(input);
      if (Number(filtered) > DEFAULT_TOKEN_TRADE_AMOUNT && isPreSaleOngoing)
        return;
      setAmount(filtered);
    },
    [isPreSaleOngoing]
  );

  const handleAmountDirectly = useCallback((input: string) => {
    setAmount(input);
  }, []);

  /**
   * For every new transaction, fetch the new balances and costs
   */
  useEffect(() => {
    if (
      fetching.current ||
      !tempTokenContract.address ||
      !userAddress ||
      !walletIsConnected
    )
      return;
    const fetch = async () => {
      fetching.current = true;
      const startTime = Date.now();
      console.log("useTradeTokenState, fetching", startTime);
      let endTime = 0;
      try {
        await Promise.all([
          refetchMint(),
          refetchBurn(),
          refetchMintCostAfterFees(),
          refetchBurnProceedsAfterFees(),
          refetchUserEthBalance(),
        ]).then(() => {
          endTime = Date.now();
        });
      } catch (err) {
        endTime = Date.now();
        console.log("useTradeTokenState fetching error", err);
      }
      console.log("useTradeTokenState, fetched", endTime);
      const MILLIS = 0;
      const timeToWait =
        endTime >= startTime + MILLIS ? 0 : MILLIS - (endTime - startTime);
      await new Promise((resolve) => {
        setTimeout(resolve, timeToWait);
      });
      fetching.current = false;
    };
    fetch();
  }, [tokenTxs.length, isPreSaleOngoing]);

  /**
   * Error handling
   */
  useEffect(() => {
    if (!matchingChain) {
      setErrorMessage("wrong network");
    } else if (Number(formatIncompleteNumber(amount)) <= 0) {
      setErrorMessage("enter amount");
    } else if (
      userEthBalance?.value &&
      mintCostAfterFees > userEthBalance?.value
    ) {
      setErrorMessage("insufficient ETH");
    } else {
      setErrorMessage("");
    }
  }, [matchingChain, amount, userEthBalance?.value, mintCostAfterFees]);

  return {
    amount,
    mintCostAfterFees,
    mintCostAfterFeesLoading,
    burnProceedsAfterFees,
    burnProceedsAfterFeesLoading,
    mint,
    refetchMint,
    mintTxLoading,
    isRefetchingMint,
    burn,
    refetchBurn,
    burnTxLoading,
    isRefetchingBurn,
    handleAmount,
    handleAmountDirectly,
    errorMessage,
    userEthBalance,
  };
};
