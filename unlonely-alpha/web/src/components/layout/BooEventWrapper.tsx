import React, { useEffect } from "react";
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
import { useScreenAnimationsContext } from "../../hooks/context/useScreenAnimations";
import { Image } from "@chakra-ui/react";

export const eventStartTime = 0;
const slug = "brian";
export const CHANNEL_ID_TO_USE = 3;

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
  const { emojiBlast } = useScreenAnimationsContext();

  const { data: channelStatic } = useQuery(CHANNEL_STATIC_QUERY, {
    variables: { slug },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (channelStatic) handleChannelStaticData(channelStatic?.getChannelBySlug);
  }, [channelStatic]);

  useEffect(() => {
    setTimeout(() => {
      emojiBlast(
        <Image
          src={"https://i.imgur.com/he6L5cp.gif"}
          display="inline"
          verticalAlign={"middle"}
          h="80px"
          p="5px"
          transform="rotate(180deg)"
        />,
        {
          durationInMillis: 9000,
          horizSpeedRange: [3, 4],
          vertSpeedRange: [4, 9],
          downward: true,
          numParticles: 18,
        }
      );
    }, 3000);
  }, []);

  return (
    <>
      {isMobile ? (
        <MobileHomePageBooEventStreamPage />
      ) : (
        <HomePageBooEventStreamPage />
      )}
    </>
  );
};

export default BooEventWrapper;
