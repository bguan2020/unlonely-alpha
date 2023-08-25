import Ably from "ably/promises";
import { Types } from "ably";
import { useEffect, useState } from "react";

import { useChannelContext } from "../context/useChannel";
import { Message } from "../../constants/types/chat";
import { ADD_REACTION_EVENT } from "../../constants";
import { useUser } from "../context/useUser";

const ably = new Ably.Realtime.Promise({ authUrl: "/api/createTokenRequest" });

export function useAblyChannel(
  channelName: string,
  callbackOnMessage: (message: Types.Message) => void
): [Types.RealtimeChannelPromise, Types.RealtimePromise] {
  const channel = ably.channels.get(channelName);

  // explain this code below
  const onMount = () => {
    channel.subscribe((msg) => {
      callbackOnMessage(msg);
    });
  };

  const onUnmount = () => {
    channel.unsubscribe();
  };

  const useEffectHook = () => {
    onMount();
    return () => {
      onUnmount();
    };
  };

  useEffect(useEffectHook);

  return [channel, ably];
}

export function useChannel(fixedChatName?: string) {
  const { userAddress } = useUser();
  const { chat } = useChannelContext();
  const { chatChannel } = chat;

  const channelName =
    fixedChatName ??
    (chatChannel
      ? `persistMessages:${chatChannel}`
      : "persistMessages:chat-demo");

  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const [hasMessagesLoaded, setHasMessagesLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [channel, ably] = useAblyChannel(channelName, (message) => {
    setHasMessagesLoaded(false);
    // remove messages where name = add-reaction
    let messageHistory = receivedMessages.filter(
      (m) => m.name !== ADD_REACTION_EVENT
    );
    if (message.name === ADD_REACTION_EVENT) {
      messageHistory = updateMessageHistoryReactions(message, messageHistory);

      setReceivedMessages([...messageHistory]);
    }
    // If the message is not banned OR (if it's banned and the current user's address matches the message's address)
    if (
      !message.data.isBanned ||
      (message.data.isBanned && message.data.address === userAddress)
    ) {
      setReceivedMessages([...messageHistory, message]);
    }
    setHasMessagesLoaded(true);
  });

  useEffect(() => {
    async function getMessages() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await channel.history((err, result) => {
        let messageHistory = result.items.filter(
          (message: any) =>
            message.name === "chat-message" &&
            (!message.data.isBanned ||
              (message.data.isBanned && message.data.address === userAddress))
        );
        const reverse = [...messageHistory].reverse();
        setReceivedMessages(reverse);

        // iterate through result
        result.items.forEach((message: any) => {
          if (message.name === ADD_REACTION_EVENT) {
            messageHistory = updateMessageHistoryReactions(
              message,
              messageHistory
            );
            const reverse = [...messageHistory, message].reverse();
            setReceivedMessages(reverse);
          }
        });
        // Get index of last sent message from history
      });
      setMounted(true);
    }
    if (!channel) return;
    getMessages();
  }, [channel, userAddress]);

  return {
    ably,
    ablyChannel: channel,
    receivedMessages,
    hasMessagesLoaded,
    mounted,
    setReceivedMessages,
    setHasMessagesLoaded,
  };
}

const updateMessageHistoryReactions = (
  message: Ably.Types.Message,
  messageHistory: Message[]
) => {
  const reaction = message;
  const timeserial = reaction.data.extras.reference.timeserial;
  const emojiType = reaction.data.body;

  // get index of message in filteredHistory array where timeserial matches
  const index = messageHistory.findIndex(
    (m) => m.extras.timeserial === timeserial
  );

  const messageToUpdate = messageHistory[index];
  const emojisToUpdate = messageToUpdate.data.reactions;
  const emojiIndex = emojisToUpdate.findIndex((e) => e.emojiType === emojiType);

  if (emojiIndex !== -1) {
    emojisToUpdate[emojiIndex].count += 1;
  }
  const updatedMessage = {
    ...messageToUpdate,
    data: {
      ...messageToUpdate.data,
      reactions: emojisToUpdate,
    },
  };
  messageHistory[index] = updatedMessage;

  return messageHistory;
};
