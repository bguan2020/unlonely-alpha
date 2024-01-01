import { ApolloError, useLazyQuery, useQuery } from "@apollo/client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPublicClient, http } from "viem";

import { EventTypeForContract } from "../../constants";
import { NETWORKS } from "../../constants/networks";
import {
  CHANNEL_FEED_QUERY,
  GET_UNCLAIMED_EVENTS_QUERY,
} from "../../constants/queries";
import {
  Channel,
  GetUnclaimedEventsQuery,
  SharesEvent,
} from "../../generated/graphql";
import { getContractFromNetwork } from "../../utils/contract";
import { useNetworkContext } from "./useNetwork";
import { useUser } from "./useUser";

type UnclaimedBet = SharesEvent & {
  payout: bigint;
};

export const useCacheContext = () => {
  return useContext(CacheContext);
};

const CacheContext = createContext<{
  channelFeed: any[];
  claimableBets: UnclaimedBet[];
  fetchingBets: boolean;
  feedLoading: boolean;
  feedError?: ApolloError;
}>({
  channelFeed: [],
  claimableBets: [],
  fetchingBets: true,
  feedLoading: true,
  feedError: undefined,
});

export const CacheProvider = ({ children }: { children: React.ReactNode }) => {
  const isFetching = useRef(false);
  const [fetchingBets, setFetchingBets] = useState<boolean>(true);
  const [claimableBets, setClaimableBets] = useState<UnclaimedBet[]>([]);
  const [counter, setCounter] = useState(0);

  const { userAddress, activeWallet, walletIsConnected } = useUser();

  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const contractData = getContractFromNetwork("unlonelySharesV2", localNetwork);

  const {
    data: dataChannels,
    loading: feedLoading,
    error,
  } = useQuery(CHANNEL_FEED_QUERY, {
    variables: {
      data: {},
    },
    fetchPolicy: "cache-first",
  });

  const ongoingBets = useMemo(() => {
    if (!dataChannels?.getChannelFeed) return [];
    const _channels: Channel[] = dataChannels?.getChannelFeed;
    return _channels
      .filter((channel) => channel.sharesEvent) // Filter out channels without sharesEvent
      .flatMap((channel) => channel.sharesEvent) // Flatten the arrays of sharesEvent
      .filter((event): event is SharesEvent => event !== null); // Filter out null values
  }, [dataChannels?.getChannelFeed]);

  const [getUnclaimedEvents] = useLazyQuery<GetUnclaimedEventsQuery>(
    GET_UNCLAIMED_EVENTS_QUERY,
    {
      fetchPolicy: "network-only",
    }
  );

  useEffect(() => {
    const init = async () => {
      const chainId = activeWallet?.chainId?.split(":")[1];
      const _network = NETWORKS.find(
        (network) => network.config.chainId === Number(chainId)
      );
      if (
        ongoingBets.length === 0 ||
        !_network ||
        !contractData.address ||
        isFetching.current ||
        !userAddress ||
        !walletIsConnected ||
        !activeWallet
      )
        return;
      setFetchingBets(true);
      isFetching.current = true;
      let unclaimedBets: SharesEvent[] = [];
      try {
        const data = await getUnclaimedEvents({
          variables: {
            data: {
              userAddress: userAddress as `0x${string}`,
              chainId: contractData.chainId,
            },
          },
        });
        unclaimedBets =
          data?.data?.getUnclaimedEvents.filter(
            (event): event is SharesEvent =>
              event !== null && event?.chainId === contractData.chainId
          ) || [];
      } catch (err) {
        console.log(
          "claimpage fetching for unclaimed events failed, switching to fetching ongoing bets",
          err
        );
        unclaimedBets = ongoingBets;
      }
      let payouts: any[] = [];
      try {
        const publicClient = createPublicClient({
          chain: _network,
          transport: http(),
        });
        const promises = unclaimedBets.map((event) =>
          publicClient.readContract({
            address: contractData.address,
            abi: contractData.abi,
            functionName: "getVotePayout",
            args: [
              event.sharesSubjectAddress,
              event.id,
              EventTypeForContract.YAY_NAY_VOTE,
              userAddress,
            ],
          })
        );
        payouts = await Promise.all(promises);
      } catch (err) {
        console.log("claimpage getVotePayout", err);
        payouts = [];
      }
      const formattedPayouts = payouts.map((payout) => BigInt(String(payout)));
      const combinedBets = unclaimedBets.map((event, i) => ({
        ...event,
        payout: formattedPayouts[i],
      }));
      const claimableBets = combinedBets.filter(
        (event) => event.payout > BigInt(0) && (event?.resultIndex ?? -1) >= 0
      );
      setClaimableBets(claimableBets);
      isFetching.current = false;
      setFetchingBets(false);
    };
    init();
  }, [
    userAddress,
    contractData.address,
    activeWallet,
    walletIsConnected,
    ongoingBets,
    counter,
  ]);

  setInterval(() => {
    setCounter((counter) => counter + 1);
  }, 1000 * 60 * 8);

  const value = useMemo(() => {
    return {
      claimableBets,
      fetchingBets,
      channelFeed: dataChannels?.getChannelFeed || [],
      feedLoading,
      feedError: error,
    };
  }, [
    claimableBets,
    fetchingBets,
    feedLoading,
    dataChannels?.getChannelFeed,
    error,
  ]);

  return (
    <CacheContext.Provider value={value}>{children}</CacheContext.Provider>
  );
};
