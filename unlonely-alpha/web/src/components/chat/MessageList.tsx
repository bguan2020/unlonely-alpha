import { Flex, Text } from "@chakra-ui/react";
import React, { memo } from "react";
import { Virtuoso } from "react-virtuoso";

import MessageBody from "./MessageBody";
import { Message } from "../../constants/types/chat";

type MessageListProps = {
  messages: Message[];
  channel: any;
  scrollRef: any;
  isAtBottomCallback: (value: boolean) => void;
};

type MessageItemProps = {
  message: Message;
  channel: any;
  index: number;
};

const MessageItem = memo(({ message, channel, index }: MessageItemProps) => {
  if (message.name !== "chat-message") return null;
  const messageText = message.data.messageText;
  const linkArray: RegExpMatchArray | null = messageText.match(
    /((https?:\/\/)|(www\.))[^\s/$.?#].[^\s]*/g
  );

  return (
    <div key={message.id || index}>
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
  ({ messages, channel, scrollRef, isAtBottomCallback }: MessageListProps) => {
    return (
      <>
        {messages.length > 0 ? (
          <Virtuoso
            followOutput={"auto"}
            ref={scrollRef}
            style={{ height: "100%" }}
            data={messages}
            atBottomStateChange={(isAtBottom) => isAtBottomCallback(isAtBottom)}
            initialTopMostItemIndex={messages.length - 1}
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
            <Flex flexDirection="row">
              <Text color="white">
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
