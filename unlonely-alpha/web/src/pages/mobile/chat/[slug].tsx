import React, { useEffect } from "react";
import { Container, Flex } from "@chakra-ui/react";
import { useQuery } from "@apollo/client";

import {
  ChannelProvider,
  useChannelContext,
} from "../../../hooks/context/useChannel";
import { WavyText } from "../../../components/general/WavyText";
import PopOutChatComponent from "../../../components/mobile/PopOutChatComponent";
import { ChannelStaticQuery } from "../../../generated/graphql";
import { useRouter } from "next/router";
import { CHANNEL_STATIC_QUERY } from "../../../constants/queries";

export default function Chat() {
  return (
    <ChannelProvider>
      <ChatComponent />
    </ChannelProvider>
  );
}

const ChatComponent = () => {
  const router = useRouter();
  const { slug } = router.query;

  const { chat, channel } = useChannelContext();
  const { chatChannel } = chat;
  const { handleChannelStaticData } = channel;
  const {
    data: channelStatic,
    error: channelStaticError,
    loading: channelStaticLoading,
  } = useQuery<ChannelStaticQuery>(CHANNEL_STATIC_QUERY, {
    variables: { slug },
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (channelStatic)
      handleChannelStaticData(
        (channelStatic["getChannelBySlug"] as any) ?? null
      );
  }, [channelStatic]);

  return (
    <>
      {chatChannel ? (
        <PopOutChatComponent />
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
