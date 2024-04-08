import { Flex, Text, Box, Button } from "@chakra-ui/react";
import { ChatReturnType, useChatBox } from "../../hooks/chat/useChat";
import MessageList from "./MessageList";
import ChatForm from "./ChatForm";
import { TempTokenTimerView } from "../channels/temp/TempTokenTimer";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useUser } from "../../hooks/context/useUser";
import { EXCLUDED_SLUGS } from "./ChatComponent";
import { useState } from "react";
import Participants from "../presence/Participants";

export const ChatWithTokenTimer = ({ chat }: { chat: ChatReturnType }) => {
  const { userAddress } = useUser();
  const { chat: chatContext, channel } = useChannelContext();
  const { presenceChannel } = chatContext;
  const { channelQueryData } = channel;

  const isOwner = userAddress === channelQueryData?.owner.address;

  const [showParticipants, setShowParticipants] = useState(true);

  const {
    scrollRef,
    isAtBottom,
    channelChatCommands,
    handleScrollToPresent,
    handleIsAtBottom,
    sendChatMessage,
  } = useChatBox(
    "chat",
    chat.receivedMessages,
    chat.hasMessagesLoaded,
    chat.channel
  );

  return (
    <Flex
      direction="column"
      position="absolute"
      zIndex={1}
      bg="rgba(10, 6, 52, 0.9)"
      width="25%"
      height="50%"
      right="0"
      top="0"
    >
      <Flex justifyContent={"center"} bg="rgba(11, 5, 63, 0.534)">
        <TempTokenTimerView disableChatbot={false} />
      </Flex>
      {presenceChannel && (
        <Flex
          justifyContent={"center"}
          py="0.5rem"
          gap="5px"
          alignItems={"center"}
        >
          {EXCLUDED_SLUGS.includes(channelQueryData?.slug as string) &&
            isOwner && (
              <Button
                onClick={() => setShowParticipants((prev) => !prev)}
                bg={"#403c7d"}
                p={2}
                height={"20px"}
                _focus={{}}
                _active={{}}
                _hover={{
                  bg: "#8884d8",
                }}
              >
                <Text fontSize="14px" color="white">
                  {showParticipants ? "hide" : "show"}
                </Text>
              </Button>
            )}
          <Participants
            ablyPresenceChannel={presenceChannel}
            show={showParticipants}
          />
        </Flex>
      )}
      <Flex direction="column" id={"chat"} height="100%">
        <MessageList
          scrollRef={scrollRef}
          messages={chat.receivedMessages}
          channel={chat.channel}
          isAtBottomCallback={handleIsAtBottom}
          isVipChat={false}
          tokenForTransfer="tempToken"
        />
        <Flex justifyContent="center">
          {!isAtBottom && chat.hasMessagesLoaded && (
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
              <Text fontSize="12px">scrolling paused</Text>
            </Box>
          )}
        </Flex>
        <Flex w="100%" px="0.5rem" pb="0.5rem">
          <ChatForm
            sendChatMessage={sendChatMessage}
            additionalChatCommands={channelChatCommands}
            allowPopout
            channel={chat.channel}
            isVipChat={false}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};
