import React, { useEffect } from "react";
import { HomePageBooEventTokenCountdown } from "./HomepageBooEventCountdown";
import { HomePageBooEventStreamPage } from "./HomepageBooEventStreamPage";
import {
  ChannelProvider,
  useChannelContext,
} from "../../hooks/context/useChannel";
import { SolanaProvider } from "../../hooks/context/useSolana";
import { CHANNEL_STATIC_QUERY } from "../../constants/queries";
import { useQuery } from "@apollo/client";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { MobileHomePageBooEventStreamPage } from "./MobileHomepageBooEventStreamPage";

export const eventStartTime = 1933548029;
const slug = "danny";

const BooEventWrapper = () => {
  return (
    <SolanaProvider>
      <ChannelProvider providedSlug={slug}>
        <BooEventWrapperWithSolana />
      </ChannelProvider>
    </SolanaProvider>
  );
};

const BooEventWrapperWithSolana = () => {
  const { channel } = useChannelContext();
  const { handleChannelStaticData } = channel;
  const { isMobile } = useUserAgent();

  const { data: channelStatic } = useQuery(CHANNEL_STATIC_QUERY, {
    variables: { slug },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (channelStatic) handleChannelStaticData(channelStatic?.getChannelBySlug);
  }, [channelStatic]);

  return (
    <>
      {true ? (
        <>
          {isMobile ? (
            <MobileHomePageBooEventStreamPage />
          ) : (
            <HomePageBooEventStreamPage />
          )}
        </>
      ) : (
        <HomePageBooEventTokenCountdown />
      )}
    </>
  );
};

export default BooEventWrapper;
