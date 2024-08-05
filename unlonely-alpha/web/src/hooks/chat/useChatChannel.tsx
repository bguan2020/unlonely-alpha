import Ably from "ably/promises";
import { Types } from "ably";
import { useEffect, useState } from "react";

import { useChannelContext } from "../context/useChannel";
import { Message, SenderStatus } from "../../constants/types/chat";
import {
  CHANGE_CHANNEL_DETAILS_EVENT,
  CHANGE_USER_ROLE_EVENT,
  CHAT_MESSAGE_EVENT,
  InteractionType,
  PINNED_CHAT_MESSAGES_EVENT,
  TOKEN_TRANSFER_EVENT,
  VIBES_TOKEN_PRICE_RANGE_EVENT,
} from "../../constants";
import { useUser } from "../context/useUser";
import { SharesEventState } from "../../generated/graphql";
import { useVibesContext } from "../context/useVibes";
import { isAddress, isAddressEqual } from "viem";
import { Box, Flex, useToast, Text } from "@chakra-ui/react";
import centerEllipses from "../../utils/centerEllipses";
import { useTempTokenContext } from "../context/useTempToken";
import { useVersusTempTokenContext } from "../context/useVersusTempToken";

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
  const { userAddress } = useUser();
  const { channel: c, chat, ui } = useChannelContext();
  const {
    channelRoles,
    handleChannelRoles,
    handleLatestBet,
    handleRealTimeChannelDetails,
    handleChannelVibesTokenPriceRange,
    handlePinnedChatMessages,
  } = c;
  const { chatChannel } = chat;
  const { handleLocalSharesEventState } = ui;
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
    if (message.name === TOKEN_TRANSFER_EVENT) {
      const body = JSON.parse(message.data.body);
      const fromAddress = body.from as string | undefined;
      const toAddress = body.to as string | undefined;
      const amount = body.amount as number;
      const symbol = body.symbol as string;
      const includesUser =
        toAddress &&
        isAddress(toAddress) &&
        fromAddress &&
        isAddress(fromAddress) &&
        (isAddressEqual(fromAddress, userAddress as `0x${string}`) ||
          isAddressEqual(toAddress, userAddress as `0x${string}`));
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
      if (
        toAddress &&
        isAddress(toAddress) &&
        isAddressEqual(toAddress, userAddress as `0x${string}`)
      ) {
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
      const body = JSON.parse(message.data.body);
      handleChannelRoles?.(body.address, body.role, body.isAdding);
    }
    if (message.name === CHANGE_CHANNEL_DETAILS_EVENT) {
      const body = JSON.parse(message.data.body);
      console.log("body", body);
      handleRealTimeChannelDetails?.({
        channelName: body.channelName,
        channelDescription: body.channelDescription,
        chatCommands: body.chatCommands,
        allowNfcs: body.allowNfcs,
        isLive: body.isLive,
      });
    }
    if (message.name === VIBES_TOKEN_PRICE_RANGE_EVENT) {
      const newSliderValue = JSON.parse(message.data.body);
      handleChannelVibesTokenPriceRange?.(newSliderValue);
    }
    if (message.name === PINNED_CHAT_MESSAGES_EVENT) {
      const _pinnedMessages = JSON.parse(message.data.body);
      handlePinnedChatMessages?.(_pinnedMessages);
    }
    if (message.name === CHAT_MESSAGE_EVENT) {
      if (message.data.senderStatus === SenderStatus.CHATBOT) {
        const chatbotTaskType =
          message?.data?.body?.split(":")[0] ||
          JSON.parse(message?.data?.body).interactionType;
        if (chatbotTaskType === InteractionType.EVENT_LIVE) {
          const betId = message.data.body.split(":")[1];
          const sharesSubjectQuestion = message.data.body.split(":")[2];
          const sharesSubjectAddress = message.data.body.split(":")[3];
          const optionA = message.data.body.split(":")[4];
          const optionB = message.data.body.split(":")[5];
          const chainId = message.data.body.split(":")[6];
          const channelId = message.data.body.split(":")[7];
          handleLatestBet?.({
            id: betId as string,
            sharesSubjectQuestion: sharesSubjectQuestion as string,
            sharesSubjectAddress: sharesSubjectAddress as string,
            options: [optionA as string, optionB as string],
            chainId: Number(chainId as string),
            channelId: channelId as string,
            createdAt: new Date().toISOString(),
            eventState: SharesEventState.Live,
          });
        }
        if (chatbotTaskType === InteractionType.EVENT_LOCK) {
          handleLocalSharesEventState?.(SharesEventState.Lock);
        }
        if (chatbotTaskType === InteractionType.EVENT_UNLOCK) {
          handleLocalSharesEventState?.(SharesEventState.Live);
        }
        if (chatbotTaskType === InteractionType.EVENT_PAYOUT) {
          handleLocalSharesEventState?.(SharesEventState.Payout);
        }
      }
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
