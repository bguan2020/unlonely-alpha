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
  Spinner,
  Tooltip,
} from "@chakra-ui/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { useScrollPercentage } from "../../hooks/useScrollPercentage";
import { InteractionType } from "../../constants";
import BuyButton from "../arcade/BuyButton";
import { FetchBalanceResult } from "../../constants/types";
import { useLazyQuery } from "@apollo/client";
import { GET_TOKEN_HOLDERS_BY_CHANNEL_QUERY } from "../../constants/queries";
import centerEllipses from "../../utils/centerEllipses";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { isAddress } from "viem";

type Props = {
  username: string | null | undefined;
  chatBot: ChatBot[];
  user: User | undefined;
  ablyChatChannel?: string;
  ablyPresenceChannel?: string;
  channelArn: string;
  channelId: number;
  allowNFCs: boolean;
  tokenContractAddress: string;
  tokenBalanceData?: FetchBalanceResult;
  handleControlModal?: () => void;
  handleChanceModal?: () => void;
  handlePvpModal?: () => void;
  handleTipModal?: () => void;
  handleBuyModal?: () => void;
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
  tokenContractAddress,
  tokenBalanceData,
  handleControlModal,
  handleChanceModal,
  handlePvpModal,
  handleTipModal,
  handleBuyModal,
}: Props) => {
  const { user } = useUser();
  const { address } = useAccount();
  const ADD_REACTION_EVENT = "add-reaction";
  /*eslint-disable prefer-const*/
  let inputBox: HTMLTextAreaElement | null = null;
  /*eslint-enable prefer-const*/

  const [receivedMessages, setMessages] = useState<Message[]>([]);
  const [formError, setFormError] = useState<null | string[]>(null);
  const [chatHeightGrounded, setChatHeightGrounded] = useState(false);
  const [hasMessagesLoaded, setHasMessagesLoaded] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showArcade, setShowArcade] = useState<boolean>(false);
  const [holders, setHolders] = useState<{ name: string; quantity: number }[]>(
    []
  );

  const clickedOutsideLeaderBoard = useRef(false);
  const clickedOutsideArcade = useRef(false);
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const arcadeRef = useRef<HTMLDivElement>(null);

  const [
    getTokenHolders,
    { loading: holdersLoading, error, data: holdersData },
  ] = useLazyQuery(GET_TOKEN_HOLDERS_BY_CHANNEL_QUERY);

  useEffect(() => {
    if (showLeaderboard && !holdersLoading && !holdersData) {
      getTokenHolders({
        variables: {
          data: {
            channelId: channelId,
          },
        },
      });
    }
  }, [showLeaderboard]);

  useEffect(() => {
    if (!holdersLoading && !error && holdersData) {
      const _holders: { name: string; quantity: number }[] =
        holdersData.getTokenHoldersByChannel
          .map((holder: any) => {
            return {
              name:
                holder.user.username ?? centerEllipses(holder.user.address, 10),
              quantity: holder.quantity,
            };
          })
          .sort((a: any, b: any) => b.quantity - a.quantity)
          .slice(0, 10);
      setHolders(_holders);
    }
  }, [holdersLoading, error, holdersData]);

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
  const { scrollRef, scrollPercentage } = useScrollPercentage();

  const hasScrolled = useMemo(() => {
    return scrollPercentage < 100 && !chatHeightGrounded;
  }, [scrollPercentage, chatHeightGrounded]);

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
      if (lastMessage.taskType === InteractionType.TIP) {
        messageText = lastMessage.description ?? "Tip";
      }
      if (lastMessage.taskType === "pvp") {
        messageText = lastMessage.description ?? "Pvp";
      }
      if (lastMessage.taskType === "chance") {
        messageText = lastMessage.description ?? "Chance";
      }
      if (lastMessage.taskType === InteractionType.CONTROL) {
        messageText = lastMessage.description ?? "Control";
      }
      if (lastMessage.taskType === InteractionType.BUY) {
        messageText = lastMessage.description ?? "Buy";
      }

      channel.publish({
        name: "chat-message",
        data: {
          messageText: messageText,
          username: "chatbot🤖",
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
    if (!hasMessagesLoaded && receivedMessages.length) {
      chat.scrollTop = chat.scrollHeight;
      setHasMessagesLoaded(true);
      return;
    }
    if (scrollPercentage === 100) {
      chat.scrollTop = chat.scrollHeight;
    }
    setChatHeightGrounded(chat.scrollHeight <= chat.clientHeight);
  }, [receivedMessages]);

  const handleScrollToPresent = () => {
    const chat = document.getElementById("chat");
    if (!chat) return;
    chat.scrollTop = chat.scrollHeight;
  };

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
                {isAddress(tokenContractAddress) && (
                  <>
                    <BuyButton
                      tokenName={`$${tokenBalanceData?.symbol}`}
                      callback={handleBuyModal}
                    />
                    <Grid
                      mt="50px"
                      templateColumns="repeat(2, 1fr)"
                      gap={12}
                      alignItems="center"
                      justifyItems="center"
                    >
                      <GridItem>
                        <ControlButton callback={handleControlModal} />
                      </GridItem>
                      <GridItem>
                        <Tooltip label={"coming soon"}>
                          <span>
                            <DiceButton noHover />
                          </span>
                        </Tooltip>
                      </GridItem>
                      <GridItem>
                        <Tooltip label={"coming soon"}>
                          <span>
                            <SwordButton noHover />
                          </span>
                        </Tooltip>
                      </GridItem>
                      <GridItem>
                        <CoinButton callback={handleTipModal} />
                      </GridItem>
                    </Grid>
                  </>
                )}
                {!isAddress(tokenContractAddress) && (
                  <>
                    <Tooltip label={"not available"}>
                      <span>
                        <BuyButton tokenName={"token"} />
                      </span>
                    </Tooltip>
                    <Grid
                      mt="50px"
                      templateColumns="repeat(2, 1fr)"
                      gap={12}
                      alignItems="center"
                      justifyItems="center"
                    >
                      <GridItem>
                        <Tooltip label={"not available"}>
                          <span>
                            <ControlButton />
                          </span>
                        </Tooltip>
                      </GridItem>
                      <GridItem>
                        <Tooltip label={"not available"}>
                          <span>
                            <CoinButton />
                          </span>
                        </Tooltip>
                      </GridItem>
                      <GridItem>
                        <Tooltip label={"not available"}>
                          <span>
                            <DiceButton />
                          </span>
                        </Tooltip>
                      </GridItem>
                      <GridItem>
                        <Tooltip label={"not available"}>
                          <span>
                            <SwordButton />
                          </span>
                        </Tooltip>
                      </GridItem>
                    </Grid>
                  </>
                )}
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
                <Text fontSize={"36px"} fontWeight="bold" textAlign={"center"}>
                  HIGH SCORES
                </Text>
                <Text
                  color={"#B6B6B6"}
                  fontSize={"14px"}
                  fontWeight="400"
                  textAlign={"center"}
                >
                  who owns the most $BRIAN?
                </Text>
                {holdersLoading && (
                  <Flex justifyContent={"center"} p="20px">
                    <Spinner />
                  </Flex>
                )}
                {!holdersLoading && holders.length > 0 && (
                  <TableContainer overflowX={"hidden"}>
                    <Table variant="unstyled">
                      <Thead>
                        <Tr>
                          <Th
                            textTransform={"lowercase"}
                            fontSize={"20px"}
                            p="10px"
                            textAlign="center"
                          >
                            rank
                          </Th>
                          <Th
                            textTransform={"lowercase"}
                            fontSize={"20px"}
                            p="10px"
                            textAlign="center"
                          >
                            name
                          </Th>
                          <Th
                            textTransform={"lowercase"}
                            fontSize={"20px"}
                            p="10px"
                            textAlign="center"
                            isNumeric
                          >
                            amount
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {holders.map((holder, index) => (
                          <Tr>
                            <Td fontSize={"20px"} p="10px" textAlign="center">
                              {index + 1}
                            </Td>
                            <Td fontSize={"20px"} p="10px" textAlign="center">
                              {holder.name}
                            </Td>
                            <Td
                              fontSize={"20px"}
                              p="10px"
                              textAlign="center"
                              isNumeric
                            >
                              {truncateValue(holder.quantity, 2)}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
                {!holdersLoading && holders.length === 0 && (
                  <Text textAlign={"center"} p="20px">
                    no holders found
                  </Text>
                )}
              </Flex>
            </Flex>
          )}
          <Flex my="10px" direction={"column"}>
            <Text
              lineHeight={5}
              fontWeight="light"
              fontSize={13}
              textAlign="center"
              color="#A9ADCC"
            >
              who's here?
            </Text>
            <Participants ablyPresenceChannel={ablyPresenceChannel} />
          </Flex>
          <Flex
            direction="column"
            overflowX="auto"
            height="100%"
            id="chat"
            position="relative"
            mt="8px"
            ref={scrollRef}
          >
            <MessageList messages={receivedMessages} channel={channel} />
          </Flex>
          <Flex justifyContent="center">
            {hasScrolled && hasMessagesLoaded ? (
              <Box
                bg="rgba(98, 98, 98, 0.6)"
                p="4px"
                borderRadius="4px"
                _hover={{
                  background: "rgba(98, 98, 98, 0.3)",
                  cursor: "pointer",
                }}
                onClick={handleScrollToPresent}
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
