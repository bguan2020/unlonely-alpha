import { Box, Flex, useToast, Image, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { VirtuosoHandle } from "react-virtuoso";

import {
  BaseChatCommand,
  InteractionType,
  NULL_ADDRESS,
  RANDOM_CHAT_COLOR,
} from "../../constants";
import { ChatBot } from "../../constants/types";
import { initializeEmojis } from "../../constants/types/chat";
import { ChatCommand } from "../../generated/graphql";
import { useChannel } from "../../hooks/chat/useChannel";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useScreenAnimationsContext } from "../../hooks/context/useScreenAnimations";
import { useUser } from "../../hooks/context/useUser";
import usePostChatByAwsId from "../../hooks/server/usePostChatByAwsId";
import ChatForm from "../chat/ChatForm";
import MessageList from "../chat/MessageList";
import NextHead from "../layout/NextHead";

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
};

const AblyChatComponent = ({ chatBot }: Props) => {
  const router = useRouter();
  const { awsId } = router.query;
  const { user, walletIsConnected } = useUser();
  const { channel: channelContext } = useChannelContext();
  const { channelQueryData } = channelContext;

  const {
    ablyChannel: channel,
    hasMessagesLoaded,
    setHasMessagesLoaded,
    receivedMessages,
  } = useChannel();

  /*eslint-disable prefer-const*/
  let inputBox: HTMLTextAreaElement | null = null;
  const [formError, setFormError] = useState<null | string[]>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const scrollRef = useRef<VirtuosoHandle>(null);

  const channelChatCommands = useMemo(
    () =>
      channelQueryData?.chatCommands
        ? channelQueryData?.chatCommands.filter(
            (c): c is ChatCommand => c !== null
          )
        : [],
    [channelQueryData?.chatCommands]
  );

  const { emojiBlast } = useScreenAnimationsContext();

  const mountingMessages = useRef(true);

  const { postChatByAwsId } = usePostChatByAwsId({
    onError: (m) => {
      setFormError(m ? m.map((e) => e.message) : ["An unknown error occurred"]);
    },
  });

  const toast = useToast();

  const sendChatMessage = async (
    messageText: string,
    isGif: boolean,
    body?: string
  ) => {
    if (walletIsConnected && user) {
      channel.publish({
        name: "chat-message",
        data: {
          messageText,
          username: user.username,
          chatColor: RANDOM_CHAT_COLOR,
          isFC: user.isFCUser,
          isLens: user.isLensUser,
          lensHandle: user.lensHandle,
          address: user.address,
          powerUserLvl: user?.powerUserLvl,
          videoSavantLvl: user?.videoSavantLvl,
          nfcRank: user?.nfcRank,
          isGif,
          reactions: initializeEmojis,
          body,
        },
      });
      handleChatCommand(messageText);
      await postChatByAwsId({ text: messageText, awsId });
    } else {
      toast({
        title: "Sign in first.",
        description: "Please sign a transaction to connect your wallet.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
    if (inputBox) inputBox.focus();
  };

  const handleChatCommand = async (messageText: string) => {
    let messageToPublish = "";
    let allowPublish = false;

    if (messageText.startsWith("@")) {
      messageToPublish = "seems you're trying to use commands. try !commands";
      allowPublish = true;
    } else if (messageText.startsWith(BaseChatCommand.COMMANDS)) {
      messageToPublish = `${BaseChatCommand.CHATBOT}\n${
        BaseChatCommand.CLIP
      }\n${BaseChatCommand.RULES}\n${channelChatCommands
        .map((c) => `!${c.command}`)
        .join("\n")}`;
      allowPublish = true;
    } else if (messageText.startsWith(BaseChatCommand.CHATBOT)) {
      const prompt = messageText.substring(9);
      const res = await fetch("/api/openai", {
        body: JSON.stringify({
          prompt: `Answer the following prompt: ${prompt}`,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = await res.json();
      messageToPublish = `${data}`;
      allowPublish = true;
    } else if (messageText.startsWith(BaseChatCommand.CLIP)) {
      if (channelQueryData?.allowNFCs || false) {
        window.open(
          `/clip?arn=${channelQueryData?.channelArn || ""}`,
          "_blank"
        );
        allowPublish = false;
      } else {
        messageToPublish = "NFCs are not allowed on this channel.";
        allowPublish = true;
      }
    } else if (messageText.startsWith(BaseChatCommand.RULES)) {
      const rules =
        '"!chatbot [question]" to ask chatbot a question\n"!rules" to see these rules.';
      setTimeout(() => {
        messageToPublish = rules;
        publishChatBotMessage(messageToPublish);
      }, 1000);
      allowPublish = false;
    } else {
      for (let i = 0; i < channelChatCommands.length; i++) {
        const chatCommand = channelChatCommands[i];
        if (messageText.startsWith(`!${chatCommand.command}`)) {
          messageToPublish = chatCommand.response;
          setTimeout(() => {
            publishChatBotMessage(messageToPublish);
          }, 1000);
          allowPublish = false;
          break;
        }
      }
    }

    if (allowPublish) {
      publishChatBotMessage(messageToPublish);
    }
  };

  const publishChatBotMessage = (messageText: string, body?: string) => {
    channel.publish({
      name: "chat-message",
      data: {
        messageText: messageText,
        username: "chatbot🤖",
        address: NULL_ADDRESS,
        isFC: false,
        isLens: false,
        isGif: false,
        reactions: initializeEmojis,
        body,
      },
    });
  };

  useEffect(() => {
    const chat = document.getElementById("chat");
    if (!chat) return;
    if (!hasMessagesLoaded && receivedMessages.length) {
      handleScrollToPresent();
      setHasMessagesLoaded(true);
      return;
    }
    if (isAtBottom) {
      handleScrollToPresent();
    }
  }, [receivedMessages]);

  useEffect(() => {
    if (receivedMessages.length === 0) return;
    if (!mountingMessages.current) {
      const latestMessage = receivedMessages[receivedMessages.length - 1];
      if (latestMessage && latestMessage.name === "chat-message") {
        if (
          latestMessage.data.body &&
          latestMessage.data.body.split(":")[0] === InteractionType.BLAST
        ) {
          if (latestMessage.data.isGif) {
            emojiBlast(<Image src={latestMessage.data.messageText} h="80px" />);
          } else {
            emojiBlast(
              <Text fontSize="40px">{latestMessage.data.messageText}</Text>
            );
          }
        }
      }
    }
    mountingMessages.current = false;
  }, [receivedMessages]);

  const handleScrollToPresent = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToIndex(receivedMessages.length - 1);
    }
  }, [receivedMessages.length]);

  const handleIsAtBottom = useCallback((value: boolean) => {
    setIsAtBottom(value);
  }, []);

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
            paddingBottom: CHAT_INPUT_PANEL_HEIGHT,
            overflowY: "scroll",
            overscrollBehavior: "contain",
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            "-webkit-overflow-scrolling": "touch",
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            "-webkit-mask-image":
              "linear-gradient(180deg, rgba(0,0,0,1) 92%, rgba(0,0,0,0) 100%)",
          }}
        >
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
              messages={receivedMessages}
              channel={channel}
              isAtBottomCallback={handleIsAtBottom}
            />
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
      <div
        style={{
          width: "100%",
          position: "fixed",
          bottom: 0,
          padding: 8,
          paddingBottom: 0,
        }}
      >
        <ChatForm
          sendChatMessage={sendChatMessage}
          inputBox={inputBox}
          additionalChatCommands={channelChatCommands}
          mobile
        />
      </div>
    </Box>
  );
};

export default AblyChatComponent;
