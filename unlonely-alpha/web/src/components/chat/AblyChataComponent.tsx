import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Text,
  Flex,
  Button,
  Textarea,
  Link,
  useToast,
  Image,
  Tooltip,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";

import useChannel from "../../hooks/useChannel";
import { useUser } from "../../hooks/useUser";
import { ChatBot } from "../../pages/channels/youtube";
import { COLORS } from "../../styles/Colors";
import { isFCUser } from "../../utils/farcasterBadge";
import NFTList from "../profile/NFTList";

type Message = {
  clientId: string;
  connectionId: string;
  data: {
    messageText: string;
    username: string;
    chatColor: string;
    address: string;
    isFC: boolean;
    powerUserLvl: number | null;
    videoSavantLvl: number | null;
  };
  id: string;
  timestamp: number;
};

type Props = {
  username: string | null | undefined;
  chatBot: ChatBot[];
};

const chatColor = COLORS[Math.floor(Math.random() * COLORS.length)];

const AblyChatComponent = ({ username, chatBot }: Props) => {
  const { user } = useUser();
  const autoScroll = useRef(true);
  let inputBox: HTMLTextAreaElement | null = null;

  const [messageText, setMessageText] = useState<string>("");
  const [receivedMessages, setMessages] = useState<Message[]>([]);
  const [isFC, setIsFC] = useState<boolean>(false);
  const toast = useToast();
  const [buttonStatus, toggleButton] = useState(false);

  const messageTextIsEmpty = messageText.trim().length === 0;

  const switchButton = () => {
    toggleButton((current) => !current);
  };
  const [channel, ably] = useChannel(
    "persistMessages:chat-demo",
    (message: Message) => {
      const history = receivedMessages.slice(-199);
      setMessages([...history, message]);
    }
  );

  useEffect(() => {
    async function getMessages() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { items } = await channel.history({ limit: 200 });
      const reversed = items.reverse();
      setMessages(reversed);
    }
    getMessages();
  }, []);

  useEffect(() => {
    if (chatBot.length > 0) {
      const lastMessage = chatBot[chatBot.length - 1];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      channel.publish({
        name: "chat-message",
        data: {
          messageText: `${username} added the video: "${lastMessage.videoTitle}"`,
          username: "chatbot🤖",
          chatColor: "black",
          address: "0x0000000000000000000000000000000000000000",
          isFC: false,
        },
      });
    }
  }, [chatBot]);

  const sendChatMessage = async (messageText: string) => {
    if (user) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      channel.publish({
        name: "chat-message",
        data: {
          messageText,
          username: user.username,
          chatColor,
          isFC,
          address: user.address,
          powerUserLvl: user?.powerUserLvl,
          videoSavantLvl: user?.videoSavantLvl,
        },
      });
    } else {
      toast({
        title: "Sign in first.",
        description: "Please sign into your wallet first.",
        status: "warning",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
    }
    setMessageText("");
    if (inputBox) inputBox.focus();
    if (messageText.startsWith("@chatbot")) {
      // const that removes the @chatbot: from the beginning of the message
      const prompt = messageText.substring(9);
      const res = await fetch("/api/openai", {
        body: JSON.stringify({
          prompt: prompt,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      channel.publish({
        name: "chat-message",
        data: {
          messageText: `${data}`,
          username: "chatbot🤖",
          chatColor: "black",
          address: "0x0000000000000000000000000000000000000000",
          isFC: false,
        },
      });
    }
  };

  const handleFormSubmission = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (username) {
      sendChatMessage(messageText);
    } else {
      toast({
        title: "Sign in first.",
        description: "Please sign into your wallet first.",
        status: "warning",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleKeyPress = (event: any) => {
    if (event.charCode !== 13 || messageTextIsEmpty) {
      return;
    }
    event.preventDefault();
    if (username) {
      sendChatMessage(messageText);
    } else {
      toast({
        title: "Sign in first.",
        description: "Please sign into your wallet first.",
        status: "warning",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const messages = receivedMessages.map((message, index) => {
    return (
      <>
        <Flex direction="column">
          <Flex key={index} direction="row" align="center">
            {((user && (user?.powerUserLvl > 0) && (user?.username === message.data.username)) || (message.data.powerUserLvl && message.data.powerUserLvl> 0)) ? (
              <Tooltip label={`Power User lvl:${message.data.powerUserLvl} \nThis badge means you've come to multiple streams and have engaged in chat! Continue the streak to gain levels!`}>
                  <Image
                    src={`/images/badges/lvl${message.data.powerUserLvl}_poweruser.png`}
                    width="20px"
                    height="20px"
                    mr="5px"
                  />
              </Tooltip>
            ) : null}
            {((user && (user?.videoSavantLvl > 0) && (user?.username === message.data.username)) || (message.data.videoSavantLvl && message.data.videoSavantLvl> 0)) ? (
              <Tooltip label={`Video Savant lvl:${message.data.videoSavantLvl}\nThis badge means you pick good videos that get upvoted and watched. Continue picking good videos to gain levels!`}>
                  <Image
                    src={`/images/badges/lvl${message.data.videoSavantLvl}_videosavant.png`}
                    width="20px"
                    height="20px"
                    mr="5px"
                  />
              </Tooltip>
            ) : null}
            {(message.data.isFC) && (
              <Tooltip label="Farcaster Badge">
                  <Image
                    src="https://searchcaster.xyz/img/logo.png"
                    width="20px"
                    height="20px"
                    mr="5px"
                  />
              </Tooltip>
            )}
            <NFTList address={message.data.address} author={message.data.username} />
          </Flex>
          <Box
            key={index}
            borderRadius="10px"
            bg={message.data.chatColor}
            pr="10px"
            pl="10px"
            mb="10px"
          >
            <Text color="white" fontSize={14} wordBreak="break-word">
              {message.data.messageText}
            </Text>
          </Box>
        </Flex>
      </>
    );
  });


  useEffect(() => {
    const fetchData = async (address: string) => {
      const fcBadge = await isFCUser(address);
      setIsFC(fcBadge);
    };
    if (user?.address) {
      fetchData(user.address);
    }
  }, [user?.address]);

  // useeffect to scroll to the bottom of the chat
  useEffect(() => {
    if (autoScroll.current) {
      const chat = document.getElementById("chat");
      if (chat) {
        chat.scrollTop = chat.scrollHeight;
      }
    }
  }, [receivedMessages]);

  return (
    <>
      <Flex p="10px" h="100%" minW="100%">
        <Flex direction="column">
          <Text lineHeight={5} mb="10px" fontWeight="bold" fontSize={14}>
            Give product feedback and bug reports
            <Link href="https://tally.so/r/mODB9K" isExternal>
              {" "}
              here.
              <ExternalLinkIcon mx="2px" />
            </Link>
          </Text>
          <Flex
            direction="column"
            overflowX="auto"
            height="100%"
            maxH="400px"
            id="chat"
          >
            {messages}
            {autoScroll.current && (
              <Box
              // ref={(el) => {
              //   if (el) el.scrollIntoView({ behavior: "smooth" });
              // }}
              />
            )}
          </Flex>
          <Flex mt="20px" w="100%">
            <form
              onSubmit={handleFormSubmission}
              className="xeedev-form-i"
              style={{ width: "100%" }}
            >
              <Textarea
                ref={(element) => {
                  inputBox = element;
                }}
                value={messageText}
                placeholder="Type a message..."
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                background="white"
                minW="100%"
              ></Textarea>
              <Flex width="100%" justifyContent="right" mb="50px">
                <Button
                  type="submit"
                  disabled={messageTextIsEmpty}
                  mt="5px"
                  bg="#27415E"
                  color="white"
                  className="xeedev-button-desktop"
                >
                  Send
                </Button>
              </Flex>
            </form>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

export default AblyChatComponent;
