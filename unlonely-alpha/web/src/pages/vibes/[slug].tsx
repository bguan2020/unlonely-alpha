import { Flex } from "@chakra-ui/react";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect } from "react";

import VibesTokenInterface from "../../components/channels/vibes/VibesTokenInterface";
import {
  ChannelProvider,
  useChannelContext,
} from "../../hooks/context/useChannel";
import { useChat } from "../../hooks/chat/useChat";
import AppLayout from "../../components/layout/AppLayout";
import { ChannelStaticQuery } from "../../generated/graphql";
import { CHANNEL_STATIC_QUERY } from "../../constants/queries";
import { VibesProvider } from "../../hooks/context/useVibes";

const FullVibesChartPage = () => {
  return (
    <AppLayout isCustomHeader={false} noHeader>
      <VibesProvider>
        <ChannelProvider>
          <FullVibesChart />
        </ChannelProvider>
      </VibesProvider>
    </AppLayout>
  );
};

const FullVibesChart = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { channel, chat: c } = useChannelContext();
  const { handleChannelStaticData } = channel;
  const chat = useChat({ chatBot: c.chatBot });
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
    <Flex h="100vh" justifyContent={"space-between"} bg="#131323" p="0.5rem">
      <VibesTokenInterface
        isFullChart
        ablyChannel={chat.channel}
        customLoading={channelStaticLoading}
        noChannelData={channelStaticError !== undefined}
      />
    </Flex>
  );
};

export default FullVibesChartPage;
