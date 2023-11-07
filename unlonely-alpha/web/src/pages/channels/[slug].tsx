import { useQuery } from "@apollo/client";
import { GetServerSidePropsContext } from "next";
import React, { useCallback, useMemo, useState } from "react";
import {
  Flex,
  IconButton,
  Text,
  Image,
  Tooltip,
  Grid,
  Stack,
} from "@chakra-ui/react";

import { initializeApollo } from "../../apiClient/client";
import ChannelDesc from "../../components/channels/ChannelDesc";
import ChannelStreamerPerspective from "../../components/channels/ChannelStreamerPerspective";
import { ChannelTournament } from "../../components/channels/ChannelTournament";
import ChannelViewerPerspective from "../../components/channels/ChannelViewerPerspective";
import ChatComponent from "../../components/chat/ChatComponent";
import { BorderType, OuterBorder } from "../../components/general/OuterBorder";
import { WavyText } from "../../components/general/WavyText";
import AppLayout from "../../components/layout/AppLayout";
import ChannelNextHead from "../../components/layout/ChannelNextHead";
import StandaloneAblyChatComponent from "../../components/mobile/StandAloneChatComponentV2";
// import PvpTransactionModal from "../../components/transactions/PvpTransactionModal";
import {
  CHANNEL_DETAIL_QUERY,
  GET_BADGE_HOLDERS_BY_CHANNEL_QUERY,
  GET_CHANNELS_BY_NUMBER_OF_BADGE_HOLDERS_QUERY,
} from "../../constants/queries";
import {
  ChannelDetailQuery,
  GetBadgeHoldersByChannelQuery,
  GetChannelsByNumberOfBadgeHoldersQuery,
} from "../../generated/graphql";
import {
  ChannelProvider,
  useChannelContext,
} from "../../hooks/context/useChannel";
import { useUser } from "../../hooks/context/useUser";
import useUserAgent from "../../hooks/internal/useUserAgent";

const ChannelDetail = ({
  channelData,
}: {
  channelData: ChannelDetailQuery;
}) => {
  const { isStandalone } = useUserAgent();

  const channelSSR = useMemo(
    () => channelData?.getChannelBySlug,
    [channelData]
  );

  return (
    <ChannelProvider>
      {!isStandalone ? (
        <DesktopPage channelSSR={channelSSR} />
      ) : (
        <MobilePage channelSSR={channelSSR} />
      )}
    </ChannelProvider>
  );
};

const DesktopPage = ({
  channelSSR,
}: {
  channelSSR: ChannelDetailQuery["getChannelBySlug"];
}) => {
  const { channel, recentStreamInteractions } = useChannelContext();

  const {
    channelQueryData,
    loading: channelDataLoading,
    error: channelDataError,
  } = channel;
  const { loading: recentStreamInteractionsLoading } = recentStreamInteractions;
  const queryLoading = useMemo(
    () => channelDataLoading || recentStreamInteractionsLoading,
    [channelDataLoading, recentStreamInteractionsLoading]
  );

  const { data } = useQuery<GetBadgeHoldersByChannelQuery>(
    GET_BADGE_HOLDERS_BY_CHANNEL_QUERY,
    {
      variables: { data: { channelId: channelQueryData?.id } },
    }
  );

  const { data: _data } = useQuery<GetChannelsByNumberOfBadgeHoldersQuery>(
    GET_CHANNELS_BY_NUMBER_OF_BADGE_HOLDERS_QUERY
  );

  // console.log(_data?.getChannelsByNumberOfBadgeHolders);

  // console.log(data?.getBadgeHoldersByChannel);

  const { userAddress } = useUser();

  const isOwner = userAddress === channelQueryData?.owner.address;
  // const isOwner = true;

  const [previewStream, setPreviewStream] = useState<boolean>(false);

  return (
    <>
      {channelSSR && <ChannelNextHead channel={channelSSR} />}
      <AppLayout
        title={channelSSR?.name}
        image={channelSSR?.owner?.FCImageUrl}
        pageUrl={`/channels/${channelSSR?.slug}`}
        description={channelSSR?.description}
        isCustomHeader={true}
      >
        {!queryLoading && !channelDataError ? (
          <>
            <Stack
              mx={[0, 8, 4]}
              alignItems={["center", "initial"]}
              spacing={[4, 8]}
              direction={["column", "column", "row", "row"]}
            >
              <Stack direction="column" width={"100%"}>
                {isOwner && !previewStream ? (
                  <ChannelStreamerPerspective />
                ) : (
                  <ChannelViewerPerspective />
                )}
                {isOwner && (
                  <Flex justifyContent={"center"} gap="10px">
                    <Tooltip
                      label={`${previewStream ? "hide" : "preview"} stream`}
                    >
                      <IconButton
                        onClick={() => setPreviewStream((prev) => !prev)}
                        aria-label="preview"
                        _hover={{}}
                        _active={{}}
                        _focus={{}}
                        icon={
                          <Image
                            src="/svg/preview-video.svg"
                            height={12}
                            style={{
                              filter: previewStream
                                ? "grayscale(100%)"
                                : "none",
                            }}
                          />
                        }
                      />
                    </Tooltip>
                  </Flex>
                )}
                <Grid templateColumns="50% 50%" gap={4} mt="20px">
                  <ChannelDesc />
                  <Flex gap="1rem" margin="1rem" justifyContent={"flex-end"}>
                    <ChannelTournament />
                  </Flex>
                </Grid>
              </Stack>
              <Stack
                direction="column"
                minW={["100%", "100%", "380px", "380px"]}
                maxW={["100%", "100%", "380px", "380px"]}
                gap="1rem"
              >
                <ChatComponent />
                <OuterBorder type={BorderType.FIRE}>
                  <Flex width="100%" bg="rgba(19, 18, 37, 1)"></Flex>
                </OuterBorder>
              </Stack>
            </Stack>
          </>
        ) : (
          <Flex
            alignItems={"center"}
            justifyContent={"center"}
            width="100%"
            height="calc(100vh - 64px)"
            fontSize="50px"
          >
            {!channelDataError ? (
              <WavyText text="loading..." />
            ) : (
              <Text fontFamily="LoRes15">
                server error, please try again later
              </Text>
            )}
          </Flex>
        )}
      </AppLayout>
    </>
  );
};

const MobilePage = ({
  channelSSR,
}: {
  channelSSR: ChannelDetailQuery["getChannelBySlug"];
}) => {
  const { channel, recentStreamInteractions } = useChannelContext();
  const {
    channelQueryData,
    loading: channelDataLoading,
    error: channelDataError,
  } = channel;
  const { loading: recentStreamInteractionsLoading } = recentStreamInteractions;

  const queryLoading = useMemo(
    () => channelDataLoading || recentStreamInteractionsLoading,
    [channelDataLoading, recentStreamInteractionsLoading]
  );

  const { userAddress } = useUser();

  const isOwner = userAddress === channelQueryData?.owner.address;

  const [previewStream, setPreviewStream] = useState<boolean>(false);

  const handleShowPreviewStream = useCallback(() => {
    setPreviewStream((prev) => !prev);
  }, []);

  return (
    <AppLayout
      title={channelSSR?.name}
      image={channelSSR?.owner?.FCImageUrl}
      pageUrl={`/channels/${channelSSR?.slug}`}
      description={channelSSR?.description}
      isCustomHeader={true}
    >
      {!queryLoading && !channelDataError ? (
        <>
          {(previewStream || !isOwner) && <ChannelViewerPerspective mobile />}
          <StandaloneAblyChatComponent
            previewStream={previewStream}
            handleShowPreviewStream={handleShowPreviewStream}
          />
        </>
      ) : (
        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          direction="column"
          width="100%"
          height="100vh"
          fontSize="50px"
        >
          {!channelDataError ? (
            <>
              <Image
                src="/icons/icon-192x192.png"
                borderRadius="10px"
                height="96px"
              />
              <Flex>
                <WavyText text="..." />
              </Flex>
            </>
          ) : (
            <Text fontFamily="LoRes15">
              server error, please try again later
            </Text>
          )}
        </Flex>
      )}
    </AppLayout>
  );
};

export default ChannelDetail;

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ slug: string }>
) {
  const { slug } = context.params!;

  const apolloClient = initializeApollo(null, context.req.cookies, true);

  const { data, error } = await apolloClient.query({
    query: CHANNEL_DETAIL_QUERY,
    variables: { slug },
  });

  return { props: { channelData: data } };
}
