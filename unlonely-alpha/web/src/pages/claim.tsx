import { useLazyQuery, useQuery } from "@apollo/client";
import {
  Text,
  Flex,
  Box,
  Avatar,
  Image,
  SimpleGrid,
  Button,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { decodeEventLog, formatUnits } from "viem";
import { usePublicClient } from "wagmi";
import Link from "next/link";

import { WavyText } from "../components/general/WavyText";
import AppLayout from "../components/layout/AppLayout";
import { anonUrl } from "../components/presence/AnonUrl";
import { EventType } from "../constants";
import { CHANNEL_FEED_QUERY, GET_SUBSCRIPTION } from "../constants/queries";
import {
  Channel,
  GetSubscriptionQuery,
  SharesEvent,
} from "../generated/graphql";
import { useNetworkContext } from "../hooks/context/useNetwork";
import { useUser } from "../hooks/context/useUser";
import { useClaimVotePayout } from "../hooks/contracts/useSharesContractV2";
import centerEllipses from "../utils/centerEllipses";
import { sortChannels } from "../utils/channelSort";
import { getContractFromNetwork } from "../utils/contract";
import { truncateValue } from "../utils/tokenDisplayFormatting";
import useCloseSharesEvent from "../hooks/server/useCloseSharesEvent";
import usePostClaimPayout from "../hooks/server/usePostClaimPayout";
export default function ClaimPage() {
  const { user, walletIsConnected } = useUser();

  return (
    <AppLayout isCustomHeader={false}>
      {user && walletIsConnected ? (
        <ClaimContent />
      ) : (
        <Text>You must be logged in to see this page.</Text>
      )}
    </AppLayout>
  );
}

const ClaimContent = () => {
  const { initialNotificationsGranted } = useUser();

  const [endpoint, setEndpoint] = useState<string>("");
  const [sortedChannels, setSortedChannels] = useState<Channel[]>([]);
  const [isSorted, setIsSorted] = useState<boolean>(false);
  const scrollRef = useRef<VirtuosoHandle>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const { data: dataChannels, loading } = useQuery(CHANNEL_FEED_QUERY, {
    variables: {
      data: {},
    },
    fetchPolicy: "cache-first",
  });

  const [getSubscription, { data: subscriptionData }] =
    useLazyQuery<GetSubscriptionQuery>(GET_SUBSCRIPTION, {
      fetchPolicy: "cache-first",
    });

  const channels: Channel[] = dataChannels?.getChannelFeed;

  const suggestedChannels =
    subscriptionData?.getSubscriptionByEndpoint?.allowedChannels;

  const handleGetSubscription = useCallback(async () => {
    await getSubscription({
      variables: { data: { endpoint } },
    });
  }, [endpoint]);

  useEffect(() => {
    if (endpoint) {
      handleGetSubscription();
    }
  }, [endpoint]);

  useEffect(() => {
    const init = async () => {
      if ("serviceWorker" in navigator) {
        const registrationExists =
          await navigator.serviceWorker.getRegistration("/");
        if (registrationExists) {
          const subscription =
            await registrationExists.pushManager.getSubscription();
          if (subscription) {
            const endpoint = subscription.endpoint;
            setEndpoint(endpoint);
          }
        }
      }
    };
    init();
  }, [initialNotificationsGranted]);

  useEffect(() => {
    if (isSorted || !suggestedChannels || !channels) return;
    const liveChannels = channels.filter((channel) => channel.isLive);
    const _suggestedNonLiveChannels = channels.filter(
      (channel) =>
        suggestedChannels.includes(String(channel.id)) && !channel.isLive
    );
    const otherChannels = channels.filter(
      (channel) =>
        !suggestedChannels.includes(String(channel.id)) && !channel.isLive
    );

    const sortedLiveChannels = sortChannels(liveChannels);
    const sortedSuggestedNonLiveChannels = sortChannels(
      _suggestedNonLiveChannels
    );
    const sortedOtherChannels = sortChannels(otherChannels);
    setSortedChannels([
      ...sortedLiveChannels,
      ...sortedSuggestedNonLiveChannels,
      ...sortedOtherChannels,
    ]);
    setIsSorted(true);
  }, [channels, isSorted, suggestedChannels]);

  return (
    <>
      {!loading ? (
        <Flex direction="column">
          <Text>claim payout</Text>
          <Flex>
            {sortedChannels && sortedChannels.length > 0 ? (
              <Flex
                height="calc(80vh)"
                position={"relative"}
                direction="column"
                justifyContent="center"
                width="300px"
              >
                <Virtuoso
                  followOutput={"auto"}
                  ref={scrollRef}
                  data={sortedChannels}
                  totalCount={sortedChannels.length}
                  initialTopMostItemIndex={0}
                  itemContent={(index, data) => (
                    <ChannelBlock
                      key={index}
                      channel={data}
                      selectedChannel={selectedChannel}
                      callback={(channel) => setSelectedChannel(channel)}
                    />
                  )}
                />
              </Flex>
            ) : (
              <Text
                textAlign={"center"}
                fontFamily={"LoRes15"}
                fontSize={"25px"}
              >
                Could not fetch channels, please try again later
              </Text>
            )}
            {selectedChannel && (
              <>
                {(selectedChannel?.sharesEvent?.length ?? 0) > 0 ? (
                  <EventsDashboard channel={selectedChannel} />
                ) : (
                  <Text>
                    This channel does not have any ongoing bets, please choose
                    another one.
                  </Text>
                )}
              </>
            )}
          </Flex>
        </Flex>
      ) : (
        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          direction="column"
          width="100%"
          height="calc(100vh - 103px)"
          fontSize="50px"
        >
          <Image
            src="/icons/icon-192x192.png"
            borderRadius="10px"
            height="96px"
          />
          <Flex>
            <WavyText text="..." />
          </Flex>
        </Flex>
      )}
    </>
  );
};

type UnclaimedBet = SharesEvent & {
  payout: bigint;
};

const EventsDashboard = ({ channel }: { channel: Channel }) => {
  const { userAddress } = useUser();
  const isFetching = useRef(false);

  const { network } = useNetworkContext();
  const { localNetwork } = network;

  const [loading, setLoading] = useState<boolean>(false);
  const publicClient = usePublicClient();
  const contractData = getContractFromNetwork("unlonelySharesV2", localNetwork);

  const ongoingBets = useMemo(
    () =>
      channel?.sharesEvent?.filter(
        (event): event is SharesEvent =>
          event !== null && event?.chainId === localNetwork.config.chainId
      ) || [],
    [channel?.sharesEvent, localNetwork.config.chainId]
  );

  const [claimableBets, setClaimableBets] = useState<UnclaimedBet[]>([]);

  useEffect(() => {
    const init = async () => {
      if (!contractData || !contractData.address || isFetching.current) return;
      setLoading(true);
      isFetching.current = true;
      const promises = ongoingBets.map((event) =>
        publicClient.readContract({
          address: contractData.address,
          abi: contractData.abi,
          functionName: "getVotePayout",
          args: [
            event.sharesSubjectAddress,
            event.id,
            EventType.YAY_NAY_VOTE,
            userAddress,
          ],
        })
      );
      const payouts = await Promise.all(promises);
      const formattedPayouts = payouts.map((payout) => BigInt(String(payout)));
      const combinedBets = ongoingBets.map((event, i) => ({
        ...event,
        payout: formattedPayouts[i],
      }));
      const claimableBets = combinedBets.filter(
        (event) => event.payout > BigInt(0) && (event?.resultIndex ?? -1) >= 0
      );
      setClaimableBets(claimableBets);
      isFetching.current = false;
      setLoading(false);
    };
    init();
  }, [ongoingBets, userAddress, contractData.address]);

  return (
    <Flex>
      {loading ? (
        <Spinner />
      ) : (
        <Flex direction="column">
          <Text>claimable bets</Text>
          <SimpleGrid columns={[2, 3, 4, 4]} spacing={10}>
            {claimableBets.map((event) => (
              <EventCard event={event} channel={channel} />
            ))}
          </SimpleGrid>
        </Flex>
      )}
    </Flex>
  );
};

const EventCard = ({
  event,
  channel,
}: {
  event: UnclaimedBet;
  channel: Channel;
}) => {
  const { userAddress } = useUser();
  const { network } = useNetworkContext();
  const { matchingChain, localNetwork, explorerUrl } = network;
  const contractData = getContractFromNetwork("unlonelySharesV2", localNetwork);
  const toast = useToast();

  const { postClaimPayout } = usePostClaimPayout({
    onError: (err) => {
      console.log(err);
    },
  });
  const { closeSharesEvents } = useCloseSharesEvent({
    onError: (err) => {
      console.log(err);
    },
  });

  const { claimVotePayout } = useClaimVotePayout(
    {
      eventAddress: event.sharesSubjectAddress as `0x${string}`,
      eventId: Number(event.id ?? "0"),
    },
    contractData,
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
                claimVotePayout pending, click to view
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
              claimVotePayout cancelled
            </Box>
          ),
        });
      },
      onTxSuccess: async (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                claimVotePayout success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        const topics = decodeEventLog({
          abi: contractData.abi,
          data: data.logs[0].data,
          topics: data.logs[0].topics,
        });
        const args: any = topics.args;
        await postClaimPayout({
          channelId: channel?.id as string,
          userAddress: userAddress as `0x${string}`,
          eventId: Number(event.id),
          eventType: EventType.YAY_NAY_VOTE,
        });
        if (args.votingPooledEth === BigInt(0)) {
          await closeSharesEvents({
            chainId: localNetwork.config.chainId,
            channelId: channel?.id as string,
            sharesEventIds: [Number(event.id)],
          });
        }
      },
      onTxError: (error) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              claimVotePayout error
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
    <Flex direction="column">
      <Text textAlign={"center"} fontSize={"20px"} fontWeight={"bold"}>
        {event.sharesSubjectQuestion}
      </Text>
      {(event?.resultIndex ?? -1 >= 0) && (
        <Flex justifyContent="space-between">
          <Text fontSize="18px">event outcome</Text>
          <Text
            fontSize="18px"
            fontWeight="bold"
            color={event.resultIndex === 0 ? "#02f042" : "#ee6204"}
          >
            {event.resultIndex === 0 ? "Yes" : "No"}
          </Text>
        </Flex>
      )}
      <Button
        _hover={{}}
        _focus={{}}
        _active={{}}
        bg={"#E09025"}
        borderRadius="25px"
        isDisabled={!claimVotePayout}
        onClick={claimVotePayout}
        width="100%"
      >
        <Text fontSize="20px">
          {truncateValue(formatUnits(event.payout, 18))} ETH
        </Text>
      </Button>
    </Flex>
  );
};

const ChannelBlock = ({
  channel,
  selectedChannel,
  callback,
}: {
  selectedChannel: Channel | null;
  channel: Channel;
  callback: (channel: Channel) => void;
}) => {
  const imageUrl = channel?.owner?.FCImageUrl
    ? channel?.owner.FCImageUrl
    : channel?.owner?.lensImageUrl
    ? channel?.owner.lensImageUrl
    : anonUrl;
  const ipfsUrl = imageUrl.startsWith("ipfs://")
    ? `https://ipfs.io/ipfs/${imageUrl.slice(7)}`
    : imageUrl;

  return (
    <Flex
      p="10px"
      bg={selectedChannel?.id === channel.id ? "#006080" : "#19162F"}
      width="100%"
      justifyContent={"space-between"}
      onClick={() => callback(channel)}
      _hover={{}}
    >
      <Flex gap="15px">
        <Avatar
          name={channel?.owner.username ?? channel?.owner.address}
          src={ipfsUrl}
          size="md"
        />
        <Flex direction="column">
          <Text fontFamily="LoRes15">{channel.name}</Text>
          <Text fontFamily="LoRes15" color="#9d9d9d">
            {channel?.owner.username ??
              centerEllipses(channel?.owner.address, 13)}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};
