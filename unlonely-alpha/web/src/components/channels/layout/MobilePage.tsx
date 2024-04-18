import { ApolloError, useLazyQuery } from "@apollo/client";
import { Flex, Text, Image, useToast, Button } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { Log, isAddressEqual } from "viem";
import { useContractEvent } from "wagmi";
import { Contract } from "../../../constants";
import { GET_LIVEPEER_STREAM_DATA_QUERY } from "../../../constants/queries";
import {
  ChannelStaticQuery,
  GetLivepeerStreamDataQuery,
} from "../../../generated/graphql";
import { useChat } from "../../../hooks/chat/useChat";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { useNetworkContext } from "../../../hooks/context/useNetwork";
import { useUser } from "../../../hooks/context/useUser";
import {
  useGenerateKey,
  useSupply,
  useGetHolderBalance,
} from "../../../hooks/contracts/useTournament";
import { getContractFromNetwork } from "../../../utils/contract";
import { truncateValue } from "../../../utils/tokenDisplayFormatting";
import { WavyText } from "../../general/WavyText";
import AppLayout from "../../layout/AppLayout";
import ChannelNextHead from "../../layout/ChannelNextHead";
import ChannelStreamerPerspective from "./ChannelStreamerPerspective";
import ChannelViewerPerspective from "./ChannelViewerPerspective";
import StandaloneAblyChatComponent from "../../mobile/StandAloneChatComponent";
import { ChannelWideModals } from "../ChannelWideModals";
import { PlaybackInfo } from "livepeer/dist/models/components";
import { Livepeer } from "livepeer";
import copy from "copy-to-clipboard";
import trailString from "../../../utils/trailString";
import { formatApolloError } from "./DesktopChannelPageSimplified";

export const MobilePage = ({
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
    isOwner,
    handleTotalBadges,
    handleChannelStaticData,
  } = channel;
  const { handleIsVip } = leaderboard;
  const toast = useToast();

  const chat = useChat();

  const { userAddress } = useUser();

  useEffect(() => {
    if (channelSSR) handleChannelStaticData(channelSSR);
  }, [channelSSR]);

  const tournamentContract = getContractFromNetwork(
    Contract.TOURNAMENT,
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

  const livepeer = new Livepeer({
    apiKey: String(process.env.NEXT_PUBLIC_STUDIO_API_KEY),
  });

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

  const handleUpdate = (tradeEvents: Log[]) => {
    const sortedEvents = tradeEvents.filter(
      (event: any) => (event?.args.trade.eventByte as string) === generatedKey
    );
    if (sortedEvents.length === 0) return;
    let newBalanceAddition = 0;
    for (let i = 0; i < sortedEvents.length; i++) {
      const tradeEvent: any = sortedEvents[i];
      const trader = tradeEvent?.args.trade.trader as `0x${string}`;
      if (userAddress && isAddressEqual(trader, userAddress as `0x${string}`)) {
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

  const handleCopy = () => {
    toast({
      title: "copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

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
                  playbackData={
                    playbackInfo
                      ? {
                          infra: "livepeer",
                          livepeerPlaybackInfo: playbackInfo,
                        }
                      : {
                          infra: "aws",
                        }
                  }
                />
              </>
            ) : (
              <ChannelViewerPerspective
                playbackData={
                  playbackInfo
                    ? {
                        infra: "livepeer",
                        livepeerPlaybackInfo: playbackInfo,
                      }
                    : {
                        infra: "aws",
                      }
                }
                mobile
              />
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
              <Flex direction="column" gap="10px" justifyContent="center">
                <Text fontFamily="LoRes15" textAlign={"center"} fontSize="50px">
                  server error, please try again later
                </Text>
                {channelDataError && (
                  <Flex justifyContent={"center"} direction="column">
                    <Text textAlign={"center"} fontSize="12px">
                      {trailString(formatApolloError(channelDataError), 25)}
                    </Text>
                    <Button
                      _focus={{}}
                      _active={{}}
                      _hover={{
                        transform: "scale(1.1)",
                      }}
                      onClick={() => {
                        copy(formatApolloError(channelDataError));
                        handleCopy();
                      }}
                      color="white"
                      bg="#e2461f"
                      mx="auto"
                    >
                      copy full error
                    </Button>
                  </Flex>
                )}
              </Flex>
            )}
          </Flex>
        )}
      </AppLayout>
    </>
  );
};
