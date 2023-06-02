import {
  Box,
  Text,
  Flex,
  useToast,
  Button,
  Stack,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Td,
  Th,
  Tr,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";

import useChannel from "../../hooks/useChannel";
import { ChatBot } from "../../pages/channels/brian";
import { COLORS } from "../../styles/Colors";
import { Message, initializeEmojis } from "./types/index";
import { User } from "../../generated/graphql";
import ChatForm from "./ChatForm";
import usePostFirstChat from "../../hooks/usePostFirstChat";
import Participants from "../presence/Participants";
import { useUser } from "../../hooks/useUser";
import MessageList from "./MessageList";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import SwordButton from "../arcade/SwordButton";
import CoinButton from "../arcade/CoinButton";
import ControlButton from "../arcade/ControlButton";
import DiceButton from "../arcade/DiceButton";

type Props = {
  username: string | null | undefined;
  chatBot: ChatBot[];
  user: User | undefined;
  ablyChatChannel?: string;
  ablyPresenceChannel?: string;
  channelArn: string;
  channelId: number;
  allowNFCs: boolean;
};

export const chatColor = COLORS[Math.floor(Math.random() * COLORS.length)];

export const emojis = [
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

export const chatbotAddress = "0x0000000000000000000000000000000000000000";

const AblyChatComponent = ({
  username,
  chatBot,
  ablyChatChannel,
  ablyPresenceChannel,
  channelArn,
  channelId,
  allowNFCs,
}: Props) => {
  const { user } = useUser();
  const { address } = useAccount();
  const ADD_REACTION_EVENT = "add-reaction";
  const autoScroll = useRef(true);
  /*eslint-disable prefer-const*/
  let inputBox: HTMLTextAreaElement | null = null;
  /*eslint-enable prefer-const*/

  const [receivedMessages, setMessages] = useState<Message[]>([]);
  const [formError, setFormError] = useState<null | string[]>(null);
  const [hasMessagesLoaded, setHasMessagesLoaded] = useState(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showArcade, setShowArcade] = useState<boolean>(false);

  const clickedOutsideLeaderBoard = useRef(false);
  const clickedOutsideArcade = useRef(false);
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const arcadeRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(leaderboardRef, () => {
    if (showLeaderboard) {
      setShowLeaderboard(false);
      clickedOutsideLeaderBoard.current = true;
    }
    clickedOutsideArcade.current = false;
  });
  useOnClickOutside(arcadeRef, () => {
    if (showArcade) {
      setShowArcade(false);
      clickedOutsideArcade.current = true;
    }
    clickedOutsideLeaderBoard.current = false;
  });

  const { postFirstChat, loading: postChatLoading } = usePostFirstChat({
    onError: (m) => {
      setFormError(m ? m.map((e) => e.message) : ["An unknown error occurred"]);
    },
  });
  const toast = useToast();
  const channelName = ablyChatChannel
    ? `persistMessages:${ablyChatChannel}`
    : "persistMessages:chat-demo";

  const [channel, ably] = useChannel(channelName, (message) => {
    setHasMessagesLoaded(false);
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
    setHasMessagesLoaded(true);
  });

  useEffect(() => {
    if (chatBot.length > 0) {
      const lastMessage = chatBot[chatBot.length - 1];

      let messageText = `${username} paid 5 $BRIAN to switch to a random scene!`;
      if (lastMessage.taskType === "video") {
        messageText = `${username} added a ${lastMessage.taskType} task: "${lastMessage.title}", "${lastMessage.description}"`;
      }

      channel.publish({
        name: "chat-message",
        data: {
          messageText: messageText,
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
          { text: messageText, channelId: channelId },
          { isFirst: true }
        );
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
        await postFirstChat(
          { text: messageText, channelId: channelId },
          { isFirst: false }
        );
      }
    } else {
      if (address) {
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
    let messageToPublish = "";
    let allowPublish = false;

    if (messageText.startsWith("@chatbot")) {
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
      messageToPublish = `${data}`;
      allowPublish = true;
    } else if (
      messageText.startsWith("@nfc-it") ||
      messageText.startsWith("@nfc")
    ) {
      if (allowNFCs) {
        window.open(`/clip?arn=${channelArn}`, "_blank");
        allowPublish = false;
      } else {
        messageToPublish = "NFCs are not allowed on this channel.";
        allowPublish = true;
      }
    } else if (messageText.startsWith("@rules")) {
      const rules =
        '"@chatbot [question]" to ask chatbot a question\n"@noFCplz [message]" to not have message casted.\n"@rules" to see these rules.';
      setTimeout(() => {
        messageToPublish = rules;
        publishMessage(messageToPublish);
      }, 1000);
      allowPublish = false;
    }

    if (allowPublish) {
      publishMessage(messageToPublish);
    }
  };

  const publishMessage = (messageText: string) => {
    channel.publish({
      name: "chat-message",
      data: {
        messageText: messageText,
        username: "chatbot🤖",
        chatColor: "black",
        address: chatbotAddress,
        isFC: false,
        isLens: false,
        isGif: false,
        reactions: initializeEmojis,
      },
    });
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

  // useeffect to scroll to the bottom of the chat
  // explain what the useEffect below is doing
  useEffect(() => {
    const chat = document.getElementById("chat");
    if (!chat) return;
    if (autoScroll.current) {
      //inital message load
      if (!hasMessagesLoaded && receivedMessages.length) {
        chat.scrollTop = chat.scrollHeight;
        setIsScrolled(false);
        setHasMessagesLoaded(true);
        return;
      } //every message after (might have to determine a better number than 600)
      else if (chat.scrollHeight - chat.scrollTop > 600) {
        setIsScrolled(true);
        return;
      }
      //anything else
      chat.scrollTop = chat.scrollHeight;
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
      <Flex h="100%" minW="100%">
        <Flex
          mt="10px"
          direction="column"
          minW="100%"
          width="100%"
          position={"relative"}
        >
          {ablyChatChannel?.includes("channel") && (
            <Stack direction={"row"} spacing="10px">
              <Flex
                borderRadius={"5px"}
                p="1px"
                bg={
                  "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
                }
                flex={1}
                minWidth={0}
              >
                <Button
                  opacity={showArcade ? 0.9 : 1}
                  width="100%"
                  bg={"#131323"}
                  _hover={{}}
                  _focus={{}}
                  _active={{}}
                  onClick={() => {
                    if (clickedOutsideArcade.current) {
                      clickedOutsideArcade.current = false;
                      return;
                    }
                    setShowArcade(!showArcade);
                  }}
                >
                  <Text fontSize={"24px"} fontFamily={"Neue Pixel Sans"}>
                    arcade
                  </Text>
                </Button>
              </Flex>
              <Flex
                borderRadius={"5px"}
                p="1px"
                bg={
                  "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
                }
                flex={1}
                minWidth={0}
              >
                <Button
                  opacity={showLeaderboard ? 0.9 : 1}
                  width="100%"
                  bg={"#131323"}
                  _hover={{}}
                  _focus={{}}
                  _active={{}}
                  onClick={() => {
                    if (clickedOutsideLeaderBoard.current) {
                      clickedOutsideLeaderBoard.current = false;
                      return;
                    }
                    setShowLeaderboard(!showLeaderboard);
                  }}
                >
                  <Text fontSize={"24px"} fontFamily={"Neue Pixel Sans"}>
                    leaderboard
                  </Text>
                </Button>
              </Flex>
            </Stack>
          )}
          {showArcade && (
            <Flex
              ref={arcadeRef}
              borderRadius={"5px"}
              p="1px"
              position="absolute"
              top="50px"
              width={"100%"}
              zIndex={3}
              style={{
                border: "1px solid",
                borderWidth: "1px",
                borderImageSource:
                  "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)",
                borderImageSlice: 1,
                borderRadius: "5px",
              }}
            >
              <Flex
                direction="column"
                bg={"rgba(19, 19, 35, 0.8)"}
                style={{ backdropFilter: "blur(6px)" }}
                borderRadius={"5px"}
                width={"100%"}
                padding={"40px"}
              >
                <Grid
                  templateColumns="repeat(2, 1fr)"
                  gap={12}
                  alignItems="center"
                  justifyItems="center"
                >
                  <GridItem>
                    <ControlButton />
                  </GridItem>
                  <GridItem>
                    <DiceButton />
                  </GridItem>
                  <GridItem>
                    <SwordButton />
                  </GridItem>
                  <GridItem>
                    <CoinButton />
                  </GridItem>
                </Grid>
              </Flex>
            </Flex>
          )}
          {showLeaderboard && (
            <Flex
              ref={leaderboardRef}
              borderRadius={"5px"}
              p="1px"
              position="absolute"
              top="50px"
              width={"100%"}
              zIndex={3}
              style={{
                border: "1px solid",
                borderWidth: "1px",
                borderImageSource:
                  "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)",
                borderImageSlice: 1,
                borderRadius: "5px",
              }}
            >
              <Flex
                direction="column"
                bg={"rgba(19, 19, 35, 0.8)"}
                style={{ backdropFilter: "blur(6px)" }}
                borderRadius={"5px"}
                width={"100%"}
              >
                <Text fontSize={"44px"} fontWeight="400" textAlign={"center"}>
                  HIGH SCORES
                </Text>
                <Text
                  color={"#B6B6B6"}
                  fontSize={"18"}
                  fontWeight="400"
                  textAlign={"center"}
                >
                  Who owns the most $BRIAN?
                </Text>
                <TableContainer overflowX={"hidden"}>
                  <Table variant="unstyled">
                    <Thead>
                      <Tr>
                        <Th
                          textTransform={"lowercase"}
                          fontSize={"24px"}
                          p="10px"
                          textAlign="center"
                        >
                          rank
                        </Th>
                        <Th
                          textTransform={"lowercase"}
                          fontSize={"24px"}
                          p="10px"
                          textAlign="center"
                        >
                          name
                        </Th>
                        <Th
                          textTransform={"lowercase"}
                          fontSize={"24px"}
                          p="10px"
                          textAlign="center"
                          isNumeric
                        >
                          amount
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td fontSize={"24px"} p="10px" textAlign="center">
                          1
                        </Td>
                        <Td fontSize={"24px"} p="10px" textAlign="center">
                          cruzy
                        </Td>
                        <Td
                          fontSize={"24px"}
                          p="10px"
                          textAlign="center"
                          isNumeric
                        >
                          25000
                        </Td>
                      </Tr>
                      <Tr>
                        <Td fontSize={"24px"} p="10px" textAlign="center">
                          2
                        </Td>
                        <Td fontSize={"24px"} p="10px" textAlign="center">
                          tiny
                        </Td>
                        <Td
                          fontSize={"24px"}
                          p="10px"
                          textAlign="center"
                          isNumeric
                        >
                          3000
                        </Td>
                      </Tr>
                      <Tr>
                        <Td fontSize={"24px"} p="10px" textAlign="center">
                          3
                        </Td>
                        <Td fontSize={"24px"} p="10px" textAlign="center">
                          me
                        </Td>
                        <Td
                          fontSize={"24px"}
                          p="10px"
                          textAlign="center"
                          isNumeric
                        >
                          10
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </Flex>
            </Flex>
          )}
          <Text
            lineHeight={5}
            mt="4px"
            mb="4px"
            fontWeight="light"
            fontSize={13}
            textAlign="center"
            color="#A9ADCC"
          >
            Who's here?
          </Text>
          <Participants ablyPresenceChannel={ablyPresenceChannel} />
          <Flex
            direction="column"
            overflowX="auto"
            height="100%"
            id="chat"
            position="relative"
            mt="8px"
          >
            <MessageList messages={receivedMessages} channel={channel} />
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
                <Text fontSize="12px">
                  scrolling paused. click to scroll to bottom.
                </Text>
              </Box>
            ) : null}
          </Flex>
          <Flex mt="40px" w="100%" mb="15px">
            <ChatForm sendChatMessage={sendChatMessage} inputBox={inputBox} />
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

export default AblyChatComponent;
