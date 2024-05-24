import { Flex, Text, Box, Button } from "@chakra-ui/react";
import { ChatReturnType } from "../../hooks/chat/useChat";
import MessageList from "./MessageList";
import ChatForm from "./ChatForm";
import { useChannelContext } from "../../hooks/context/useChannel";
import { EXCLUDED_SLUGS } from "./ChatComponent";
import { useState } from "react";
import Participants from "../presence/Participants";
import { useChatBox } from "../../hooks/chat/useChatBox";
import { SingleTempTokenTimerView } from "../channels/temp/TempTokenTimerView";
import { VersusTempTokenTimerView } from "../channels/versus/VersusTokenTimerView";

export const ChatWithTempTokenTimer = ({
  chat,
  mode,
}: {
  chat: ChatReturnType;
  mode: "single-temp-token" | "versus-mode";
}) => {
  const { chat: chatContext, channel } = useChannelContext();
  const { presenceChannel } = chatContext;
  const { channelQueryData, isOwner } = channel;

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
        {mode === "single-temp-token" && (
          <SingleTempTokenTimerView disableChatbot={false} />
        )}
        {mode === "versus-mode" && (
          <VersusTempTokenTimerView disableChatbot={false} />
        )}
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
          hidePinnedMessages={true}
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
            messages={chat.receivedMessages}
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
