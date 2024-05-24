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
import { CHANNEL_IDS_ALLOWED_TO_DESKTOP_CHANNEL_TEMP_TOKEN } from "../../constants";
import { TempTokenProvider } from "../../hooks/context/useTempToken";
import { DesktopChannelPageTempToken } from "../../components/channels/layout/temptoken/DesktopChannelPageTempToken";
import { VersusTempTokenProvider } from "../../hooks/context/useVersusTempToken";
import { VibesProvider } from "../../hooks/context/useVibes";

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
          {CHANNEL_IDS_ALLOWED_TO_DESKTOP_CHANNEL_TEMP_TOKEN.includes(
            channelSSR?.id ?? ""
          ) ? (
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
            <VibesProvider>
              <DesktopPage
                channelSSR={channelSSR}
                channelSSRDataLoading={channelDataLoading}
                channelSSRDataError={channelDataError}
              />
            </VibesProvider>
          )}
        </>
      ) : (
        <>
          {CHANNEL_IDS_ALLOWED_TO_DESKTOP_CHANNEL_TEMP_TOKEN.includes(
            channelSSR?.id ?? ""
          ) ? (
            <TempTokenProvider>
              <VersusTempTokenProvider>
                <MobilePage
                  channelSSR={channelSSR}
                  channelSSRDataLoading={channelDataLoading}
                  channelSSRDataError={channelDataError}
                />
              </VersusTempTokenProvider>
            </TempTokenProvider>
          ) : (
            <VibesProvider>
              <MobilePage
                channelSSR={channelSSR}
                channelSSRDataLoading={channelDataLoading}
                channelSSRDataError={channelDataError}
              />
            </VibesProvider>
          )}
        </>
      )}
    </ChannelProvider>
  );
};

export default ChannelDetail;

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ slug: string }>
) {
  const { slug } = context.params!;

  const apolloClient = initializeApollo(null);

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
