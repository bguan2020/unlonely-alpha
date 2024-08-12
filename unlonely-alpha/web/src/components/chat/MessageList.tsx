import { Flex, Text } from "@chakra-ui/react";
import React, { memo, useMemo } from "react";
import { Virtuoso } from "react-virtuoso";

import MessageBody from "./MessageBody";
import {
  Message,
  SelectedUser,
  SenderStatus,
} from "../../constants/types/chat";
import {
  AblyChannelPromise,
  CHAT_MESSAGE_EVENT,
  InteractionType,
  PINNED_CHAT_MESSAGES_EVENT,
} from "../../constants";
import { ChatUserModal } from "../channels/ChatUserModal";
import { useChannelContext } from "../../hooks/context/useChannel";
import { ChatUserModal_token } from "../channels/ChatUserModal_token";
import useUpdatePinnedChatMessages from "../../hooks/server/channel/useUpdatePinnedChatMessages";
import PinnedMessageBody from "./PinnedMessageBody";
import { useZoraCollect1155 } from "../../hooks/contracts/useZoraCollect1155";
import { TransactionReceipt } from "viem";

type MessageListProps = {
  messages: Message[];
  channel: AblyChannelPromise;
  scrollRef: any;
  isAtBottomCallback: (value: boolean) => void;
  isVipChat?: boolean;
  tokenForTransfer: "vibes" | "tempToken";
  hidePinnedMessages: boolean;
};

export type MessageItemProps = {
  message: Message;
  index: number;
  handleOpen: (value?: SelectedUser) => void;
  handlePinCallback: (value: string) => void;
  handleCollectorMint?: (
    tokenContract: `0x${string}`,
    tokenId: number,
    quantityToMint: bigint
  ) => Promise<TransactionReceipt | undefined>;
  channel: AblyChannelPromise;
};

const MessageItem = memo(
  ({
    channel,
    message,
    handleOpen,
    index,
    handlePinCallback,
    handleCollectorMint,
  }: MessageItemProps) => {
    const messageText = message.data.messageText;
    const linkArray: RegExpMatchArray | null = messageText.match(
      /((https?:\/\/)|(www\.))[^\s/$.?#].[^\s]*/g
    );

    return (
      <div
        key={message.id || index}
        style={{
          padding: "2px",
        }}
      >
        <MessageBody
          channel={channel}
          index={index}
          message={message}
          messageText={messageText}
          linkArray={linkArray}
          handleOpen={handleOpen}
          handlePinCallback={handlePinCallback}
          handleCollectorMint={handleCollectorMint}
        />
      </div>
    );
  }
);

const excludedChatbotInteractionTypesInVipChat = [
  InteractionType.BUY,
  InteractionType.BUY_BADGES,
  InteractionType.BUY_TEMP_TOKENS,
  InteractionType.BUY_VIBES,
  InteractionType.BUY_VOTES,

  InteractionType.SELL_BADGES,
  InteractionType.SELL_TEMP_TOKENS,
  InteractionType.SELL_VIBES,
  InteractionType.SELL_VOTES,

  InteractionType.CREATE_TEMP_TOKEN,
  InteractionType.TEMP_TOKEN_EXPIRED,
  InteractionType.PRESALE_OVER,
  InteractionType.TEMP_TOKEN_EXPIRATION_WARNING,
  InteractionType.TEMP_TOKEN_REACHED_THRESHOLD,
  InteractionType.TEMP_TOKEN_DURATION_INCREASED,
  InteractionType.TEMP_TOKEN_BECOMES_ALWAYS_TRADEABLE,
  InteractionType.TEMP_TOKEN_THRESHOLD_INCREASED,
  InteractionType.SEND_REMAINING_FUNDS_TO_WINNER_AFTER_TEMP_TOKEN_EXPIRATION,

  InteractionType.EVENT_LIVE,
  InteractionType.EVENT_LOCK,
  InteractionType.EVENT_UNLOCK,
  InteractionType.EVENT_PAYOUT,
];

const MessageList = memo(
  ({
    messages,
    channel,
    scrollRef,
    isAtBottomCallback,
    isVipChat,
    tokenForTransfer,
    hidePinnedMessages,
  }: MessageListProps) => {
    const { ui, channel: c } = useChannelContext();
    const { collectorMint } = useZoraCollect1155();
    const { pinnedChatMessages, channelQueryData } = c;
    const { selectedUserInChat, handleSelectedUserInChat } = ui;
    const chatMessages = useMemo(() => {
      if (isVipChat) {
        return messages.filter((m) => {
          const isChatMessageEvent = m.name === CHAT_MESSAGE_EVENT;
          const isVip = m.data.senderStatus === SenderStatus.VIP;
          const isChatbotWithAcceptableInteractionType =
            m.data.senderStatus === SenderStatus.CHATBOT &&
            !excludedChatbotInteractionTypesInVipChat.includes(
              m?.data?.body?.split(":")[0] as any
            );
          return (
            isChatMessageEvent &&
            (isVip || isChatbotWithAcceptableInteractionType)
          );
        });
      } else {
        return messages.filter((m) => m.name === CHAT_MESSAGE_EVENT);
      }
    }, [messages, isVipChat]);

    const { updatePinnedChatMessages } = useUpdatePinnedChatMessages({});

    const handleUpdatePinnedChatMessages = async (value: string) => {
      if (channelQueryData?.id) {
        const isPinned = pinnedChatMessages.includes(value);
        let updatedPinnedChatMessages: string[] = [];
        if (isPinned) {
          updatedPinnedChatMessages = pinnedChatMessages.filter(
            (item) => item !== value
          );
        } else {
          updatedPinnedChatMessages = [...pinnedChatMessages, value];
        }
        await updatePinnedChatMessages({
          id: channelQueryData?.id,
          pinnedChatMessages: updatedPinnedChatMessages,
        });
        channel?.publish({
          name: PINNED_CHAT_MESSAGES_EVENT,
          data: { body: JSON.stringify(updatedPinnedChatMessages) },
        });
      }
    };

    return (
      <>
        {tokenForTransfer === "vibes" ? (
          <ChatUserModal
            isOpen={selectedUserInChat !== undefined}
            targetUser={selectedUserInChat}
            channel={channel}
            handleClose={() => {
              handleSelectedUserInChat(undefined);
            }}
          />
        ) : (
          <ChatUserModal_token
            isOpen={selectedUserInChat !== undefined}
            targetUser={selectedUserInChat}
            channel={channel}
            handleClose={() => {
              handleSelectedUserInChat(undefined);
            }}
          />
        )}
        {!hidePinnedMessages && pinnedChatMessages.length > 0 && (
          <Flex direction="column">
            {pinnedChatMessages.map((m, i) => {
              return (
                <PinnedMessageBody
                  key={i}
                  messageText={m}
                  handlePinCallback={handleUpdatePinnedChatMessages}
                />
              );
            })}
          </Flex>
        )}
        {chatMessages.length > 0 ? (
          <Virtuoso
            followOutput={"auto"}
            ref={scrollRef}
            style={{
              height: "100%",
              overflowY: "scroll",
            }}
            className="hide-scrollbar"
            data={chatMessages}
            atBottomStateChange={(isAtBottom) => isAtBottomCallback(isAtBottom)}
            initialTopMostItemIndex={chatMessages.length - 1}
            itemContent={(index, data) => (
              <MessageItem
                channel={channel}
                key={data.id || index}
                message={data}
                handleOpen={handleSelectedUserInChat}
                handlePinCallback={handleUpdatePinnedChatMessages}
                handleCollectorMint={collectorMint}
                index={index}
              />
            )}
          />
        ) : (
          <>
            <Flex flexDirection="row" flex="1">
              <Text color="white" textAlign={"center"}>
                {"No messages to show. Messages delete every 48 hrs."}
              </Text>
            </Flex>
          </>
        )}
      </>
    );
  }
);

export default MessageList;
