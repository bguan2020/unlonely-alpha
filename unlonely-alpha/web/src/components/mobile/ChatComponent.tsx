import { Box, Flex } from "@chakra-ui/react";

import { ChatBot } from "../../constants/types";
import ChatForm from "../chat/ChatForm";
import MessageList from "../chat/MessageList";
import NextHead from "../layout/NextHead";
import { useChat } from "../../hooks/chat/useChat";

const CHAT_INPUT_PANEL_HEIGHT = 120;

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

type Props = {
  chatBot: ChatBot[];
  addToChatbot: (chatBotMessageToAdd: ChatBot) => void;
};

const AblyChatComponent = ({ chatBot, addToChatbot }: Props) => {
  const {
    handleScrollToPresent,
    handleIsAtBottom,
    channel,
    receivedMessages,
    isAtBottom,
    scrollRef,
    channelChatCommands,
    sendChatMessage,
    inputBox,
  } = useChat(chatBot, true);

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
            // backgroundColor: "yellow",
            height: "100%",
            overflowY: "scroll",
            overscrollBehavior: "contain",
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            "-webkit-overflow-scrolling": "touch",
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
          }}
        >
          <Flex
            direction="column"
            overflowX="auto"
            height="100%"
            id="chat"
            position="relative"
            padding="8px"
            background={"#19162F"}
          >
            <MessageList
              scrollRef={scrollRef}
              messages={receivedMessages}
              channel={channel}
              isAtBottomCallback={handleIsAtBottom}
            />
            <Flex mt="20px" w="100%">
              <ChatForm
                sendChatMessage={sendChatMessage}
                inputBox={inputBox}
                additionalChatCommands={channelChatCommands}
                addToChatbot={addToChatbot}
              />
            </Flex>
          </Flex>
          <button
            style={{
              position: "fixed",
              top: 8,
              fontSize: 13,
              height: 64,
              width: "100%",
              textAlign: "center",
              transition: !isAtBottom
                ? "all 0.25s 0.5s ease"
                : "all 0.15s ease",
              opacity: !isAtBottom ? 1 : 0,
              pointerEvents: !isAtBottom ? "all" : "none",
              transform: !isAtBottom ? "translateY(0)" : "translateY(-100%)",
            }}
            onClick={handleScrollToPresent}
          >
            <span
              style={{
                position: "relative",
                display: "inline-block",
                background: "rgba(255,255,255,0.6)",
                padding: 8,
                borderRadius: 32,
                boxShadow: "0 3px 12px rgba(0,0,0,0.5)",
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                "-webkit-backdrop-filter": "blur(6px)",
                backdropFilter: "blur(6px)",
                zIndex: 10,
                color: "black",
              }}
            >
              👇️ tap to scroll to bottom 👇️
            </span>
          </button>
        </div>
      </div>
    </Box>
  );
};

export default AblyChatComponent;
