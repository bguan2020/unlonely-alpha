import Ably from "ably/promises";
import { Types } from "ably";
import { useEffect, useState } from "react";

import { useChannelContext } from "../context/useChannel";
import { Message } from "../../constants/types/chat";
import {
  APPOINT_USER_EVENT,
  BAN_USER_EVENT,
  CHAT_MESSAGE_EVENT,
  VIBES_TOKEN_PRICE_RANGE_EVENT,
} from "../../constants";
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
  const { channel: c, chat, ui } = useChannelContext();
  const { channelQueryData, refetch } = c;
  const { chatChannel } = chat;
  const { handleVibesTokenPriceRange } = ui;

  const channelName =
    fixedChatName ??
    (chatChannel
      ? `persistMessages:${chatChannel}`
      : "persistMessages:chat-demo");

  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [hasMessagesLoaded, setHasMessagesLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [localBanList, setLocalBanList] = useState<string[] | undefined>(
    undefined
  );

  const [channel, ably] = useAblyChannel(channelName, async (message) => {
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
    if (
      message.name === APPOINT_USER_EVENT ||
      message.name === BAN_USER_EVENT
    ) {
      await refetch();
    }
    if (message.name === VIBES_TOKEN_PRICE_RANGE_EVENT) {
      const newSliderValue = JSON.parse(message.data.body);
      handleVibesTokenPriceRange(newSliderValue);
    }
    if (message.name === CHAT_MESSAGE_EVENT) {
      if (localBanList.length === 0) {
        setReceivedMessages([...messageHistory, message]);
      } else {
        if (userAddress && localBanList.includes(userAddress)) {
          // Current user is banned, they see all messages
          setReceivedMessages([...messageHistory, message]);
        } else {
          // Current user is not banned, they only see messages from non-banned users
          if (!localBanList.includes(message.data.address)) {
            setReceivedMessages([...messageHistory, message]);
          }
        }
      }
    }
    setHasMessagesLoaded(true);
  });

  useEffect(() => {
    if (!channelQueryData) {
      setLocalBanList(undefined);
      return;
    }
    const filteredUsersToBan = (channelQueryData.roles ?? [])
      .filter((user) => user?.role === 1)
      .map((user) => user?.userAddress) as string[];
    setLocalBanList(filteredUsersToBan);
  }, [channelQueryData]);

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

          // For non-banned users or users without a userAddress
          if (!userAddress || !localBanList.includes(userAddress)) {
            return !senderIsBanned;
          }

          // For banned users
          return true; // See all messages
        });
        const reverse = [...messageHistory].reverse();
        setReceivedMessages(reverse);
      });
      setMounted(true);
    }
    getMessages();
  }, [channel, userAddress, localBanList]);

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
