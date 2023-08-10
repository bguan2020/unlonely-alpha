import React, { useCallback, useState } from "react";
import { Container, Flex } from "@chakra-ui/react";

import {
  ChannelProvider,
  useChannelContext,
} from "../../../hooks/context/useChannel";
import AblyChatComponent from "../../../components/mobile/ChatComponent";
import { ChatBot } from "../../../constants/types";
import { WavyText } from "../../../components/general/WavyText";

export default function Chat() {
  return (
    <ChannelProvider mobile>
      <ChatComponent />
    </ChannelProvider>
  );
}

const ChatComponent = () => {
  const { chat } = useChannelContext();
  const { chatChannel } = chat;
  const [chatBot, setChatBot] = useState<ChatBot[]>([]);

  const addToChatbot = useCallback((chatBotMessageToAdd: ChatBot) => {
    setChatBot((prev) => [...prev, chatBotMessageToAdd]);
  }, []);

  return (
    <>
      {chatChannel ? (
        <AblyChatComponent chatBot={chatBot} addToChatbot={addToChatbot} />
      ) : (
        <Container>
          <Flex
            alignItems={"center"}
            justifyContent={"center"}
            width="100%"
            height="100vh"
            fontSize="50px"
          >
            <WavyText text="loading..." />
          </Flex>
        </Container>
      )}
    </>
  );
};
