import { Flex, Text } from "@chakra-ui/react";
import React from "react";

import MessageBody from "./MessageBody";
import { Message } from "../../constants/types/chat";

type Props = {
  messages: Message[];
  channel: any;
};

const MessageList = ({ messages, channel }: Props) => {
  return (
    <>
      {messages.length > 0 ? (
        <>
          {messages.map((message, index) => {
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
          })}
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
