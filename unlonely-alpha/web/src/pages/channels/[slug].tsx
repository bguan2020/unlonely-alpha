import { GetServerSidePropsContext } from "next";
import React, { useMemo } from "react";
import { getFrameMetadata, isFrameRequest } from "frog/next"
import type { Metadata } from "next"
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

import { headers } from "next/headers";

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
  if (isFrameRequest(headers())) return null
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
export async function generateMetadata(context: GetServerSidePropsContext<{ slug: string }>): Promise<Metadata> {
  const { slug } = context.params!;
  
  const url = `${process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000"}/frame/channel/${slug}`;
  console.log("XXXXXXXXXXXXFetching frame metadata from URL:XXXXXXXXxxxXXXX: ", url);

  try {
    const frameTags = await getFrameMetadata(url);
    return {
      other: frameTags,
    };
  } catch (error) {
    console.error("Error fetching frame metadata:", error);
    return {
      other: {},
    };
  }
}

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
