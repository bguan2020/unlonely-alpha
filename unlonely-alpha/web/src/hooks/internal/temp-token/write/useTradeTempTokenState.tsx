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
  DEFAULT_TOKEN_CLAIM_AMOUNT,
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
import centerEllipses from "../../../../utils/centerEllipses";
import {
  burnErrors,
  mintErrors,
} from "../../../../components/channels/vibes/VibesTokenExchange";
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
import { safeIncludes } from "../../../../utils/safeFunctions";

export type UseTradeTempTokenStateType = {
  tradeAmount: string;
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

  mint?: () => void;
  refetchMint: () => void;
  burn?: () => void;
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
  const { wagmiAddress, user } = useUser();

  const { chat, channel } = useChannelContext();
  const { channelQueryData } = channel;
  const { addToChatbot: addToChatbotForTempToken } = chat;
  const { network } = useNetworkContext();
  const { localNetwork, explorerUrl, matchingChain } = network;
  const toast = useToast();

  const canAddToChatbot_mint = useRef(false);
  const canAddToChatbot_burn = useRef(false);
  const [tradeAmount, setTradeAmount] = useState<string>(
    String(DEFAULT_TOKEN_TRADE_AMOUNT)
  );
  const debouncedTradeAmount = useDebounce(tradeAmount, 300);
  const trade_amount_bigint = useMemo(
    () => BigInt(debouncedTradeAmount as `${number}`),
    [debouncedTradeAmount]
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

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
    address: wagmiAddress as `0x${string}`,
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
  } = useGetMintCostAfterFees(trade_amount_bigint, tempTokenContract);

  const {
    burnProceedsAfterFees,
    refetch: refetchBurnProceedsAfterFees,
    loading: burnProceedsAfterFeesLoading,
  } = useGetBurnProceedsAfterFees(trade_amount_bigint, tempTokenContract);

  const amountToMint = useMemo(() => {
    return isPreSaleOngoing
      ? BigInt(DEFAULT_TOKEN_CLAIM_AMOUNT)
      : trade_amount_bigint;
  }, [isPreSaleOngoing, trade_amount_bigint]);

  const valueToSendForMint = useMemo(() => {
    return isPreSaleOngoing
      ? BigInt(PRE_SALE_PRICE_PER_TOKEN * DEFAULT_TOKEN_CLAIM_AMOUNT)
      : mintCostAfterFees;
  }, [isPreSaleOngoing, mintCostAfterFees]);

  const {
    mint,
    refetch: refetchMint,
    isRefetchingMint,
    mintTxLoading,
  } = useMint(
    {
      amount: amountToMint,
      value: valueToSendForMint,
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
            setTradeAmount(String(DEFAULT_TOKEN_TRADE_AMOUNT));
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
          const title = isPreSaleOngoing
            ? `${
                user?.username ??
                centerEllipses(args.account as `0x${string}`, 15)
              } claimed their free $${tokenSymbol}!`
            : `${
                user?.username ??
                centerEllipses(args.account as `0x${string}`, 15)
              } bought ${Number(args.amount as bigint)} $${tokenSymbol}!`;

          /**
           * perform a check to see data.logs.length is greater than 2 to determine
           * if the totalSupplyThresholdReached event was emitted, if so include returned value into ably message
           */
          const hasTotalSupplyThresholdReachedEvent = data.logs.length > 2;
          addToChatbotForTempToken({
            username: user?.username ?? "",
            address: wagmiAddress ?? "",
            taskType: InteractionType.BUY_TEMP_TOKENS,
            title,
            description: JSON.stringify({
              address: wagmiAddress,
              amount: Number(args.amount as bigint),
              blockNumber: String(data.blockNumber),
              tokenAddress,
              totalSupply: String(totalSupply),
              highestTotalSupply: String(highestTotalSupply),
              hasTotalSupplyThresholdReached:
                hasTotalSupplyThresholdReachedEvent
                  ? hasHitTotalSupplyThreshold
                  : false,
              endTimestamp: String(endTimestamp),
            }),
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
          setTradeAmount(String(DEFAULT_TOKEN_TRADE_AMOUNT));
          if (
            hasTotalSupplyThresholdReachedEvent &&
            hasHitTotalSupplyThreshold
          ) {
            // wait few seconds
            await new Promise((res) => setTimeout(res, 4000));
            const _title = `The $${tokenSymbol} token has hit the price goal and survives for another 24 hours! 🎉`;
            addToChatbotForTempToken({
              username: user?.username ?? "",
              address: wagmiAddress ?? "",
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
          if (safeIncludes(String(error), key)) {
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
      amount: trade_amount_bigint,
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
            setTradeAmount(String(DEFAULT_TOKEN_TRADE_AMOUNT));
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
            address: wagmiAddress ?? "",
            taskType: InteractionType.SELL_TEMP_TOKENS,
            title,
            description: JSON.stringify({
              address: wagmiAddress,
              amount: Number(args.amount as bigint),
              blockNumber: String(data.blockNumber),
              tokenAddress,
              totalSupply: String(totalSupply),
            }),
          });
          callbackOnBurnTxSuccess?.();
          canAddToChatbot_burn.current = false;
          setTradeAmount(String(DEFAULT_TOKEN_TRADE_AMOUNT));
        }
      },
      onTxError: (error) => {
        console.log("burn error", error);
        let message =
          "Unknown error, please check the explorer for more details";
        Object.keys(burnErrors).forEach((key) => {
          if (safeIncludes(String(error), key)) {
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
      setTradeAmount(filtered);
    },
    [isPreSaleOngoing]
  );

  const handleAmountDirectly = useCallback((input: string) => {
    setTradeAmount(input);
  }, []);

  /**
   * For every new transaction, fetch the new balances and costs
   */
  useEffect(() => {
    if (!tempTokenContract.address || !wagmiAddress) return;
    const fetch = async () => {
      const startTime = Date.now();
      console.log("useTradeTokenState, fetching", startTime);
      let endTime = 0;
      let calls: any[] = [];
      calls = calls.concat([refetchUserEthBalance(), refetchMint()]);
      if (!isPreSaleOngoing) {
        calls = calls.concat([
          refetchBurn(),
          refetchMintCostAfterFees(),
          refetchBurnProceedsAfterFees(),
        ]);
      }
      try {
        await Promise.all(calls).then(() => {
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
    };
    fetch();
  }, [tokenTxs.length]);

  useEffect(() => {
    const fetch = async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      await refetchMintCostAfterFees();
      await refetchMint();
    };
    fetch();
  }, [isPreSaleOngoing]);

  /**
   * Error handling
   */
  useEffect(() => {
    if (!matchingChain) {
      setErrorMessage("wrong network");
    } else if (Number(formatIncompleteNumber(tradeAmount)) <= 0) {
      setErrorMessage("enter amount");
    } else if (
      userEthBalance?.value &&
      mintCostAfterFees > userEthBalance?.value
    ) {
      setErrorMessage("insufficient ETH");
    } else {
      setErrorMessage("");
    }
  }, [matchingChain, tradeAmount, userEthBalance?.value, mintCostAfterFees]);

  return {
    tradeAmount,
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
