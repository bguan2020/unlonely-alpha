import { ApolloError, useLazyQuery } from "@apollo/client";
import { Flex, Button, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { Log } from "viem";
import { useContractEvent } from "wagmi";
import { Contract } from "../../../constants";
import { GET_LIVEPEER_STREAM_DATA_QUERY } from "../../../constants/queries";
import {
  ChannelStaticQuery,
  GetLivepeerStreamDataQuery,
} from "../../../generated/graphql";
import { useChat } from "../../../hooks/chat/useChat";
import {
  useChannelContext,
  ChannelWideModals,
} from "../../../hooks/context/useChannel";
import { useNetworkContext } from "../../../hooks/context/useNetwork";
import { useUser } from "../../../hooks/context/useUser";
import { useGenerateKey } from "../../../hooks/contracts/useSharesContractV2";
import {
  useSupply,
  useGetHolderBalance,
} from "../../../hooks/contracts/useTournament";
import { streamerTourSteps } from "../../../pages/_app";
import { getContractFromNetwork } from "../../../utils/contract";
import { truncateValue } from "../../../utils/tokenDisplayFormatting";
import ChatComponent from "../../chat/ChatComponent";
import VibesTokenInterface from "../../chat/VibesTokenInterface";
import { WavyText } from "../../general/WavyText";
import AppLayout from "../../layout/AppLayout";
import ChannelNextHead from "../../layout/ChannelNextHead";
import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";
import ChannelDesc from "../ChannelDesc";
import ChannelStreamerPerspective from "../ChannelStreamerPerspective";
import ChannelViewerPerspective from "../ChannelViewerPerspective";
import Trade from "../bet/Trade";
import { PlaybackInfo } from "livepeer/dist/models/components";
import { Livepeer } from "livepeer";

export const DesktopPage = ({
  channelSSR,
  channelSSRDataLoading,
  channelSSRDataError,
}: {
  channelSSR: ChannelStaticQuery["getChannelBySlug"];
  channelSSRDataLoading: boolean;
  channelSSRDataError?: ApolloError;
}) => {
  const { channel, leaderboard, ui } = useChannelContext();
  const chat = useChat();
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const {
    channelQueryData,
    loading: channelDataLoading,
    error: channelDataError,
    handleTotalBadges,
    handleChannelStaticData,
    createTempToken,
  } = channel;
  const {
    welcomeStreamerModal,
    handleWelcomeStreamerModal,
    handleStartedWelcomeTour,
    handleIsTourOpen,
    handleSetTourSteps,
  } = ui;
  const { handleIsVip } = leaderboard;

  const [livepeerData, setLivepeerData] =
    useState<GetLivepeerStreamDataQuery["getLivepeerStreamData"]>();
  const { userAddress, walletIsConnected } = useUser();

  const livepeer = new Livepeer({
    apiKey: String(process.env.NEXT_PUBLIC_STUDIO_API_KEY),
  });

  const isOwner = userAddress === channelQueryData?.owner?.address;

  const tournamentContract = getContractFromNetwork(
    Contract.TOURNAMENT,
    localNetwork
  );

  const [getLivepeerStreamData] = useLazyQuery<GetLivepeerStreamDataQuery>(
    GET_LIVEPEER_STREAM_DATA_QUERY,
    {
      fetchPolicy: "network-only",
    }
  );

  const livepeerPlaybackId = useMemo(
    () =>
      channelQueryData?.livepeerPlaybackId == null
        ? undefined
        : channelQueryData?.livepeerPlaybackId,
    [channelQueryData]
  );

  const [playbackInfo, setPlaybackInfo] = useState<PlaybackInfo | undefined>(
    undefined
  );

  useEffect(() => {
    const init = async () => {
      if (livepeerPlaybackId) {
        const res = await livepeer.playback.get(livepeerPlaybackId);
        const playbackInfo = res.playbackInfo;
        setPlaybackInfo(playbackInfo);
      }
    };
    init();
  }, [livepeerPlaybackId]);

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

  return (
    <>
      {channelSSR && <ChannelNextHead channel={channelSSR} />}
      <TransactionModalTemplate
        title={
          welcomeStreamerModal === "welcome"
            ? "Welcome streamer!"
            : "You are ready to start streaming!"
        }
        isOpen={welcomeStreamerModal !== "off"}
        handleClose={() => handleWelcomeStreamerModal("off")}
        cannotClose={welcomeStreamerModal === "welcome"}
        hideFooter
      >
        {welcomeStreamerModal === "welcome" && (
          <Flex direction="column" gap="10px">
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
                handleWelcomeStreamerModal("off");
                handleSetTourSteps?.(streamerTourSteps);
                handleIsTourOpen(true);
                handleStartedWelcomeTour(true);
              }}
            >
              Start tour
            </Button>
          </Flex>
        )}
        {welcomeStreamerModal === "bye" && (
          <Flex direction="column" gap="10px">
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
                handleWelcomeStreamerModal("off");
                handleStartedWelcomeTour(false);
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
                      livepeerPlaybackInfo={playbackInfo}
                    />
                    <Button onClick={createTempToken}>create temp token</Button>
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
