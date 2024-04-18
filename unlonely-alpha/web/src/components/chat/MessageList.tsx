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
} from "../../constants";
import { ChatUserModal } from "../channels/ChatUserModal";
import { useChannelContext } from "../../hooks/context/useChannel";
import { ChatUserModal_token } from "../channels/ChatUserModal_token";

type MessageListProps = {
  messages: Message[];
  channel: AblyChannelPromise;
  scrollRef: any;
  isAtBottomCallback: (value: boolean) => void;
  isVipChat?: boolean;
  tokenForTransfer: "vibes" | "tempToken";
};

type MessageItemProps = {
  message: Message;
  index: number;
  handleOpen: (value?: SelectedUser) => void;
};

const MessageItem = memo(({ message, handleOpen, index }: MessageItemProps) => {
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
        index={index}
        message={message}
        messageText={messageText}
        linkArray={linkArray}
        handleOpen={handleOpen}
      />
    </div>
  );
});

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
  }: MessageListProps) => {
    const { ui } = useChannelContext();
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
                key={data.id || index}
                message={data}
                handleOpen={handleSelectedUserInChat}
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
