import {
  Flex,
  Box,
  Text,
  Image,
  IconButton,
  Spinner,
  SimpleGrid,
  Stack,
  Button,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useLazyQuery } from "@apollo/client";
import { BiSolidBellOff, BiSolidBellRing } from "react-icons/bi";

import { GetSubscriptionQuery } from "../../generated/graphql";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useUser } from "../../hooks/context/useUser";
import ChannelDesc from "../channels/ChannelDesc";
import { ChatReturnType, useChatBox } from "../../hooks/chat/useChat";
import MessageList from "../chat/MessageList";
import ChatForm from "../chat/ChatForm";
import { GET_SUBSCRIPTION } from "../../constants/queries";
import useAddChannelToSubscription from "../../hooks/server/useAddChannelToSubscription";
import useRemoveChannelFromSubscription from "../../hooks/server/channel/useRemoveChannelFromSubscription";
import { BorderType, OuterBorder } from "../general/OuterBorder";
import { useOnClickOutside } from "../../hooks/internal/useOnClickOutside";
import Participants from "../presence/Participants";
import { VipBadgeBuy } from "../channels/vibes/VipBadgeBuy";
import useUserAgent from "../../hooks/internal/useUserAgent";
import Trade from "../channels/bet/Trade";
import VibesTokenInterface from "../chat/VibesTokenInterface";

export const EXCLUDED_SLUGS = ["loveonleverage"];

const StandaloneChatComponent = ({ chat }: { chat: ChatReturnType }) => {
  const { channel: channelContext, chat: chatInfo } = useChannelContext();
  const { userAddress } = useUser();
  const { channelQueryData } = channelContext;
  const { chatChannel } = chatInfo;

  const router = useRouter();
  const [isBellAnimating, setIsBellAnimating] = useState(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [showVip, setShowVip] = useState<boolean>(false);
  const [endpoint, setEndpoint] = useState<string>("");
  const clickedOutsideInfo = useRef(false);
  const clickedOutsideVip = useRef(false);
  const infoRef = useRef<HTMLDivElement>(null);
  const vipRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useOnClickOutside(infoRef, () => {
    if (showInfo) {
      setShowInfo(false);
      clickedOutsideInfo.current = true;
    }
    clickedOutsideVip.current = false;
  });

  useOnClickOutside(vipRef, () => {
    if (showVip) {
      setShowVip(false);
      clickedOutsideVip.current = true;
    }
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

  const { addChannelToSubscription } = useAddChannelToSubscription({
    onError: () => {
      console.error("Failed to add channel to subscription.");
    },
  });

  const { removeChannelFromSubscription } = useRemoveChannelFromSubscription({
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
    if (!endpoint) return;
    setIsLoading(true);
    await addChannelToSubscription({
      endpoint,
      channelId,
    });
    await handleGetSubscription();
    setIsLoading(false);
    setIsBellAnimating(true);
  };

  const handleRemoveChannelFromSubscription = async () => {
    if (!endpoint) return;
    setIsLoading(true);
    await removeChannelFromSubscription({
      endpoint,
      channelId,
    });
    await handleGetSubscription();
    setIsLoading(false);
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
      h={"75vh"}
      p="5px"
      id="chat"
      position={"relative"}
      marginTop={"25vh"}
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
            <Flex
              px="8px"
              borderRadius="15px"
              bg="rgba(255, 255, 255, 0.1)"
              onClick={() => {
                if (clickedOutsideInfo.current) {
                  clickedOutsideInfo.current = false;
                  return;
                }
                setShowInfo(!showInfo);
              }}
            >
              <Text fontSize="20px" cursor={"pointer"} color="#8793FF">
                /
                {(channelQueryData?.slug?.length ?? 0) > 10
                  ? channelQueryData?.slug.substring(0, 10).concat("...")
                  : channelQueryData?.slug}
              </Text>
            </Flex>
          </Flex>
          <Flex gap="10px">
            <IconButton
              color="white"
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
                isLoading ? (
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
          <InfoComponent />
        </Flex>
      )}
      <TabsComponent chat={chat} />
    </Flex>
  );
};

export const TabsComponent = ({ chat }: { chat: ChatReturnType }) => {
  const { userAddress } = useUser();
  const { chat: chatContext, channel } = useChannelContext();
  const { presenceChannel } = chatContext;
  const { isStandalone } = useUserAgent();

  const { channelQueryData } = channel;
  const [showParticipants, setShowParticipants] = useState(true);

  const isOwner = userAddress === channelQueryData?.owner.address;

  const [selectedTab, setSelectedTab] = useState<
    "chat" | "trade" | "vibes" | "vip"
  >("chat");

  return (
    <>
      <Flex width="100%" pb="0.5rem">
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
        {!isStandalone && (
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
              <Text fontFamily="LoRes15" fontSize="16px" fontWeight={"bold"}>
                vote
              </Text>
            </Flex>
          </OuterBorder>
        )}
        <OuterBorder
          type={BorderType.OCEAN}
          zIndex={selectedTab === "vibes" ? 4 : 2}
          onClick={() => setSelectedTab("vibes")}
          noborder
          pb={selectedTab === "vibes" ? "0px" : undefined}
        >
          <Flex
            bg={selectedTab === "vibes" ? "#1b9d9d" : "rgba(19, 18, 37, 1)"}
            py="0.3rem"
            width="100%"
            justifyContent={"center"}
          >
            <Text fontFamily="LoRes15" fontSize="16px" fontWeight={"bold"}>
              vibes
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
      {presenceChannel && (
        <Flex
          justifyContent={"center"}
          py="0.5rem"
          gap="5px"
          alignItems={"center"}
        >
          {EXCLUDED_SLUGS.includes(channelQueryData?.slug as string) &&
            isOwner && (
              <Button
                onClick={() => setShowParticipants((prev) => !prev)}
                bg={"#403c7d"}
                p={2}
                height={"20px"}
                _focus={{}}
                _active={{}}
                _hover={{
                  bg: "#8884d8",
                }}
              >
                <Text fontSize="14px" color="white">
                  {showParticipants ? "hide" : "show"}
                </Text>
              </Button>
            )}
          <Participants
            ablyPresenceChannel={presenceChannel}
            show={showParticipants}
          />
        </Flex>
      )}
      <Flex p={"0.5rem"} width={"100%"} height={"100%"} direction="column">
        {selectedTab === "chat" && <Chat chat={chat} />}
        {selectedTab === "trade" && <Trade />}
        {selectedTab === "vibes" && (
          <Flex h="100%" justifyContent={"space-between"}>
            <VibesTokenInterface isExchangeColumn ablyChannel={chat.channel} />
          </Flex>
        )}
        {selectedTab === "vip" && <Chat chat={chat} isVipChat />}
      </Flex>
    </>
  );
};

const InfoComponent = () => {
  const { userAddress } = useUser();
  const { channel: channelContext, ui } = useChannelContext();
  const {
    handleNotificationsModal,
    handleEditModal,
    handleChatCommandModal,
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

const Chat = ({
  chat,
  isVipChat,
}: {
  chat: ChatReturnType;
  isVipChat?: boolean;
}) => {
  const { user } = useUser();

  const { channel, leaderboard } = useChannelContext();
  const { channelQueryData, channelRoles } = channel;
  const { isVip } = leaderboard;

  const userIsChannelOwner = useMemo(
    () => user?.address === channelQueryData?.owner.address,
    [user, channelQueryData]
  );

  const userIsModerator = useMemo(
    () =>
      channelRoles.some((m) => m?.address === user?.address && m?.role === 2),
    [user, channelRoles]
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

  return (
    <Flex
      direction="column"
      minW="100%"
      width="100%"
      h="100%"
      position={"relative"}
    >
      {!isVip && !userIsChannelOwner && !userIsModerator && isVipChat && (
        <Flex direction="column">
          <Text textAlign={"center"}>
            You must have a VIP badge to use this chat.
          </Text>
          <VipBadgeBuy />
        </Flex>
      )}
      <Flex
        direction="column"
        overflowX="auto"
        height="100%"
        id={isVipChat ? "vip-chat" : "chat"}
        position="relative"
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
          tokenForTransfer="vibes"
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
