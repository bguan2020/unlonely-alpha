import { ApolloError, useLazyQuery } from "@apollo/client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ToastId, useToast, Box, Flex, Text, Spinner } from "@chakra-ui/react";

import { CHANNEL_FEED_QUERY } from "../../constants/queries";
import { GetChannelFeedQuery } from "../../generated/graphql";
import { useUser } from "./useUser";
import { useRouter } from "next/router";
import { useFetchEthPrice } from "../internal/useFetchEthPrice";
import {
  UseGetClaimBetEventsType,
  useGetClaimBetEvents,
  useGetClaimBetEventsInitial,
} from "../internal/useGetClaimBetEvents";
import useUserAgent from "../internal/useUserAgent";

export const useCacheContext = () => {
  return useContext(CacheContext);
};

const CacheContext = createContext<
  {
    channelFeed: GetChannelFeedQuery["getChannelFeed"];
    feedLoading: boolean;
    feedError?: ApolloError;
    addAppError: (error: Error, source: string) => void;
    popAppError: (errorName: string, field: string) => void;
    ethPriceInUsd: string;
  } & UseGetClaimBetEventsType
>({
  channelFeed: [],
  feedLoading: true,
  feedError: undefined,
  addAppError: () => undefined,
  popAppError: () => undefined,
  ethPriceInUsd: "0",
  ...useGetClaimBetEventsInitial,
});

type SourcedError = Error & {
  source: string;
};

export const CacheProvider = ({ children }: { children: React.ReactNode }) => {
  const [appErrors, setAppErrors] = useState<SourcedError[]>([]);
  const toast = useToast();

  const { walletIsConnected } = useUser();
  const { isStandalone } = useUserAgent();
  const toastIdRef = useRef<ToastId | undefined>();

  const router = useRouter();
  const ethPriceInUsd = useFetchEthPrice();
  const claimBetEvents = useGetClaimBetEvents();

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

  const [getChannelFeed, { data: dataChannels, loading: feedLoading, error }] =
    useLazyQuery<GetChannelFeedQuery>(CHANNEL_FEED_QUERY, {
      variables: {
        data: {},
      },
      fetchPolicy: "cache-first",
    });

  useEffect(() => {
    const getChannelFeedData = async () => {
      const pathnameAccepted =
        router.pathname.startsWith("/claim") || router.pathname === "/";
      if (!dataChannels && pathnameAccepted) getChannelFeed();
    };
    getChannelFeedData();
  }, [router]);

  useEffect(() => {
    if (
      walletIsConnected &&
      appErrors.filter((err) => err.name?.includes("ConnectorNotFoundError"))
        .length > 0 &&
      !toast.isActive("no-connector") &&
      !isStandalone
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

  const value = useMemo(() => {
    return {
      channelFeed: dataChannels?.getChannelFeed ?? [],
      feedLoading,
      feedError: error,
      addAppError,
      popAppError,
      ethPriceInUsd,
      isStandalone,
      ...claimBetEvents,
    };
  }, [
    feedLoading,
    error,
    dataChannels?.getChannelFeed,
    addAppError,
    popAppError,
    ethPriceInUsd,
    claimBetEvents,
  ]);

  return (
    <CacheContext.Provider value={value}>{children}</CacheContext.Provider>
  );
};
