import { useToast, Image, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { VirtuosoHandle } from "react-virtuoso";

import {
  AblyChannelPromise,
  BaseChatCommand,
  CHAT_MESSAGE_EVENT,
  InteractionType,
  NULL_ADDRESS,
  RANDOM_CHAT_COLOR,
} from "../../constants";
import { useChannelContext } from "../context/useChannel";
import { useUser } from "../context/useUser";
import usePostFirstChat from "../server/usePostFirstChat";
import { useChannel } from "./useChannel";
import { useScreenAnimationsContext } from "../context/useScreenAnimations";
import { Message, SenderStatus } from "../../constants/types/chat";

export type ChatReturnType = {
  channel: AblyChannelPromise;
  hasMessagesLoaded: boolean;
  receivedMessages: Message[];
  allMessages: Message[];
};

export const useChat = (): ChatReturnType => {
  const {
    ablyChannel: channel,
    hasMessagesLoaded,
    receivedMessages,
    allMessages,
    mounted,
  } = useChannel();
  const { username, userAddress: address } = useUser();
  const { chat } = useChannelContext();
  const { chatBot } = chat;

  const mountingMessages = useRef(true);
  const { emojiBlast, fireworks } = useScreenAnimationsContext();

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
        senderStatus: SenderStatus.CHATBOT,
        body,
      },
    });
  };

  useEffect(() => {
    if (mounted) mountingMessages.current = false;
  }, [mounted]);

  // chat messages from chatbot to create events
  useEffect(() => {
    if (mountingMessages.current || receivedMessages.length === 0) return;
    const latestMessage = receivedMessages[receivedMessages.length - 1];
    if (
      latestMessage &&
      latestMessage.data.body &&
      latestMessage.name === CHAT_MESSAGE_EVENT &&
      Date.now() - latestMessage.timestamp < 12000
    ) {
      const body = latestMessage.data.body;
      if (
        (body.split(":")[0] === InteractionType.BUY ||
          body.split(":")[0] === InteractionType.TIP) &&
        Date.now() - latestMessage.timestamp < 12000
      ) {
        fireworks();
      } else if (
        body.split(":")[0] === InteractionType.BLAST &&
        Date.now() - latestMessage.timestamp < 12000
      ) {
        if (latestMessage.data.isGif) {
          emojiBlast(<Image src={latestMessage.data.messageText} h="80px" />);
        } else {
          emojiBlast(
            <Text fontSize="40px">{latestMessage.data.messageText}</Text>
          );
        }
      } else if (
        body.split(":")[0] === InteractionType.BUY_VOTES &&
        Date.now() - latestMessage.timestamp < 12000
      ) {
        const votedOption = body.split(":")[4];
        emojiBlast(
          <Text fontSize="40px">
            {"🚀"}
            {votedOption}
            {"🚀"}
          </Text>
        );
        // } else if (
        //   body.split(":")[0] === InteractionType.SELL_VOTES &&
        //   Date.now() - latestMessage.timestamp < 12000
        // ) {
        //   const isYay = body.split(":")[3] === "yay";
        //   const amount = body.split(":")[2];
        //   emojiBlast(
        //     <Text fontSize="40px">
        //       {!isYay ? "📈" : "📉"}
        //       {amount}
        //     </Text>
        //   );
      } else if (
        body.split(":")[0] === InteractionType.BUY_VIBES &&
        Date.now() - latestMessage.timestamp < 12000
      ) {
        const amount = body.split(":")[2];
        if (Number(amount) < 2000) return;
        const m = determineValue(Number(amount));
        emojiBlast(<Text fontSize={"30px"}>{"📈"}</Text>);
      } else if (
        body.split(":")[0] === InteractionType.SELL_VIBES &&
        Date.now() - latestMessage.timestamp < 12000
      ) {
        const amount = body.split(":")[2];
        if (Number(amount) < 2000) return;
        const m = determineValue(Number(amount));
        emojiBlast(<Text fontSize={"30px"}>{"📉"}</Text>);
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
      if (
        Object.values(InteractionType).includes(
          lastMessage.taskType as InteractionType
        )
      ) {
        messageText = lastMessage.title ?? lastMessage.taskType;
        body = `${lastMessage.taskType}:${lastMessage.description ?? ""}`;
        publishChatBotMessage(messageText, body);
      }
    }
  }, [chatBot]);

  return {
    channel,
    hasMessagesLoaded,
    receivedMessages,
    allMessages,
  };
};

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
  const { channelDetails, channelQueryData } = channelContext;
  const { user, walletIsConnected } = useUser();

  const { postFirstChat } = usePostFirstChat({
    onError: (m) => {
      console.log(m);
    },
  });

  const { leaderboard, chat } = useChannelContext();

  const { userRank } = leaderboard;
  const { clipping } = chat;
  const { handleIsClipUiOpen } = clipping;

  const channelChatCommands = useMemo(
    () => channelDetails?.chatCommands ?? [],
    [channelDetails?.chatCommands]
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
      if (channelDetails?.allowNfcs || false) {
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
        username: "chatbot🤖",
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

function determineValue(M: number) {
  return M > 0 ? Math.floor(Math.log10(M) / Math.log10(10)) + 1 : 1;
}
