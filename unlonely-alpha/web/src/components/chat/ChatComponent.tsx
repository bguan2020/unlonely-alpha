import {
  ChevronDownIcon,
  TriangleDownIcon,
  TriangleUpIcon,
} from "@chakra-ui/icons";
import Link from "next/link";
import { decodeEventLog, formatUnits } from "viem";
import {
  Flex,
  Box,
  Text,
  Container,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tr,
  IconButton,
  Button,
  useToast,
  Input,
} from "@chakra-ui/react";
import {
  useEffect,
  useRef,
  useState,
  CSSProperties,
  useMemo,
  useCallback,
} from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { useBalance, useBlockNumber } from "wagmi";

import {
  ADD_REACTION_EVENT,
  InteractionType,
  NULL_ADDRESS,
} from "../../constants";
import {
  ChatReturnType,
  useChat as useChatV2,
  useChatBox,
} from "../../hooks/chat/useChatV2";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useNetworkContext } from "../../hooks/context/useNetwork";
import {
  useBuyVotes,
  useGetPriceAfterFee,
  useReadMappings,
  useGenerateKey,
  useSellVotes,
  useGetHolderBalances,
  useClaimVotePayout,
} from "../../hooks/contracts/useSharesContractV2";
import useUserAgent from "../../hooks/internal/useUserAgent";
import usePostBetTrade from "../../hooks/server/gamblable/usePostBetTrade";
import { getContractFromNetwork } from "../../utils/contract";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { filteredInput } from "../../utils/validation/input";
import { OuterBorder, BorderType } from "../general/OuterBorder";
import ChatForm from "./ChatForm";
import MessageList from "./MessageList";
import { useUser } from "../../hooks/context/useUser";
import centerEllipses from "../../utils/centerEllipses";
import { getTimeFromMillis } from "../../utils/time";
import { GamblableEvent, SharesEventState } from "../../generated/graphql";
import { getSortedLeaderboard } from "../../utils/getSortedLeaderboard";

const ChatComponent = () => {
  const { isStandalone } = useUserAgent();
  const [selectedTab, setSelectedTab] = useState<"chat" | "trade" | "vip">(
    "chat"
  );
  const { leaderboard: leaderboardContext } = useChannelContext();
  const { network } = useNetworkContext();
  const { localNetwork } = network;

  const {
    data: leaderboardData,
    loading: leaderboardLoading,
    error: leaderboardError,
    refetchGamblableEventLeaderboard,
  } = leaderboardContext;

  const chat = useChatV2();
  const [leaderboard, setLeaderboard] = useState<
    { name: string; totalFees: number }[]
  >([]);
  const [leaderboardIsCollapsed, setLeaderboardIsCollapsed] = useState(true);

  useEffect(() => {
    refetchGamblableEventLeaderboard?.();
  }, [localNetwork]);

  useEffect(() => {
    if (!leaderboardLoading && !leaderboardError && leaderboardData) {
      const _leaderboard: { name: string; totalFees: number }[] =
        getSortedLeaderboard(
          leaderboardData.getGamblableEventLeaderboardByChannelId
        );
      setLeaderboard(_leaderboard);
    }
  }, [leaderboardLoading, leaderboardError, leaderboardData]);

  return (
    <Flex
      height={!isStandalone ? { base: "80vh" } : "100%"}
      position={"relative"}
    >
      <OuterBorder type={BorderType.OCEAN} p={"0"}>
        <Container centerContent maxW="100%" h="100%" alignSelf="end" p="0">
          <Flex width="100%">
            <OuterBorder
              type={BorderType.OCEAN}
              zIndex={selectedTab === "chat" ? 4 : 2}
              onClick={() => setSelectedTab("chat")}
              noborder
              pb={selectedTab === "chat" ? "0px" : undefined}
            >
              <Flex
                bg={
                  selectedTab === "chat"
                    ? "rgba(24, 22, 47, 1)"
                    : "rgba(19, 18, 37, 1)"
                }
                py="0.3rem"
                width="100%"
                justifyContent={"center"}
              >
                <Text>CHAT</Text>
              </Flex>
            </OuterBorder>
            <OuterBorder
              type={BorderType.OCEAN}
              zIndex={selectedTab === "trade" ? 4 : 2}
              onClick={() => setSelectedTab("trade")}
              noborder
              pb={selectedTab === "trade" ? "0px" : undefined}
            >
              <Flex
                bg={
                  selectedTab === "trade"
                    ? "rgba(24, 22, 47, 1)"
                    : "rgba(19, 18, 37, 1)"
                }
                py="0.3rem"
                width="100%"
                justifyContent={"center"}
              >
                <Text>VOTE</Text>
              </Flex>
            </OuterBorder>
            <OuterBorder
              type={BorderType.OCEAN}
              zIndex={selectedTab === "vip" ? 4 : 2}
              onClick={() => setSelectedTab("vip")}
              noborder
              pb={selectedTab === "vip" ? "0px" : undefined}
            >
              <Flex
                bg={
                  selectedTab === "vip"
                    ? "rgba(24, 22, 47, 1)"
                    : "rgba(19, 18, 37, 1)"
                }
                py="0.3rem"
                width="100%"
                justifyContent={"center"}
              >
                <Text>VIP</Text>
              </Flex>
            </OuterBorder>
          </Flex>
          <OuterBorder
            type={BorderType.OCEAN}
            width={"100%"}
            zIndex={3}
            alignSelf="flex-end"
            noborder
            pt="0px"
          >
            <Flex
              bg="rgba(24, 22, 47, 1)"
              p={"1rem"}
              width={"100%"}
              direction="column"
            >
              <Flex borderRadius={"5px"} p="1px" zIndex={3} mb="75px">
                <Flex
                  direction="column"
                  position="absolute"
                  style={{ backdropFilter: "blur(6px)" }}
                  // width={"100%"}
                  left={"10px"}
                  right={"10px"}
                >
                  <Text
                    fontSize={"20px"}
                    textAlign={"center"}
                    fontFamily={"LoRes15"}
                  >
                    LEADERBOARD
                  </Text>
                  <IconButton
                    aria-label="show leaderboard"
                    _hover={{}}
                    _active={{}}
                    _focus={{}}
                    bg="transparent"
                    icon={<ChevronDownIcon />}
                    onClick={() => {
                      setLeaderboardIsCollapsed(!leaderboardIsCollapsed);
                    }}
                    position="absolute"
                    right="-10px"
                    top="-10px"
                    transform={!leaderboardIsCollapsed ? "rotate(180deg)" : ""}
                  />
                  {leaderboardIsCollapsed && (
                    <Box
                      position="absolute"
                      bg={"linear-gradient(to bottom, transparent 75%, black)"}
                      width="100%"
                      height="100%"
                      pointerEvents={"none"}
                    />
                  )}
                  {/* {channelQueryData?.token?.symbol && (
                    <Text
                      color={"#B6B6B6"}
                      fontSize={"14px"}
                      fontWeight="400"
                      textAlign={"center"}
                    >
                      {`who owns the most $${channelQueryData?.token?.symbol}?`}
                    </Text>
                  )} */}
                  {/* {holdersLoading && (
                    <Flex justifyContent={"center"} p="20px">
                      <Spinner />
                    </Flex>
                  )} */}
                  {/* {!holdersLoading && holders.length > 0 && ( */}
                  <TableContainer
                    overflowY={leaderboardIsCollapsed ? "hidden" : "auto"}
                    maxHeight={leaderboardIsCollapsed ? "45px" : "150px"}
                    transition={"max-height 0.2s ease-in-out"}
                  >
                    <Table variant="unstyled" size="xs">
                      {/* <Thead>
                        <Tr>
                          <Th
                            textTransform={"lowercase"}
                            fontSize={"20px"}
                            textAlign="center"
                          >
                            rank
                          </Th>
                          <Th
                            textTransform={"lowercase"}
                            fontSize={"20px"}
                            textAlign="center"
                          >
                            name
                          </Th>
                          <Th
                            textTransform={"lowercase"}
                            fontSize={"20px"}
                            textAlign="center"
                            isNumeric
                          >
                            amount
                          </Th>
                        </Tr>
                      </Thead> */}
                      <Tbody>
                        {leaderboard.map((holder, index) => (
                          <Tr>
                            <Td fontSize={"20px"} p="4px" textAlign="center">
                              <Text fontSize="14px">{index + 1}</Text>
                            </Td>
                            <Td fontSize={"20px"} p="4px" textAlign="center">
                              <Text fontSize="14px">{holder.name}</Text>
                            </Td>
                            <Td
                              fontSize={"20px"}
                              p="4px"
                              textAlign="center"
                              isNumeric
                            >
                              <Text fontSize="14px">
                                {truncateValue(holder.totalFees, 2)}
                              </Text>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                  {/* )} */}
                  {/* {!holdersLoading && holders.length === 0 && (
                    <Text textAlign={"center"} p="20px">
                      no holders found
                    </Text>
                  )} */}
                </Flex>
              </Flex>
              {selectedTab === "chat" && <Chat chat={chat} />}
              {selectedTab === "trade" && <Trade chat={chat} />}
              {selectedTab === "vip" && <Chat chat={chat} isVipChat />}
            </Flex>
          </OuterBorder>
        </Container>
      </OuterBorder>
    </Flex>
  );
};

const Trade = ({ chat }: { chat: ChatReturnType }) => {
  const { userAddress, walletIsConnected, user } = useUser();
  const {
    channel,
    arcade,
    leaderboard: leaderboardContext,
  } = useChannelContext();
  const { channelQueryData, refetch } = channel;
  const { addToChatbot } = arcade;

  const { network } = useNetworkContext();
  const { matchingChain, localNetwork, explorerUrl } = network;

  const [isBuying, setIsBuying] = useState<boolean>(true);
  const [isYay, setIsYay] = useState<boolean>(true);
  const [amountOfVotes, setAmountOfVotes] = useState<string>("0");

  const amount_bigint = useMemo(
    () => BigInt(amountOfVotes as `${number}`),
    [amountOfVotes]
  );

  const { data: userEthBalance, refetch: refetchUserEthBalance } = useBalance({
    address: userAddress as `0x${string}`,
  });

  const toast = useToast();

  const handleInputChange = (event: any) => {
    const input = event.target.value;
    const filtered = filteredInput(input);
    setAmountOfVotes(filtered);
  };

  const { postBetTrade } = usePostBetTrade({
    onError: (err) => {
      console.log(err);
    },
  });

  const v2contract = getContractFromNetwork("unlonelySharesV2", localNetwork);

  const {
    refetch: refetchBalances,
    yayVotesBalance,
    nayVotesBalance,
  } = useGetHolderBalances(
    (channelQueryData?.sharesEvent?.[0]
      ?.sharesSubjectAddress as `0x${string}`) ?? NULL_ADDRESS,
    Number(channelQueryData?.sharesEvent?.[0]?.id ?? "0"),
    userAddress as `0x${string}`,
    isYay,
    v2contract
  );

  const { priceAfterFee: votePrice, refetch: refetchVotePrice } =
    useGetPriceAfterFee(
      channelQueryData?.owner?.address as `0x${string}`,
      Number(channelQueryData?.sharesEvent?.[0]?.id ?? "0"),
      BigInt(amountOfVotes),
      isYay,
      isBuying,
      v2contract
    );

  const { key: generatedKey } = useGenerateKey(
    channelQueryData?.owner?.address as `0x${string}`,
    Number(channelQueryData?.sharesEvent?.[0]?.id ?? "0"),
    v2contract
  );

  const {
    yayVotesSupply,
    nayVotesSupply,
    eventEndTimestamp,
    votingPooledEth,
    userPayout,
    eventVerified,
    eventResult,
    refetch: refetchMappings,
  } = useReadMappings(
    generatedKey,
    (channelQueryData?.sharesEvent?.[0]
      ?.sharesSubjectAddress as `0x${string}`) ?? NULL_ADDRESS,
    Number(channelQueryData?.sharesEvent?.[0]?.id ?? "0"),
    v2contract
  );

  const { buyVotes, refetch: refetchBuyVotes } = useBuyVotes(
    {
      eventAddress:
        (channelQueryData?.sharesEvent?.[0]
          ?.sharesSubjectAddress as `0x${string}`) ?? NULL_ADDRESS,
      eventId: Number(channelQueryData?.sharesEvent?.[0]?.id ?? "0"),
      isYay,
      amountOfVotes: amount_bigint,
      value: votePrice,
    },
    v2contract,
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
                buyVotes pending, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
      onWriteError: (error) => {
        toast({
          duration: 9000,
          isClosable: true,
          position: "top-right",
          render: () => (
            <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
              buyVotes cancelled
            </Box>
          ),
        });
      },
      onTxSuccess: async (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                buyVotes success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        setAmountOfVotes("0");
        const topics = decodeEventLog({
          abi: v2contract.abi,
          data: data.logs[0].data,
          topics: data.logs[0].topics,
        });
        const args: any = topics.args;
        const title = `${user?.username ?? centerEllipses(userAddress, 15)} ${
          args.trade.isBuy ? "bought" : "sold"
        } ${args.trade.shareAmount} ${args.trade.isYay ? "yes" : "no"} votes!`;
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.BUY_VOTES,
          title,
          description: `${user?.username ?? userAddress ?? ""}:${
            args.trade.shareAmount
          }:${args.trade.isYay ? "yay" : "nay"}`,
        });
        await postBetTrade({
          channelId: channelQueryData?.id as string,
          userAddress: userAddress as `0x${string}`,
          chainId: localNetwork.config.chainId,
          type: args.trade.isYay
            ? GamblableEvent.BetYesBuy
            : GamblableEvent.BetNoBuy,
          fees: Number(formatUnits(args.trade.subjectEthAmount, 18)),
        });
      },
      onTxError: (error) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              buyVotes error
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
    }
  );

  const { sellVotes, refetch: refetchSellVotes } = useSellVotes(
    {
      eventAddress: channelQueryData?.sharesEvent?.[0]
        ?.sharesSubjectAddress as `0x${string}`,
      eventId: Number(channelQueryData?.sharesEvent?.[0]?.id ?? "0"),
      isYay,
      amountOfVotes: amount_bigint,
    },
    v2contract,
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
                sellVotes pending, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
      onWriteError: (error) => {
        toast({
          duration: 9000,
          isClosable: true,
          position: "top-right",
          render: () => (
            <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
              sellVotes cancelled
            </Box>
          ),
        });
      },
      onTxSuccess: async (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                sellVotes success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        setAmountOfVotes("0");
        const topics = decodeEventLog({
          abi: v2contract.abi,
          data: data.logs[0].data,
          topics: data.logs[0].topics,
        });
        const args: any = topics.args;
        const title = `${user?.username ?? centerEllipses(userAddress, 15)} ${
          args.trade.isBuy ? "bought" : "sold"
        } ${args.trade.shareAmount} ${args.trade.isYay ? "yes" : "no"} votes!`;
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.SELL_VOTES,
          title,
          description: `${user?.username ?? userAddress ?? ""}:${
            args.trade.shareAmount
          }:${args.trade.isYay ? "yay" : "nay"}`,
        });
        await postBetTrade({
          channelId: channelQueryData?.id as string,
          userAddress: userAddress as `0x${string}`,
          chainId: localNetwork.config.chainId,
          type: args.trade.isYay
            ? GamblableEvent.BetYesSell
            : GamblableEvent.BetNoSell,
          fees: Number(formatUnits(args.trade.subjectEthAmount, 18)),
        });
      },
      onTxError: (error) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              sellVotes error
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
    }
  );

  const { claimVotePayout, refetch: refetchClaimVotePayout } =
    useClaimVotePayout(
      {
        eventAddress: channelQueryData?.sharesEvent?.[0]
          ?.sharesSubjectAddress as `0x${string}`,
        eventId: Number(channelQueryData?.sharesEvent?.[0]?.id ?? "0"),
      },
      v2contract,
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
                  claimVotePayout pending, click to view
                </Link>
              </Box>
            ),
            duration: 9000,
            isClosable: true,
            position: "top-right",
          });
        },
        onWriteError: (error) => {
          toast({
            duration: 9000,
            isClosable: true,
            position: "top-right",
            render: () => (
              <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
                claimVotePayout cancelled
              </Box>
            ),
          });
        },
        onTxSuccess: async (data) => {
          toast({
            render: () => (
              <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
                <Link
                  target="_blank"
                  href={`${explorerUrl}/tx/${data.transactionHash}`}
                  passHref
                >
                  claimVotePayout success, click to view
                </Link>
              </Box>
            ),
            duration: 9000,
            isClosable: true,
            position: "top-right",
          });
        },
        onTxError: (error) => {
          toast({
            render: () => (
              <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
                claimVotePayout error
              </Box>
            ),
            duration: 9000,
            isClosable: true,
            position: "top-right",
          });
        },
      }
    );

  const tradeMessages = useMemo(() => {
    const tradeMessages = chat.receivedMessages.filter(
      (m) =>
        m.data.body?.split(":")[0] === InteractionType.BUY_VOTES ||
        m.data.body?.split(":")[0] === InteractionType.SELL_VOTES
    );
    const tradeData = tradeMessages.map((m) => {
      const splitMessage = m.data.body?.split(":");
      return {
        taskType: splitMessage?.[0],
        trader: splitMessage?.[1],
        amount: splitMessage?.[2],
        isYay: splitMessage?.[3] === "yay",
      };
    });
    return tradeData;
  }, [chat.receivedMessages]);

  const blockNumber = useBlockNumber({
    watch: true,
  });

  const doesEventExist = useMemo(() => {
    if (!channelQueryData?.sharesEvent?.[0]?.sharesSubjectAddress) return false;
    if (!channelQueryData?.sharesEvent?.[0]?.id) return false;
    return true;
  }, [channelQueryData?.sharesEvent]);

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [dateNow, setDateNow] = useState<number>(Date.now());
  const [isAtBottom, setIsAtBottom] = useState(false);
  const scrollRef = useRef<VirtuosoHandle>(null);
  const isFetching = useRef(false);

  useEffect(() => {
    if (!blockNumber.data || isFetching.current) return;
    const fetch = async () => {
      isFetching.current = true;
      try {
        await Promise.all([
          refetchBalances(),
          refetchVotePrice(),
          refetchBuyVotes(),
          refetchSellVotes(),
          refetchMappings(),
          refetchClaimVotePayout(),
          refetchUserEthBalance(),
        ]);
      } catch (err) {
        console.log("vote fetching error", err);
      }
      setDateNow(Date.now());
      isFetching.current = false;
    };
    fetch();
  }, [blockNumber.data]);

  useEffect(() => {
    const fetch = async () => {
      if (chat.receivedMessages.length > 0) {
        const latestMessage =
          chat.receivedMessages[chat.receivedMessages.length - 1];
        if (
          latestMessage.data.body &&
          (latestMessage.data.body.split(":")[0] ===
            InteractionType.EVENT_LIVE ||
            latestMessage.data.body.split(":")[0] ===
              InteractionType.EVENT_LOCK ||
            latestMessage.data.body.split(":")[0] ===
              InteractionType.EVENT_PAYOUT ||
            latestMessage.data.body.split(":")[0] ===
              InteractionType.EVENT_END) &&
          Date.now() - latestMessage.timestamp < 12000
        ) {
          await refetch();
        }
      }
    };
    fetch();
  }, [chat.receivedMessages]);

  useEffect(() => {
    if (!walletIsConnected) {
      setErrorMessage("connect wallet first");
    } else if (!matchingChain) {
      setErrorMessage("wrong network");
    } else if (!doesEventExist) {
      setErrorMessage("no event found");
    } else if (
      Number(eventEndTimestamp) * 1000 < dateNow ||
      channelQueryData?.sharesEvent?.[0]?.eventState === SharesEventState.Payout
    ) {
      setErrorMessage("event over");
    } else if (!isBuying) {
      if (
        (isYay && Number(yayVotesBalance) < Number(amountOfVotes)) ||
        (!isYay && Number(nayVotesBalance) < Number(amountOfVotes))
      ) {
        setErrorMessage("insufficient votes to sell");
      }
    } else if (
      isBuying &&
      userEthBalance?.value &&
      votePrice > userEthBalance?.value
    ) {
      setErrorMessage("insufficient ETH to spend");
    } else {
      setErrorMessage("");
    }
  }, [
    walletIsConnected,
    matchingChain,
    userEthBalance,
    isBuying,
    votePrice,
    yayVotesBalance,
    nayVotesBalance,
    amountOfVotes,
    dateNow,
    eventEndTimestamp,
    doesEventExist,
  ]);

  const getColor = (taskType: InteractionType, isYay: boolean) => {
    if (taskType === InteractionType.BUY_VOTES && !isYay) return "#ff321f";
    if (taskType === InteractionType.SELL_VOTES && isYay) return "#fe6715";
    if (taskType === InteractionType.SELL_VOTES && !isYay) return "#bbd400";
    return "#14de02";
  };

  const handleIsAtBottom = useCallback((value: boolean) => {
    setIsAtBottom(value);
  }, []);

  const handleScrollToPresent = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToIndex(tradeMessages.length - 1);
    }
  }, [tradeMessages.length]);

  useEffect(() => {
    const scrollable = document.getElementById("scrollable");
    if (!scrollable) return;
    if (isAtBottom) handleScrollToPresent();
  }, [isAtBottom]);

  return (
    <>
      {doesEventExist && (
        <Flex
          direction="column"
          overflowX="auto"
          height="100%"
          width="100%"
          mt="8px"
          position="relative"
        >
          <Text
            textAlign={"center"}
            width="90%"
            fontSize={"20px"}
            fontWeight={"bold"}
          >
            {channelQueryData?.sharesEvent?.[0]?.sharesSubjectQuestion}
          </Text>
          <Text textAlign={"center"} fontSize="14px" color="#f8f53b">
            {truncateValue(formatUnits(votingPooledEth, 18), 4)} ETH in the pool
          </Text>
          <Flex
            direction="column"
            overflowX="auto"
            height="100%"
            id={"scrollable"}
            position="relative"
            mt="8px"
          >
            <Virtuoso
              ref={scrollRef}
              followOutput={"auto"}
              style={{
                height: "100%",
                overflowY: "scroll",
              }}
              className="hide-scrollbar"
              data={tradeMessages}
              atBottomStateChange={(isAtBottom) => handleIsAtBottom(isAtBottom)}
              initialTopMostItemIndex={tradeMessages.length - 1}
              itemContent={(index, data) => {
                const color = getColor(
                  data.taskType as InteractionType.BUY_VOTES,
                  data.isYay as boolean
                );
                return (
                  <Flex justifyContent={"space-between"}>
                    <Text>{data.trader}</Text>
                    <Text color={color}>
                      {data.taskType === InteractionType.BUY_VOTES
                        ? "bought"
                        : "sold"}{" "}
                      {data.amount} {data.isYay ? "YES" : "NO"}
                    </Text>
                  </Flex>
                );
              }}
            />
          </Flex>
          <Flex justifyContent="center">
            {!isAtBottom && tradeMessages.length > 0 && (
              <Box
                bg="rgba(98, 98, 98, 0.6)"
                p="4px"
                borderRadius="4px"
                _hover={{
                  background: "rgba(98, 98, 98, 0.3)",
                  cursor: "pointer",
                }}
                onClick={handleScrollToPresent}
              >
                <Text fontSize="12px" textAlign={"center"}>
                  scroll to present
                </Text>
              </Box>
            )}
          </Flex>
        </Flex>
      )}
      {errorMessage && (
        <Text textAlign={"center"} color="red.400">
          {errorMessage}
        </Text>
      )}
      {!doesEventExist && (
        <Text textAlign={"center"}>there is no event at the moment</Text>
      )}
      {doesEventExist &&
        Number(eventEndTimestamp) * 1000 > dateNow &&
        channelQueryData?.sharesEvent?.[0]?.eventState === "LIVE" && (
          <>
            <Flex justifyContent={"space-around"} gap="5px">
              <Flex gap="5px">
                <Button
                  bg={isYay ? "#46a800" : "transparent"}
                  border={!isYay ? "1px solid #46a800" : undefined}
                  _focus={{}}
                  _hover={{}}
                  _active={{}}
                  onClick={() => setIsYay(true)}
                >
                  <Flex alignItems={"center"} gap="2px">
                    <TriangleUpIcon />
                    {truncateValue(String(yayVotesSupply), 0, true)}
                  </Flex>
                </Button>
                <Button
                  bg={!isYay ? "#fe2815" : "transparent"}
                  border={isYay ? "1px solid #fe2815" : undefined}
                  _focus={{}}
                  _hover={{}}
                  _active={{}}
                  onClick={() => setIsYay(false)}
                >
                  <Flex alignItems={"center"} gap="2px">
                    <TriangleDownIcon />
                    {truncateValue(String(nayVotesSupply), 0, true)}
                  </Flex>
                </Button>
              </Flex>
              <Flex bg={"#131323"} borderRadius="15px">
                <Button
                  bg={isBuying ? "#46a800" : "transparent"}
                  border={!isBuying ? "1px solid #46a800" : undefined}
                  _focus={{}}
                  _hover={{}}
                  _active={{}}
                  onClick={() => setIsBuying(true)}
                >
                  BUY
                </Button>
                <Button
                  bg={!isBuying ? "#fe2815" : "transparent"}
                  border={isBuying ? "1px solid #fe2815" : undefined}
                  _focus={{}}
                  _hover={{}}
                  _active={{}}
                  onClick={() => setIsBuying(false)}
                >
                  SELL
                </Button>
              </Flex>
            </Flex>
            <Flex direction="column" borderRadius="15px" p="1rem">
              <Flex justifyContent={"space-between"} mb="5px">
                <Flex direction="column">
                  <Text fontSize="10px" textAlign="center">
                    how many
                  </Text>
                  <Flex alignItems={"center"}>
                    <Input
                      textAlign="center"
                      width={"70px"}
                      value={amountOfVotes}
                      onChange={handleInputChange}
                    />
                  </Flex>
                </Flex>
                <Flex direction="column">
                  <Text fontSize="10px" textAlign="center">
                    ETH price
                  </Text>
                  <Text whiteSpace={"nowrap"} margin="auto">
                    {truncateValue(formatUnits(votePrice, 18), 4)}
                  </Text>
                </Flex>
                <Flex direction="column">
                  <Text fontSize="10px" textAlign="center">
                    have
                  </Text>
                  <Text whiteSpace={"nowrap"} margin="auto">
                    {isYay ? yayVotesBalance : nayVotesBalance}
                  </Text>
                </Flex>
              </Flex>
              <Text>
                Time to close:{" "}
                {getTimeFromMillis(Number(eventEndTimestamp) * 1000 - dateNow)}
              </Text>
              <Button
                bg={
                  isBuying && isYay
                    ? "#46a800"
                    : isBuying && !isYay
                    ? "#fe2815"
                    : !isBuying && !isYay
                    ? "#809100"
                    : "#fe6715"
                }
                _focus={{}}
                _hover={{}}
                _active={{}}
                onClick={() => (isBuying ? buyVotes?.() : sellVotes?.())}
                disabled={(isBuying && !buyVotes) || (!isBuying && !sellVotes)}
              >
                {isBuying ? "BUY" : "SELL"}
              </Button>
            </Flex>
          </>
        )}
      {doesEventExist &&
        channelQueryData?.sharesEvent?.[0]?.eventState === "LOCK" && (
          <>
            <Flex justifyContent={"space-evenly"} my="10px">
              <Text color="#35b657" fontWeight="bold" fontSize="25px">
                {truncateValue(String(yayVotesSupply), 0, true)} YES
              </Text>
              <Text color="#ff623b" fontWeight="bold" fontSize="25px">
                {truncateValue(String(nayVotesSupply), 0, true)} NO
              </Text>
            </Flex>
            <Text textAlign={"center"} fontSize="14px" color="#e49c16">
              voting disabled
            </Text>
          </>
        )}
      {doesEventExist &&
        channelQueryData?.sharesEvent?.[0]?.eventState === "PAYOUT" &&
        eventVerified && (
          <>
            <Flex justifyContent="space-between">
              <Text fontSize="18px">event outcome</Text>
              <Text
                fontSize="18px"
                fontWeight="bold"
                color={eventResult === true ? "#02f042" : "#ee6204"}
              >
                {eventResult ? "Yes" : "No"}
              </Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontSize="18px">your winnings</Text>
              <Text fontSize="18px">
                {truncateValue(formatUnits(userPayout, 18))}
              </Text>
            </Flex>
            {userPayout > BigInt(0) && (
              <Button
                _hover={{}}
                _focus={{}}
                _active={{}}
                bg={"#E09025"}
                borderRadius="25px"
                isDisabled={!claimVotePayout}
                onClick={claimVotePayout}
              >
                <Text fontSize="20px">get payout</Text>
              </Button>
            )}
          </>
        )}
    </>
  );
};

const Chat = ({
  chat,
  isVipChat,
}: {
  chat: ChatReturnType;
  isVipChat?: boolean;
}) => {
  const {
    scrollRef,
    isAtBottom,
    channelChatCommands,
    handleScrollToPresent,
    handleIsAtBottom,
    sendChatMessage,
  } = useChatBox(
    isVipChat ? "vip-chat" : "chat",
    chat.receivedMessages,
    chat.hasMessagesLoaded,
    chat.channel
  );

  const [emojisToAnimate, setEmojisToAnimate] = useState<
    { emoji: string; id: number }[]
  >([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.offsetHeight);
    }
  }, [containerRef]);

  const handleAnimateReactionEmoji = (str: string) => {
    const id = Date.now();
    setEmojisToAnimate((prev) => [...prev, { emoji: str, id }]);

    // Remove the emoji from the state after the animation duration (1s)
    setTimeout(() => {
      setEmojisToAnimate((prev) => prev.filter((emoji) => emoji.id !== id));
    }, 4000);
  };

  useEffect(() => {
    if (!chat.allMessages || chat.allMessages.length === 0) return;
    const latestMessage = chat.allMessages[chat.allMessages.length - 1];
    if (
      Date.now() - latestMessage.timestamp < 300 &&
      latestMessage.name === ADD_REACTION_EVENT &&
      latestMessage.data.body
    )
      handleAnimateReactionEmoji(latestMessage.data.body);
  }, [chat.allMessages]);

  return (
    <Flex
      mt="10px"
      direction="column"
      minW="100%"
      width="100%"
      h="100%"
      position={"relative"}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          pointerEvents: "none",
        }}
        ref={containerRef}
      >
        {emojisToAnimate.map(({ emoji, id }) => (
          <span
            key={id}
            className="floatingEmoji"
            style={
              {
                "--translateY": `${containerHeight - 120}px`,
              } as CSSProperties & { "--translateY": string }
            }
          >
            {emoji}
          </span>
        ))}
      </div>
      <Flex
        direction="column"
        overflowX="auto"
        height="100%"
        id={isVipChat ? "vip-chat" : "chat"}
        position="relative"
        mt="8px"
      >
        <MessageList
          scrollRef={scrollRef}
          messages={chat.receivedMessages}
          channel={chat.channel}
          isAtBottomCallback={handleIsAtBottom}
          isVipChat={isVipChat}
        />
      </Flex>
      <Flex justifyContent="center">
        {!isAtBottom && chat.hasMessagesLoaded && (
          <Box
            bg="rgba(98, 98, 98, 0.6)"
            p="4px"
            borderRadius="4px"
            _hover={{
              background: "rgba(98, 98, 98, 0.3)",
              cursor: "pointer",
            }}
            onClick={handleScrollToPresent}
          >
            <Text fontSize="12px">
              scrolling paused. click to scroll to bottom.
            </Text>
          </Box>
        )}
      </Flex>
      <Flex w="100%">
        <ChatForm
          sendChatMessage={sendChatMessage}
          additionalChatCommands={channelChatCommands}
          allowPopout
          channel={chat.channel}
          isVipChat={isVipChat}
        />
      </Flex>
    </Flex>
  );
};

export default ChatComponent;
