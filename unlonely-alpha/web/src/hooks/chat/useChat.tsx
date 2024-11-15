import { Image, Text } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

import {
  AblyChannelPromise,
  CHAT_MESSAGE_EVENT,
  InteractionType,
  NULL_ADDRESS,
} from "../../constants";
import { useScreenAnimationsContext } from "../context/useScreenAnimations";
import {
  ChatBotMessageBody,
  Message,
  SenderStatus,
} from "../../constants/types/chat";
import { useChatChannel } from "./useChatChannel";
import { ChatBot } from "../../constants/types";
import { jp, safeIncludes } from "../../utils/safeFunctions";

export type ChatReturnType = {
  channel: AblyChannelPromise;
  hasMessagesLoaded: boolean;
  receivedMessages: Message[];
  allMessages: Message[];
  mounted: boolean;
};

export const useChat = ({
  chatBot,
  fixedChannelName,
}: {
  chatBot: ChatBot[];
  fixedChannelName?: string;
}): ChatReturnType => {
  const {
    ablyChannel: channel,
    hasMessagesLoaded,
    receivedMessages,
    allMessages,
    mounted,
  } = useChatChannel(fixedChannelName);

  const mountingMessages = useRef(true);
  const { emojiBlast, fireworks } = useScreenAnimationsContext();

  const publishChatBotMessage = async (messageText: string, body?: string) => {
    await channel.publish({
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
      const body = jp(latestMessage.data.body);
      if (
        body.interactionType === InteractionType.BLAST &&
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
        body.interactionType === InteractionType.BUY_VIBES &&
        Date.now() - latestMessage.timestamp < 12000
      ) {
        const amount = body.amount;
        if (Number(amount) < 2000) return;
        const m = determineValue(Number(amount));
        emojiBlast(<Text fontSize={"30px"}>{"📈"}</Text>);
      } else if (
        body.interactionType === InteractionType.SELL_VIBES &&
        Date.now() - latestMessage.timestamp < 12000
      ) {
        const amount = body.amount;
        if (Number(amount) < 2000) return;
        emojiBlast(<Text fontSize={"30px"}>{"📉"}</Text>);
      }
    }
  }, [receivedMessages]);

  useEffect(() => {
    if (chatBot.length > 0) {
      const lastMessage = chatBot[chatBot.length - 1];
      let body: string | undefined = undefined;
      if (
        safeIncludes(
          Object.values(InteractionType),
          lastMessage.taskType as InteractionType
        )
      ) {
        const newJsonData: ChatBotMessageBody = {
          interactionType: lastMessage.taskType,
          ...(lastMessage.description ? jp(lastMessage.description) : {}),
        };
        body = JSON.stringify(newJsonData);
        const messageText = lastMessage.title ?? lastMessage.taskType;
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
