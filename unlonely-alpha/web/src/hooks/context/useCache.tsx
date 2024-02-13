import { ApolloError, useLazyQuery, useQuery } from "@apollo/client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPublicClient, http } from "viem";
import { ToastId, useToast, Box, Flex, Text, Spinner } from "@chakra-ui/react";
import * as AWS from "aws-sdk";

import { EventTypeForContract } from "../../constants";
import { NETWORKS } from "../../constants/networks";
import {
  CHANNEL_FEED_QUERY,
  GET_UNCLAIMED_EVENTS_QUERY,
} from "../../constants/queries";
import { GetUnclaimedEventsQuery, SharesEvent } from "../../generated/graphql";
import { getContractFromNetwork } from "../../utils/contract";
import { useNetworkContext } from "./useNetwork";
import { useUser } from "./useUser";
import { useVibesCheck } from "../internal/useVibesCheck";
import { FetchBalanceResult, VibesTokenTx } from "../../constants/types";
import { getCoingeckoTokenPrice } from "../../utils/coingecko";

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
  userVibesBalance?: FetchBalanceResult;
  vibesTokenTxs: VibesTokenTx[];
  vibesTokenLoading: boolean;
  chartTimeIndexes: Map<
    string,
    { index: number | undefined; blockNumber: number | undefined }
  >;
  currentBlockNumberForVibes: bigint;
  addAppError: (error: Error, source: string) => void;
  popAppError: (errorName: string, field: string) => void;
  ethPriceInUsd: string;
}>({
  channelFeed: [],
  claimableBets: [],
  fetchingBets: true,
  feedLoading: true,
  feedError: undefined,
  vibesTokenTxs: [],
  vibesTokenLoading: true,
  userVibesBalance: undefined,
  chartTimeIndexes: new Map(),
  addAppError: () => undefined,
  popAppError: () => undefined,
  ethPriceInUsd: "0",
  currentBlockNumberForVibes: BigInt(0),
});

type SourcedError = Error & {
  source: string;
};

export const CacheProvider = ({ children }: { children: React.ReactNode }) => {
  const isFetching = useRef(false);
  const isFetchingPrice = useRef(false);

  const [fetchingBets, setFetchingBets] = useState<boolean>(true);
  const [claimableBets, setClaimableBets] = useState<UnclaimedBet[]>([]);
  const [counter, setCounter] = useState(0);
  const [appErrors, setAppErrors] = useState<SourcedError[]>([]);
  const toast = useToast();

  const { userAddress, activeWallet, walletIsConnected } = useUser();
  const toastIdRef = useRef<ToastId | undefined>();

  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const contractData = getContractFromNetwork("unlonelySharesV2", localNetwork);

  const {
    vibesBalance,
    tokenTxs,
    chartTimeIndexes,
    loading,
    currentBlockNumberForVibes,
  } = useVibesCheck();
  const [ethPriceInUsd, setEthPriceInUsd] = useState<string>("0");

  const addAppError = useCallback(
    (error: Error, source: string) => {
      const existingError = appErrors.find((err) => err.name === error.name);
      if (!existingError) {
        const sourcedError = {
          ...error,
          source,
        };
        setAppErrors((appErrors) => [...appErrors, sourcedError]);
      }
    },
    [appErrors]
  );

  const popAppError = useCallback(
    (errorName: string, field: string) => {
      setAppErrors((appErrors) =>
        appErrors.filter((err) => (err as any)[field] !== errorName)
      );
    },
    [appErrors]
  );

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
        !_network ||
        !contractData.address ||
        isFetching.current ||
        !userAddress ||
        !walletIsConnected ||
        !activeWallet
      ) {
        setFetchingBets(false);
        return;
      }
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
    counter,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const init = async () => {
        if (typeof window === "undefined" || isFetchingPrice.current) return;
        isFetchingPrice.current = true;
        const value = localStorage.getItem("unlonely-eth-price-usd-v0");
        const dateNow = new Date().getTime();
        if (value) {
          const parsedValue = JSON.parse(value);
          const price = parsedValue.price;
          const timestamp = parsedValue.timestamp;
          if (dateNow - timestamp < 1000 * 60 * 5) {
            setEthPriceInUsd(price);
            isFetchingPrice.current = false;
            return;
          }
        }
        try {
          const lambda = new AWS.Lambda({
            region: "us-west-2",
            accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY,
            secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
          });

          const params = {
            FunctionName: "getTokenPrices",
            Payload: JSON.stringify({}),
          };

          const response = await lambda.invoke(params).promise();
          const parsedResponse = JSON.parse(response.Payload as any);
          if (parsedResponse.statusCode !== 200) {
            throw new Error("error fetching eth price from lambda");
          }
          const price = String(JSON.parse(parsedResponse.body).ethereum);
          localStorage.setItem(
            "unlonely-eth-price-usd-v0",
            JSON.stringify({
              price,
              timestamp: dateNow,
            })
          );
          setEthPriceInUsd(price);
        } catch (e) {
          console.log("error fetching eth price, switching to coingecko", e);
          try {
            const price = await getCoingeckoTokenPrice("ethereum", "usd");
            localStorage.setItem(
              "unlonely-eth-price-usd-v0",
              JSON.stringify({
                price,
                timestamp: dateNow,
              })
            );
            if (price !== undefined) setEthPriceInUsd(price);
          } catch (e) {
            console.log("error fetching eth price from coingecko", e);
          }
        }
        isFetchingPrice.current = false;
      };
      init();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (
      walletIsConnected &&
      appErrors.filter((err) => err.name?.includes("ConnectorNotFoundError"))
        .length > 0 &&
      !toast.isActive("no-connector")
    ) {
      toastIdRef.current = toast({
        id: "no-connector",
        duration: null,
        position: "top",
        render: () => (
          <Box
            borderRadius="md"
            className="background-change-element"
            bg="#c21c1c"
            p="10px"
            zIndex="20"
          >
            <Flex direction={"column"}>
              <Flex justifyContent={"space-between"} alignItems="center">
                <Text textAlign="center" fontSize="18px">
                  <Flex alignItems={"center"} gap="10px">
                    <Spinner /> configuring wallet connection...
                  </Flex>
                  <Text fontSize="15px">
                    refresh the app if this message persists
                  </Text>
                </Text>
              </Flex>
            </Flex>
          </Box>
        ),
      });
    } else {
      if (toastIdRef.current) {
        toast.close(toastIdRef.current);
      }
    }
  }, [appErrors, walletIsConnected]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => prev + 1);
    }, 1000 * 60 * 8);

    return () => clearInterval(interval);
  }, []);

  const value = useMemo(() => {
    return {
      claimableBets,
      fetchingBets,
      channelFeed: dataChannels?.getChannelFeed || [],
      feedLoading,
      feedError: error,
      vibesTokenTxs: tokenTxs,
      vibesTokenLoading: loading,
      userVibesBalance: vibesBalance,
      chartTimeIndexes,
      addAppError,
      popAppError,
      currentBlockNumberForVibes,
      ethPriceInUsd,
    };
  }, [
    claimableBets,
    fetchingBets,
    feedLoading,
    error,
    dataChannels?.getChannelFeed,
    tokenTxs,
    loading,
    chartTimeIndexes,
    addAppError,
    popAppError,
    ethPriceInUsd,
    currentBlockNumberForVibes,
    vibesBalance,
  ]);

  return (
    <CacheContext.Provider value={value}>{children}</CacheContext.Provider>
  );
};
