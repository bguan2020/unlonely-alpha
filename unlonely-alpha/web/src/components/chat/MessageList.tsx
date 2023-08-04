import { Flex, Text } from "@chakra-ui/react";
import React, { memo } from "react";

import MessageBody from "./MessageBody";
import { Message } from "../../constants/types/chat";

type MessageListProps = {
  messages: Message[];
  channel: any;
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
    <div key={index}>
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
const MessageList = ({ messages, channel }: MessageListProps) => {
  return (
    <>
      {messages.length > 0 ? (
        <>
          {messages.map((message, index) => (
            <MessageItem
              key={message.id || index}
              message={message}
              channel={channel}
              index={index}
            />
          ))}
        </>
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
};

export default MessageList;
