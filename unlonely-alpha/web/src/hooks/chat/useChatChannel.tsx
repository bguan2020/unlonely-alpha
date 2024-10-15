import Ably from "ably/promises";
import { Types } from "ably";
import { useEffect, useMemo, useState } from "react";

import { useChannelContext } from "../context/useChannel";
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
import { useVibesContext } from "../context/useVibes";
import { Box, Flex, useToast, Text } from "@chakra-ui/react";
import centerEllipses from "../../utils/centerEllipses";
import { useTempTokenContext } from "../context/useTempToken";
import { useVersusTempTokenContext } from "../context/useVersusTempToken";
import { jp } from "../../utils/validation/jsonParse";
import { areAddressesEqual } from "../../utils/validation/wallet";

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
  const { channel: c, chat } = useChannelContext();
  const {
    channelRoles,
    handleChannelRoles,
    handleRealTimeChannelDetails,
    handleChannelVibesTokenPriceRange,
    handlePinnedChatMessages,
  } = c;
  const { chatChannel } = chat;
  const { refetchVibesBalance } = useVibesContext();
  const { tempToken } = useTempTokenContext();
  const { refetchUserTempTokenBalance } = tempToken;
  const { gameState, tokenATxs, tokenBTxs } = useVersusTempTokenContext();
  const { tokenA, tokenB } = gameState;
  const { refetchUserTempTokenBalance: refetchUserVersusTokenBalanceA } =
    tokenATxs;
  const { refetchUserTempTokenBalance: refetchUserVersusTokenBalanceB } =
    tokenBTxs;
  const toast = useToast();

  const channelName = useMemo(() => {
    return fixedChatName
      ? `persistMessages:${fixedChatName}`
      : chatChannel
      ? `persistMessages:${chatChannel}`
      : "persistMessages:chat-demo";
  }, [chatChannel, fixedChatName]);

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
    if (message.name === TOKEN_TRANSFER_EVENT) {
      const body = jp(message.data.body);
      const fromAddress = body.from as string | undefined;
      const toAddress = body.to as string | undefined;
      const amount = body.amount as number;
      const symbol = body.symbol as string;
      const includesUser =
        areAddressesEqual(fromAddress ?? "", user?.address ?? "") ||
        areAddressesEqual(toAddress ?? "", user?.address ?? "");
      if (includesUser) {
        if (symbol === "vibes") {
          refetchVibesBalance?.();
        } else if (symbol === tokenA.symbol) {
          refetchUserVersusTokenBalanceA?.();
        } else if (symbol === tokenB.symbol) {
          refetchUserVersusTokenBalanceB?.();
        } else {
          refetchUserTempTokenBalance?.();
        }
      }
      if (toAddress && areAddressesEqual(toAddress, user?.address ?? "")) {
        toast({
          duration: 5000,
          isClosable: true,
          render: () => (
            <Box borderRadius="md" bg="#8e64dd" px={4} h={8}>
              <Flex justifyContent="center" alignItems="center">
                <Text fontSize="16px" color="white">
                  {centerEllipses(fromAddress, 13)} sent you {amount} ${symbol}!
                  🎉
                </Text>
              </Flex>
            </Box>
          ),
        });
      }
    }
    if (message.name === CHANGE_USER_ROLE_EVENT) {
      const body = jp(message.data.body);
      handleChannelRoles?.(body.address, body.role, body.isAdding);
    }
    if (message.name === CHANGE_CHANNEL_DETAILS_EVENT) {
      const body = jp(message.data.body);
      handleRealTimeChannelDetails?.({
        channelName: body.channelName,
        channelDescription: body.channelDescription,
        chatCommands: body.chatCommands,
        allowNfcs: body.allowNfcs,
        isLive: body.isLive,
      });
    }
    if (message.name === VIBES_TOKEN_PRICE_RANGE_EVENT) {
      const newSliderValue = jp(message.data.body);
      handleChannelVibesTokenPriceRange?.(newSliderValue);
    }
    if (message.name === PINNED_CHAT_MESSAGES_EVENT) {
      const _pinnedMessages = jp(message.data.body);
      handlePinnedChatMessages?.(_pinnedMessages);
    }
    if (message.name === CHAT_MESSAGE_EVENT) {
      if (localBanList.length === 0) {
        setReceivedMessages([...messageHistory, message]);
      } else {
        if (user?.address && localBanList.includes(user?.address)) {
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
    if (!channelRoles) {
      setLocalBanList(undefined);
      return;
    }
    const filteredUsersToBan = (channelRoles ?? [])
      .filter((user) => user?.role === 1)
      .map((user) => user?.address) as string[];
    setLocalBanList(filteredUsersToBan);
  }, [channelRoles]);

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

          // For non-banned users or users without a user?.address
          if (!user?.address || !localBanList.includes(user?.address)) {
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
  }, [channel, user?.address, localBanList]);

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
