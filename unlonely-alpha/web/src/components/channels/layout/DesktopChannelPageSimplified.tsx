import { ApolloError, useLazyQuery } from "@apollo/client";
import {
  ChannelStaticQuery,
  GetLivepeerStreamDataQuery,
} from "../../../generated/graphql";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { useChat } from "../../../hooks/chat/useChat";
import { useNetworkContext } from "../../../hooks/context/useNetwork";
import { Livepeer } from "livepeer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "../../../hooks/context/useUser";
import ChannelNextHead from "../../layout/ChannelNextHead";
import { Stack, Flex, Text, Button } from "@chakra-ui/react";
import { PlaybackInfo } from "livepeer/dist/models/components";
import { GET_LIVEPEER_STREAM_DATA_QUERY } from "../../../constants/queries";
import { WavyText } from "../../general/WavyText";
import { ChannelWideModals } from "../ChannelWideModals";
import { DesktopChannelViewerPerspectiveSimplified } from "./DesktopChannelViewerPerspectiveSimplified";
import { Contract } from "../../../constants";
import { getContractFromNetwork } from "../../../utils/contract";
import ChatComponent from "../../chat/ChatComponent";
import { DesktopChannelStreamerPerspectiveSimplified } from "./DesktopChannelStreamerPerspectiveSimplified";
import { TempTokenInterface } from "../../chat/TempTokenInterface";
import {
  useGenerateKey,
  useGetHolderBalance,
} from "../../../hooks/contracts/useTournament";
import { useContractEvent } from "wagmi";
import { Log } from "viem";
import Header from "../../navigation/Header";
import { TempTokenCreationModal } from "../TempTokenCreationModal";

export const DesktopChannelPageSimplified = ({
  channelSSR,
  channelSSRDataLoading,
  channelSSRDataError,
}: {
  channelSSR: ChannelStaticQuery["getChannelBySlug"];
  channelSSRDataLoading: boolean;
  channelSSRDataError?: ApolloError;
}) => {
  const { userAddress, walletIsConnected } = useUser();
  const { channel, leaderboard } = useChannelContext();
  const chat = useChat();
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const {
    channelQueryData,
    loading: channelDataLoading,
    error: channelDataError,
    handleChannelStaticData,
    currentActiveTokenEndTimestamp,
  } = channel;
  const { handleIsVip } = leaderboard;

  useEffect(() => {
    if (channelSSR) handleChannelStaticData(channelSSR);
  }, [channelSSR]);

  const isOwner = userAddress === channelQueryData?.owner?.address;

  /**
   * VIP stuff
   */
  const tournamentContract = getContractFromNetwork(
    Contract.TOURNAMENT,
    localNetwork
  );

  const { key: generatedKey } = useGenerateKey(
    channelQueryData?.owner?.address as `0x${string}`,
    0,
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

  /**
   * livepeer playback management
   */

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

  const [shouldRenderTempTokenInterface, setShouldRenderTempTokenInterface] =
    useState(false);
  const [canPlayToken, setCanPlayToken] = useState(false);
  const [createTokenModalOpen, setCreateTokenModalOpen] = useState(false);

  /**
   * if there is an existing token, render the temp token interface
   */

  useEffect(() => {
    const decideRender = () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const shouldRender =
        currentTime <= Number(currentActiveTokenEndTimestamp) &&
        currentActiveTokenEndTimestamp !== BigInt(0);
      setShouldRenderTempTokenInterface(shouldRender);
    };

    // Initial update
    decideRender();

    const interval = setInterval(() => {
      decideRender();
      clearInterval(interval);
    }, 5 * 1000); // Check every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [currentActiveTokenEndTimestamp]);

  const handleCanPlayToken = useCallback((canPlay: boolean) => {
    setCanPlayToken(canPlay);
  }, []);

  return (
    <>
      {channelSSR && <ChannelNextHead channel={channelSSR} />}
      <Flex
        h="100vh"
        bg="rgba(5, 0, 31, 1)"
        position={"relative"}
        overflowY={"hidden"}
      >
        {!channelDataLoading &&
        !channelDataError &&
        !channelSSRDataError &&
        !channelSSRDataLoading ? (
          <Flex direction="column" width="100%">
            <Header />
            <Stack
              height="100%"
              alignItems={["center", "initial"]}
              direction={["column", "column", "row", "row"]}
              gap="0"
              width="100%"
            >
              <Flex direction="column" width={"100%"} height="100%">
                {isOwner && walletIsConnected ? (
                  <>
                    <ChannelWideModals ablyChannel={chat.channel} />
                    <TempTokenCreationModal
                      title="Create Temp Token"
                      isOpen={createTokenModalOpen}
                      handleClose={() => setCreateTokenModalOpen(false)}
                      getLivepeerStreamData={getLivepeerStreamData}
                    />
                    <DesktopChannelStreamerPerspectiveSimplified
                      ablyChannel={chat.channel}
                      livepeerData={livepeerData}
                      livepeerPlaybackInfo={playbackInfo}
                    />
                  </>
                ) : (
                  <DesktopChannelViewerPerspectiveSimplified
                    livepeerPlaybackInfo={playbackInfo}
                    chat={chat}
                    openOverlappingChat={canPlayToken}
                  />
                )}
              </Flex>
              {canPlayToken && (
                <Flex
                  direction="column"
                  minW={["100%", "100%", "500px", "500px"]}
                  maxW={["100%", "100%", "500px", "500px"]}
                  gap="1rem"
                >
                  <TempTokenInterface
                    ablyChannel={chat.channel}
                    canPlayToken={canPlayToken}
                    handleCanPlayToken={handleCanPlayToken}
                    customHeight="100%"
                  />
                </Flex>
              )}
              {!canPlayToken && (
                <Flex
                  direction="column"
                  minW={["100%", "100%", "380px", "380px"]}
                  maxW={["100%", "100%", "380px", "380px"]}
                  gap="1rem"
                >
                  {isOwner && walletIsConnected ? (
                    <>
                      {shouldRenderTempTokenInterface ? (
                        <TempTokenInterface
                          ablyChannel={chat.channel}
                          canPlayToken={canPlayToken}
                          handleCanPlayToken={handleCanPlayToken}
                          customHeight="30%"
                        />
                      ) : (
                        <Flex
                          gap="5px"
                          justifyContent={"space-between"}
                          bg="#131323"
                          p="5px"
                          height="20vh"
                        >
                          <Button onClick={() => setCreateTokenModalOpen(true)}>
                            start creating temp token
                          </Button>
                        </Flex>
                      )}
                      <ChatComponent chat={chat} customHeight={"100%"} />
                    </>
                  ) : (
                    <>
                      {shouldRenderTempTokenInterface && (
                        <TempTokenInterface
                          ablyChannel={chat.channel}
                          canPlayToken={canPlayToken}
                          handleCanPlayToken={handleCanPlayToken}
                          customHeight="30%"
                        />
                      )}
                      <ChatComponent chat={chat} customHeight={"100%"} />
                    </>
                  )}
                </Flex>
              )}
            </Stack>
          </Flex>
        ) : (
          <Flex
            alignItems={"center"}
            justifyContent={"center"}
            width="100%"
            height="calc(100vh)"
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
      </Flex>
    </>
  );
};
