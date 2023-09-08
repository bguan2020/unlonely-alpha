import {
  Text,
  Flex,
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
  Box,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { isAddress } from "viem";

import ChatForm from "./ChatForm";
import Participants from "../presence/Participants";
import { useUser } from "../../hooks/context/useUser";
import { useOnClickOutside } from "../../hooks/internal/useOnClickOutside";
// import SwordButton from "../arcade/SwordButton";
import CoinButton from "../arcade/CoinButton";
// import DiceButton from "../arcade/DiceButton";
import BuyButton from "../arcade/BuyButton";
import { ChatBot } from "../../constants/types";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { useChannelContext } from "../../hooks/context/useChannel";
import CustomButton from "../arcade/CustomButton";
import MessageList from "./MessageList";
import { useChat } from "../../hooks/chat/useChat";
import { getHolders } from "../../utils/getHolders";

type Props = {
  chatBot: ChatBot[];
  addToChatbot: (chatBotMessageToAdd: ChatBot) => void;
  handleControlModal?: () => void;
  handleChanceModal?: () => void;
  handlePvpModal?: () => void;
  handleTipModal?: () => void;
  handleBuyModal?: () => void;
  handleCustomModal?: () => void;
};

const AblyChatComponent = ({
  chatBot,
  addToChatbot,
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
  } = useChannelContext();
  const { channelQueryData } = channelContext;
  const { chatChannel, presenceChannel } = chat;
  const {
    data: holdersData,
    loading: holdersLoading,
    error: holdersError,
    refetchTokenHolders,
  } = holdersContext;

  const {
    handleScrollToPresent,
    handleIsAtBottom,
    channel,
    hasMessagesLoaded,
    receivedMessages,
    isAtBottom,
    scrollRef,
    channelChatCommands,
    sendChatMessage,
    inputBox,
  } = useChat(chatBot);

  const { user, userAddress: address } = useUser();

  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showArcade, setShowArcade] = useState<boolean>(false);
  const [holders, setHolders] = useState<{ name: string; quantity: number }[]>(
    []
  );

  const clickedOutsideLeaderBoard = useRef(false);
  const clickedOutsideArcade = useRef(false);
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const arcadeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showLeaderboard && !holdersLoading && !holdersData) {
      refetchTokenHolders?.();
    }
  }, [showLeaderboard]);

  useEffect(() => {
    if (!holdersLoading && !holdersError && holdersData) {
      const _holders: { name: string; quantity: number }[] = getHolders(
        holdersData.getTokenHoldersByChannel
      );
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
              {isAddress(String(channelQueryData?.token?.address)) &&
                user &&
                address && (
                  <>
                    <BuyButton
                      tokenName={
                        channelQueryData?.token?.symbol
                          ? `$${channelQueryData?.token?.symbol}`
                          : "token"
                      }
                      callback={handleBuyModal}
                    />
                    <Grid
                      mt="50px"
                      templateColumns="repeat(2, 1fr)"
                      gap={12}
                      alignItems="center"
                      justifyItems="center"
                    >
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
                        <Tooltip label={"make streamer do X"}>
                          <span>
                            <CustomButton callback={handleCustomModal} />
                          </span>
                        </Tooltip>
                      </GridItem>
                      {/* <GridItem>
                        <Tooltip label={"control text on the stream"}>
                          <span>
                            <ControlButton callback={handleControlModal} />
                          </span>
                        </Tooltip>
                      </GridItem> */}
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
              {(!isAddress(String(channelQueryData?.token?.address)) ||
                !user) && (
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
                          <CustomButton />
                        </span>
                      </Tooltip>
                    </GridItem>
                    {/* <GridItem>
                      <Tooltip
                        label={!user ? "connect wallet first" : "not available"}
                      >
                        <span>
                          <ControlButton />
                        </span>
                      </Tooltip>
                    </GridItem> */}
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
              {channelQueryData?.token?.symbol && (
                <Text
                  color={"#B6B6B6"}
                  fontSize={"14px"}
                  fontWeight="400"
                  textAlign={"center"}
                >
                  {`who owns the most $${channelQueryData?.token?.symbol}?`}
                </Text>
              )}
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
        >
          <MessageList
            scrollRef={scrollRef}
            messages={receivedMessages}
            channel={channel}
            isAtBottomCallback={handleIsAtBottom}
          />
        </Flex>
        <Flex justifyContent="center">
          {!isAtBottom && hasMessagesLoaded && (
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
          )}
        </Flex>
        <Flex mt="40px" w="100%" mb="15px">
          <ChatForm
            sendChatMessage={sendChatMessage}
            inputBox={inputBox}
            additionalChatCommands={channelChatCommands}
            addToChatbot={addToChatbot}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default AblyChatComponent;
