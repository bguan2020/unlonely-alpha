import { Flex, Text } from "@chakra-ui/react";
import React, { memo, useMemo } from "react";
import { Virtuoso } from "react-virtuoso";

import MessageBody from "./MessageBody";
import { Message, SenderStatus } from "../../constants/types/chat";
import { AblyChannelPromise, CHAT_MESSAGE_EVENT } from "../../constants";

type MessageListProps = {
  messages: Message[];
  channel: AblyChannelPromise;
  scrollRef: any;
  isAtBottomCallback: (value: boolean) => void;
  isVipChat?: boolean;
};

type MessageItemProps = {
  message: Message;
  channel: AblyChannelPromise;
  index: number;
};

const MessageItem = memo(({ message, channel, index }: MessageItemProps) => {
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
        channel={channel}
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
                channel={channel}
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
