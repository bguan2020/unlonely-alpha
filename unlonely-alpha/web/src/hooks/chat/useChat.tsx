import { useToast, Image, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { VirtuosoHandle } from "react-virtuoso";

import {
  BaseChatCommand,
  CHAT_MESSAGE_EVENT,
  InteractionType,
  NULL_ADDRESS,
  RANDOM_CHAT_COLOR,
} from "../../constants";
import { initializeEmojis } from "../../constants/types/chat";
import { ChatCommand } from "../../generated/graphql";
import { useChannelContext } from "../context/useChannel";
import { useUser } from "../context/useUser";
import usePostFirstChat from "../server/usePostFirstChat";
import { useChannel } from "./useChannel";
import centerEllipses from "../../utils/centerEllipses";
import { useScreenAnimationsContext } from "../context/useScreenAnimations";
import { ChatBot } from "../../constants/types";

export const useChat = (chatBot: ChatBot[], mobile?: boolean) => {
  const [isAtBottom, setIsAtBottom] = useState(false);
  const scrollRef = useRef<VirtuosoHandle>(null);
  const {
    ablyChannel: channel,
    hasMessagesLoaded,
    setHasMessagesLoaded,
    receivedMessages,
    mounted,
  } = useChannel();
  const { user, username, userAddress: address, walletIsConnected } = useUser();

  const {
    channel: channelContext,
    holders: holdersContext,
    chat,
    recentStreamInteractions,
  } = useChannelContext();
  const { channelQueryData } = channelContext;
  const { userRank } = holdersContext;
  const { clipping } = chat;
  const { fetchData } = clipping;
  const { addToTextOverVideo } = recentStreamInteractions;

  const mountingMessages = useRef(true);
  const { emojiBlast, fireworks } = useScreenAnimationsContext();

  const { postFirstChat } = usePostFirstChat({
    onError: (m) => {
      console.log(m);
    },
  });

  const toast = useToast();

  /*eslint-disable prefer-const*/
  let inputBox: HTMLTextAreaElement | null = null;

  const channelChatCommands = useMemo(
    () =>
      channelQueryData?.chatCommands
        ? channelQueryData?.chatCommands.filter(
            (c): c is ChatCommand => c !== null
          )
        : [],
    [channelQueryData?.chatCommands]
  );

  const channelId = useMemo(
    () => (channelQueryData?.id ? Number(channelQueryData?.id) : 3),
    [channelQueryData?.id]
  );

  const handleScrollToPresent = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToIndex(receivedMessages.length - 1);
    }
  }, [receivedMessages.length]);

  const handleIsAtBottom = useCallback((value: boolean) => {
    setIsAtBottom(value);
  }, []);

  const handleChatCommand = async (messageText: string) => {
    let messageToPublish = "";
    let allowPublish = false;

    if (messageText.startsWith(BaseChatCommand.COMMANDS)) {
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
        fetchData();
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
      name: CHAT_MESSAGE_EVENT,
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

  const sendChatMessage = async (
    messageText: string,
    isGif: boolean,
    body?: string
  ) => {
    if (walletIsConnected && user) {
      channel.publish({
        name: CHAT_MESSAGE_EVENT,
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
      await postFirstChat({ text: messageText, channelId: channelId });
    } else {
      toast({
        title: "Sign in first.",
        description: "Please sign into your wallet first.",
        status: "warning",
        duration: 9000,
        isClosable: true,
        position: mobile ? "bottom" : "top",
      });
    }
    if (inputBox) inputBox.focus();
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
    if (mounted) mountingMessages.current = false;
  }, [mounted]);

  useEffect(() => {
    if (mountingMessages.current || receivedMessages.length === 0) return;
    const latestMessage = receivedMessages[receivedMessages.length - 1];
    if (latestMessage && latestMessage.name === CHAT_MESSAGE_EVENT) {
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
        latestMessage.data.body.split(":")[0] === InteractionType.BLAST &&
        Date.now() - latestMessage.timestamp < 6000
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
  }, [receivedMessages]);

  useEffect(() => {
    if (chatBot.length > 0) {
      const lastMessage = chatBot[chatBot.length - 1];
      let body: string | undefined = undefined;

      let messageText = `${
        username ?? address
      } paid 5 $BRIAN to switch to a random scene!`;
      if (lastMessage.taskType === "video") {
        messageText = `${username ?? address} added a ${
          lastMessage.taskType
        } task: "${lastMessage.title}", "${lastMessage.description}"`;
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

  return {
    handleScrollToPresent,
    handleIsAtBottom,
    channel,
    hasMessagesLoaded,
    receivedMessages,
    isAtBottom,
    scrollRef,
    channelChatCommands,
    sendChatMessage,
    inputBox,
  };
};