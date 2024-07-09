import { GetServerSidePropsContext } from "next";
import React, { useMemo } from "react";
import { ApolloError } from "@apollo/client";

import { initializeApollo } from "../../apiClient/client";
import { CHANNEL_STATIC_QUERY } from "../../constants/queries";
import { ChannelStaticQuery } from "../../generated/graphql";
import { ChannelProvider } from "../../hooks/context/useChannel";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { MobilePage } from "../../components/channels/layout/MobilePage";
import { TempTokenProvider } from "../../hooks/context/useTempToken";
import { DesktopChannelPageTempToken } from "../../components/channels/layout/temptoken/DesktopChannelPageTempToken";
import { VersusTempTokenProvider } from "../../hooks/context/useVersusTempToken";
import Head from "next/head";

const ChannelDetail = ({
  channelData,
  channelDataLoading,
  channelDataError,
  hostUrl,
  slug,
}: {
  channelData: ChannelStaticQuery;
  channelDataLoading: boolean;
  channelDataError?: ApolloError;
  hostUrl: string;
  slug: string;
}) => {
  const { isStandalone } = useUserAgent();

  const channelSSR = useMemo(
    () => channelData?.getChannelBySlug,
    [channelData]
  );

  const title = `${channelSSR?.name}`;

  const imageParams = new URLSearchParams({
    slug: String(slug),
    hostUrl: String(hostUrl),
    title: String(title),
  });

  const frameImgUrl = `${hostUrl}/api/images/startSubscribing?${imageParams.toString()}`;
  // const frameImgUrl = `${hostUrl}/images/start-subscribing.png`;

  const subscribeButtonText = `Subscribe to ${slug}'s live stream`;
  const subscribeTargetUrl = `${hostUrl}/api/channels/subscribe?channelId=${channelSSR?.id}&slug=${slug}`;

  return (
    <>
      <Head>
        <meta property="og:title" content={title} />
        <meta property="fc:frame" content="vNext" />
        <meta name="fc:frame:image" content={frameImgUrl} />
        <meta name="fc:frame:image:aspect_ratio" content="1:1" />
        {/* <meta
          name="fc:frame:text"
          content={`Subscribe to ${channelSSR?.slug}'s channel to get notified when they go live!`}
        /> */}
        <meta name="fc:frame:text" content={`${channelSSR?.name}`} />
        <meta name="fc:frame:image:aspect_ratio" content="1:1" />
        <meta property="fc:frame:button:1" content={subscribeButtonText} />
        <meta
          property="fc:frame:button:1:target"
          content={subscribeTargetUrl}
        />
        <meta property="fc:frame:button:2" content={`go watch ${slug}`} />
        <meta name="fc:frame:button:2:action" content="link" />
        <meta
          property="fc:frame:button:2:target"
          content={`${hostUrl}/channels/${slug}`}
        />
      </Head>
      <ChannelProvider>
        {!isStandalone ? (
          <TempTokenProvider>
            <VersusTempTokenProvider>
              <DesktopChannelPageTempToken
                channelSSR={channelSSR}
                channelSSRDataLoading={channelDataLoading}
                channelSSRDataError={channelDataError}
              />
            </VersusTempTokenProvider>
          </TempTokenProvider>
        ) : (
          <TempTokenProvider>
            <VersusTempTokenProvider>
              <MobilePage
                channelSSR={channelSSR}
                channelSSRDataLoading={channelDataLoading}
                channelSSRDataError={channelDataError}
              />
            </VersusTempTokenProvider>
          </TempTokenProvider>
        )}
      </ChannelProvider>
    </>
  );
};

export default ChannelDetail;

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ slug: string }>
) {
  const { slug } = context.params!;
  const hostUrl = `http://${context.req.headers.host}`;

  const apolloClient = initializeApollo(null, null);

  const { data, loading, error } = await apolloClient.query({
    query: CHANNEL_STATIC_QUERY,
    variables: { slug },
  });

  return {
    props: {
      channelData: data ?? null,
      channelDataLoading: loading,
      channelDataError: error ?? null,
      hostUrl,
      slug,
    },
  };
}
