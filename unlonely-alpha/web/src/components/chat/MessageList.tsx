import { Flex, Text } from "@chakra-ui/react";
import React, { memo, useMemo } from "react";
import { Virtuoso } from "react-virtuoso";

import MessageBody from "./MessageBody";
import {
  Message,
  SelectedUser,
  SenderStatus,
} from "../../constants/types/chat";
import { AblyChannelPromise, CHAT_MESSAGE_EVENT } from "../../constants";
import { ChatUserModal } from "../channels/ChatUserModal";
import { useChannelContext } from "../../hooks/context/useChannel";

type MessageListProps = {
  messages: Message[];
  channel: AblyChannelPromise;
  scrollRef: any;
  isAtBottomCallback: (value: boolean) => void;
  isVipChat?: boolean;
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
const MessageList = memo(
  ({
    messages,
    channel,
    scrollRef,
    isAtBottomCallback,
    isVipChat,
  }: MessageListProps) => {
    const { ui } = useChannelContext();
    const { selectedUserInChat, handleSelectedUserInChat } = ui;
    const chatMessages = useMemo(
      () =>
        messages
          .filter((message) => message.name === CHAT_MESSAGE_EVENT)
          .filter((message) =>
            isVipChat
              ? message.data.senderStatus === SenderStatus.VIP ||
                message.data.senderStatus === SenderStatus.CHATBOT
              : true
          ),
      [messages, isVipChat]
    );

    return (
      <>
        <ChatUserModal
          isOpen={selectedUserInChat !== undefined}
          targetUser={selectedUserInChat}
          channel={channel}
          handleClose={() => {
            handleSelectedUserInChat(undefined);
          }}
        />
        {chatMessages.length > 0 ? (
          <Virtuoso
            followOutput={"auto"}
            ref={scrollRef}
            style={{
              height: "100%",
              overflowY: "scroll",
            }}
            className="hide-scrollbar always-allow-touchmove"
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
