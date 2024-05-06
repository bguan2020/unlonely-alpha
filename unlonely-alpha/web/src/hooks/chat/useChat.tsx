import { Image, Text } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

import {
  AblyChannelPromise,
  CHAT_MESSAGE_EVENT,
  InteractionType,
  NULL_ADDRESS,
} from "../../constants";
import { useChannelContext } from "../context/useChannel";
import { useUser } from "../context/useUser";
import { useScreenAnimationsContext } from "../context/useScreenAnimations";
import { Message, SenderStatus } from "../../constants/types/chat";
import { useChatChannel } from "./useChatChannel";

export type ChatReturnType = {
  channel: AblyChannelPromise;
  hasMessagesLoaded: boolean;
  receivedMessages: Message[];
  allMessages: Message[];
  mounted: boolean;
};

export const useChat = (): ChatReturnType => {
  const {
    ablyChannel: channel,
    hasMessagesLoaded,
    receivedMessages,
    allMessages,
    mounted,
  } = useChatChannel();
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
    mounted,
  };
};

function determineValue(M: number) {
  return M > 0 ? Math.floor(Math.log10(M) / Math.log10(10)) + 1 : 1;
}
