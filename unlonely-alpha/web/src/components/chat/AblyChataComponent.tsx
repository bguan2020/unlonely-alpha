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
  // Menu,
  // MenuButton,
  // MenuList,
  // MenuItem,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { EmojiHappyIcon } from "@heroicons/react/solid";

import useChannel from "../../hooks/useChannel";
import { useUser } from "../../hooks/useUser";
import { ChatBot } from "../../pages/channels/youtube";
import { COLORS } from "../../styles/Colors";
import { isFCUser } from "../../utils/farcasterBadge";
import { timestampConverter } from "../../utils/timestampConverter";
import NFTList from "../profile/NFTList";
import Badges from "./Badges";
import { EmojiDisplay } from "./EmojiDisplay";
import { Message, EmojiUsage } from "./types/index";

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
  const [showEmojiList, setShowEmojiList] = useState(false);

  const messageTextIsEmpty = messageText.trim().length === 0;

  const emojis = ["⛽️", "😂", "🌝", "📉", "😡", "👏"];
  // salute emoji
  let usedEmojiCollection: EmojiUsage[] = [];

  const ADD_REACTION_EVENT = "add-reaction";

  const [channel, ably] = useChannel(
    "persistMessages:chat-demo",
    (message) => {
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

  // emojis to chat
  // const sendMessageReaction = (
  //   emoji: string,
  //   timeserial: any,
  //   reactionEvent: string
  // ) => {
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   // @ts-ignore
  //   channel.publish(reactionEvent, {
  //     body: emoji,
  //     extras: {
  //       reference: { type: "com.ably.reaction", timeserial },
  //     },
  //   });
  //   setShowEmojiList(false);
  // }

  // const handleEmojiCount = (emoji: string, timeserial: any) => {
  //   sendMessageReaction(emoji, timeserial, ADD_REACTION_EVENT);
  // }

  // const getMessageReactions = () => {
  //   channel.subscribe(
  //     {
  //       name: ADD_REACTION_EVENT,
  //       refTimeserial: chatMessage.timeserial,
  //     },
  //     (reaction) => {
  //       // Update current chat with its reactions
  //       const msgReactions = updateEmojiCollection(
  //         reaction.data.body,
  //         reaction.clientId,
  //         reaction.name
  //       )
  //       setChatMessage((chatMessage) => ({
  //         ...chatMessage,
  //         reactions: msgReactions,
  //       }))
  //     }
  //   )
  // }

  const messages = receivedMessages.map((message, index) => {
    return (
      <>
        <Flex direction="column">
          <Flex key={index} direction="row" align="center">
            <Text color="#5A5A5A" fontSize="12px" mr="5px">
              {`${timestampConverter(message.timestamp)}`}
            </Text>
            <Badges user={user} message={message}/>
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
                <Flex justifyContent="space-between" direction="row">
                  <Flex>
                    <Text color="white" fontSize={14} wordBreak="break-word" textAlign="left">
                      {message.data.messageText}
                    </Text>
                      <Flex>
                        {message.data.reactions?.length ? (
                          <Flex>
                            {message.data.reactions?.map((reaction) => 
                              reaction.usedBy.length ? (
                                <Flex key={reaction.emoji} direction="row" align="center"
                                  borderRadius="20px"
                                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                  // @ts-ignore
                                  bg={reaction.usedBy.includes(ably.connection.id) ? "blue-200" : "gray-200"}
                                  onClick={() =>
                                    handleEmojiCount(
                                      reaction.emoji,
                                      message.timeserial,
                                    )}
                                  >
                                    <EmojiDisplay emoji={reaction.emoji} />
                                    <Flex>{reaction.usedBy.length}</Flex>
                                </Flex>
                              ) : null
                            )}
                          </Flex>
                      ) : null }
                      </Flex>
                  </Flex>
                    <Flex direction="row-reverse" mb="5px">
                      <EmojiHappyIcon 
                        style={{cursor: "pointer"}}
                        onClick={() => setShowEmojiList(!showEmojiList)}
                        width="1rem"
                      />
                    </Flex>
                </Flex>
                  {showEmojiList ? (
                    <Flex borderRadius="10px" height="2rem">
                      {emojis.map((emoji) => (
                        <Flex key={emoji} direction="row" align="center">
                          <EmojiDisplay emoji={emoji} />
                        </Flex>
                      ))}
                    </Flex>
                  ) : null }
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
            {messages.length > 0 ? messages : <Flex flexDirection="row"><Image src="https://i.imgur.com/tS6RUJt.gif" width="2rem" height="2rem" mr="0.5rem"/>{"loading messages"}</Flex>}  
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
