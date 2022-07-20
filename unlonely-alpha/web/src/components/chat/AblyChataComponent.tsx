import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Box, Text, Flex, Button, Textarea, Link } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

import useChannel from "../../hooks/useChannel";
import { COLORS } from "../../styles/Colors";

type Message = {
    clientId: string;
    connectionId: string;
    data: { messageText: string;
            username: string;
            chatColor: string;
          };
    id: string;
    timestamp: number;
}

type Props = {
    username: string | null | undefined;
}

const chatColor = COLORS[Math.floor(Math.random() * COLORS.length)]

const AblyChatComponent = ({ username }: Props) => {
    let inputBox: HTMLTextAreaElement | null = null;
    let messageEnd: HTMLDivElement | null = null;
  
    const [messageText, setMessageText] = useState<string>("");
    const [receivedMessages, setMessages] = useState<Message[]>([]);
    const messageTextIsEmpty = messageText.trim().length === 0;
  
    const [channel, ably] = useChannel("chat-demo", (message: Message) => {
      const history = receivedMessages.slice(-199);
      setMessages([...history, message]);
    });
  
    const sendChatMessage = (messageText: string) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      channel.publish({ name: "chat-message", data: { messageText, username, chatColor } });
      setMessageText("");
      if (inputBox) inputBox.focus();
    };
  
    const handleFormSubmission = (event: { preventDefault: () => void; }) => {
      event.preventDefault();
      sendChatMessage(messageText);
    };

    const handleKeyPress = (event: any) => {
        if (event.charCode !== 13 || messageTextIsEmpty) {
            return;
        }
        sendChatMessage(messageText);
        event.preventDefault();
        }
  
    const messages = receivedMessages.map((message, index) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const author = message.connectionId === ably.connection.id ? "me" : message.data.username;
      return (
        <>
            <Flex direction="row" mb="5px">
                <Text>
                    {author}:{" "}
                </Text>
                <Box key={index} borderRadius="10px" bg={message.data.chatColor} pr="10px" pl="10px" >
                    <Text color="white" fontSize={14} wordBreak="break-word">
                        {message.data.messageText}
                    </Text>
                </Box>
            </Flex>
        </>
      );
    });
  
    useEffect(() => {
        if (messageEnd) {
            messageEnd.scrollIntoView({ behavior: "smooth" });
        }
    });
  
    return (
        <>
            <Flex p="10px" h="100%" minW="100%">
                <Flex direction="column">
                    <Text lineHeight={5} mb="10px" fontWeight="bold">
                        Interested in learning more?
                        <Link href="https://tally.so/r/3ja0ba" isExternal>
                        {" "}Join our community to get notified!<ExternalLinkIcon mx="2px" />
                        </Link>
                    </Text>
                    <Flex direction="column" overflowX="auto" height="100%" maxH="500px">
                        {messages}
                        <div ref={(element) => { messageEnd = element; }}></div>
                    </Flex>  
                    <Flex mt="20px" w="100%">
                        <form onSubmit={handleFormSubmission} style={{ width: "100%"}}>
                            <Textarea
                                ref={(element) => { inputBox = element; }}
                                value={messageText}
                                placeholder="Type a message..."
                                onChange={e => setMessageText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                background="white"
                                minW="100%"
                            >
                            </Textarea>
                            <Flex width="100%" justifyContent="right" mb="50px">
                                <Button type="submit" disabled={messageTextIsEmpty} mt="5px" bg="#27415E" color="white">Send</Button>
                            </Flex>
                        </form>  
                    </Flex>
                </Flex>
            </Flex>
        </>
    );
  }
  
  export default AblyChatComponent;