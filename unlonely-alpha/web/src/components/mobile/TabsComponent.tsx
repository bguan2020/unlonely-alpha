import { Flex, Box, Text, Button } from "@chakra-ui/react";
import { useMemo, useState } from "react";

import { useChannelContext } from "../../hooks/context/useChannel";
import { useUser } from "../../hooks/context/useUser";
import { ChatReturnType } from "../../hooks/chat/useChat";
import MessageList from "../chat/MessageList";
import ChatForm from "../chat/ChatForm";
import { BorderType, OuterBorder } from "../general/OuterBorder";
import Participants from "../presence/Participants";
import { VipBadgeBuy } from "../channels/vibes/VipBadgeBuy";
import VibesTokenInterface from "../channels/vibes/VibesTokenInterface";
import { useChatBox } from "../../hooks/chat/useChatBox";
import {
  CHANNEL_IDS_NO_VIP,
  CHANNEL_SLUGS_CAN_HIDE_PARTICIPANTS,
} from "../../constants";

export const TabsComponent = ({ chat }: { chat: ChatReturnType }) => {
  const { chat: chatContext, channel } = useChannelContext();
  const { presenceChannel } = chatContext;

  const { channelQueryData, isOwner } = channel;
  const [showParticipants, setShowParticipants] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"chat" | "vibes" | "vip">(
    "chat"
  );

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
        {channelQueryData?.id &&
          !CHANNEL_IDS_NO_VIP.includes(Number(channelQueryData?.id)) && (
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
          )}
      </Flex>
      {presenceChannel && (
        <Flex
          justifyContent={"center"}
          py="0.5rem"
          gap="5px"
          alignItems={"center"}
        >
          {CHANNEL_SLUGS_CAN_HIDE_PARTICIPANTS.includes(
            channelQueryData?.slug as string
          ) &&
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
        {selectedTab === "chat" && <ChatTab chat={chat} />}
        {selectedTab === "vibes" && (
          <Flex h="100%" justifyContent={"space-between"}>
            <VibesTokenInterface isExchangeColumn ablyChannel={chat.channel} />
          </Flex>
        )}
        {selectedTab === "vip" && <ChatTab chat={chat} isVipChat />}
      </Flex>
    </>
  );
};

const ChatTab = ({
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
    () => user?.address === channelQueryData?.owner?.address,
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
          <VipBadgeBuy chat={chat} />
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
          hidePinnedMessages={false}
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
            messages={chat.receivedMessages}
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
