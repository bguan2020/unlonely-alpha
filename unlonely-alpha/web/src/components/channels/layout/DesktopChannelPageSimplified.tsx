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
  useToast,
  Box,
  Spinner,
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
} from "../../../hooks/contracts/useTournament";
import { useContractEvent } from "wagmi";
import { Log, decodeEventLog, isAddress } from "viem";
import Header from "../../navigation/Header";
import { TempTokenCreationModal } from "../temp/TempTokenCreationModal";
import { useSendRemainingFundsToWinnerAfterTokenExpiration } from "../../../hooks/contracts/useTempTokenV1";
import TempTokenAbi from "../../../constants/abi/TempTokenV1.json";
import { ContractData } from "../../../constants/types";
import Link from "next/link";

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
    canPlayToken,
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

// creation flow and send remaining funds from INACTIVE token, DO NOT USE THIS COMPONENT FOR ACTIVE TOKENS
const CreateTokenInterface = () => {
  const { channel } = useChannelContext();
  const {
    lastInactiveTokenAddress, // todo finish send after expiration flow before creating token flow
    lastInactiveTokenBalance,
  } = channel;
  const { network } = useNetworkContext();
  const { localNetwork, explorerUrl } = network;
  const [createTokenModalOpen, setCreateTokenModalOpen] = useState(false);
  const [winnerAddress, setWinnerAddress] = useState("");
  const toast = useToast();

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
    sendRemainingFundsToWinnerAfterTokenExpirationTxLoading,
  } = useSendRemainingFundsToWinnerAfterTokenExpiration(
    {
      winnerWalletAddress: winnerAddress,
    },
    inactiveTempTokenContract,
    {
      onWriteSuccess: (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#287ab0" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.hash}`}
                passHref
              >
                send remaining funds pending, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
      onWriteError: (error) => {
        toast({
          duration: 9000,
          isClosable: true,
          position: "top-right",
          render: () => (
            <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
              send remaining funds cancelled
            </Box>
          ),
        });
      },
      onTxSuccess: async (data) => {
        const topics = decodeEventLog({
          abi: inactiveTempTokenContract.abi,
          data: data.logs[0].data,
          topics: data.logs[0].topics,
        });
        console.log("send remaining funds success", data, topics.args);
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                send remaining funds success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        setWinnerAddress("");
      },
      onTxError: (error) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              send remaining funds error
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
    }
  );

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
            Please provide an address to send it before creating a new one
          </Text>
          <Input
            variant="glow"
            value={winnerAddress}
            onChange={(e) => setWinnerAddress(e.target.value)}
          />
          <Button
            isDisabled={
              !isAddress(winnerAddress) ||
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
