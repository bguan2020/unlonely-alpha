import {
  Flex,
  Box,
  Text,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tr,
  Image,
  IconButton,
  Spinner,
  SimpleGrid,
  Stack,
  Button,
} from "@chakra-ui/react";
import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/router";
import { useLazyQuery } from "@apollo/client";
import { BiSolidBellOff, BiSolidBellRing } from "react-icons/bi";

import { GetSubscriptionQuery } from "../../generated/graphql";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useUser } from "../../hooks/context/useUser";
import ChannelDesc from "../channels/ChannelDesc";
import { getSortedLeaderboard } from "../../utils/getSortedLeaderboard";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { ChatReturnType, useChatBox, useChat } from "../../hooks/chat/useChat";
import { ADD_REACTION_EVENT } from "../../constants";
import MessageList from "../chat/MessageList";
import ChatForm from "../chat/ChatForm";
import { GET_SUBSCRIPTION } from "../../constants/queries";
import useAddChannelToSubscription from "../../hooks/server/useAddChannelToSubscription";
import useRemoveChannelFromSubscription from "../../hooks/server/useRemoveChannelFromSubscription";
import { BorderType, OuterBorder } from "../general/OuterBorder";
import { Trade } from "../chat/ChatComponent";
import { useNetworkContext } from "../../hooks/context/useNetwork";
import { useOnClickOutside } from "../../hooks/internal/useOnClickOutside";
import { ChannelTournament } from "../channels/ChannelTournament";

const StandaloneChatComponent = ({
  previewStream,
  handleShowPreviewStream,
}: {
  previewStream?: boolean;
  handleShowPreviewStream: () => void;
}) => {
  const { channel: channelContext, chat: chatInfo } = useChannelContext();
  const { userAddress } = useUser();
  const { channelQueryData } = channelContext;
  const { chatChannel } = chatInfo;
  const chat = useChat();

  const router = useRouter();
  const [isBellAnimating, setIsBellAnimating] = useState(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showVip, setShowVip] = useState<boolean>(false);
  const [endpoint, setEndpoint] = useState<string>("");
  const clickedOutsideInfo = useRef(false);
  const clickedOutsideLeaderBoard = useRef(false);
  const clickedOutsideVip = useRef(false);
  const infoRef = useRef<HTMLDivElement>(null);
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const vipRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(infoRef, () => {
    if (showInfo) {
      setShowInfo(false);
      clickedOutsideInfo.current = true;
    }
    clickedOutsideLeaderBoard.current = false;
    clickedOutsideVip.current = false;
  });

  useOnClickOutside(leaderboardRef, () => {
    if (showLeaderboard) {
      setShowLeaderboard(false);
      clickedOutsideLeaderBoard.current = true;
    }
    clickedOutsideInfo.current = false;
    clickedOutsideVip.current = false;
  });

  useOnClickOutside(vipRef, () => {
    if (showVip) {
      setShowVip(false);
      clickedOutsideVip.current = true;
    }
    clickedOutsideLeaderBoard.current = false;
    clickedOutsideInfo.current = false;
  });

  const isOwner = userAddress === channelQueryData?.owner.address;

  const channelId = useMemo(
    () => (channelQueryData?.id ? Number(channelQueryData?.id) : 3),
    [channelQueryData?.id]
  );

  const [getSubscription, { data }] = useLazyQuery<GetSubscriptionQuery>(
    GET_SUBSCRIPTION,
    {
      fetchPolicy: "network-only",
    }
  );

  const { addChannelToSubscription, loading: addLoading } =
    useAddChannelToSubscription({
      onError: () => {
        console.error("Failed to add channel to subscription.");
      },
    });

  const { removeChannelFromSubscription, loading: removeLoading } =
    useRemoveChannelFromSubscription({
      onError: () => {
        console.error("Failed to remove channel from subscription.");
      },
    });

  const handleGetSubscription = useCallback(async () => {
    await getSubscription({
      variables: { data: { endpoint } },
    });
  }, [endpoint]);

  const channelCanNotify = useMemo(
    () =>
      data?.getSubscriptionByEndpoint?.allowedChannels?.includes(
        String(channelId)
      ),
    [channelId, data]
  );

  useEffect(() => {
    if (endpoint) {
      handleGetSubscription();
    }
  }, [endpoint]);

  useEffect(() => {
    const init = async () => {
      if ("serviceWorker" in navigator) {
        const registrationExists =
          await navigator.serviceWorker.getRegistration("/");
        if (registrationExists) {
          const subscription =
            await registrationExists.pushManager.getSubscription();
          if (subscription) {
            const endpoint = subscription.endpoint;
            setEndpoint(endpoint);
          }
        }
      }
    };
    init();
  }, []);

  const handleAddChannelToSubscription = async () => {
    await addChannelToSubscription({
      endpoint,
      channelId,
    });
    await handleGetSubscription();
    setIsBellAnimating(true);
  };

  const handleRemoveChannelFromSubscription = async () => {
    await removeChannelFromSubscription({
      endpoint,
      channelId,
    });
    await handleGetSubscription();
  };

  const share = async () => {
    if (navigator.share && channelQueryData) {
      navigator
        .share({
          title: channelQueryData?.name ?? "Unlonely Stream",
          url: `${window.location.origin}/channels/${channelQueryData.slug}`,
        })
        .then(() => {
          console.log("Thanks for sharing!");
        })
        .catch(console.error);
    } else {
      // Fallback for browsers that do not support the Web Share API
      console.log("Your browser does not support the Web Share API.");
    }
  };

  useEffect(() => {
    if (isBellAnimating) {
      const button = document.getElementById("bellring");

      const handleAnimationEnd = () => {
        setIsBellAnimating(false);
      };

      button?.addEventListener("animationend", handleAnimationEnd);

      // Cleanup function
      return () => {
        button?.removeEventListener("animationend", handleAnimationEnd);
      };
    }
  }, [isBellAnimating]);

  return (
    <Flex
      direction="column"
      h={!previewStream && isOwner ? "100vh" : "75vh"}
      p="5px"
      id="chat"
      position={"relative"}
      marginTop={!previewStream && isOwner ? "0" : "25vh"}
    >
      {chatChannel?.includes("channel") ? (
        <Flex justifyContent={"space-between"} py="2px">
          <Flex alignItems="center">
            <IconButton
              _hover={{}}
              _focus={{}}
              _active={{}}
              minWidth="6"
              aria-label="Back"
              bg="transparent"
              icon={<Image src="/svg/mobile/back.svg" h="50%" />}
              onClick={() => router.push("/")}
            />
            <IconButton
              _hover={{}}
              _focus={{}}
              _active={{}}
              minWidth="6"
              aria-label="Back"
              bg="transparent"
              icon={<Image src="/svg/mobile/share.svg" h="50%" />}
              onClick={share}
            />
            <IconButton
              _hover={{}}
              _focus={{}}
              _active={{}}
              minWidth="6"
              aria-label="leaderboard"
              bg="transparent"
              icon={<Image src="/svg/mobile/leaderboard.svg" h="50%" />}
              onClick={() => {
                if (clickedOutsideLeaderBoard.current) {
                  clickedOutsideLeaderBoard.current = false;
                  return;
                }
                setShowLeaderboard(!showLeaderboard);
              }}
            />
            <Text
              pl="5px"
              fontSize="20px"
              cursor={"pointer"}
              color="#8793FF"
              onClick={() => {
                if (clickedOutsideInfo.current) {
                  clickedOutsideInfo.current = false;
                  return;
                }
                setShowInfo(!showInfo);
              }}
            >
              /{channelQueryData?.slug}
            </Text>
          </Flex>
          <Flex gap="10px">
            <IconButton
              _hover={{}}
              _focus={{}}
              _active={{}}
              bg="transparent"
              opacity={channelCanNotify ? 1 : 0.5}
              aria-label="notify"
              id="bellring"
              className={isBellAnimating ? "bell" : ""}
              width="unset"
              icon={
                addLoading || removeLoading ? (
                  <Spinner />
                ) : channelCanNotify ? (
                  <BiSolidBellRing height={"100%"} />
                ) : (
                  <BiSolidBellOff height={"100%"} />
                )
              }
              onClick={() => {
                if (channelCanNotify) {
                  handleRemoveChannelFromSubscription();
                } else {
                  handleAddChannelToSubscription();
                }
              }}
            />
            <Button
              _hover={{}}
              _focus={{}}
              _active={{}}
              px={"5px"}
              bg={
                "linear-gradient(163deg, rgba(255,255,255,1) 0%, rgba(255,227,143,1) 3%, rgba(255,213,86,1) 4%, rgba(246,190,45,1) 6%, #bb7205 7%, #daab0f 63%, #925a00 100%)"
              }
              boxShadow={"-2px -2px 2px white"}
              onClick={() => {
                if (clickedOutsideVip.current) {
                  clickedOutsideVip.current = false;
                  return;
                }
                setShowVip(!showVip);
              }}
            >
              <Text fontFamily="LoRes15" fontSize="18px">
                BUY VIP
              </Text>
            </Button>
          </Flex>
        </Flex>
      ) : (
        <IconButton
          aria-label="Back"
          bg="transparent"
          icon={<Image src="/svg/mobile/back.svg" />}
          onClick={() => router.push("/")}
        />
      )}
      {showInfo && (
        <Flex ref={infoRef}>
          <InfoComponent
            previewStream={previewStream}
            handleShowPreviewStream={handleShowPreviewStream}
          />
        </Flex>
      )}
      {showLeaderboard && (
        <Flex ref={leaderboardRef}>
          <LeaderboardComponent />
        </Flex>
      )}
      {showVip && (
        <Flex ref={vipRef}>
          <VipTradeComponent chat={chat} />
        </Flex>
      )}
      <TabsComponent />
    </Flex>
  );
};

export const TabsComponent = () => {
  const { channel: channelContext } = useChannelContext();
  const { channelQueryData } = channelContext;

  const chat = useChat();

  const doesEventExist = useMemo(() => {
    if (!channelQueryData?.sharesEvent?.[0]?.sharesSubjectAddress) return false;
    if (!channelQueryData?.sharesEvent?.[0]?.id) return false;
    return true;
  }, [channelQueryData?.sharesEvent]);

  const [selectedTab, setSelectedTab] = useState<"chat" | "trade" | "vip">(
    "chat"
  );

  return (
    <>
      <Flex width="100%">
        <OuterBorder
          type={BorderType.OCEAN}
          zIndex={selectedTab === "chat" ? 4 : 2}
          onClick={() => setSelectedTab("chat")}
          noborder
          pb={selectedTab === "chat" ? "0px" : undefined}
        >
          <Flex
            bg={selectedTab === "chat" ? "#1b9d9d" : "rgba(19, 18, 37, 1)"}
            py="0.3rem"
            width="100%"
            justifyContent={"center"}
          >
            <Text fontFamily="LoRes15" fontSize="16px" fontWeight={"bold"}>
              chat
            </Text>
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
            bg={selectedTab === "trade" ? "#1b9d9d" : "rgba(19, 18, 37, 1)"}
            py="0.3rem"
            width="100%"
            justifyContent={"center"}
          >
            {doesEventExist && (
              <Text className="zooming-text" fontSize="8px">
                🔴
              </Text>
            )}
            <Text fontFamily="LoRes15" fontSize="16px" fontWeight={"bold"}>
              vote
            </Text>
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
                ? "#1b9d9d"
                : "linear-gradient(163deg, rgba(255,255,255,1) 1%, rgba(255,227,143,1) 13%, rgba(255,213,86,1) 14%, rgba(246,190,45,1) 16%, rgba(249,163,32,1) 27%, rgba(231,143,0,1) 28%, #2e1405 30%, #603208 100%)"
            }
            py="0.3rem"
            width="100%"
            justifyContent={"center"}
          >
            <Text fontFamily="LoRes15" fontSize="16px" fontWeight={"bold"}>
              vip
            </Text>
          </Flex>
        </OuterBorder>
      </Flex>
      <Flex p={"0.5rem"} width={"100%"} height={"100%"} direction="column">
        {selectedTab === "chat" && <Chat chat={chat} />}
        {selectedTab === "trade" && <Trade chat={chat} />}
        {selectedTab === "vip" && <Chat chat={chat} isVipChat />}
      </Flex>
    </>
  );
};

const InfoComponent = ({
  previewStream,
  handleShowPreviewStream,
}: {
  previewStream?: boolean;
  handleShowPreviewStream: () => void;
}) => {
  const { userAddress } = useUser();
  const { channel: channelContext, ui } = useChannelContext();
  const {
    handleNotificationsModal,
    handleEventModal,
    handleEditModal,
    handleChatCommandModal,
    handleBetModal,
    handleModeratorModal,
  } = ui;
  const { channelQueryData } = channelContext;
  const isOwner = userAddress === channelQueryData?.owner.address;

  return (
    <Flex
      borderRadius={"5px"}
      p="1px"
      position="absolute"
      top="50px"
      left="0"
      width={"100%"}
      zIndex={5}
      style={{
        border: "1px solid",
        borderWidth: "1px",
        borderImageSource:
          "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)",
        borderImageSlice: 1,
        borderRadius: "5px",
      }}
    >
      <Flex
        direction="column"
        bg={"rgba(19, 19, 35, 1)"}
        borderRadius={"5px"}
        width={"100%"}
        padding="10px"
      >
        <Flex justifyContent={"space-between"}>
          <ChannelDesc />
          {isOwner && (
            <IconButton
              onClick={handleShowPreviewStream}
              aria-label="preview"
              _hover={{}}
              _active={{}}
              _focus={{}}
              icon={
                <Image
                  src="/svg/preview-video.svg"
                  height={12}
                  style={{
                    filter: previewStream ? "grayscale(100%)" : "none",
                  }}
                />
              }
            />
          )}
        </Flex>
        {isOwner && (
          <Stack
            my={["0", "5rem"]}
            direction="column"
            width={"100%"}
            justifyContent="center"
          >
            <Flex width={"100%"} position="relative" justifyContent={"center"}>
              <SimpleGrid columns={3} spacing={10}>
                <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
                  <Text textAlign="center">send notifications</Text>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="10px"
                    onClick={() => handleNotificationsModal(true)}
                    _hover={{
                      cursor: "pointer",
                      transform: "scale(1.1)",
                      transitionDuration: "0.3s",
                    }}
                    _active={{
                      transform: "scale(1)",
                    }}
                  >
                    <Image src="/svg/notifications.svg" width="100%" />
                  </Box>
                </Flex>
                <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
                  <Text textAlign="center">add event</Text>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="10px"
                    onClick={() => handleEventModal(true)}
                    _hover={{
                      cursor: "pointer",
                      transform: "scale(1.1)",
                      transitionDuration: "0.3s",
                    }}
                    _active={{
                      transform: "scale(1)",
                    }}
                  >
                    <Image src="/svg/calendar.svg" width="100%" />
                  </Box>
                </Flex>
                <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
                  <Text textAlign="center">
                    edit channel title / description
                  </Text>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="10px"
                    onClick={() => handleEditModal(true)}
                    _hover={{
                      cursor: "pointer",
                      transform: "scale(1.1)",
                      transitionDuration: "0.3s",
                    }}
                    _active={{
                      transform: "scale(1)",
                    }}
                  >
                    <Image src="/svg/edit.svg" width="100%" />
                  </Box>
                </Flex>
                <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
                  <Text textAlign="center">custom commands</Text>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="10px"
                    onClick={() => handleChatCommandModal(true)}
                    _hover={{
                      cursor: "pointer",
                      transform: "scale(1.1)",
                      transitionDuration: "0.3s",
                    }}
                    _active={{
                      transform: "scale(1)",
                    }}
                  >
                    <Image src="/svg/custom-commands.svg" width="100%" />
                  </Box>
                </Flex>
                <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
                  <Text textAlign="center">
                    {channelQueryData?.sharesEvent?.[0]
                      ? "🔴manage bet"
                      : "create a bet"}
                  </Text>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="10px"
                    onClick={() => handleBetModal(true)}
                    _hover={{
                      cursor: "pointer",
                      transform: "scale(1.1)",
                      transitionDuration: "0.3s",
                    }}
                    _active={{
                      transform: "scale(1)",
                    }}
                  >
                    <Image src="/svg/bet.svg" width="100%" />
                  </Box>
                </Flex>
                <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
                  <Text textAlign={"center"}>moderators</Text>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="10px"
                    onClick={() => handleModeratorModal(true)}
                    _hover={{
                      cursor: "pointer",
                      transform: "scale(1.1)",
                      transitionDuration: "0.3s",
                    }}
                    _active={{
                      transform: "scale(1)",
                    }}
                  >
                    <Image src="/svg/mods.svg" width="100%" />
                  </Box>
                </Flex>
              </SimpleGrid>
            </Flex>
          </Stack>
        )}
      </Flex>
    </Flex>
  );
};

const LeaderboardComponent = () => {
  const { leaderboard: leaderboardContext } = useChannelContext();
  const { network } = useNetworkContext();
  const { localNetwork } = network;

  const {
    data: leaderboardData,
    loading: leaderboardLoading,
    error: leaderboardError,
    refetchGamblableEventLeaderboard,
  } = leaderboardContext;

  const [leaderboard, setLeaderboard] = useState<
    { name: string; totalFees: number }[]
  >([]);

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
      borderRadius={"5px"}
      p="1px"
      position="absolute"
      top="50px"
      bottom="10px"
      left="0"
      width={"100%"}
      zIndex={5}
      style={{
        border: "1px solid",
        borderWidth: "1px",
        borderImageSource:
          "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)",
        borderImageSlice: 1,
        borderRadius: "5px",
      }}
    >
      <Flex
        direction="column"
        bg={"rgba(19, 19, 35, 1)"}
        borderRadius={"5px"}
        width={"100%"}
      >
        <Text fontSize={"20px"} textAlign={"center"} fontFamily={"LoRes15"}>
          leaderboard
        </Text>
        {!leaderboardLoading && leaderboard.length > 0 && (
          <TableContainer overflowX={"auto"} overflowY="scroll">
            <Table variant="unstyled">
              <Tbody>
                {leaderboard.map((holder, index) => (
                  <Tr>
                    <Td fontSize={"20px"} p="4px" textAlign="center">
                      <Text fontSize="14px">{index + 1}</Text>
                    </Td>
                    <Td fontSize={"20px"} p="4px" textAlign="center">
                      <Text fontSize="14px">{holder.name}</Text>
                    </Td>
                    <Td fontSize={"20px"} p="4px" textAlign="center" isNumeric>
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
        {leaderboardLoading && (
          <Flex justifyContent={"center"} p="20px">
            <Spinner />
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

const VipTradeComponent = ({ chat }: { chat: ChatReturnType }) => {
  return (
    <Flex
      borderRadius={"5px"}
      p="1px"
      position="absolute"
      top="50px"
      bottom="10px"
      left="0"
      width={"100%"}
      zIndex={5}
      style={{
        border: "1px solid",
        borderWidth: "1px",
        borderImageSource:
          "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)",
        borderImageSlice: 1,
        borderRadius: "5px",
      }}
    >
      <Flex
        direction="column"
        bg={"rgba(19, 19, 35, 1)"}
        borderRadius={"5px"}
        width={"100%"}
        gap="5px"
      >
        {/* <TournamentPot chat={chat} /> */}
        <ChannelTournament />
      </Flex>
    </Flex>
  );
};

const Chat = ({
  chat,
  isVipChat,
}: {
  chat: ChatReturnType;
  isVipChat?: boolean;
}) => {
  const { user } = useUser();

  const { channel, leaderboard } = useChannelContext();
  const { channelQueryData } = channel;
  const { isVip } = leaderboard;

  const userIsChannelOwner = useMemo(
    () => user?.address === channelQueryData?.owner.address,
    [user, channelQueryData]
  );

  const userIsModerator = useMemo(
    () =>
      channelQueryData?.roles?.some(
        (m) => m?.userAddress === user?.address && m?.role === 2
      ),
    [user, channelQueryData]
  );

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

    // Remove the emoji from the state after the animation duration
    setTimeout(() => {
      setEmojisToAnimate((prev) => prev.filter((emoji) => emoji.id !== id));
    }, 4000);
  };

  useEffect(() => {
    if (!chat.allMessages || chat.allMessages.length === 0) return;
    const latestMessage = chat.allMessages[chat.allMessages.length - 1];
    if (
      Date.now() - latestMessage.timestamp < 2000 &&
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
          position: "absolute",
          pointerEvents: "none",
          height: "100%",
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
      {!isVip && !userIsChannelOwner && !userIsModerator && isVipChat && (
        <>
          <Text textAlign={"center"}>
            You must have at least one VIP badge to use this chat.
          </Text>
        </>
      )}
      <Flex
        direction="column"
        overflowX="auto"
        height="100%"
        id={isVipChat ? "vip-chat" : "chat"}
        position="relative"
        mt="8px"
      >
        {!isVip && !userIsChannelOwner && !userIsModerator && isVipChat && (
          <Flex
            position="absolute"
            style={{ backdropFilter: "blur(6px)" }}
            left={"0"}
            right={"0"}
            top={"0"}
            bottom={"0"}
            zIndex={"1"}
          />
        )}
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
      {(userIsChannelOwner || userIsModerator || isVip || !isVipChat) && (
        <Flex w="100%">
          <ChatForm
            sendChatMessage={sendChatMessage}
            additionalChatCommands={channelChatCommands}
            allowPopout
            channel={chat.channel}
            isVipChat={isVipChat}
          />
        </Flex>
      )}
    </Flex>
  );
};

export default StandaloneChatComponent;
