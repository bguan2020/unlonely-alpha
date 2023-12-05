import { useQuery } from "@apollo/client";
import { GetServerSidePropsContext } from "next";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Flex,
  IconButton,
  Text,
  Image,
  Tooltip,
  Stack,
} from "@chakra-ui/react";
import { useBlockNumber, usePublicClient } from "wagmi";

import { initializeApollo } from "../../apiClient/client";
import ChannelDesc from "../../components/channels/ChannelDesc";
import ChannelStreamerPerspective from "../../components/channels/ChannelStreamerPerspective";
import ChannelViewerPerspective from "../../components/channels/ChannelViewerPerspective";
import ChatComponent from "../../components/chat/ChatComponent";
import { WavyText } from "../../components/general/WavyText";
import AppLayout from "../../components/layout/AppLayout";
import ChannelNextHead from "../../components/layout/ChannelNextHead";
import StandaloneAblyChatComponent from "../../components/mobile/StandAloneChatComponent";
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
import { useChat } from "../../hooks/chat/useChat";
import Trade from "../../components/channels/bet/Trade";
import { useGenerateKey } from "../../hooks/contracts/useSharesContractV2";
import { getContractFromNetwork } from "../../utils/contract";
import { useNetworkContext } from "../../hooks/context/useNetwork";
import { useGetHolderBalance } from "../../hooks/contracts/useTournament";
import { truncateValue } from "../../utils/tokenDisplayFormatting";

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
  const { channel, leaderboard } = useChannelContext();
  const chat = useChat();
  const { network } = useNetworkContext();
  const { matchingChain, localNetwork, explorerUrl } = network;
  const {
    channelQueryData,
    loading: channelDataLoading,
    error: channelDataError,
    handleTotalBadges,
  } = channel;
  const { handleIsVip } = leaderboard;

  const queryLoading = useMemo(() => channelDataLoading, [channelDataLoading]);

  const { data } = useQuery<GetBadgeHoldersByChannelQuery>(
    GET_BADGE_HOLDERS_BY_CHANNEL_QUERY,
    {
      variables: { data: { channelId: channelQueryData?.id } },
    }
  );

  const { data: _data } = useQuery<GetChannelsByNumberOfBadgeHoldersQuery>(
    GET_CHANNELS_BY_NUMBER_OF_BADGE_HOLDERS_QUERY
  );

  const { userAddress, walletIsConnected } = useUser();
  const publicClient = usePublicClient();

  const isOwner = userAddress === channelQueryData?.owner.address;
  // const isOwner = true;

  const [previewStream, setPreviewStream] = useState<boolean>(false);

  const tournamentContract = getContractFromNetwork(
    "unlonelyTournament",
    localNetwork
  );

  const blockNumber = useBlockNumber({
    watch: true,
  });
  const isFetching = useRef(false);

  const { key: generatedKey } = useGenerateKey(
    channelQueryData?.owner?.address as `0x${string}`,
    0,
    tournamentContract
  );

  const [vipBadgeSupply, setVipBadgeSupply] = useState<bigint>(BigInt(0));

  const { vipBadgeBalance, refetch: refetchVipBadgeBalance } =
    useGetHolderBalance(
      channelQueryData?.owner?.address as `0x${string}`,
      0,
      userAddress as `0x${string}`,
      tournamentContract
    );

  useEffect(() => {
    if (!blockNumber.data || isFetching.current || !publicClient) return;
    const fetch = async () => {
      isFetching.current = true;
      try {
        const [supply] = await Promise.all([
          publicClient.readContract({
            address: tournamentContract.address as `0x${string}`,
            abi: tournamentContract.abi,
            functionName: "vipBadgeSupply",
            args: [generatedKey],
          }),
          refetchVipBadgeBalance(),
        ]);
        setVipBadgeSupply(BigInt(String(supply)));
      } catch (err) {
        console.log("channelTournament fetching error", err);
      }
      isFetching.current = false;
    };
    fetch();
  }, [blockNumber.data]);

  useEffect(() => {
    if (Number(vipBadgeBalance) > 0) {
      handleIsVip?.(true);
    } else {
      handleIsVip?.(false);
    }
  }, [vipBadgeBalance]);

  useEffect(() => {
    handleTotalBadges(truncateValue(Number(vipBadgeSupply), 0));
  }, [vipBadgeSupply]);

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
              spacing={[4, "1rem"]}
              direction={["column", "column", "row", "row"]}
            >
              <Stack direction="column" width={"100%"}>
                {isOwner && !previewStream && walletIsConnected ? (
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
                <Flex
                  gap={4}
                  mt="0 !important"
                  justifyContent={"space-between"}
                >
                  <ChannelDesc />
                  <Flex gap="1rem" mt="1rem" justifyContent={"flex-end"}>
                    {/* <ChannelTournament /> */}
                    <Flex
                      direction="column"
                      bg={"#131323"}
                      width="400px"
                      borderRadius="0px"
                      p="1rem"
                    >
                      <Trade chat={chat} />
                    </Flex>
                  </Flex>
                </Flex>
              </Stack>
              <Stack
                direction="column"
                minW={["100%", "100%", "380px", "380px"]}
                maxW={["100%", "100%", "380px", "380px"]}
                gap="1rem"
              >
                <ChatComponent chat={chat} />
                {/* <TournamentPot chat={chat} /> */}
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
  const { channel } = useChannelContext();
  const {
    channelQueryData,
    loading: channelDataLoading,
    error: channelDataError,
  } = channel;

  const queryLoading = useMemo(() => channelDataLoading, [channelDataLoading]);

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
