import { ApolloError, useLazyQuery } from "@apollo/client";
import {
  ChannelStaticQuery,
  GetLivepeerStreamDataQuery,
} from "../../../generated/graphql";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { useChat } from "../../../hooks/chat/useChat";
import { useNetworkContext } from "../../../hooks/context/useNetwork";
import { Livepeer } from "livepeer";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "../../../hooks/context/useUser";
import ChannelNextHead from "../../layout/ChannelNextHead";
import {
  Stack,
  Flex,
  Text,
  Button,
  Input,
  Spinner,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { PlaybackInfo } from "livepeer/dist/models/components";
import { GET_LIVEPEER_STREAM_DATA_QUERY } from "../../../constants/queries";
import { WavyText } from "../../general/WavyText";
import { ChannelWideModals } from "../ChannelWideModals";
import { DesktopChannelViewerPerspectiveSimplified } from "./DesktopChannelViewerPerspectiveSimplified";
import { Contract, NULL_ADDRESS } from "../../../constants";
import { getContractFromNetwork } from "../../../utils/contract";
import ChatComponent from "../../chat/ChatComponent";
import { DesktopChannelStreamerPerspectiveSimplified } from "./DesktopChannelStreamerPerspectiveSimplified";
import { TempTokenInterface } from "../temp/TempTokenInterface";
import {
  useGenerateKey,
  useGetHolderBalance,
  useSupply,
} from "../../../hooks/contracts/useTournament";
import { useContractEvent } from "wagmi";
import { Log, isAddressEqual } from "viem";
import Header from "../../navigation/Header";
import { TempTokenCreationModal } from "../temp/TempTokenCreationModal";
import TempTokenAbi from "../../../constants/abi/TempTokenV1.json";
import { ContractData } from "../../../constants/types";
import { useSendRemainingFundsToWinnerState } from "../../../hooks/internal/temp-token/write/useSendRemainingFundsToWinnerState";
import { truncateValue } from "../../../utils/tokenDisplayFormatting";
import trailString from "../../../utils/trailString";
import copy from "copy-to-clipboard";
import { useTempTokenContext } from "../../../hooks/context/useTempToken";

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
  const { tempToken } = useTempTokenContext();
  const chat = useChat();
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const {
    channelQueryData,
    loading: channelDataLoading,
    error: channelDataError,
    handleTotalBadges,
    handleChannelStaticData,
    isOwner,
  } = channel;
  const { currentActiveTokenEndTimestamp, canPlayToken } = tempToken;
  const { handleIsVip } = leaderboard;
  const toast = useToast();

  useEffect(() => {
    if (channelSSR) handleChannelStaticData(channelSSR);
  }, [channelSSR]);

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

  /**
   * if there is an existing token, render the temp token interface
   */

  useEffect(() => {
    if (!currentActiveTokenEndTimestamp) {
      setShouldRenderTempTokenInterface(false);
      return;
    }
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

  const canShowInterface = useMemo(() => {
    return (
      !channelDataLoading &&
      !channelDataError &&
      !channelSSRDataError &&
      !channelSSRDataLoading
    );
  }, [
    channelDataLoading,
    channelDataError,
    channelSSRDataError,
    channelSSRDataLoading,
  ]);

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
      <Flex
        h="100vh"
        bg="rgba(5, 0, 31, 1)"
        position={"relative"}
        overflowY={"hidden"}
      >
        {canShowInterface ? (
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
                    <DesktopChannelStreamerPerspectiveSimplified
                      ablyChannel={chat.channel}
                      livepeerData={livepeerData}
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
                  <DesktopChannelViewerPerspectiveSimplified
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
                          customHeight="30%"
                        />
                      ) : (
                        <Flex
                          gap="5px"
                          justifyContent={"center"}
                          alignItems={"center"}
                          bg="#131323"
                          p="5px"
                          height="20vh"
                        >
                          <CreateTokenInterface />
                        </Flex>
                      )}
                      <ChatComponent chat={chat} customHeight={"100%"} />
                    </>
                  ) : (
                    <>
                      {shouldRenderTempTokenInterface && (
                        <TempTokenInterface
                          ablyChannel={chat.channel}
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
              <Flex direction="column" gap="10px" justifyContent="center">
                <Text fontFamily="LoRes15" textAlign={"center"}>
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
      </Flex>
    </>
  );
};

// creation flow and send remaining funds from INACTIVE token, DO NOT USE THIS COMPONENT FOR ACTIVE TOKENS
const CreateTokenInterface = () => {
  const { tempToken } = useTempTokenContext();
  const { lastInactiveTokenAddress, lastInactiveTokenBalance } = tempToken;
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const [createTokenModalOpen, setCreateTokenModalOpen] = useState(false);

  const inactiveTempTokenContract: ContractData = useMemo(() => {
    if (!lastInactiveTokenAddress) {
      return {
        address: NULL_ADDRESS,
        abi: undefined,
        chainId: localNetwork.config.chainId,
      };
    }
    return {
      address: lastInactiveTokenAddress as `0x${string}`,
      abi: TempTokenAbi,
      chainId: localNetwork.config.chainId,
    };
  }, [lastInactiveTokenAddress, localNetwork.config.chainId]);

  const {
    sendRemainingFundsToWinnerAfterTokenExpiration,
    loading: sendRemainingFundsToWinnerAfterTokenExpirationTxLoading,
    handleWinnerChange,
    winner,
    resolvedAddress,
  } = useSendRemainingFundsToWinnerState(inactiveTempTokenContract);

  return (
    <>
      {lastInactiveTokenAddress === NULL_ADDRESS &&
      lastInactiveTokenBalance === BigInt(0) ? (
        <>
          <TempTokenCreationModal
            title="Create Temp Token"
            isOpen={createTokenModalOpen}
            handleClose={() => setCreateTokenModalOpen(false)}
          />
          <Button onClick={() => setCreateTokenModalOpen(true)}>
            create temp token
          </Button>
        </>
      ) : (
        <Flex direction="column" gap="5px">
          <Text>Your last token that had expired still has a balance</Text>
          <Text>
            Please provide an address or an ENS to send it before creating a new
            one
          </Text>
          <Tooltip
            placement="top"
            shouldWrapChildren
            isOpen={resolvedAddress}
            isDisabled={!resolvedAddress}
            label={`This ENS points to ${resolvedAddress}`}
            bg="#078410"
          >
            <Input
              variant="glow"
              value={winner}
              onChange={(e) => handleWinnerChange(e.target.value)}
            />
          </Tooltip>
          <Button
            isDisabled={
              sendRemainingFundsToWinnerAfterTokenExpirationTxLoading ||
              !sendRemainingFundsToWinnerAfterTokenExpiration
            }
            onClick={sendRemainingFundsToWinnerAfterTokenExpiration}
          >
            {sendRemainingFundsToWinnerAfterTokenExpirationTxLoading ? (
              <Spinner />
            ) : (
              "send"
            )}
          </Button>
        </Flex>
      )}
    </>
  );
};

export function formatApolloError(error: ApolloError) {
  let errorDetails = `Error Message: ${error.message}\n`;

  if (error.graphQLErrors) {
    error.graphQLErrors.forEach((err, index) => {
      errorDetails += `GraphQL Error #${index + 1}: ${err.message}\n`;
    });
  }

  if (error.networkError) {
    errorDetails += `Network Error: ${error.networkError.message}\n`;
  }

  if (error.extraInfo) {
    errorDetails += `Extra Info: ${JSON.stringify(error.extraInfo)}\n`;
  }

  return errorDetails;
}
