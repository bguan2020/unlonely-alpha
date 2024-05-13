import { Flex } from "@chakra-ui/react";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect } from "react";

import {
  ChannelProvider,
  useChannelContext,
} from "../../hooks/context/useChannel";
import { useChat } from "../../hooks/chat/useChat";
import AppLayout from "../../components/layout/AppLayout";
import { ChannelStaticQuery } from "../../generated/graphql";
import { CHANNEL_STATIC_QUERY } from "../../constants/queries";
import { TempTokenInterface } from "../../components/channels/temp/TempTokenInterface";
import { TempTokenProvider } from "../../hooks/context/useTempToken";
import { VersusTempTokenProvider } from "../../hooks/context/useVersusTempToken";
import { VersusTempTokensInterface } from "../../components/channels/layout/versus/VersusTempTokensInterface";
import { CAN_USE_VERSUS_MODE_SLUGS } from "../../constants";
import { useTempTokenAblyInterpreter } from "../../hooks/internal/temp-token/ui/useTempTokenAblyInterpreter";
import { useVersusTempTokenAblyInterpreter } from "../../hooks/internal/versus-token/ui/useVersusTempTokenAblyInterpreter";

const FullTempTokenChartPage = () => {
  return (
    <AppLayout isCustomHeader={false} noHeader>
      <ChannelProvider>
        <ChannelLayer />
      </ChannelProvider>
    </AppLayout>
  );
};

const ChannelLayer = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { channel } = useChannelContext();
  const { channelQueryData, handleChannelStaticData } = channel;
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
      {CAN_USE_VERSUS_MODE_SLUGS.includes(channelQueryData?.slug ?? "") ? (
        <VersusTempTokenProvider>
          <FullVersusTokenChart
            channelStaticError={channelStaticError}
            channelStaticLoading={channelStaticLoading}
          />
        </VersusTempTokenProvider>
      ) : (
        <TempTokenProvider>
          <FullTempTokenChart
            channelStaticError={channelStaticError}
            channelStaticLoading={channelStaticLoading}
          />
        </TempTokenProvider>
      )}
    </>
  );
};

const FullTempTokenChart = ({
  channelStaticError,
  channelStaticLoading,
}: {
  channelStaticError?: any;
  channelStaticLoading?: boolean;
}) => {
  const chat = useChat();
  useTempTokenAblyInterpreter(chat);

  return (
    <Flex h="100vh" justifyContent={"space-between"} bg="#131323" p="0.5rem">
      <TempTokenInterface
        isFullChart
        ablyChannel={chat.channel}
        customLoading={channelStaticLoading}
        noChannelData={channelStaticError !== undefined}
      />
    </Flex>
  );
};

const FullVersusTokenChart = ({
  channelStaticError,
  channelStaticLoading,
}: {
  channelStaticError?: any;
  channelStaticLoading?: boolean;
}) => {
  const chat = useChat();
  useVersusTempTokenAblyInterpreter(chat);

  return (
    <Flex h="100vh" justifyContent={"space-between"} bg="#131323" p="0.5rem">
      <VersusTempTokensInterface
        isFullChart
        ablyChannel={chat.channel}
        customLoading={channelStaticLoading}
        noChannelData={channelStaticError !== undefined}
      />
    </Flex>
  );
};

export default FullTempTokenChartPage;
