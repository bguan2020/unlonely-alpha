import { Text, useToast, Image, Flex, Box } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { VirtuosoHandle } from "react-virtuoso";

import {
  InteractionType,
  RANDOM_CHAT_COLOR,
  BaseChatCommand,
  NULL_ADDRESS,
} from "../../constants";
import { ChatBot } from "../../constants/types";
import { initializeEmojis } from "../../constants/types/chat";
import { ChatCommand } from "../../generated/graphql";
import { useChannel } from "../../hooks/chat/useChannel";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useScreenAnimationsContext } from "../../hooks/context/useScreenAnimations";
import { useUser } from "../../hooks/context/useUser";
import usePostFirstChat from "../../hooks/server/usePostFirstChat";
import centerEllipses from "../../utils/centerEllipses";
import ChatForm from "../chat/ChatForm";
import MessageList from "../chat/MessageList";
import Participants from "../presence/Participants";

type Props = {
  chatBot: ChatBot[];
  addToChatbot: (chatBotMessageToAdd: ChatBot) => void;
};

const StandaloneAblyChatComponent = ({ chatBot, addToChatbot }: Props) => {
  const {
    channel: channelContext,
    chat,
    holders: holdersContext,
    recentStreamInteractions,
  } = useChannelContext();
  const { userRank } = holdersContext;
  const { presenceChannel } = chat;

  const { channelQueryData } = channelContext;
  const { addToTextOverVideo } = recentStreamInteractions;

  const channelId = useMemo(
    () => (channelQueryData?.id ? Number(channelQueryData?.id) : 3),
    [channelQueryData?.id]
  );

  const channelChatCommands = useMemo(
    () =>
      channelQueryData?.chatCommands
        ? channelQueryData?.chatCommands.filter(
            (c): c is ChatCommand => c !== null
          )
        : [],
    [channelQueryData?.chatCommands]
  );

  const {
    ablyChannel: channel,
    hasMessagesLoaded,
    setHasMessagesLoaded,
    receivedMessages,
  } = useChannel();

  const { username, user, userAddress: address, walletIsConnected } = useUser();
  const { emojiBlast, fireworks } = useScreenAnimationsContext();
  /*eslint-disable prefer-const*/
  let inputBox: HTMLTextAreaElement | null = null;
  const [formError, setFormError] = useState<null | string[]>(null);
  const scrollRef = useRef<VirtuosoHandle>(null);

  const mountingMessages = useRef(true);

  const { postFirstChat } = usePostFirstChat({
    onError: (m) => {
      setFormError(m ? m.map((e) => e.message) : ["An unknown error occurred"]);
    },
  });
  const [isAtBottom, setIsAtBottom] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (chatBot.length > 0) {
      const lastMessage = chatBot[chatBot.length - 1];
      let body: string | undefined = undefined;

      let messageText = `${username} paid 5 $BRIAN to switch to a random scene!`;
      if (lastMessage.taskType === "video") {
        messageText = `${username} added a ${lastMessage.taskType} task: "${lastMessage.title}", "${lastMessage.description}"`;
      }
      if (lastMessage.taskType === InteractionType.TIP) {
        messageText = lastMessage.title ?? "Tip";
        body = `${InteractionType.TIP}:${lastMessage.description ?? ""}`;
      }
      if (lastMessage.taskType === "pvp") {
        messageText = lastMessage.title ?? "Pvp";
      }
      if (lastMessage.taskType === "chance") {
        messageText = lastMessage.title ?? "Chance";
      }
      if (lastMessage.taskType === InteractionType.CONTROL) {
        messageText = lastMessage.title ?? "Control";
        body = `${InteractionType.CONTROL}:${lastMessage.description ?? ""}`;
      }
      if (lastMessage.taskType === InteractionType.CUSTOM) {
        messageText = lastMessage.title ?? "Custom";
        body = `${InteractionType.CUSTOM}:${lastMessage.description ?? ""}`;
      }
      if (lastMessage.taskType === InteractionType.BUY) {
        messageText = lastMessage.title ?? "Buy";
        body = `${InteractionType.BUY}:${lastMessage.description ?? ""}`;
      }
      if (lastMessage.taskType === InteractionType.CLIP) {
        messageText = lastMessage.title ?? "Clip";
        body = `${InteractionType.CLIP}:${lastMessage.description ?? ""}`;
      }
      publishChatBotMessage(messageText, body);
    }
  }, [chatBot]);

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
          tokenHolderRank: userRank,
          isGif,
          reactions: initializeEmojis,
          body,
        },
      });
      handleChatCommand(messageText);
      await postFirstChat(
        { text: messageText, channelId: channelId }
        // { isFirst: false }
      );
    } else {
      toast({
        title: "Sign in first.",
        description: "Please sign into your wallet first.",
        status: "warning",
        duration: 9000,
        isClosable: true,
        position: "top",
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
        messageToPublish = `${
          user?.username ?? centerEllipses(address, 15)
        } has just clipped a highlight from this stream!`;
        allowPublish = true;
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
  // useeffect to scroll to the bottom of the chat
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
          latestMessage.data.body.split(":")[0] === InteractionType.CONTROL
        ) {
          const newTextOverVideo = latestMessage.data.body
            .split(":")
            .slice(1)
            .join();
          if (newTextOverVideo) {
            addToTextOverVideo(newTextOverVideo);
          }
        } else if (
          latestMessage.data.body &&
          (latestMessage.data.body.split(":")[0] === InteractionType.BUY ||
            latestMessage.data.body.split(":")[0] === InteractionType.TIP)
        ) {
          fireworks();
        } else if (
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
    <Flex
      direction="column"
      height="calc(70vh - 98px)"
      p="5px"
      id="chat"
      position={"relative"}
    >
      <Flex position="absolute" top="-10px" right="10px" zIndex="2">
        <Participants ablyPresenceChannel={presenceChannel} />
      </Flex>
      <MessageList
        scrollRef={scrollRef}
        messages={receivedMessages}
        channel={channel}
        isAtBottomCallback={handleIsAtBottom}
      />
      <Flex justifyContent="center">
        {!isAtBottom && hasMessagesLoaded && (
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
            <Text fontSize="12px" textAlign={"center"}>
              scroll to present
            </Text>
          </Box>
        )}
      </Flex>
      <Flex mt="10px" w="100%">
        <ChatForm
          sendChatMessage={sendChatMessage}
          inputBox={inputBox}
          additionalChatCommands={channelChatCommands}
          addToChatbot={addToChatbot}
        />
      </Flex>
    </Flex>
  );
};

export default StandaloneAblyChatComponent;
