import { GetServerSidePropsContext } from "next";
import React, { useEffect, useMemo, useState } from "react";
import { Flex, Text, Image, Stack, Button } from "@chakra-ui/react";
import { useContractEvent } from "wagmi";
import { Log } from "viem";

import { initializeApollo } from "../../apiClient/client";
import ChannelViewerPerspective from "../../components/channels/ChannelViewerPerspective";
import { WavyText } from "../../components/general/WavyText";
import AppLayout from "../../components/layout/AppLayout";
import ChannelNextHead from "../../components/layout/ChannelNextHead";
import StandaloneAblyChatComponent from "../../components/mobile/StandAloneChatComponent";
import {
  CHANNEL_STATIC_QUERY,
  GET_LIVEPEER_STREAM_DATA_QUERY,
} from "../../constants/queries";
import {
  ChannelStaticQuery,
  GetLivepeerStreamDataQuery,
} from "../../generated/graphql";
import {
  ChannelProvider,
  ChannelWideModals,
  useChannelContext,
} from "../../hooks/context/useChannel";
import { useUser } from "../../hooks/context/useUser";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { useChat } from "../../hooks/chat/useChat";
import { getContractFromNetwork } from "../../utils/contract";
import { useNetworkContext } from "../../hooks/context/useNetwork";
import {
  useGetHolderBalance,
  useGenerateKey,
  useSupply,
} from "../../hooks/contracts/useTournament";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import ChatComponent from "../../components/chat/ChatComponent";
import VibesTokenInterface from "../../components/chat/VibesTokenInterface";
import ChannelDesc from "../../components/channels/ChannelDesc";
import ChannelStreamerPerspective from "../../components/channels/ChannelStreamerPerspective";
import Trade from "../../components/channels/bet/Trade";
import { ApolloError, useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { TransactionModalTemplate } from "../../components/transactions/TransactionModalTemplate";
import { useTour } from "@reactour/tour";
import { streamerTourSteps } from "../_app";
import { NEW_STREAMER_URL_QUERY_PARAM } from "../../constants";
import Link from "next/link";

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
        <DesktopPage
          channelSSR={channelSSR}
          channelSSRDataLoading={channelDataLoading}
          channelSSRDataError={channelDataError}
        />
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

const DesktopPage = ({
  channelSSR,
  channelSSRDataLoading,
  channelSSRDataError,
}: {
  channelSSR: ChannelStaticQuery["getChannelBySlug"];
  channelSSRDataLoading: boolean;
  channelSSRDataError?: ApolloError;
}) => {
  const { channel, leaderboard } = useChannelContext();
  const chat = useChat();
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const {
    channelQueryData,
    loading: channelDataLoading,
    error: channelDataError,
    handleTotalBadges,
    handleChannelStaticData,
  } = channel;
  const { handleIsVip } = leaderboard;

  const router = useRouter();

  const [welcomeStreamer, setWelcomeStreamer] = useState(false);
  const [welcomeStreamerModal, setWelcomeStreamerModal] = useState<
    "welcome" | "off" | "bye"
  >("off");
  const [startedWelcomeTour, setStartedWelcomeTour] = useState(false);
  const [livepeerData, setLivepeerData] =
    useState<GetLivepeerStreamDataQuery["getLivepeerStreamData"]>();

  const {
    setIsOpen: setIsTourOpen,
    setSteps: setTourSteps,
    isOpen: isTourOpen,
  } = useTour();

  const { userAddress, walletIsConnected } = useUser();

  const isOwner = userAddress === channelQueryData?.owner?.address;

  const tournamentContract = getContractFromNetwork(
    "unlonelyTournament",
    localNetwork
  );

  const [getLivepeerStreamData] = useLazyQuery<GetLivepeerStreamDataQuery>(
    GET_LIVEPEER_STREAM_DATA_QUERY,
    {
      fetchPolicy: "network-only",
    }
  );

  useEffect(() => {
    const init = async () => {
      if (channelQueryData?.livepeerStreamId) {
        const res = await getLivepeerStreamData({
          variables: {
            data: { streamId: channelQueryData?.livepeerStreamId },
          },
        });
        setLivepeerData(res.data?.getLivepeerStreamData);
      }
    };
    init();
  }, [channelQueryData?.livepeerStreamId]);

  useEffect(() => {
    if (router.query[NEW_STREAMER_URL_QUERY_PARAM] && isOwner) {
      setWelcomeStreamerModal("welcome");
      setWelcomeStreamer(true);
      const newPath = router.pathname;
      const newQuery = { ...router.query };
      delete newQuery[NEW_STREAMER_URL_QUERY_PARAM];

      router.replace(
        {
          pathname: newPath,
          query: newQuery,
        },
        undefined,
        { shallow: true }
      );
    }
  }, [router, isOwner]);

  useEffect(() => {
    if (channelSSR) handleChannelStaticData(channelSSR);
  }, [channelSSR]);

  const { key: generatedKey } = useGenerateKey(
    channelQueryData?.owner?.address as `0x${string}`,
    0,
    tournamentContract
  );

  const { vipBadgeSupply, setVipBadgeSupply } = useSupply(
    generatedKey,
    tournamentContract
  );

  const { vipBadgeBalance, setVipBadgeBalance } = useGetHolderBalance(
    channelQueryData?.owner?.address as `0x${string}`,
    0,
    userAddress as `0x${string}`,
    tournamentContract
  );

  const handleUpdate = (tradeEvents: Log[]) => {
    const sortedEvents = tradeEvents.filter(
      (event: any) => (event?.args.trade.eventByte as string) === generatedKey
    );
    if (sortedEvents.length === 0) return;
    let newBalanceAddition = 0;
    for (let i = 0; i < sortedEvents.length; i++) {
      const tradeEvent: any = sortedEvents[i];
      const trader = tradeEvent?.args.trade.trader as `0x${string}`;
      if (trader === userAddress) {
        newBalanceAddition +=
          ((tradeEvent?.args.trade.isBuy as boolean) ? 1 : -1) *
          Number(tradeEvent?.args.trade.badgeAmount as bigint);
      }
    }
    setVipBadgeSupply(
      (sortedEvents[sortedEvents.length - 1] as any).args.trade.supply as bigint
    );
    setVipBadgeBalance((prev) => String(Number(prev) + newBalanceAddition));
  };

  const [incomingTrades, setIncomingTrades] = useState<Log[]>([]);

  useContractEvent({
    address: tournamentContract.address,
    abi: tournamentContract.abi,
    eventName: "Trade",
    listener(logs) {
      const init = async () => {
        setIncomingTrades(logs);
      };
      init();
    },
  });

  useEffect(() => {
    if (incomingTrades) handleUpdate(incomingTrades);
  }, [incomingTrades]);

  useEffect(() => {
    if (Number(vipBadgeBalance) > 0) {
      handleIsVip(true);
    } else {
      handleIsVip(false);
    }
  }, [vipBadgeBalance]);

  useEffect(() => {
    handleTotalBadges(truncateValue(Number(vipBadgeSupply), 0));
  }, [vipBadgeSupply]);

  useEffect(() => {
    if (!isTourOpen && welcomeStreamer && startedWelcomeTour)
      setWelcomeStreamerModal("bye");
  }, [isTourOpen, welcomeStreamer, startedWelcomeTour]);

  return (
    <>
      {channelSSR && <ChannelNextHead channel={channelSSR} />}
      <TransactionModalTemplate
        isOpen={welcomeStreamerModal !== "off"}
        handleClose={() => setWelcomeStreamerModal("off")}
        cannotClose
        hideFooter
      >
        {welcomeStreamerModal === "welcome" && (
          <Flex direction="column" gap="10px">
            <Text fontSize={"2rem"} textAlign="center" fontFamily="LoRes15">
              Welcome streamer!
            </Text>
            <Text fontSize={"1rem"} textAlign="center">
              You can now start your stream and interact with your viewers
            </Text>
            <Text textAlign="center">
              We've also prepared a small guide for how to use this page!
            </Text>
            <Button
              bg="#cd34e8"
              color={"white"}
              _focus={{}}
              _hover={{
                transform: "scale(1.05)",
              }}
              _active={{}}
              onClick={() => {
                setWelcomeStreamerModal("off");
                setTourSteps?.(streamerTourSteps);
                setIsTourOpen(true);
                setStartedWelcomeTour(true);
              }}
            >
              Start tour
            </Button>
            <Button
              bg="transparent"
              color={"#a3a3a3"}
              _focus={{}}
              _hover={{
                transform: "scale(1.05)",
              }}
              _active={{}}
              onClick={() => {
                setWelcomeStreamerModal("off");
                setWelcomeStreamer(false);
              }}
            >
              No thanks
            </Button>
          </Flex>
        )}
        {welcomeStreamerModal === "bye" && (
          <Flex direction="column" gap="10px">
            <Text fontSize={"1rem"} textAlign="center">
              you're ready to start streaming!
            </Text>
            <Text fontSize={"1rem"} textAlign="center">
              check out the rest of our features{" "}
              <Link href="https://bit.ly/unlonelyFAQs" target="_blank">
                <Text as="span" textDecoration={"underline"} color="#3cd8ff">
                  here
                </Text>
              </Link>
            </Text>
            <Button
              onClick={() => {
                setWelcomeStreamerModal("off");
                setWelcomeStreamer(false);
              }}
              color="white"
              bg={"#0767ac"}
              _focus={{}}
              _hover={{
                transform: "scale(1.05)",
              }}
              _active={{}}
            >
              close
            </Button>
          </Flex>
        )}
      </TransactionModalTemplate>
      <AppLayout
        title={channelSSR?.name}
        image={channelSSR?.owner?.FCImageUrl}
        pageUrl={`/channels/${channelSSR?.slug}`}
        description={channelSSR?.description}
        isCustomHeader={true}
      >
        {!channelDataLoading &&
        !channelDataError &&
        !channelSSRDataError &&
        !channelSSRDataLoading ? (
          <>
            <Stack
              mx={[0, 8, 4]}
              alignItems={["center", "initial"]}
              spacing={[4, "1rem"]}
              direction={["column", "column", "row", "row"]}
            >
              <Stack direction="column" width={"100%"}>
                {isOwner && walletIsConnected ? (
                  <>
                    <ChannelWideModals ablyChannel={chat.channel} />
                    <ChannelStreamerPerspective
                      ablyChannel={chat.channel}
                      livepeerData={livepeerData}
                    />
                  </>
                ) : (
                  <ChannelViewerPerspective />
                )}
                <Flex
                  gap={4}
                  mt="0 !important"
                  justifyContent={"space-between"}
                >
                  <ChannelDesc />
                  <Flex gap="1rem" mt="1rem" justifyContent={"flex-end"}>
                    <Flex
                      direction="column"
                      bg={"#131323"}
                      width="400px"
                      borderRadius="0px"
                      p="1rem"
                    >
                      <Trade />
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
                <Flex
                  minH="20vh"
                  gap="5px"
                  justifyContent={"space-between"}
                  bg="#131323"
                  p="5px"
                >
                  <VibesTokenInterface ablyChannel={chat.channel} />
                </Flex>
                <ChatComponent chat={chat} />
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
            {!channelDataError && !channelSSRDataError ? (
              <WavyText text="loading..." />
            ) : channelSSR === null ? (
              <Text fontFamily="LoRes15">channel does not exist</Text>
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
  channelSSRDataLoading,
  channelSSRDataError,
}: {
  channelSSR: ChannelStaticQuery["getChannelBySlug"];
  channelSSRDataLoading: boolean;
  channelSSRDataError?: ApolloError;
}) => {
  const { channel, leaderboard } = useChannelContext();
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const {
    channelQueryData,
    loading: channelDataLoading,
    error: channelDataError,
    handleTotalBadges,
    handleChannelStaticData,
  } = channel;
  const { handleIsVip } = leaderboard;

  const chat = useChat();

  const { userAddress } = useUser();

  const isOwner = userAddress === channelQueryData?.owner?.address;

  useEffect(() => {
    if (channelSSR) handleChannelStaticData(channelSSR);
  }, [channelSSR]);

  const tournamentContract = getContractFromNetwork(
    "unlonelyTournament",
    localNetwork
  );

  const { key: generatedKey } = useGenerateKey(
    channelQueryData?.owner?.address as `0x${string}`,
    0,
    tournamentContract
  );

  const { vipBadgeSupply, setVipBadgeSupply } = useSupply(
    generatedKey,
    tournamentContract
  );

  const { vipBadgeBalance, setVipBadgeBalance } = useGetHolderBalance(
    channelQueryData?.owner?.address as `0x${string}`,
    0,
    userAddress as `0x${string}`,
    tournamentContract
  );

  const [livepeerData, setLivepeerData] =
    useState<GetLivepeerStreamDataQuery["getLivepeerStreamData"]>();

  const [getLivepeerStreamData] = useLazyQuery<GetLivepeerStreamDataQuery>(
    GET_LIVEPEER_STREAM_DATA_QUERY,
    {
      fetchPolicy: "network-only",
    }
  );

  useEffect(() => {
    const init = async () => {
      if (channelQueryData?.livepeerStreamId) {
        const res = await getLivepeerStreamData({
          variables: {
            data: { streamId: channelQueryData?.livepeerStreamId },
          },
        });
        setLivepeerData(res.data?.getLivepeerStreamData);
      }
    };
    init();
  }, [channelQueryData?.livepeerStreamId]);

  const handleUpdate = (tradeEvents: Log[]) => {
    const sortedEvents = tradeEvents.filter(
      (event: any) => (event?.args.trade.eventByte as string) === generatedKey
    );
    if (sortedEvents.length === 0) return;
    let newBalanceAddition = 0;
    for (let i = 0; i < sortedEvents.length; i++) {
      const tradeEvent: any = sortedEvents[i];
      const trader = tradeEvent?.args.trade.trader as `0x${string}`;
      if (trader === userAddress) {
        newBalanceAddition +=
          ((tradeEvent?.args.trade.isBuy as boolean) ? 1 : -1) *
          Number(tradeEvent?.args.trade.badgeAmount as bigint);
      }
    }
    setVipBadgeSupply(
      (sortedEvents[sortedEvents.length - 1] as any).args.trade.supply as bigint
    );
    setVipBadgeBalance((prev) => String(Number(prev) + newBalanceAddition));
  };

  const [incomingTrades, setIncomingTrades] = useState<Log[]>([]);

  useContractEvent({
    address: tournamentContract.address,
    abi: tournamentContract.abi,
    eventName: "Trade",
    listener(logs) {
      const init = async () => {
        setIncomingTrades(logs);
      };
      init();
    },
  });

  useEffect(() => {
    if (incomingTrades) handleUpdate(incomingTrades);
  }, [incomingTrades]);

  useEffect(() => {
    if (Number(vipBadgeBalance) > 0) {
      handleIsVip(true);
    } else {
      handleIsVip(false);
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
        {!channelDataLoading &&
        !channelDataError &&
        !channelSSRDataError &&
        !channelSSRDataLoading ? (
          <>
            {isOwner ? (
              <>
                <ChannelWideModals ablyChannel={chat.channel} />
                <ChannelStreamerPerspective
                  livepeerData={livepeerData}
                  ablyChannel={chat.channel}
                />
              </>
            ) : (
              <ChannelViewerPerspective mobile />
            )}
            <StandaloneAblyChatComponent chat={chat} />
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
            {!channelDataError && !channelSSRDataError ? (
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
            ) : channelSSR === null ? (
              <Text fontFamily="LoRes15">channel does not exist</Text>
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
