import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { decodeEventLog, formatUnits, isAddress } from "viem";
import Link from "next/link";
import { useBalance, useBlockNumber } from "wagmi";
import { ResponsiveContainer, LineChart, Line, Tooltip } from "recharts";

import { useCacheContext } from "../../hooks/context/useCache";
import centerEllipses from "../../utils/centerEllipses";
import { filteredInput } from "../../utils/validation/input";
import {
  useBurn,
  useGetBurnProceedsAfterFees,
  useGetMintCostAfterFees,
  useMint,
} from "../../hooks/contracts/useVibesToken";
import useDebounce from "../../hooks/internal/useDebounce";
import { getContractFromNetwork } from "../../utils/contract";
import { useNetworkContext } from "../../hooks/context/useNetwork";
import { useChannelContext } from "../../hooks/context/useChannel";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { useUser } from "../../hooks/context/useUser";
import { InteractionType, NULL_ADDRESS } from "../../constants";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <Flex
        direction="column"
        bg="rgba(0, 0, 0, 0.5)"
        p="5px"
        borderRadius="15px"
      >
        <Text>{`${
          isAddress(payload[0].payload.user)
            ? centerEllipses(payload[0].payload.user, 13)
            : payload[0].payload.user
        }`}</Text>
        <Text
          color={payload[0].payload.event === "Mint" ? "#46a800" : "#fe2815"}
        >{`${payload[0].payload.event === "Mint" ? "Bought" : "Sold"} ${
          payload[0].payload.amount
        }`}</Text>
        <Text>{`New price: ${truncateValue(
          formatUnits(payload[0].payload.price, 18),
          10
        )} ETH`}</Text>
      </Flex>
    );
  }

  return null;
};

const VibesTokenExchange = () => {
  const { walletIsConnected, userAddress, user } = useUser();
  const { vibesTokenTxs, vibesTokenLoading, chartTimeIndexes } =
    useCacheContext();
  const toast = useToast();
  const { network } = useNetworkContext();
  const { matchingChain, localNetwork, explorerUrl } = network;
  const contract = getContractFromNetwork("vibesTokenV1", localNetwork);
  const { chat, channel } = useChannelContext();
  const { channelQueryData } = channel;
  const { addToChatbot } = chat;

  const [timeFilter, setTimeFilter] = useState<"1h" | "1d" | "all">("1d");

  const blockNumber = useBlockNumber({
    watch: true,
  });

  const { data: vibesBalance, refetch } = useBalance({
    address: userAddress,
    token: getContractFromNetwork("vibesTokenV1", localNetwork).address,
    enabled:
      isAddress(userAddress as `0x${string}`) &&
      isAddress(
        getContractFromNetwork("vibesTokenV1", localNetwork).address ??
          NULL_ADDRESS
      ),
  });

  const formattedHourData = useMemo(() => {
    const res = vibesTokenTxs.map((tx) => {
      return {
        user: tx.user,
        event: tx.eventName,
        amount: Number(tx.amount),
        price: tx.price,
        blockNumber: tx.blockNumber,
      };
    });
    return res.slice(chartTimeIndexes.get("hour") as number);
  }, [vibesTokenTxs, chartTimeIndexes]);

  const formattedDayData = useMemo(() => {
    const res = vibesTokenTxs.map((tx) => {
      return {
        user: tx.user,
        event: tx.eventName,
        amount: Number(tx.amount),
        price: tx.price,
        blockNumber: tx.blockNumber,
      };
    });
    return res.slice(chartTimeIndexes.get("day") as number);
  }, [vibesTokenTxs, chartTimeIndexes]);

  const formattedData = useMemo(() => {
    if (timeFilter === "1h") return formattedHourData;
    if (timeFilter === "1d") return formattedDayData;
    const res = vibesTokenTxs.map((tx) => {
      return {
        user: tx.user,
        event: tx.eventName,
        amount: Number(tx.amount),
        price: tx.price,
        blockNumber: tx.blockNumber,
      };
    });
    return res;
  }, [timeFilter, formattedHourData, formattedDayData, vibesTokenTxs]);

  const [amountOfVibes, setAmountOfVibes] = useState<string>("1");
  const debouncedAmountOfVotes = useDebounce(amountOfVibes, 300);
  const amount_votes_bigint = useMemo(
    () => BigInt(debouncedAmountOfVotes as `${number}`),
    [debouncedAmountOfVotes]
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const canAddToChatbot_mint = useRef(false);
  const canAddToChatbot_burn = useRef(false);

  const isFetching = useRef(false);
  const { mintCostAfterFees, refetch: refetchMintCostAfterFees } =
    useGetMintCostAfterFees(amount_votes_bigint, contract);

  const { burnProceedsAfterFees, refetch: refetchBurnProceedsAfterFees } =
    useGetBurnProceedsAfterFees(amount_votes_bigint, contract);

  const {
    mint,
    refetch: refetchMint,
    isRefetchingMint,
  } = useMint(
    {
      streamer: channelQueryData?.owner.address as `0x${string}`,
      amount: amount_votes_bigint,
      value: mintCostAfterFees,
    },
    contract,
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
        const topics = decodeEventLog({
          abi: contract.abi,
          data: data.logs[1].data,
          topics: data.logs[1].topics,
        });
        const args: any = topics.args;
        const title = `${
          user?.username ?? centerEllipses(args.account, 15)
        } bought ${args.amount} $VIBES!`;
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.BUY_VIBES,
          title,
          description: `${user?.username ?? centerEllipses(userAddress, 15)}:${
            args.amount
          }`,
        });
        canAddToChatbot_mint.current = false;
        setAmountOfVibes("1");
      },
      onTxError: (error) => {
        console.log("mint error", error);
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              <Flex direction="column">
                <Text>mint error</Text>
                <Text fontSize="15px">{error?.message ?? "unknown error"}</Text>
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
  } = useBurn(
    {
      streamer: channelQueryData?.owner.address as `0x${string}`,
      amount: amount_votes_bigint,
    },
    contract,
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
          abi: contract.abi,
          data: data.logs[1].data,
          topics: data.logs[1].topics,
        });
        const args: any = topics.args;
        const title = `${
          user?.username ?? centerEllipses(args.account, 15)
        } sold ${args.amount} $VIBES!`;
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.SELL_VIBES,
          title,
          description: `${user?.username ?? centerEllipses(userAddress, 15)}:${
            args.amount
          }`,
        });
        canAddToChatbot_burn.current = false;
        setAmountOfVibes("1");
      },
      onTxError: (error) => {
        console.log("burn error", error);
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              <Flex direction="column">
                <Text>burn error</Text>
                <Text fontSize="15px">{error?.message ?? "unknown error"}</Text>
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

  const handleInputChange = (event: any) => {
    const input = event.target.value;
    const filtered = filteredInput(input);
    setAmountOfVibes(filtered);
  };

  useEffect(() => {
    if (
      !blockNumber.data ||
      isFetching.current ||
      !contract.address ||
      !userAddress
    )
      return;
    const fetch = async () => {
      isFetching.current = true;
      try {
        await Promise.all([
          refetchMint(),
          refetchBurn(),
          refetchMintCostAfterFees(),
          refetchBurnProceedsAfterFees(),
          refetch(),
        ]);
      } catch (err) {
        console.log("vibes fetching error", err);
      }
      isFetching.current = false;
    };
    fetch();
  }, [blockNumber.data, contract.address, userAddress]);

  useEffect(() => {
    if (!walletIsConnected) {
      setErrorMessage("connect wallet first");
    } else if (!matchingChain) {
      setErrorMessage("wrong network");
    } else {
      setErrorMessage("");
    }
  }, [walletIsConnected, matchingChain, amountOfVibes]);

  return (
    <>
      {vibesTokenLoading ? (
        <Flex
          direction="column"
          alignItems="center"
          width="100%"
          gap="5px"
          justifyContent={"center"}
        >
          <Text>loading $VIBES chart</Text>
          <Spinner size="md" />
        </Flex>
      ) : (
        <Flex direction="column" w="100%" position="relative">
          {formattedHourData.length === 0 && timeFilter === "1h" && (
            <Text position="absolute" color="gray" top="50%">
              no txs in last hour
            </Text>
          )}
          {formattedDayData.length === 0 && timeFilter === "1d" && (
            <Text position="absolute" color="gray" top="50%">
              no txs in the past 24 hours
            </Text>
          )}
          {formattedData.length === 0 && timeFilter === "all" && (
            <Text position="absolute" color="gray" top="50%">
              no txs
            </Text>
          )}
          <Flex gap="1rem" alignItems={"center"}>
            <Text fontSize={"20px"} color="#c6c3fc" fontWeight="bold">
              $VIBES
            </Text>
            <Button
              bg={timeFilter === "1h" ? "#7874c9" : "#403c7d"}
              color="#c6c3fc"
              p={2}
              height={"20px"}
              _focus={{}}
              _active={{}}
              _hover={{}}
              onClick={() => setTimeFilter("1h")}
            >
              1h
            </Button>
            <Button
              bg={timeFilter === "1d" ? "#7874c9" : "#403c7d"}
              color="#c6c3fc"
              p={2}
              height={"20px"}
              _focus={{}}
              _active={{}}
              _hover={{}}
              onClick={() => setTimeFilter("1d")}
            >
              1d
            </Button>
            <Button
              bg={timeFilter === "all" ? "#7874c9" : "#403c7d"}
              color="#c6c3fc"
              p={2}
              height={"20px"}
              _focus={{}}
              _active={{}}
              _hover={{}}
              onClick={() => setTimeFilter("all")}
            >
              all
            </Button>
          </Flex>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#8884d8"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Flex>
      )}
      <Flex direction="column" justifyContent={"flex-end"} gap="10px">
        <Flex position="relative" gap="5px" alignItems={"center"}>
          <Input
            variant="glow"
            textAlign="center"
            value={amountOfVibes}
            onChange={handleInputChange}
            mx="auto"
            p="1"
            fontSize={"14px"}
          />
          <Button
            bg={"#403c7d"}
            color="white"
            p={2}
            height={"20px"}
            _focus={{}}
            _active={{}}
            _hover={{
              bg: "#8884d8",
            }}
            onClick={() => {
              vibesBalance && setAmountOfVibes(vibesBalance.formatted);
            }}
          >
            max
          </Button>
        </Flex>
        <Button
          color="white"
          _focus={{}}
          _hover={{}}
          _active={{}}
          bg="#46a800"
          isDisabled={!mint}
          onClick={mint}
        >
          BUY
        </Button>
        <Button
          color="white"
          _focus={{}}
          _hover={{}}
          _active={{}}
          bg="#fe2815"
          isDisabled={!burn}
          onClick={burn}
        >
          SELL
        </Button>
      </Flex>
    </>
  );
};

export default VibesTokenExchange;
