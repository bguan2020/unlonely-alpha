import Ably from "ably/promises";
import { Types } from "ably";
import { useEffect, useState } from "react";

import { Message } from "../../constants/types/chat";
import {
  CHANGE_CHANNEL_DETAILS_EVENT,
  CHANGE_USER_ROLE_EVENT,
  CHAT_MESSAGE_EVENT,
  // InteractionType,
  PINNED_CHAT_MESSAGES_EVENT,
  TOKEN_TRANSFER_EVENT,
  VIBES_TOKEN_PRICE_RANGE_EVENT,
} from "../../constants";
import { useUser } from "../context/useUser";
// import { SharesEventState } from "../../generated/graphql";
import { jp } from "../../utils/validation/jsonParse";

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

export function useChatChannel(fixedChatName?: string) {
  const { user } = useUser();

  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [hasMessagesLoaded, setHasMessagesLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [localBanList, setLocalBanList] = useState<string[] | undefined>(
    undefined
  );

  const [channel, ably] = useAblyChannel("", async (message) => {
    setHasMessagesLoaded(false);
    if (localBanList === undefined) {
      setHasMessagesLoaded(true);
      return;
    }
    const newAllMessages = [...allMessages, message];
    setAllMessages(newAllMessages);
    const messageHistory = receivedMessages.filter(
      (m) => m.name === CHAT_MESSAGE_EVENT
    );
    if (message.name === TOKEN_TRANSFER_EVENT) {
      const body = jp(message.data.body);
      const fromAddress = body.from as string | undefined;
      const toAddress = body.to as string | undefined;
      const amount = body.amount as number;
      const symbol = body.symbol as string;
    }
    if (message.name === CHANGE_USER_ROLE_EVENT) {
      const body = jp(message.data.body);
    }
    if (message.name === CHANGE_CHANNEL_DETAILS_EVENT) {
      const body = jp(message.data.body);
    }
    if (message.name === VIBES_TOKEN_PRICE_RANGE_EVENT) {
      const newSliderValue = jp(message.data.body);
    }
    if (message.name === PINNED_CHAT_MESSAGES_EVENT) {
      const _pinnedMessages = jp(message.data.body);
    }
    if (message.name === CHAT_MESSAGE_EVENT) {
      if (localBanList.length === 0) {
        setReceivedMessages([...messageHistory, message]);
      } else {
      }
    }
    setHasMessagesLoaded(true);
  });

  useEffect(() => {
    async function getMessages() {
      if (!channel || localBanList === undefined) return;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await channel.history((err, result) => {
        setAllMessages(result.items);
        const messageHistory = result.items.filter((message: any) => {
          if (message.name !== CHAT_MESSAGE_EVENT) return false;

          const senderIsBanned = localBanList.includes(message.data.address);

          // For banned users
          return true; // See all messages
        });
        const reverse = [...messageHistory].reverse();
        setReceivedMessages(reverse);
      });
      setMounted(true);
    }
    getMessages();
  }, [channel, localBanList]);

  return {
    ably,
    ablyChannel: channel,
    receivedMessages,
    allMessages,
    hasMessagesLoaded,
    mounted,
    setReceivedMessages,
  };
}
