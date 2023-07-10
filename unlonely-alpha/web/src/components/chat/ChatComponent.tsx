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

import { useChannel } from "../../hooks/chat/useChannel";
import { initializeEmojis } from "./types/index";
import ChatForm from "./ChatForm";
import usePostFirstChat from "../../hooks/server/usePostFirstChat";
import Participants from "../presence/Participants";
import { useUser } from "../../hooks/context/useUser";
import MessageList from "./MessageList";
import { useOnClickOutside } from "../../hooks/internal/useOnClickOutside";
// import SwordButton from "../arcade/SwordButton";
import CoinButton from "../arcade/CoinButton";
import ControlButton from "../arcade/ControlButton";
// import DiceButton from "../arcade/DiceButton";
import { useScrollPercentage } from "../../hooks/internal/useScrollPercentage";
import {
  NULL_ADDRESS,
  InteractionType,
  RANDOM_CHAT_COLOR,
  BaseChatCommand,
} from "../../constants";
import BuyButton from "../arcade/BuyButton";
import { ChatBot } from "../../constants/types";
import centerEllipses from "../../utils/centerEllipses";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { isAddress } from "viem";
import { useChannelContext } from "../../hooks/context/useChannel";
import { ChatCommand } from "../../generated/graphql";
import CustomButton from "../arcade/CustomButton";

type Props = {
  username: string | null | undefined;
  chatBot: ChatBot[];
  handleControlModal?: () => void;
  handleChanceModal?: () => void;
  handlePvpModal?: () => void;
  handleTipModal?: () => void;
  handleBuyModal?: () => void;
  handleCustomModal?: () => void;
};

const AblyChatComponent = ({
  username,
  chatBot,
  handleControlModal,
  handleChanceModal,
  handlePvpModal,
  handleTipModal,
  handleBuyModal,
  handleCustomModal,
}: Props) => {
  const {
    channel: channelContext,
    chat,
    holders: holdersContext,
    recentStreamInteractions,
  } = useChannelContext();
  const { channelBySlug } = channelContext;
  const { chatChannel, presenceChannel } = chat;
  const {
    data: holdersData,
    loading: holdersLoading,
    error: holdersError,
    refetchTokenHolders,
    userRank,
  } = holdersContext;
  const { addToTextOverVideo } = recentStreamInteractions;

  const channelId = useMemo(
    () => (channelBySlug?.id ? Number(channelBySlug?.id) : 3),
    [channelBySlug?.id]
  );

  const channelChatCommands = useMemo(
    () =>
      channelBySlug?.chatCommands
        ? channelBySlug?.chatCommands.filter(
            (c): c is ChatCommand => c !== null
          )
        : [],
    [channelBySlug?.chatCommands]
  );

  const {
    ablyChannel: channel,
    hasMessagesLoaded,
    setHasMessagesLoaded,
    receivedMessages,
  } = useChannel();

  const { user, userAddress: address } = useUser();
  /*eslint-disable prefer-const*/
  let inputBox: HTMLTextAreaElement | null = null;
  /*eslint-enable prefer-const*/

  const [formError, setFormError] = useState<null | string[]>(null);
  const [chatHeightGrounded, setChatHeightGrounded] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showArcade, setShowArcade] = useState<boolean>(false);
  const [holders, setHolders] = useState<{ name: string; quantity: number }[]>(
    []
  );

  const clickedOutsideLeaderBoard = useRef(false);
  const clickedOutsideArcade = useRef(false);
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const arcadeRef = useRef<HTMLDivElement>(null);

  const mountingMessages = useRef(true);

  const chatCommands = useMemo(
    () =>
      channelBySlug?.chatCommands?.filter((c): c is ChatCommand => c !== null),
    [channelBySlug]
  );

  useEffect(() => {
    if (showLeaderboard && !holdersLoading && !holdersData) {
      refetchTokenHolders?.();
    }
  }, [showLeaderboard]);

  useEffect(() => {
    if (!holdersLoading && !holdersError && holdersData) {
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
  }, [holdersLoading, holdersError, holdersData]);

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

  const { postFirstChat } = usePostFirstChat({
    onError: (m) => {
      setFormError(m ? m.map((e) => e.message) : ["An unknown error occurred"]);
    },
  });
  const { scrollRef, scrollPercentage } = useScrollPercentage();

  const hasScrolled = useMemo(() => {
    return scrollPercentage < 100 && !chatHeightGrounded;
  }, [scrollPercentage, chatHeightGrounded]);

  const toast = useToast();

  useEffect(() => {
    if (chatBot.length > 0) {
      const lastMessage = chatBot[chatBot.length - 1];
      let body: string | undefined = undefined;

      let messageText = `${username} paid 5 $BRIAN to switch to a random scene!`;
      if (lastMessage.taskType === "video") {
        messageText = `${username} added a ${lastMessage.taskType} task: "${lastMessage.title}", "${lastMessage.description}"`;
      }
      if (lastMessage.taskType === InteractionType.TIP) {
        messageText = lastMessage.title ?? "Tip";
      }
      if (lastMessage.taskType === "pvp") {
        messageText = lastMessage.title ?? "Pvp";
      }
      if (lastMessage.taskType === "chance") {
        messageText = lastMessage.title ?? "Chance";
      }
      if (lastMessage.taskType === InteractionType.CONTROL) {
        messageText = lastMessage.title ?? "Control";
        body = `${InteractionType.CONTROL}:${lastMessage.description ?? ""}`;
      }
      if (lastMessage.taskType === InteractionType.CUSTOM) {
        messageText = lastMessage.title ?? "Custom";
        body = `${InteractionType.CUSTOM}:${lastMessage.description ?? ""}`;
      }
      if (lastMessage.taskType === InteractionType.BUY) {
        messageText = lastMessage.title ?? "Buy";
      }
      publishChatBotMessage(messageText, body);
    }
  }, [chatBot]);

  const sendChatMessage = async (messageText: string, isGif: boolean) => {
    if (!user && !address) {
      toast({
        title: "Sign in first.",
        description: "Please sign into your wallet first.",
        status: "warning",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
    }
    if (!user && address) {
      channel.publish({
        name: "chat-message",
        data: {
          messageText,
          username: null,
          chatColor: RANDOM_CHAT_COLOR,
          isFC: false,
          isLens: false,
          address: address,
          tokenHolderRank: userRank,
          isGif,
          reactions: initializeEmojis,
        },
      });
    }
    if (user) {
      // postFirstChat comes before channel.publish b/c it will set the signat
      // subsequent chats do not need to call postFirstChat first
      if (!user.signature) {
        await postFirstChat(
          { text: messageText, channelId: channelId },
          { isFirst: true }
        );
      }
      channel.publish({
        name: "chat-message",
        data: {
          messageText,
          username: user.username,
          chatColor: RANDOM_CHAT_COLOR,
          isFC: user.isFCUser,
          isLens: user.isLensUser,
          lensHandle: user.lensHandle,
          address: user.address,
          tokenHolderRank: userRank,
          isGif,
          reactions: initializeEmojis,
        },
      });
      handleChatCommand(messageText);
      // postFirstChat comes after to speed up chat
      if (user.signature) {
        await postFirstChat(
          { text: messageText, channelId: channelId },
          { isFirst: false }
        );
      }
    }

    if (inputBox) inputBox.focus();
  };

  const handleChatCommand = async (messageText: string) => {
    let messageToPublish = "";
    let allowPublish = false;

    if (messageText.startsWith("@")) {
      messageToPublish = "seems you're trying to use commands. try !commands";
      allowPublish = true;
    } else if (messageText.startsWith(BaseChatCommand.COMMANDS)) {
      messageToPublish = `${BaseChatCommand.CHATBOT}\n${
        BaseChatCommand.CLIP
      }\n${BaseChatCommand.RULES}\n${channelChatCommands
        .map((c) => `!${c.command}`)
        .join("\n")}`;
      allowPublish = true;
    } else if (messageText.startsWith(BaseChatCommand.CHATBOT)) {
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
    } else if (messageText.startsWith(BaseChatCommand.CLIP)) {
      if (channelBySlug?.allowNFCs || false) {
        window.open(`/clip?arn=${channelBySlug?.channelArn || ""}`, "_blank");
        allowPublish = false;
      } else {
        messageToPublish = "NFCs are not allowed on this channel.";
        allowPublish = true;
      }
    } else if (messageText.startsWith(BaseChatCommand.RULES)) {
      const rules =
        '"!chatbot [question]" to ask chatbot a question\n"!rules" to see these rules.';
      setTimeout(() => {
        messageToPublish = rules;
        publishChatBotMessage(messageToPublish);
      }, 1000);
      allowPublish = false;
    } else {
      for (let i = 0; i < channelChatCommands.length; i++) {
        const chatCommand = channelChatCommands[i];
        if (messageText.startsWith(`!${chatCommand.command}`)) {
          messageToPublish = chatCommand.response;
          setTimeout(() => {
            publishChatBotMessage(messageToPublish);
          }, 1000);
          allowPublish = false;
          break;
        }
      }
    }

    if (allowPublish) {
      publishChatBotMessage(messageToPublish);
    }
  };

  const publishChatBotMessage = (messageText: string, body?: string) => {
    channel.publish({
      name: "chat-message",
      data: {
        messageText: messageText,
        username: "chatbot🤖",
        address: NULL_ADDRESS,
        isFC: false,
        isLens: false,
        isGif: false,
        reactions: initializeEmojis,
        body,
      },
    });
  };

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

  useEffect(() => {
    if (receivedMessages.length === 0) return;
    if (!mountingMessages.current) {
      const latestMessage = receivedMessages[receivedMessages.length - 1];
      if (latestMessage && latestMessage.name === "chat-message") {
        if (
          latestMessage.data.body &&
          latestMessage.data.body.split(":")[0] === InteractionType.CONTROL
        ) {
          const newTextOverVideo = latestMessage.data.body
            .split(":")
            .slice(1)
            .join();
          if (newTextOverVideo) {
            addToTextOverVideo(newTextOverVideo);
          }
        }
      }
    }
    mountingMessages.current = false;
  }, [receivedMessages]);

  const handleScrollToPresent = () => {
    const chat = document.getElementById("chat");
    if (!chat) return;
    chat.scrollTop = chat.scrollHeight;
  };

  return (
    <Flex h="100%" minW="100%">
      <Flex
        mt="10px"
        direction="column"
        minW="100%"
        width="100%"
        position={"relative"}
      >
        {chatChannel?.includes("channel") && (
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
              {isAddress(String(channelBySlug?.token?.address)) &&
                user &&
                address && (
                  <>
                    <BuyButton
                      tokenName={`$${channelBySlug?.token?.symbol}`}
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
                        <Tooltip label={"control text on the stream"}>
                          <span>
                            <ControlButton callback={handleControlModal} />
                          </span>
                        </Tooltip>
                      </GridItem>
                      {/* <GridItem>
                        <Tooltip label={"coming soon"}>
                          <span>
                            <DiceButton noHover />
                          </span>
                        </Tooltip>
                      </GridItem> */}
                      {/* <GridItem>
                        <Tooltip label={"coming soon"}>
                          <span>
                            <SwordButton noHover />
                          </span>
                        </Tooltip>
                      </GridItem> */}
                      <GridItem>
                        <Tooltip label={"control the streamer"}>
                          <span>
                            <CustomButton callback={handleCustomModal} />
                          </span>
                        </Tooltip>
                      </GridItem>
                      <GridItem>
                        <Tooltip label={"tip the streamer"}>
                          <span>
                            <CoinButton callback={handleTipModal} />
                          </span>
                        </Tooltip>
                      </GridItem>
                    </Grid>
                  </>
                )}
              {(!isAddress(String(channelBySlug?.token?.address)) || !user) && (
                <>
                  <Tooltip
                    label={!user ? "connect wallet first" : "not available"}
                  >
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
                      <Tooltip
                        label={!user ? "connect wallet first" : "not available"}
                      >
                        <span>
                          <ControlButton />
                        </span>
                      </Tooltip>
                    </GridItem>
                    <GridItem>
                      <Tooltip
                        label={!user ? "connect wallet first" : "not available"}
                      >
                        <span>
                          <CoinButton />
                        </span>
                      </Tooltip>
                    </GridItem>
                    {/* <GridItem>
                      <Tooltip
                        label={!user ? "connect wallet first" : "not available"}
                      >
                        <span>
                          <DiceButton />
                        </span>
                      </Tooltip>
                    </GridItem> */}
                    {/* <GridItem>
                      <Tooltip
                        label={!user ? "connect wallet first" : "not available"}
                      >
                        <span>
                          <SwordButton />
                        </span>
                      </Tooltip>
                    </GridItem> */}
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
                {`who owns the most $${channelBySlug?.token?.symbol}?`}
              </Text>
              {holdersLoading && (
                <Flex justifyContent={"center"} p="20px">
                  <Spinner />
                </Flex>
              )}
              {!holdersLoading && holders.length > 0 && (
                <TableContainer overflowX={"auto"}>
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
          <Participants ablyPresenceChannel={presenceChannel} />
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
          <ChatForm
            sendChatMessage={sendChatMessage}
            inputBox={inputBox}
            additionalChatCommands={chatCommands}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default AblyChatComponent;
