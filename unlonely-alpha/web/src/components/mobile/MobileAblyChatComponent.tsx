import { Box, Flex, Text } from "@chakra-ui/react";
import { useState, useRef, useEffect, CSSProperties } from "react";

import ChatForm from "../chat/ChatForm";
import MessageList from "../chat/MessageList";
import NextHead from "../layout/NextHead";
import { useChat, useChatBox } from "../../hooks/chat/useChat";
import { ADD_REACTION_EVENT } from "../../constants";

const styles = `
  html, body {
    background: transparent !important;
  }

  *, *:before, *:after {
    -webkit-user-select: none !important;
    user-select: none !important;
    -webkit-touch-callout: none !important;
    -webkit-user-drag: none !important;  
    -webkit-text-size-adjust: none;
    text-size-adjust: none;
  }
`;

const MobileAblyChatComponent = () => {
  const chat = useChat();

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
    <Box flexDirection="column" height="100dvh" flexWrap="nowrap">
      <style>{styles}</style>
      <NextHead title="Unlonely Chat" description="" image="">
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </NextHead>
      <div
        // chat area wrapper
        style={{
          // backgroundColor: "red",
          height: "100svh",
          position: "relative",
        }}
      >
        <div
          // scroll area
          style={{
            backgroundColor: "#19162F",
            height: "100%",
            // overflowY: "scroll",
            overscrollBehavior: "contain",
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            "-webkit-overflow-scrolling": "touch",
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
          }}
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
            id="chat"
            position="relative"
            padding="8px"
          >
            <MessageList
              scrollRef={scrollRef}
              messages={chat.receivedMessages}
              channel={chat.channel}
              isAtBottomCallback={handleIsAtBottom}
            />
            <Flex justifyContent="center">
              {!isAtBottom && chat.hasMessagesLoaded && (
                <Box
                  bg="rgba(98, 98, 98, 0.6)"
                  p="8px"
                  borderRadius="15px"
                  _hover={{
                    background: "rgba(98, 98, 98, 0.3)",
                    cursor: "pointer",
                  }}
                  onClick={handleScrollToPresent}
                >
                  <Text fontSize="12px">click to scroll to bottom</Text>
                </Box>
              )}
            </Flex>
            <Flex w="100%">
              <ChatForm
                sendChatMessage={sendChatMessage}
                additionalChatCommands={channelChatCommands}
                channel={chat.channel}
              />
            </Flex>
          </Flex>
        </div>
      </div>
    </Box>
  );
};

export default MobileAblyChatComponent;
