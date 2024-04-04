import { Flex, Text, Box } from "@chakra-ui/react";
import { ChatReturnType, useChatBox } from "../../hooks/chat/useChat";
import MessageList from "./MessageList";
import ChatForm from "./ChatForm";
import { useChannelContext } from "../../hooks/context/useChannel";

export const SimplifiedChatWithTokenTimer = ({
  chat,
}: {
  chat: ChatReturnType;
}) => {
  const { channel } = useChannelContext();
  const {
    timeLeftForTempToken,
    currentActiveTokenIsAlwaysTradable,
    currentActiveTokenAddress,
  } = channel;
  const {
    scrollRef,
    isAtBottom,
    channelChatCommands,
    handleScrollToPresent,
    handleIsAtBottom,
    sendChatMessage,
  } = useChatBox(
    "chat",
    chat.receivedMessages,
    chat.hasMessagesLoaded,
    chat.channel
  );

  return (
    <Flex
      right="0"
      top="0"
      direction="column"
      height="50%"
      position="absolute"
      zIndex={1}
    >
      {currentActiveTokenAddress && (
        <Text fontSize={"20px"} color="#c6c3fc" fontWeight="bold">
          {currentActiveTokenIsAlwaysTradable
            ? "winner"
            : timeLeftForTempToken ?? "expired"}
        </Text>
      )}
      <Flex direction="column" bg="#19106c5b" id={"chat"}>
        <MessageList
          scrollRef={scrollRef}
          messages={chat.receivedMessages}
          channel={chat.channel}
          isAtBottomCallback={handleIsAtBottom}
          isVipChat={false}
          tokenForTransfer="tempToken"
        />
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
        <Flex w="100%" px="0.5rem" pb="0.5rem">
          <ChatForm
            sendChatMessage={sendChatMessage}
            additionalChatCommands={channelChatCommands}
            allowPopout
            channel={chat.channel}
            isVipChat={false}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};
