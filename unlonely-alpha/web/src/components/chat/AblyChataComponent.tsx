import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Box, Text, Flex, Link, useToast, Image } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { gql, useLazyQuery } from "@apollo/client";

import useChannel from "../../hooks/useChannel";
import { ChatBot } from "../../pages/channels/brian";
import { COLORS } from "../../styles/Colors";
import { isFCUser } from "../../utils/farcasterBadge";
import { timestampConverter } from "../../utils/timestampConverter";
import NFTList from "../profile/NFTList";
import Badges from "./Badges";
import { Message } from "./types/index";
import { User } from "../../generated/graphql";
import ChatForm from "./ChatForm";
import usePostFirstChat from "../../hooks/usePostFirstChat";

type Props = {
  username: string | null | undefined;
  chatBot: ChatBot[];
  user: User | undefined;
};

const GET_POAP_QUERY = gql`
  query GetPoap($data: GetPoapInput!) {
    getPoap(data: $data) {
      id
      link
    }
  }
`;

const chatColor = COLORS[Math.floor(Math.random() * COLORS.length)];

const AblyChatComponent = ({ username, chatBot, user }: Props) => {
  const [getPoap, { loading, data }] = useLazyQuery(GET_POAP_QUERY, {
    fetchPolicy: "no-cache",
  });
  const autoScroll = useRef(true);
  /*eslint-disable prefer-const*/
  let inputBox: HTMLTextAreaElement | null = null;
  /*eslint-enable prefer-const*/

  const [receivedMessages, setMessages] = useState<Message[]>([]);
  const [isFC, setIsFC] = useState<boolean>(false);
  const [formError, setFormError] = useState<null | string[]>(null);
  const { postFirstChat, loading: postChatLoading } = usePostFirstChat({
    onError: (m) => {
      setFormError(m ? m.map((e) => e.message) : ["An unknown error occurred"]);
    },
  });
  const toast = useToast();

  const [channel, ably] = useChannel("persistMessages:chat-demo", (message) => {
    const history = receivedMessages.slice(-199);
    setMessages([...history, message]);
  });

  useEffect(() => {
    async function getMessages() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { items } = await channel.history({ limit: 500 });
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
          messageText: `${username} added a ${lastMessage.taskType} task: "${lastMessage.title}", "${lastMessage.description}"`,
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
      if (!user.signature) {
        await postFirstChat({ text: messageText });
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
        handleChatCommand(messageText);
      } else {
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
        handleChatCommand(messageText);
        await postFirstChat({ text: messageText });
      }
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
    if (inputBox) inputBox.focus();
  };

  const handleChatCommand = async (messageText: string) => {
    if (messageText.startsWith("@chatbot")) {
      // const that removes the @chatbot: from the beginning of the message
      const prompt = messageText.substring(9);
      const res = await fetch("/api/openai", {
        body: JSON.stringify({
          prompt: `Answer the following prompt: ${prompt}`,
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
    } else if (messageText.startsWith("@poap")) {
      const currentDate = new Date();
      const currentDatePst = currentDate.toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
      });
      const date = currentDatePst.split(",")[0].trim();
      const { data } = await getPoap({ variables: { data: { date } } });
      const poapLink = data.getPoap.link;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      channel.publish({
        name: "chat-message",
        data: {
          messageText: `${poapLink}`,
          username: "chatbot🤖",
          chatColor: "black",
          address: "0x0000000000000000000000000000000000000000",
          isFC: false,
        },
      });
    }
  }

  const messages = receivedMessages.map((message, index) => {
    return (
      <>
        <Flex direction="column">
          <Flex key={index} direction="row" align="center">
            <Text color="#5A5A5A" fontSize="12px" mr="5px">
              {`${timestampConverter(message.timestamp)}`}
            </Text>
            <Badges user={user} message={message} />
            <NFTList
              address={message.data.address}
              author={message.data.username}
            />
          </Flex>
          <Box
            key={index}
            borderRadius="10px"
            bg={message.data.chatColor}
            pr="10px"
            pl="10px"
            mb="10px"
          >
            <Text
              color="white"
              fontSize={14}
              wordBreak="break-word"
              textAlign="left"
            >
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
            {messages.length > 0 ? (
              messages
            ) : (
              <Flex flexDirection="row">
                <Image
                  src="https://i.imgur.com/tS6RUJt.gif"
                  width="2rem"
                  height="2rem"
                  mr="0.5rem"
                />
                {"loading messages"}
              </Flex>
            )}
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
            <ChatForm sendChatMessage={sendChatMessage} inputBox={inputBox} />
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

export default AblyChatComponent;
