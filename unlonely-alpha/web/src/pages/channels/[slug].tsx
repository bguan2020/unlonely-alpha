import { GetServerSidePropsContext } from "next";
import React, { useMemo } from "react";

import { initializeApollo } from "../../apiClient/client";
import { CHANNEL_STATIC_QUERY } from "../../constants/queries";
import { ChannelStaticQuery } from "../../generated/graphql";
import { ChannelProvider } from "../../hooks/context/useChannel";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { ApolloError } from "@apollo/client";
import { MobilePage } from "../../components/channels/layout/MobilePage";
import { DesktopPage } from "../../components/channels/layout/DesktopPage";
import { DesktopChannelPageSimplified } from "../../components/channels/layout/DesktopChannelPageSimplified";
import { channelIdsAllowedForNewPage } from "../../constants";

const ChannelDetail = ({
  channelData,
  channelDataLoading,
  channelDataError,
}: {
  channelData: ChannelStaticQuery;
  channelDataLoading: boolean;
  channelDataError?: ApolloError;
}) => {
  const { isStandalone } = useUserAgent();

  const channelSSR = useMemo(
    () => channelData?.getChannelBySlug,
    [channelData]
  );

  return (
    <ChannelProvider>
      {!isStandalone ? (
        <>
          {channelIdsAllowedForNewPage.includes(channelSSR?.id ?? "") ? (
            <DesktopChannelPageSimplified
              channelSSR={channelSSR}
              channelSSRDataLoading={channelDataLoading}
              channelSSRDataError={channelDataError}
            />
          ) : (
            <DesktopPage
              channelSSR={channelSSR}
              channelSSRDataLoading={channelDataLoading}
              channelSSRDataError={channelDataError}
            />
          )}
        </>
      ) : (
        <MobilePage
          channelSSR={channelSSR}
          channelSSRDataLoading={channelDataLoading}
          channelSSRDataError={channelDataError}
        />
      )}
    </ChannelProvider>
  );
};

export default ChannelDetail;

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ slug: string }>
) {
  const { slug } = context.params!;

  const apolloClient = initializeApollo(null, context.req.cookies, true);

  const { data, loading, error } = await apolloClient.query({
    query: CHANNEL_STATIC_QUERY,
    variables: { slug },
  });

  return {
    props: {
      channelData: data ?? null,
      channelDataLoading: loading,
      channelDataError: error ?? null,
    },
  };
}
