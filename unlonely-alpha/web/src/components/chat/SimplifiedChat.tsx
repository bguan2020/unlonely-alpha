import { Flex, Text, Box } from "@chakra-ui/react";
import { ChatReturnType, useChatBox } from "../../hooks/chat/useChat";
import MessageList from "./MessageList";
import ChatForm from "./ChatForm";

export const SimplifiedChat = ({ chat }: { chat: ChatReturnType }) => {
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
      bg="#19106c5b"
      height="50%"
      id={"chat"}
      position="absolute"
      zIndex={1}
    >
      <MessageList
        scrollRef={scrollRef}
        messages={chat.receivedMessages}
        channel={chat.channel}
        isAtBottomCallback={handleIsAtBottom}
        isVipChat={false}
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
  );
};
