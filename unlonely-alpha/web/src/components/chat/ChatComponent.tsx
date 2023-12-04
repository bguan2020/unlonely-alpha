import { Flex, Text, Container, Image, Tooltip } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { InteractionType } from "../../constants";
import { ChatReturnType } from "../../hooks/chat/useChat";
import { useChannelContext } from "../../hooks/context/useChannel";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { OuterBorder, BorderType } from "../general/OuterBorder";
import Participants from "../presence/Participants";
import Trade from "../channels/bet/Trade";
import Chat from "./Chat";

const ChatComponent = ({ chat }: { chat: ChatReturnType }) => {
  const { isStandalone } = useUserAgent();
  const [selectedTab, setSelectedTab] = useState<"chat" | "trade" | "vip">(
    "chat"
  );
  const {
    channel: channelContext,
    leaderboard: leaderboardContext,
    chat: chatContext,
    ui: uiContext,
  } = useChannelContext();
  const { channelQueryData, refetch } = channelContext;
  const { presenceChannel } = chatContext;
  const { handleTradeLoading } = uiContext;

  // const { network } = useNetworkContext();
  // const { localNetwork } = network;

  // const {
  //   data: leaderboardData,
  //   loading: leaderboardLoading,
  //   error: leaderboardError,
  //   refetchGamblableEventLeaderboard,
  // } = leaderboardContext;

  // const [leaderboard, setLeaderboard] = useState<
  //   { name: string; totalFees: number }[]
  // >([]);
  // const [leaderboardIsCollapsed, setLeaderboardIsCollapsed] = useState(true);
  // useEffect(() => {
  //   refetchGamblableEventLeaderboard?.();
  // }, [localNetwork]);

  // useEffect(() => {
  //   if (!leaderboardLoading && !leaderboardError && leaderboardData) {
  //     const _leaderboard: { name: string; totalFees: number }[] =
  //       getSortedLeaderboard(
  //         leaderboardData.getGamblableEventLeaderboardByChannelId
  //       );
  //     setLeaderboard(_leaderboard);
  //   }
  // }, [leaderboardLoading, leaderboardError, leaderboardData]);

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
          handleTradeLoading(true);
          await refetch();
          handleTradeLoading(false);
        }
      }
    };
    fetch();
  }, [chat.receivedMessages]);

  return (
    <Flex
      height={!isStandalone ? { base: "80vh" } : "100%"}
      position={"relative"}
    >
      <OuterBorder type={BorderType.OCEAN} p={"0"}>
        <Container centerContent maxW="100%" h="100%" alignSelf="end" p="0">
          <Flex width="100%">
            <OuterBorder
              cursor={"pointer"}
              type={BorderType.OCEAN}
              zIndex={selectedTab === "chat" ? 4 : 2}
              onClick={() => setSelectedTab("chat")}
              noborder
              pb={selectedTab === "chat" ? "0px" : undefined}
            >
              <Flex
                bg={selectedTab === "chat" ? "#1b9d9d" : "rgba(19, 18, 37, 1)"}
                width="100%"
                justifyContent={"center"}
              >
                <Text fontFamily="LoRes15" fontSize="20px" fontWeight={"bold"}>
                  chat
                </Text>
              </Flex>
            </OuterBorder>
            {/* <OuterBorder
              cursor={"pointer"}
              type={BorderType.OCEAN}
              zIndex={selectedTab === "trade" ? 4 : 2}
              onClick={() => setSelectedTab("trade")}
              noborder
              pb={selectedTab === "trade" ? "0px" : undefined}
            >
              <Flex
                bg={selectedTab === "trade" ? "#1b9d9d" : "rgba(19, 18, 37, 1)"}
                width="100%"
                justifyContent={"center"}
                alignItems={"center"}
              >
                {doesEventExist && (
                  <Text className="zooming-text" fontSize="10px">
                    🔴
                  </Text>
                )}
                <Text
                  alignItems={"center"}
                  fontFamily="LoRes15"
                  fontSize="20px"
                  fontWeight={"bold"}
                >
                  vote
                </Text>
              </Flex>
            </OuterBorder> */}
            <OuterBorder
              cursor={"pointer"}
              type={BorderType.OCEAN}
              zIndex={selectedTab === "vip" ? 4 : 2}
              onClick={() => setSelectedTab("vip")}
              noborder
              pb={selectedTab === "vip" ? "0px" : undefined}
            >
              <Flex
                bg={
                  selectedTab === "vip"
                    ? "#1b9d9d"
                    : "linear-gradient(163deg, rgba(255,255,255,1) 1%, rgba(255,227,143,1) 13%, rgba(255,213,86,1) 14%, rgba(246,190,45,1) 16%, rgba(249,163,32,1) 27%, rgba(231,143,0,1) 28%, #2e1405 30%, #603208 100%)"
                }
                width="100%"
                justifyContent={"center"}
                alignItems={"center"}
                gap="5px"
              >
                <Text fontFamily="LoRes15" fontSize="20px" fontWeight={"bold"}>
                  vip
                </Text>
                <Tooltip
                  label="buy a vip badge to get access to the VIP chat!"
                  shouldWrapChildren
                >
                  <Image src="/svg/info.svg" width="16px" height="16px" />
                </Tooltip>
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
              p={"0.5rem"}
              width={"100%"}
              direction="column"
            >
              {presenceChannel && (
                <Participants ablyPresenceChannel={presenceChannel} />
              )}
              {/* <Flex
                mt={"0.5rem"}
                borderRadius={"5px"}
                p="1px"
                zIndex={3}
                mb="30px"
              >
                <Flex
                  direction="column"
                  position="absolute"
                  bg="rgba(24, 22, 47, 1)"
                  left={"10px"}
                  right={"10px"}
                  border={"1px solid rgba(255, 255, 255, 0.1)"}
                >
                  <Text
                    fontSize={"20px"}
                    textAlign={"center"}
                    fontFamily={"LoRes15"}
                  >
                    leaderboard
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
                  {leaderboard.length > 0 && (
                    <TableContainer
                      overflowY={leaderboardIsCollapsed ? "hidden" : "scroll"}
                      height={leaderboardIsCollapsed ? "45px" : "150px"}
                      transition={"max-height 0.2s ease-in-out"}
                    >
                      <Table variant="unstyled" size="xs">
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
                  )}
                  {leaderboard.length === 0 && (
                    <Flex height="40px" justifyContent={"center"}>
                      <Text fontSize="10px">
                        no one is on the leaderboard for this channel yet! 👀
                      </Text>
                    </Flex>
                  )}
                  {leaderboardLoading && (
                    <Flex justifyContent={"center"} p="20px">
                      <Spinner />
                    </Flex>
                  )}
                </Flex>
              </Flex> */}
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

export default ChatComponent;
