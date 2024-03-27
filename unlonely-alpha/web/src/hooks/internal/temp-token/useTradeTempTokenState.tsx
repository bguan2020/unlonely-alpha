import { ContractData, TradeableTokenTx } from "../../../constants/types";
import TempTokenAbi from "../../../constants/abi/TempTokenV1.json";
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { InteractionType, NULL_ADDRESS } from "../../../constants";
import { useNetworkContext } from "../../context/useNetwork";
import {
  useGetMintCostAfterFees,
  useGetBurnProceedsAfterFees,
  useMint,
  useBurn,
} from "../../contracts/useTempTokenV1";
import useDebounce from "../useDebounce";
import { Flex, Box, useToast, Text } from "@chakra-ui/react";
import Link from "next/link";
import {
  Log,
  createPublicClient,
  decodeEventLog,
  formatUnits,
  http,
  isAddress,
  parseAbiItem,
} from "viem";
import centerEllipses from "../../../utils/centerEllipses";
import {
  burnErrors,
  mintErrors,
} from "../../../components/chat/VibesTokenExchange";
import {
  filteredInput,
  formatIncompleteNumber,
} from "../../../utils/validation/input";
import { useChannelContext } from "../../context/useChannel";
import { useUser } from "../../context/useUser";
import { useBalance, useContractEvent } from "wagmi";
import { base } from "viem/chains";
import { ChartTokenTx } from "../../../components/chat/VibesTokenInterface";
import { useCacheContext } from "../../../hooks/context/useCache";
import { insertElementSorted } from "../useVibesCheck";

export const useTradeTempTokenState = () => {
  const { walletIsConnected, userAddress, user } = useUser();

  const { chat, channel } = useChannelContext();
  const {
    channelQueryData,
    currentActiveTokenAddress,
    currentActiveTokenSymbol,
  } = channel;
  const { addToChatbot } = chat;
  const { network } = useNetworkContext();
  const { localNetwork, explorerUrl, matchingChain } = network;
  const toast = useToast();
  const { ethPriceInUsd } = useCacheContext();

  const canAddToChatbot_mint = useRef(false);
  const canAddToChatbot_burn = useRef(false);

  const [amount, setAmount] = useState<string>("1000");
  const debouncedAmountOfVotes = useDebounce(amount, 300);
  const amount_bigint = useMemo(
    () => BigInt(debouncedAmountOfVotes as `${number}`),
    [debouncedAmountOfVotes]
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fetching = useRef(false);
  const [tokenTxs, setTokenTxs] = useState<TradeableTokenTx[]>([]);
  const [loading, setLoading] = useState(true);

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

  const baseClient = useMemo(
    () =>
      createPublicClient({
        chain: base,
        transport: http(
          "https://base-mainnet.g.alchemy.com/v2/aR93M6MdEC4lgh4VjPXLaMnfBveve1fC"
        ),
      }),
    []
  );

  const { data: tempTokenBalance, refetch: refetchTempTokenBalance } =
    useBalance({
      address: userAddress,
      token: currentActiveTokenAddress as `0x${string}`,
      enabled:
        isAddress(userAddress as `0x${string}`) &&
        isAddress(currentActiveTokenAddress ?? NULL_ADDRESS),
    });

  const { data: userEthBalance, refetch: refetchUserEthBalance } = useBalance({
    address: userAddress as `0x${string}`,
    enabled: isAddress(userAddress as `0x${string}`),
  });

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

  const txs: ChartTokenTx[] = useMemo(() => {
    return tokenTxs.map((tx) => {
      return {
        user: tx.user,
        event: tx.eventName,
        amount: Number(tx.amount),
        price: tx.price,
        priceInUsd:
          ethPriceInUsd !== undefined
            ? Number(
                String(
                  Number(ethPriceInUsd) *
                    Number(formatUnits(BigInt(tx.price), 18))
                )
              )
            : 0,
        blockNumber: tx.blockNumber,
        priceChangePercentage: tx.priceChangePercentage,
      };
    });
  }, [tokenTxs, ethPriceInUsd]);

  useEffect(() => {
    const getTempTokenEvents = async () => {
      if (
        !baseClient ||
        !tempTokenContract.address ||
        fetching.current ||
        tokenTxs.length > 0
      ) {
        fetching.current = false;
        return;
      }
      fetching.current = true;
      const [mintLogs, burnLogs] = await Promise.all([
        baseClient.getLogs({
          address: tempTokenContract.address,
          event: parseAbiItem(
            "event Mint(address indexed account, uint256 amount, address indexed streamerAddress, uint256 indexed totalSupply, uint256 protocolFeePercent, uint256 streamerFeePercent)"
          ),
          //   fromBlock: CREATION_BLOCK,
        }),
        baseClient.getLogs({
          address: tempTokenContract.address,
          event: parseAbiItem(
            "event Burn(address indexed account, uint256 amount, address indexed streamerAddress, uint256 indexed totalSupply, uint256 protocolFeePercent, uint256 streamerFeePercent)"
          ),
          //   fromBlock: CREATION_BLOCK,
        }),
      ]);
      console.log("temp token mintLogs length", mintLogs.length);
      console.log("temp token burnLogs length", burnLogs.length);
      const logs = [...mintLogs, ...burnLogs];
      logs.sort((a, b) => {
        if (a.blockNumber === null || b.blockNumber === null) return 0;
        if (a.blockNumber < b.blockNumber) return -1;
        if (a.blockNumber > b.blockNumber) return 1;
        return 0;
      });
      const _tokenTxs: TradeableTokenTx[] = [];
      for (let i = 0; i < logs.length; i++) {
        const event = logs[i];
        const n = Number(event.args.totalSupply as bigint);
        const n_ = Math.max(n - 1, 0);
        const priceForCurrent = Math.floor((n * (n + 1) * (2 * n + 1)) / 6);
        const priceForPrevious = Math.floor((n_ * (n_ + 1) * (2 * n_ + 1)) / 6);
        const newPrice = priceForCurrent - priceForPrevious;
        const previousTxPrice =
          _tokenTxs.length > 0 ? _tokenTxs[_tokenTxs.length - 1].price : 0;
        const tx: TradeableTokenTx = {
          eventName: event.eventName,
          user: event.args.account as `0x${string}`,
          amount: event.args.amount as bigint,
          price: newPrice,
          blockNumber: Number(event.blockNumber),
          supply: event.args.totalSupply as bigint,
          priceChangePercentage:
            i > 0 && _tokenTxs.length > 0
              ? ((newPrice - previousTxPrice) / previousTxPrice) * 100
              : 0,
        };
        _tokenTxs.push(tx);
      }
      fetching.current = false;
      console.log("setting temp token txs,", _tokenTxs.length, "count");
      setTokenTxs(_tokenTxs);
      setLoading(false);
    };
    getTempTokenEvents();
  }, [currentActiveTokenAddress, baseClient]);

  const eventQueueRef = useRef<Log[]>([]);

  useContractEvent({
    address: tempTokenContract.address,
    abi: tempTokenContract.abi,
    eventName: "Mint",
    listener(logs) {
      console.log("temp token Mint event detected", logs);
      const sortedLogs = logs.sort(
        (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
      );
      sortedLogs.forEach((log) => {
        eventQueueRef.current.push(log);
        if (eventQueueRef.current.length === 1) {
          processQueue();
        }
      });
    },
  });

  const processQueue = async () => {
    while (eventQueueRef.current.length > 0) {
      const log = eventQueueRef.current[0];
      await handleEvent(log);
      eventQueueRef.current.shift();
    }
  };

  const handleEvent = async (log: any) => {
    const eventName = log?.eventName;
    const n = Number(log?.args.totalSupply as bigint);
    const n_ = Math.max(n - 1, 0);
    const priceForCurrent = Math.floor((n * (n + 1) * (2 * n + 1)) / 6);
    const priceForPrevious = Math.floor((n_ * (n_ + 1) * (2 * n_ + 1)) / 6);
    const newPrice = priceForCurrent - priceForPrevious;
    const previousTxPrice =
      tokenTxs.length > 0 ? tokenTxs[tokenTxs.length - 1].price : 0;
    const eventTx: TradeableTokenTx = {
      eventName: eventName,
      user: log?.args.account as `0x${string}`,
      amount: log?.args.amount as bigint,
      price: newPrice,
      blockNumber: Number(log?.blockNumber as bigint),
      supply: log?.args.totalSupply as bigint,
      priceChangePercentage:
        tokenTxs.length === 0
          ? 0
          : ((newPrice - previousTxPrice) / previousTxPrice) * 100,
    };
    console.log("detected", eventName, eventTx);
    setTokenTxs((prev) => {
      const newTokenTxs = insertElementSorted(prev, eventTx);
      console.log("newTokenTxs", newTokenTxs);
      return newTokenTxs;
    });
  };

  useContractEvent({
    address: tempTokenContract.address,
    abi: tempTokenContract.abi,
    eventName: "Burn",
    listener(logs) {
      console.log("temp token Burn event detected", logs);
      const sortedLogs = logs.sort(
        (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
      );
      sortedLogs.forEach((log) => {
        eventQueueRef.current.push(log);
        if (eventQueueRef.current.length === 1) {
          processQueue();
        }
      });
    },
  });

  const {
    mint,
    refetch: refetchMint,
    isRefetchingMint,
    mintTxLoading,
  } = useMint(
    {
      amount: amount_bigint,
      value: mintCostAfterFees,
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
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        canAddToChatbot_mint.current = true;
      },
      onWriteError: (error) => {
        console.log("mint write error", error);
        toast({
          duration: 9000,
          isClosable: true,
          position: "top-right",
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
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        if (channelQueryData) {
          const topics = decodeEventLog({
            abi: tempTokenContract.abi,
            data: data.logs[1].data,
            topics: data.logs[1].topics,
          });
          const args: any = topics.args;
          const title = `${
            user?.username ?? centerEllipses(args.account as `0x${string}`, 15)
          } bought ${Number(
            args.amount as bigint
          )} $${currentActiveTokenSymbol}!`;
          addToChatbot({
            username: user?.username ?? "",
            address: userAddress ?? "",
            taskType: InteractionType.BUY_TEMP_TOKENS,
            title,
            description: `${
              user?.username ?? centerEllipses(userAddress, 15)
            }:${Number(args.amount as bigint)}`,
          });
        }
        canAddToChatbot_mint.current = false;
        setAmount("1000");
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
          duration: 9000,
          isClosable: true,
          position: "top-right",
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
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        canAddToChatbot_burn.current = true;
      },
      onWriteError: (error) => {
        console.log("burn write error", error);
        toast({
          duration: 9000,
          isClosable: true,
          position: "top-right",
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
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        const topics = decodeEventLog({
          abi: tempTokenContract.abi,
          data: data.logs[1].data,
          topics: data.logs[1].topics,
        });
        const args: any = topics.args;
        const title = `${
          user?.username ?? centerEllipses(args.account as `0x${string}`, 15)
        } sold ${Number(args.amount as bigint)} $${currentActiveTokenSymbol}!`;
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.SELL_TEMP_TOKENS,
          title,
          description: `${
            user?.username ?? centerEllipses(userAddress, 15)
          }:${Number(args.amount as bigint)}`,
        });
        canAddToChatbot_burn.current = false;
        setAmount("1000");
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
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        canAddToChatbot_burn.current = false;
      },
    }
  );

  const handleAmount = useCallback((event: any) => {
    const input = event.target.value;
    const filtered = filteredInput(input);
    setAmount(filtered);
  }, []);

  useEffect(() => {
    if (
      txs.length === 0 ||
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
          refetchTempTokenBalance(),
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
  }, [txs.length]);

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
    txs,
    loading,
    errorMessage,
    tempTokenBalance,
    userEthBalance,
  };
};