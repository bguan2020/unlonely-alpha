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
  );
};

export default ChannelDetail;


export async function getServerSideProps(
  context: GetServerSidePropsContext<{ slug: string }>
) {
  const { slug } = context.params!;

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
    },
  };
}
