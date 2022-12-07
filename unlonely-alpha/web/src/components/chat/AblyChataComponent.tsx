import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Box, Text, Flex, Link, useToast, Image } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import { AddIcon } from "@chakra-ui/icons";

import useChannel from "../../hooks/useChannel";
import { ChatBot } from "../../pages/channels/brian";
import { COLORS } from "../../styles/Colors";
import { timestampConverter } from "../../utils/timestampConverter";
import NFTList from "../profile/NFTList";
import Badges from "./Badges";
import { Message, initializeEmojis } from "./types/index";
import { User } from "../../generated/graphql";
import ChatForm from "./ChatForm";
import usePostFirstChat from "../../hooks/usePostFirstChat";
import NebulousButton from "../general/button/NebulousButton";
import EmojiDisplay from "./emoji/EmojiDisplay";
import usePostNFC from "../../hooks/usePostNFC";
import Participants from "../presence/Participants";
import { useUser } from "../../hooks/useUser";

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

const emojis = [
  "https://i.imgur.com/wbUNcyS.gif",
  "https://i.imgur.com/zTfFgtZ.gif",
  "https://i.imgur.com/NurjwAK.gif",
  "⛽️",
  "😂",
  "❤️",
  "👑",
  "👀",
  "👍",
  "👎",
  "🚀",
];

const chatbotAddress = "0x0000000000000000000000000000000000000000";

const AblyChatComponent = ({ username, chatBot }: Props) => {
  const { user } = useUser();
  const ADD_REACTION_EVENT = "add-reaction";
  const [getPoap, { loading, data }] = useLazyQuery(GET_POAP_QUERY, {
    fetchPolicy: "no-cache",
  });
  const autoScroll = useRef(true);
  /*eslint-disable prefer-const*/
  let inputBox: HTMLTextAreaElement | null = null;
  /*eslint-enable prefer-const*/

  const [receivedMessages, setMessages] = useState<Message[]>([]);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [formError, setFormError] = useState<null | string[]>(null);
  const [emojiList, setEmojiList] = useState<string[]>(emojis);
  const [showEmojiList, setShowEmojiList] = useState<null | string>(null);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const { postFirstChat, loading: postChatLoading } = usePostFirstChat({
    onError: (m) => {
      setFormError(m ? m.map((e) => e.message) : ["An unknown error occurred"]);
    },
  });
  const { postNFC } = usePostNFC({
    onError: (m) => {
      setFormError(m ? m.map((e) => e.message) : ["An unknown error occurred"]);
    },
  });
  const toast = useToast();

  const [channel, ably] = useChannel("persistMessages:chat-demo", (message) => {
    const history = receivedMessages.slice(-199);
    // remove messages where name = add-reaction
    const messageHistory = history.filter((m) => m.name !== ADD_REACTION_EVENT);
    if (message.name === ADD_REACTION_EVENT) {
      const reaction = message;
      const timeserial = reaction.data.extras.reference.timeserial;
      const emojiType = reaction.data.body;

      // get index of message in filteredHistory array where timeserial matches
      const index = messageHistory.findIndex(
        (m) => m.extras.timeserial === timeserial
      );

      // if index is found, update the message object with the reaction count
      const messageToUpdate = messageHistory[index];
      const emojisToUpdate = messageToUpdate.data.reactions;
      const emojiIndex = emojisToUpdate.findIndex(
        (e) => e.emojiType === emojiType
      );

      if (emojiIndex !== -1) {
        emojisToUpdate[emojiIndex].count += 1;
      }
      const updatedMessage = {
        ...messageToUpdate,
        data: {
          ...messageToUpdate.data,
          reactions: emojisToUpdate,
        },
      };
      messageHistory[index] = updatedMessage;

      setMessages([...messageHistory]);
    }
    setMessages([...messageHistory, message]);
  });

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
          address: "chatbotAddress",
          isFC: false,
          reactions: initializeEmojis,
        },
      });
    }
  }, [chatBot]);

  const sendChatMessage = async (messageText: string, isGif: boolean) => {
    if (user) {
      if (!user.signature) {
        // postFirstChat comes before channel.publish b/c it will set the signature
        // subsequent chats do not need to call postFirstChat first
        await postFirstChat({ text: messageText }, { isFirst: true });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        channel.publish({
          name: "chat-message",
          data: {
            messageText,
            username: user.username,
            chatColor,
            isFC: user.isFCUser,
            address: user.address,
            powerUserLvl: user?.powerUserLvl,
            videoSavantLvl: user?.videoSavantLvl,
            nfcRank: user?.nfcRank,
            isGif,
            reactions: initializeEmojis,
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
            isFC: user.isFCUser,
            address: user.address,
            powerUserLvl: user?.powerUserLvl,
            videoSavantLvl: user?.videoSavantLvl,
            nfcRank: user?.nfcRank,
            isGif,
            reactions: initializeEmojis,
          },
        });
        handleChatCommand(messageText);
        // postFirstChat comes after to speed up chat
        // wait a few seconds before postFirstChat
        setTimeout(async function () {
          await postFirstChat({ text: messageText }, { isFirst: false });
        }, 5000);
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
          address: chatbotAddress,
          isFC: false,
          isGif: false,
          reactions: initializeEmojis,
        },
      });
    } else if (messageText.startsWith("@poap")) {
      const currentDate = new Date();
      const currentDatePst = currentDate.toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
      });
      const date = currentDatePst.split(",")[0].trim();
      const { data } = await getPoap({ variables: { data: { date } } });
      let messageText: string;
      if (!data.getPoap) {
        messageText = "No POAPs today. Try again next time.";
      } else {
        messageText = `${data.getPoap.link}`;
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      channel.publish({
        name: "chat-message",
        data: {
          messageText: messageText,
          username: "chatbot🤖",
          chatColor: "black",
          address: chatbotAddress,
          isFC: false,
          isGif: false,
          reactions: initializeEmojis,
        },
      });
    } else if (messageText.startsWith("@nfc-it") || messageText.startsWith("@nfc")) {
      // first check if they're a poweruser
      if (user && user?.powerUserLvl > 0) {
        // const that removes the @nfc-it: from the beginning of the message
        const title = messageText.startsWith("@nfc-it") ? messageText.substring(8) : messageText.substring(5);
        if (title) {
          const { res } = await postNFC({ title });
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          channel.publish({
            name: "chat-message",
            data: {
              messageText:
                res && res < 0
                  ? "Failed to clip. No clips remaining this week."
                  : `"${title}" clipped successfully! You have ${res} clips left this week.`,
              username: "chatbot🤖",
              chatColor: "black",
              address: chatbotAddress,
              isFC: false,
              isGif: false,
              reactions: initializeEmojis,
            },
          });
        } else {
          // no title
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          channel.publish({
            name: "chat-message",
            data: {
              messageText:
                "Failed to clip. Include clip title: '@nfc-it [title]'",
              username: "chatbot🤖",
              chatColor: "black",
              address: chatbotAddress,
              isFC: false,
              isGif: false,
              reactions: initializeEmojis,
            },
          });
        }
      } else if (user && user?.powerUserLvl === 0) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        channel.publish({
          name: "chat-message",
          data: {
            messageText: "You must be a power user to use this command.",
            username: "chatbot🤖",
            chatColor: "black",
            address: chatbotAddress,
            isFC: false,
            isGif: false,
            reactions: initializeEmojis,
          },
        });
      }
    } else if (messageText.startsWith("@rules")) {
      const rules =
        '"@chatbot [question]" to ask chatbot a question\n"@nfc-it [title]" to clip a moment\n"@noFCplz [message]" to not have message casted.\n"@rules" to see these rules.';
      // wait 1 second before sending rules
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        channel.publish({
          name: "chat-message",
          data: {
            messageText: rules,
            username: "chatbot🤖",
            chatColor: "black",
            address: chatbotAddress,
            isFC: false,
            isGif: false,
            reactions: initializeEmojis,
          },
        });
      }, 1000);
    }
  };

  // message emoji reactions

  // publish emoji reaction using timeserial
  const sendMessageReaction = (
    emoji: string,
    timeserial: any,
    reactionEvent: string
  ) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    channel.publish(reactionEvent, {
      body: emoji,
      name: reactionEvent,
      extras: {
        reference: { type: "com.ably.reaction", timeserial },
      },
    });
    setShowEmojiList(null);
  };

  useEffect(() => {
    async function getMessages() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await channel.history({ limit: 200 }, (err, result) => {
        const messageHistory: any = result.items.filter(
          (message: any) => message.name === "chat-message"
        );
        const reverse = [...messageHistory].reverse();
        setMessages(reverse);

        // iterate through result
        result.items.forEach((message: any) => {
          if (message.name === ADD_REACTION_EVENT) {
            const reaction = message;
            const timeserial = reaction.data.extras.reference.timeserial;
            const emojiType = reaction.data.body;

            // get index of message in filteredHistory array where timeserial matches
            const index = messageHistory.findIndex(
              (m: any) => m.extras.timeserial === timeserial
            );

            // if index is found, update the message object with the reaction count
            const messageToUpdate = messageHistory[index];
            const emojisToUpdate = messageToUpdate.data.reactions;
            const emojiIndex = emojisToUpdate.findIndex(
              (e: any) => e.emojiType === emojiType
            );

            if (emojiIndex !== -1) {
              emojisToUpdate[emojiIndex].count += 1;
            }
            const updatedMessage = {
              ...messageToUpdate,
              data: {
                ...messageToUpdate.data,
                reactions: emojisToUpdate,
              },
            };
            messageHistory[index] = updatedMessage;
            const reverse = [...messageHistory, message].reverse();
            setMessages(reverse);
          }
        });
        // Get index of last sent message from history
      });
    }
    getMessages();
  }, []);

  const messages = receivedMessages.map((message, index) => {
    if (message.name !== "chat-message") return null;
    const messageText = message.data.messageText;
    // regex to check if message is a link
    const isLink = messageText.match(
      /((https?:\/\/)|(www\.))[^\s/$.?#].[^\s]*/g
    )
      ? true
      : false;
    // if isLink true, remove link from message
    let splitURL: string[] | undefined = undefined;
    if (isLink) {
      // detect link at end of message, split into array [message, link].
      splitURL = messageText.split(/(?:http:\/\/|https:\/\/|www\.)/g);
      // add https:// to link
      splitURL[splitURL.length - 1] = `https://${
        splitURL[splitURL.length - 1]
      }`;
    }

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
          <div className="showhim">
            {message.data.nfcRank && message.data.nfcRank > 0 ? (
              <Box
                key={index}
                borderRadius="10px"
                // bg={message.data.chatColor}
                bgGradient="linear(to-r, #d16fce, #7655D2, #4173D6, #4ABBDF)"
                pr="10px"
                pl="10px"
                mb="10px"
                pb={showEmojiList === message.id ? "10px" : "0px"}
                position="relative"
              >
                <Flex justifyContent="space-between" flexDirection="column">
                  {message.data.isGif ? (
                    <>
                      <Flex flexDirection="row">
                        <Image src={messageText} h="40px" p="5px" />
                        <Image src={messageText} h="40px" p="5px" />
                        <Image src={messageText} h="40px" p="5px" />
                      </Flex>
                    </>
                  ) : (
                    <>
                      {isLink && splitURL ? (
                        <>
                          {splitURL.length > 1 ? (
                            <>
                              <Text
                                color="white"
                                fontFamily="Inter"
                                fontSize={12}
                                wordBreak="break-word"
                                textAlign="left"
                              >
                                {splitURL[0]}
                              </Text>
                              <Link
                                href={splitURL[splitURL.length - 1]}
                                isExternal
                                color="white"
                                fontSize={12}
                                fontFamily="Inter"
                                wordBreak="break-word"
                                textAlign="left"
                              >
                                {splitURL[splitURL.length - 1]}
                                <ExternalLinkIcon mx="2px" />
                              </Link>
                            </>
                          ) : (
                            <Link
                              href={messageText}
                              fontFamily="Inter"
                              fontWeight="light"
                              isExternal
                              color="white"
                              fontSize={12}
                              wordBreak="break-word"
                              textAlign="left"
                            >
                              {messageText}
                              <ExternalLinkIcon mx="2px" />
                            </Link>
                          )}
                        </>
                      ) : (
                        <Text
                          color="white"
                          fontFamily="Inter"
                          fontWeight="light"
                          fontSize={
                            message.data.address === chatbotAddress ? 10 : 12
                          }
                          wordBreak="break-word"
                          textAlign="left"
                        >
                          {messageText}
                        </Text>
                      )}
                    </>
                  )}
                  <div
                    className="showme"
                    style={{
                      position: "absolute",
                      right: "5px",
                      bottom: "0px",
                    }}
                  >
                    <NebulousButton
                      opacity={"0.3"}
                      aria-label="Chat-Reaction"
                      onClick={() =>
                        setShowEmojiList(showEmojiList ? null : message.id)
                      }
                      height="12px"
                      width="12px"
                    >
                      <AddIcon height="12px" width="12px" />
                    </NebulousButton>
                  </div>
                  <Flex flexDirection="row">
                    {message.data.reactions?.map((reaction) => (
                      <div
                        key={reaction.emojiType}
                        className={
                          "text-xs rounded-full p-2 m-1 space-x-2  bg-slate-100 hover:bg-slate-50"
                        }
                        style={{
                          cursor: buttonDisabled ? "not-allowed" : "pointer",
                        }}
                        onClick={() => {
                          if (buttonDisabled) return;
                          sendMessageReaction(
                            reaction.emojiType,
                            message.extras.timeserial,
                            ADD_REACTION_EVENT
                          );
                          setTimeout(() => {
                            setButtonDisabled(false);
                          }, 3000);
                          setButtonDisabled(true);
                        }}
                      >
                        {reaction.count > 0 ? (
                          <>
                            <Flex flexDirection="row">
                              <EmojiDisplay
                                emoji={reaction.emojiType}
                                fontSize={"16px"}
                                buttonDisabled={buttonDisabled}
                                setButtonDisabled={setButtonDisabled}
                              />
                              <span>
                                <Flex
                                  pl="2px"
                                  textColor="white"
                                  fontSize="14px"
                                  mr="4px"
                                >
                                  {reaction.count}
                                </Flex>
                              </span>
                            </Flex>
                          </>
                        ) : null}
                      </div>
                    ))}
                  </Flex>
                </Flex>
                {showEmojiList === message.id ? (
                  <Flex
                    flexWrap="wrap"
                    background={"rgba(255, 255, 255, 0.5)"}
                    borderRadius={"10px"}
                  >
                    {emojiList.map((emoji) => (
                      <Box
                        minH="40px"
                        background="transparent"
                        p="5px"
                        key={emoji}
                        style={{
                          cursor: buttonDisabled ? "not-allowed" : "pointer",
                        }}
                        onClick={() => {
                          setButtonDisabled(true);
                          sendMessageReaction(
                            emoji,
                            message.extras.timeserial,
                            ADD_REACTION_EVENT
                          );
                          setTimeout(() => {
                            setButtonDisabled(false);
                          }, 2000);
                        }}
                      >
                        <EmojiDisplay
                          emoji={emoji}
                          fontSize={"18px"}
                          buttonDisabled={buttonDisabled}
                          setButtonDisabled={setButtonDisabled}
                          channel={channel}
                          timeserial={message.extras.timeserial}
                        />
                      </Box>
                    ))}
                  </Flex>
                ) : null}
              </Box>
            ) : (
              <Box
                key={index}
                borderRadius="10px"
                bg={message.data.chatColor}
                pr="10px"
                pl="10px"
                mb="10px"
                pb={showEmojiList === message.id ? "10px" : "0px"}
                position="relative"
              >
                <Flex justifyContent="space-between" flexDirection="column">
                  {message.data.isGif ? (
                    <>
                      <Flex flexDirection="row">
                        <Image src={messageText} h="40px" p="5px" />
                        <Image src={messageText} h="40px" p="5px" />
                        <Image src={messageText} h="40px" p="5px" />
                      </Flex>
                    </>
                  ) : (
                    <>
                      {isLink && splitURL ? (
                        <>
                          {splitURL.length > 1 ? (
                            <>
                              <Text
                                color="white"
                                fontFamily="Inter"
                                fontSize={12}
                                wordBreak="break-word"
                                textAlign="left"
                              >
                                {splitURL[0]}
                              </Text>
                              <Link
                                href={splitURL[splitURL.length - 1]}
                                isExternal
                                color="white"
                                fontSize={12}
                                fontFamily="Inter"
                                wordBreak="break-word"
                                textAlign="left"
                              >
                                {splitURL[splitURL.length - 1]}
                                <ExternalLinkIcon mx="2px" />
                              </Link>
                            </>
                          ) : (
                            <Link
                              href={messageText}
                              fontFamily="Inter"
                              fontWeight="light"
                              isExternal
                              color="white"
                              fontSize={12}
                              wordBreak="break-word"
                              textAlign="left"
                            >
                              {messageText}
                              <ExternalLinkIcon mx="2px" />
                            </Link>
                          )}
                        </>
                      ) : (
                        <Text
                          color="white"
                          fontFamily="Inter"
                          fontWeight="light"
                          fontSize={
                            message.data.address === chatbotAddress ? 10 : 12
                          }
                          wordBreak="break-word"
                          textAlign="left"
                        >
                          {messageText}
                        </Text>
                      )}
                    </>
                  )}
                  <div
                    className="showme"
                    style={{
                      position: "absolute",
                      right: "5px",
                      bottom: "0px",
                    }}
                  >
                    <NebulousButton
                      opacity={"0.3"}
                      aria-label="Chat-Reaction"
                      onClick={() =>
                        setShowEmojiList(showEmojiList ? null : message.id)
                      }
                      height="12px"
                      width="12px"
                    >
                      <AddIcon height="12px" width="12px" />
                    </NebulousButton>
                  </div>
                  <Flex flexDirection="row">
                    {message.data.reactions?.map((reaction) => (
                      <div
                        key={reaction.emojiType}
                        className={
                          "text-xs rounded-full p-2 m-1 space-x-2  bg-slate-100 hover:bg-slate-50"
                        }
                        style={{
                          cursor: buttonDisabled ? "not-allowed" : "pointer",
                        }}
                        onClick={() => {
                          if (buttonDisabled) return;
                          sendMessageReaction(
                            reaction.emojiType,
                            message.extras.timeserial,
                            ADD_REACTION_EVENT
                          );
                          setTimeout(() => {
                            setButtonDisabled(false);
                          }, 3000);
                          setButtonDisabled(true);
                        }}
                      >
                        {reaction.count > 0 ? (
                          <>
                            <Flex flexDirection="row">
                              <EmojiDisplay
                                emoji={reaction.emojiType}
                                fontSize={"16px"}
                                buttonDisabled={buttonDisabled}
                                setButtonDisabled={setButtonDisabled}
                              />
                              <span>
                                <Flex
                                  pl="2px"
                                  textColor="white"
                                  fontSize="14px"
                                  mr="4px"
                                >
                                  {reaction.count}
                                </Flex>
                              </span>
                            </Flex>
                          </>
                        ) : null}
                      </div>
                    ))}
                  </Flex>
                </Flex>
                {showEmojiList === message.id ? (
                  <Flex
                    flexWrap="wrap"
                    background={"rgba(255, 255, 255, 0.5)"}
                    borderRadius={"10px"}
                  >
                    {emojiList.map((emoji) => (
                      <Box
                        minH="40px"
                        background="transparent"
                        p="5px"
                        key={emoji}
                        style={{
                          cursor: buttonDisabled ? "not-allowed" : "pointer",
                        }}
                        onClick={() => {
                          setButtonDisabled(true);
                          sendMessageReaction(
                            emoji,
                            message.extras.timeserial,
                            ADD_REACTION_EVENT
                          );
                          setTimeout(() => {
                            setButtonDisabled(false);
                          }, 2000);
                        }}
                      >
                        <EmojiDisplay
                          emoji={emoji}
                          fontSize={"18px"}
                          buttonDisabled={buttonDisabled}
                          setButtonDisabled={setButtonDisabled}
                          channel={channel}
                          timeserial={message.extras.timeserial}
                        />
                      </Box>
                    ))}
                  </Flex>
                ) : null}
              </Box>
            )}
          </div>
        </Flex>
      </>
    );
  });

  // useeffect to scroll to the bottom of the chat
  // explain what the useEffect below is doing
  useEffect(() => {
    const chat = document.getElementById("chat");
    if (!chat) return;

    if (autoScroll.current) {
      if (
        chat.scrollHeight - chat.scrollTop > 1000 &&
        chat.scrollHeight - chat.scrollTop < 10_000
      ) {
        setIsScrolled(true);
      } else {
        chat.scrollTop = chat.scrollHeight;
        setIsScrolled(false);
      }
    }
  }, [receivedMessages]);

  useEffect(() => {
    const chat = document.getElementById("chat");
    if (!chat) return;
    if (!isScrolled) {
      chat.scrollTop = chat.scrollHeight;
      return;
    }
  }, [isScrolled]);

  return (
    <>
      <Flex p="10px" h="100%" minW="100%" width="100%">
        <Flex direction="column">
          <Participants />
          <Text
            lineHeight={5}
            mt="4px"
            mb="4px"
            fontWeight="bold"
            fontSize={18}
            textAlign="center"
          >
            Currently Hanging Out
          </Text>
          <Flex
            direction="column"
            overflowX="auto"
            height="100%"
            maxH="400px"
            id="chat"
            position="relative"
            mt="8px"
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
          <Flex justifyContent="center">
            {isScrolled ? (
              <Box
                bg="rgba(98, 98, 98, 0.6)"
                p="4px"
                borderRadius="4px"
                _hover={{
                  background: "rgba(98, 98, 98, 0.3)",
                  cursor: "pointer",
                }}
                onClick={() => setIsScrolled(false)}
              >
                <Text fontFamily="Inter" fontSize="9px" color="black">
                  scrolling paused. click to scroll to bottom.
                </Text>
              </Box>
            ) : null}
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
