import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Box, Text, Flex, Link, useToast, Image } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { AddIcon } from "@chakra-ui/icons";
import { useAccount } from "wagmi";

import useChannel from "../../../hooks/useChannel";
import { ChatBot } from "../../channels/brian";
import { timestampConverter } from "../../../utils/timestampConverter";
import NFTList from "../../../components/profile/NFTList";
import Badges from "../../../components/chat/Badges";
import {
  Message,
  initializeEmojis,
} from "../../../components/chat/types/index";
import ChatForm from "../../../components/chat/ChatForm";
import usePostFirstChat from "../../../hooks/usePostFirstChat";
import NebulousButton from "../../../components/general/button/NebulousButton";
import EmojiDisplay from "../../../components/chat/emoji/EmojiDisplay";
import usePostNFC from "../../../hooks/usePostNFC";
import { useUser } from "../../../hooks/useUser";
import {
  chatbotAddress,
  chatColor,
  emojis,
} from "../../../components/chat/AblyChataComponent";
import ReactDOM from "react-dom";
import NextHead from "../../../components/layout/NextHead";
import Participants from "../../../components/presence/Participants";
import { useRouter } from "next/router";

const CHAT_INPUT_PANEL_HEIGHT = 80;

const styles = `
  html, body {
    background: transparent !important;
  }

  *, *:before, *:after {
    -webkit-user-select: none !important;
    user-select: none !important;
    -webkit-touch-callout: none !important;
    -webkit-user-drag: none !important;  
    -webkit-text-size-adjust: none;
    text-size-adjust: none;
  }
`;

export default function Chat() {
  const router = useRouter();
  const { awsId } = router.query;
  const username = "brian";
  const ablyChatChannel = `${awsId}-chat-channel`;
  const ablyPresenceChannel = `${awsId}-presence-channel`;
  const { user } = useUser();
  const { address } = useAccount();
  const ADD_REACTION_EVENT = "add-reaction";
  /*eslint-disable prefer-const*/
  let inputBox: HTMLTextAreaElement | null = null;
  /*eslint-enable prefer-const*/
  const [chatBot, setChatBot] = useState<ChatBot[]>([]);

  const [receivedMessages, setMessages] = useState<Message[]>([]);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [formError, setFormError] = useState<null | string[]>(null);
  const [emojiList, setEmojiList] = useState<string[]>(emojis);
  // const [hasMessagesLoaded, setHasMessagesLoaded] = useState(false);
  const [showEmojiList, setShowEmojiList] = useState<null | string>(null);
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
  const channelName = ablyChatChannel
    ? `persistMessages:${ablyChatChannel}`
    : "persistMessages:chat-demo";

  const [channel, ably] = useChannel(channelName, (message) => {
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
      if (lastMessage.taskType === "video") {
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
            isLens: false,
            reactions: initializeEmojis,
          },
        });
        return;
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      channel.publish({
        name: "chat-message",
        data: {
          messageText: `${username} paid 5 $BRIAN to switch to a random scene!`,
          username: "chatbot🤖",
          chatColor: "black",
          address: "chatbotAddress",
          isFC: false,
          isLens: false,
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
        await postFirstChat(
          { text: messageText, channelId: 3 },
          { isFirst: true }
        );
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        channel.publish({
          name: "chat-message",
          data: {
            messageText,
            username: user.username,
            chatColor,
            isFC: user.isFCUser,
            isLens: user.isLensUser,
            lensHandle: user.lensHandle,
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
            isLens: user.isLensUser,
            lensHandle: user.lensHandle,
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
          await postFirstChat(
            { text: messageText, channelId: 3 },
            { isFirst: false }
          );
        }, 5000);
      }
    } else {
      if (address) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        channel.publish({
          name: "chat-message",
          data: {
            messageText,
            username: null,
            chatColor,
            isFC: false,
            isLens: false,
            address: address,
            powerUserLvl: 0,
            videoSavantLvl: 0,
            nfcRank: 0,
            isGif,
            reactions: initializeEmojis,
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
          isLens: false,
          isGif: false,
          reactions: initializeEmojis,
        },
      });
    } else if (
      messageText.startsWith("@nfc-it") ||
      messageText.startsWith("@nfc")
    ) {
      // open new tab to /clip page
      window.open("/clip", "_blank");
    } else if (messageText.startsWith("@rules")) {
      const rules =
        '"@chatbot [question]" to ask chatbot a question\n"@nfc [title]" to clip a moment\n"@noFCplz [message]" to not have message casted.\n"@rules" to see these rules.';
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
            isLens: false,
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
        {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore */}
        <Flex direction="column">
          <Flex key={index} direction="row" align="center">
            <Text color="#5A5A5A" fontSize="12px" mr="5px">
              {`${timestampConverter(message.timestamp)}`}
            </Text>
            <Badges user={user} message={message} />
            <NFTList
              mobile
              address={message.data.address}
              author={message.data.username}
              isLens={message.data.isLens}
              lensHandle={message.data.lensHandle}
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
                  <Flex
                    flexDirection="row"
                    alignItems="center"
                    paddingBottom={1}
                  >
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
                            <Flex
                              flexDirection="row"
                              alignItems="center"
                              marginRight={1}
                            >
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
                    <div
                      className="showme"
                      style={{
                        position: "relative",
                      }}
                    >
                      <NebulousButton
                        opacity={"0.4"}
                        aria-label="Chat-Reaction"
                        onClick={() =>
                          setShowEmojiList(showEmojiList ? null : message.id)
                        }
                        height="24px"
                        width="44px"
                      >
                        <AddIcon height="12px" width="12px" />
                      </NebulousButton>
                    </div>
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

  // new shit
  //
  //
  const anchorRef = useRef(null);
  const [scrolledUp, setScrolledUp] = useState(false);

  const forceScrollDown = () => {
    const node = ReactDOM.findDOMNode(anchorRef.current);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    node?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!scrolledUp) {
      // unless scrolled up, then don't scroll to it and show a button
      // to scroll to the bottom
      forceScrollDown();
    }

    if (receivedMessages.length > 1) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (window.ReactNativeWebView !== undefined) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.ReactNativeWebView.postMessage("chat_loaded");
      }
    }
  }, [receivedMessages]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio > 0) {
          setScrolledUp(false);
        } else {
          setScrolledUp(true);
        }
      });
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    observer.observe(anchorRef.current);
    return () => {
      observer.disconnect();
    };
  }, [anchorRef]);

  return (
    <Box flexDirection="column" height="100dvh" flexWrap="nowrap">
      <style>{styles}</style>
      <NextHead title="Unlonely Chat" description="" image="">
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </NextHead>
      <Participants mobile ablyPresenceChannel={ablyPresenceChannel} />
      <div
        // chat area wrapper
        style={{
          // backgroundColor: "red",
          height: "100svh",
          position: "relative",
        }}
      >
        <div
          // scroll area
          style={{
            // backgroundColor: "yellow",
            height: "100%",
            paddingBottom: CHAT_INPUT_PANEL_HEIGHT,
            overflowY: "scroll",
            overscrollBehavior: "contain",
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            "-webkit-overflow-scrolling": "touch",
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            "-webkit-mask-image":
              "linear-gradient(180deg, rgba(0,0,0,1) 92%, rgba(0,0,0,0) 100%)",
          }}
        >
          <div
            // messages grid
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              padding: "8px",
            }}
          >
            {messages}
            <div
              ref={anchorRef}
              style={{
                height: 0,
                // background: "blue",
                marginTop: "-8px",
                width: "100%",
              }}
            ></div>
          </div>
          <button
            style={{
              position: "fixed",
              top: 8,
              fontSize: 13,
              height: 64,
              width: "100%",
              textAlign: "center",
              transition: scrolledUp ? "all 0.25s 0.5s ease" : "all 0.15s ease",
              opacity: scrolledUp ? 1 : 0,
              pointerEvents: scrolledUp ? "all" : "none",
              transform: scrolledUp ? "translateY(0)" : "translateY(-100%)",
            }}
            onClick={forceScrollDown}
          >
            <span
              style={{
                position: "relative",
                display: "inline-block",
                background: "rgba(255,255,255,0.6)",
                padding: 8,
                borderRadius: 32,
                boxShadow: "0 3px 12px rgba(0,0,0,0.5)",
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                "-webkit-backdrop-filter": "blur(6px)",
                backdropFilter: "blur(6px)",
                zIndex: 10,
              }}
            >
              👇️ tap to scroll to bottom 👇️
            </span>
          </button>
        </div>
      </div>
      <div
        style={{
          // backgroundColor: "rgba(0,0,255,0.75)",
          height: CHAT_INPUT_PANEL_HEIGHT,
          width: "100%",
          position: "fixed",
          bottom: 0,
          padding: 8,
          paddingBottom: 0,
          // background: "linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0))",
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // "-webkit-backdrop-filter": "blur(6px)",
          // backdropFilter: "blur(6px)",
        }}
      >
        <ChatForm
          sendChatMessage={sendChatMessage}
          inputBox={inputBox}
          mobile
        />
      </div>
    </Box>
  );
}
