import React from "react";
import { Container, Flex } from "@chakra-ui/react";

import {
  ChannelProvider,
  useChannelContext,
} from "../../../hooks/context/useChannel";
import { WavyText } from "../../../components/general/WavyText";
import MobileAblyChatComponent from "../../../components/mobile/MobileAblyChatComponent";

export default function Chat() {
  return (
    <ChannelProvider>
      <ChatComponent />
    </ChannelProvider>
  );
}

const ChatComponent = () => {
  const { chat } = useChannelContext();
  const { chatChannel } = chat;

  return (
    <>
      {chatChannel ? (
        <MobileAblyChatComponent />
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
