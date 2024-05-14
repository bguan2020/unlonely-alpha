import { useToast } from "@chakra-ui/react";
import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { VirtuosoHandle } from "react-virtuoso";
import {
  AblyChannelPromise,
  BaseChatCommand,
  CHAT_MESSAGE_EVENT,
  RANDOM_CHAT_COLOR,
  NULL_ADDRESS,
} from "../../constants";
import { Message, SenderStatus } from "../../constants/types/chat";
import { useChannelContext } from "../context/useChannel";
import { useUser } from "../context/useUser";
import usePostFirstChat from "../server/usePostFirstChat";

export const useChatBox = (
  chatId: string,
  receivedMessages: Message[],
  hasMessagesLoaded: boolean,
  channel: AblyChannelPromise,
  mobile?: boolean
) => {
  const scrollRef = useRef<VirtuosoHandle>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const toast = useToast();
  const { channel: channelContext } = useChannelContext();
  const { realTimeChannelDetails, channelQueryData } = channelContext;
  const { user, walletIsConnected } = useUser();

  const { postFirstChat } = usePostFirstChat({
    onError: (m) => {
      console.log(m);
    },
  });

  const { leaderboard, chat } = useChannelContext();

  const { userRank } = leaderboard;
  const { handleIsClipUiOpen } = chat;

  const channelChatCommands = useMemo(
    () => realTimeChannelDetails?.chatCommands ?? [],
    [realTimeChannelDetails?.chatCommands]
  );

  const handleScrollToPresent = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToIndex(receivedMessages.length - 1);
    }
  }, [receivedMessages.length]);

  const handleIsAtBottom = useCallback((value: boolean) => {
    setIsAtBottom(value);
  }, []);

  useEffect(() => {
    const chat = document.getElementById(chatId);
    if (!chat || !hasMessagesLoaded || receivedMessages.length === 0) return;
    if (isAtBottom) handleScrollToPresent();
  }, [receivedMessages, chatId, hasMessagesLoaded, isAtBottom]);

  const channelId = useMemo(
    () => (channelQueryData?.id ? Number(channelQueryData?.id) : 3),
    [channelQueryData?.id]
  );

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
      if (realTimeChannelDetails?.allowNfcs || false) {
        handleIsClipUiOpen(true);
        allowPublish = false;
      } else {
        messageToPublish = "Clipping is disabled for this stream.";
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

  const sendChatMessage = async (
    messageText: string,
    isGif: boolean,
    senderStatus: SenderStatus,
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
          channelUserRank: userRank,
          isGif,
          senderStatus,
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
  };

  const publishChatBotMessage = (messageText: string, body?: string) => {
    channel.publish({
      name: CHAT_MESSAGE_EVENT,
      data: {
        messageText: messageText,
        username: "🤖",
        address: NULL_ADDRESS,
        isFC: false,
        isLens: false,
        isGif: false,
        senderStatus: SenderStatus.CHATBOT,
        body,
      },
    });
  };

  return {
    scrollRef,
    isAtBottom,
    channelChatCommands,
    handleScrollToPresent,
    handleIsAtBottom,
    sendChatMessage,
  };
};
