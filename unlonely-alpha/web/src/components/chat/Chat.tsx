import { Flex, Box, Text } from "@chakra-ui/react";
import { useMemo } from "react";

import { ChatReturnType } from "../../hooks/chat/useChat";
import { useChannelContext } from "../../hooks/context/useChannel";
import ChatForm from "./ChatForm";
import MessageList from "./MessageList";
import { useUser } from "../../hooks/context/useUser";
import { VipBadgeBuy } from "../channels/vibes/VipBadgeBuy";
import { useChatBox } from "../../hooks/chat/useChatBox";

const Chat = ({
  chat,
  tokenForTransfer,
  isVipChat,
}: {
  chat: ChatReturnType;
  tokenForTransfer: "vibes" | "tempToken";
  isVipChat?: boolean;
}) => {
  const { channel, leaderboard } = useChannelContext();
  const { channelQueryData, channelRoles } = channel;
  const { isVip } = leaderboard;
  const { user } = useUser();

  const userIsChannelOwner = useMemo(
    () => user?.address === channelQueryData?.owner.address,
    [user, channelQueryData]
  );

  const userIsModerator = useMemo(
    () =>
      channelRoles?.some((m) => m?.address === user?.address && m?.role === 2),
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
          scrollRef={scrollRef}
          messages={chat.receivedMessages}
          channel={chat.channel}
          isAtBottomCallback={handleIsAtBottom}
          isVipChat={isVipChat}
          tokenForTransfer={tokenForTransfer}
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
        <Flex w="100%" px="0.5rem" pb="0.5rem">
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

export default Chat;
