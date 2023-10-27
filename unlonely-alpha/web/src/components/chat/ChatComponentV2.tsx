import {
  Flex,
  Box,
  Text,
  Container,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tr,
} from "@chakra-ui/react";
import { useEffect, useRef, useState, CSSProperties } from "react";

import { useChat } from "../../hooks/chat/useChat";
import { useChannelContext } from "../../hooks/context/useChannel";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { OuterBorder, BorderType } from "../general/OuterBorder";
import ChatForm from "./ChatForm";
import MessageList from "./MessageList";

const holders = [
  { name: "test1", quantity: 500 },
  { name: "test2", quantity: 400 },
  { name: "test3", quantity: 300 },
  { name: "test4", quantity: 200 },
  { name: "test5", quantity: 100 },
];

const ChatComponent = () => {
  const { isStandalone } = useUserAgent();
  const [selectedTab, setSelectedTab] = useState<"chat" | "trade" | "vip">(
    "chat"
  );

  return (
    <Flex
      height={!isStandalone ? { base: "65vh" } : "100%"}
      position={"relative"}
    >
      <OuterBorder type={BorderType.OCEAN} p={"0"}>
        <Container centerContent maxW="100%" h="100%" alignSelf="end" p="0">
          <Flex width="100%">
            <OuterBorder
              type={BorderType.OCEAN}
              zIndex={selectedTab === "chat" ? 4 : 2}
              onClick={() => setSelectedTab("chat")}
              noborder
              pb={selectedTab === "chat" ? "0px" : undefined}
            >
              <Flex
                bg={
                  selectedTab === "chat"
                    ? "rgba(24, 22, 47, 1)"
                    : "rgba(19, 18, 37, 1)"
                }
                py="0.3rem"
                width="100%"
                justifyContent={"center"}
              >
                <Text>CHAT</Text>
              </Flex>
            </OuterBorder>
            <OuterBorder
              type={BorderType.OCEAN}
              zIndex={selectedTab === "trade" ? 4 : 2}
              onClick={() => setSelectedTab("trade")}
              noborder
              pb={selectedTab === "trade" ? "0px" : undefined}
            >
              <Flex
                bg={
                  selectedTab === "trade"
                    ? "rgba(24, 22, 47, 1)"
                    : "rgba(19, 18, 37, 1)"
                }
                py="0.3rem"
                width="100%"
                justifyContent={"center"}
              >
                <Text>VOTE</Text>
              </Flex>
            </OuterBorder>
            <OuterBorder
              type={BorderType.OCEAN}
              zIndex={selectedTab === "vip" ? 4 : 2}
              onClick={() => setSelectedTab("vip")}
              noborder
              pb={selectedTab === "vip" ? "0px" : undefined}
            >
              <Flex
                bg={
                  selectedTab === "vip"
                    ? "rgba(24, 22, 47, 1)"
                    : "rgba(19, 18, 37, 1)"
                }
                py="0.3rem"
                width="100%"
                justifyContent={"center"}
              >
                <Text>VIP</Text>
              </Flex>
            </OuterBorder>
          </Flex>
          <OuterBorder
            type={BorderType.OCEAN}
            width={"100%"}
            zIndex={3}
            alignSelf="flex-end"
            noborder
            pt="0px"
          >
            <Flex
              bg="rgba(24, 22, 47, 1)"
              p={"1rem"}
              width={"100%"}
              direction="column"
            >
              <Flex
                borderRadius={"5px"}
                p="1px"
                zIndex={3}
                style={{
                  border: "1px solid",
                  borderWidth: "1px",
                  borderImageSource:
                    "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)",
                  borderImageSlice: 1,
                }}
              >
                <Flex
                  direction="column"
                  style={{ backdropFilter: "blur(6px)" }}
                  width={"100%"}
                >
                  <Text fontSize={"20px"} textAlign={"center"}>
                    LEADERBOARD
                  </Text>
                  {/* {channelQueryData?.token?.symbol && (
                    <Text
                      color={"#B6B6B6"}
                      fontSize={"14px"}
                      fontWeight="400"
                      textAlign={"center"}
                    >
                      {`who owns the most $${channelQueryData?.token?.symbol}?`}
                    </Text>
                  )} */}
                  {/* {holdersLoading && (
                    <Flex justifyContent={"center"} p="20px">
                      <Spinner />
                    </Flex>
                  )} */}
                  {/* {!holdersLoading && holders.length > 0 && ( */}
                  <TableContainer overflowX={"auto"}>
                    <Table variant="unstyled" size="xs">
                      {/* <Thead>
                        <Tr>
                          <Th
                            textTransform={"lowercase"}
                            fontSize={"20px"}
                            textAlign="center"
                          >
                            rank
                          </Th>
                          <Th
                            textTransform={"lowercase"}
                            fontSize={"20px"}
                            textAlign="center"
                          >
                            name
                          </Th>
                          <Th
                            textTransform={"lowercase"}
                            fontSize={"20px"}
                            textAlign="center"
                            isNumeric
                          >
                            amount
                          </Th>
                        </Tr>
                      </Thead> */}
                      <Tbody>
                        {holders.map((holder, index) => (
                          <Tr>
                            <Td fontSize={"20px"} p="4px" textAlign="center">
                              <Text fontSize="14px">{index + 1}</Text>
                            </Td>
                            <Td fontSize={"20px"} p="4px" textAlign="center">
                              <Text fontSize="14px">{holder.name}</Text>
                            </Td>
                            <Td
                              fontSize={"20px"}
                              p="4px"
                              textAlign="center"
                              isNumeric
                            >
                              <Text fontSize="14px">
                                {truncateValue(holder.quantity, 2)}
                              </Text>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                  {/* )} */}
                  {/* {!holdersLoading && holders.length === 0 && (
                    <Text textAlign={"center"} p="20px">
                      no holders found
                    </Text>
                  )} */}
                </Flex>
              </Flex>
              {selectedTab === "chat" && <Chat />}
              {selectedTab === "trade" && <Chat />}
              {selectedTab === "vip" && <Chat />}
            </Flex>
          </OuterBorder>
        </Container>
      </OuterBorder>
    </Flex>
  );
};

const Chat = () => {
  const { arcade } = useChannelContext();
  const { chatBot } = arcade;

  const {
    handleScrollToPresent,
    handleIsAtBottom,
    channel,
    hasMessagesLoaded,
    receivedMessages,
    allMessages,
    isAtBottom,
    scrollRef,
    channelChatCommands,
    sendChatMessage,
    inputBox,
  } = useChat(chatBot);

  const [emojisToAnimate, setEmojisToAnimate] = useState<
    { emoji: string; id: number }[]
  >([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.offsetHeight);
    }
  }, [containerRef]);

  const handleReactionEmoji = (str: string) => {
    const id = Date.now();
    setEmojisToAnimate((prev) => [...prev, { emoji: str, id }]);

    // Remove the emoji from the state after the animation duration (1s)
    setTimeout(() => {
      setEmojisToAnimate((prev) => prev.filter((emoji) => emoji.id !== id));
    }, 4000);
  };

  useEffect(() => {
    if (!allMessages || allMessages.length === 0) return;
    const latestMessage = allMessages[allMessages.length - 1];
    if (
      Date.now() - latestMessage.timestamp < 12000 &&
      latestMessage.data.body
    ) {
      handleReactionEmoji(latestMessage.data.body);
    }
  }, [allMessages]);

  return (
    <Flex
      mt="10px"
      direction="column"
      minW="100%"
      width="100%"
      h="100%"
      position={"relative"}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          pointerEvents: "none",
        }}
        ref={containerRef}
      >
        {emojisToAnimate.map(({ emoji, id }) => (
          <span
            key={id}
            className="floatingEmoji"
            style={
              {
                "--translateY": `${containerHeight - 120}px`,
              } as CSSProperties & { "--translateY": string }
            }
          >
            {emoji}
          </span>
        ))}
      </div>
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
      <Flex w="100%">
        <ChatForm
          sendChatMessage={sendChatMessage}
          inputBox={inputBox}
          additionalChatCommands={channelChatCommands}
          allowPopout
          channel={channel}
        />
      </Flex>
    </Flex>
  );
};

export default ChatComponent;
