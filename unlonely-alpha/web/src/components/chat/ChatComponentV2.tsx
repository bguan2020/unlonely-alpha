import { Flex, Box, Text, Container } from "@chakra-ui/react";
import { useState } from "react";

import { useChat } from "../../hooks/chat/useChat";
import { useChannelContext } from "../../hooks/context/useChannel";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { OuterBorder, BorderType } from "../general/OuterBorder";
import ChatForm from "./ChatForm";
import MessageList from "./MessageList";

const ChatComponent = () => {
  const { isStandalone } = useUserAgent();
  const [selectedTab, setSelectedTab] = useState<"chat" | "trade" | "vip">(
    "chat"
  );

  return (
    <Flex
      height={!isStandalone ? { base: "65vh" } : "100%"}
      position={"relative"}
      width="100%"
      maxW={["768px", "100%", "480px"]}
    >
      <Container centerContent maxW="100%" height="90%" alignSelf="end">
        {/* <OuterBorder
        position="absolute"
        type={BorderType.OCEAN}
        zIndex={selectedTab === "chat" ? 4 : 2}
        onClick={() => setSelectedTab("chat")}
      >
        <Flex
          bg="rgba(24, 22, 47, 1)"
          px="1rem"
          pt="0.3rem"
          pb="2rem"
          borderRadius="15px"
        >
          <Text>CHAT</Text>
        </Flex>
      </OuterBorder>
      <OuterBorder
        left="33.33%"
        position="absolute"
        type={BorderType.OCEAN}
        zIndex={selectedTab === "trade" ? 4 : 2}
        onClick={() => setSelectedTab("trade")}
      >
        <Flex
          bg="rgba(24, 22, 47, 1)"
          px="1rem"
          pt="0.3rem"
          pb="2rem"
          borderRadius="15px"
        >
          <Text>VOTE</Text>
        </Flex>
      </OuterBorder>
      <OuterBorder
        left="66.66%"
        position="absolute"
        type={BorderType.OCEAN}
        zIndex={selectedTab === "vip" ? 4 : 2}
        onClick={() => setSelectedTab("vip")}
      >
        <Flex
          bg="rgba(24, 22, 47, 1)"
          px="1rem"
          pt="0.3rem"
          pb="2rem"
          borderRadius="15px"
        >
          <Text>VIP</Text>
        </Flex>
      </OuterBorder> */}
        <OuterBorder
          type={BorderType.OCEAN}
          width={"100%"}
          zIndex={3}
          alignSelf="flex-end"
        >
          <Flex
            bg="rgba(24, 22, 47, 1)"
            p={"1rem"}
            borderRadius="15px"
            width={"100%"}
          >
            {selectedTab === "chat" && <Chat />}
            {selectedTab === "trade" && <Chat />}
            {selectedTab === "vip" && <Chat />}
          </Flex>
        </OuterBorder>
      </Container>
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
    isAtBottom,
    scrollRef,
    channelChatCommands,
    sendChatMessage,
    inputBox,
  } = useChat(chatBot);

  return (
    <Flex
      mt="10px"
      direction="column"
      minW="100%"
      width="100%"
      h="100%"
      position={"relative"}
    >
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
          allowPopout
        />
      </Flex>
    </Flex>
  );
};

export default ChatComponent;
