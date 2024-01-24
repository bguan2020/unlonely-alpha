import { ApolloError, useLazyQuery, useQuery } from "@apollo/client";
import {
  Box,
  Button,
  Container,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Stack,
  Text,
  useBreakpointValue,
  useDisclosure,
  Image,
  Spinner,
  IconButton,
  Input,
} from "@chakra-ui/react";
import Link from "next/link";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { useRouter } from "next/router";
import { BiRefresh } from "react-icons/bi";

import AppLayout from "../components/layout/AppLayout";
import NfcCardSkeleton from "../components/NFCs/NfcCardSkeleton";
import NfcList from "../components/NFCs/NfcList";
import LiveChannelList from "../components/channels/LiveChannelList";
import { WavyText } from "../components/general/WavyText";
import useUserAgent from "../hooks/internal/useUserAgent";
import {
  Channel,
  GetSubscriptionQuery,
  NfcFeedQuery,
} from "../generated/graphql";
import { SelectableChannel } from "../components/mobile/SelectableChannel";
import { GET_SUBSCRIPTION, NFC_FEED_QUERY } from "../constants/queries";
import useAddChannelToSubscription from "../hooks/server/useAddChannelToSubscription";
import useRemoveChannelFromSubscription from "../hooks/server/useRemoveChannelFromSubscription";
import { useUser } from "../hooks/context/useUser";
import { sortChannels } from "../utils/channelSort";
import { useCacheContext } from "../hooks/context/useCache";
import ChannelList from "../components/channels/ChannelList";
import VibesTokenInterface from "../components/chat/VibesTokenInterface";

const FixedComponent = ({
  newHeightPercentage,
}: {
  newHeightPercentage?: string;
}) => {
  return (
    <Flex
      borderWidth="1px"
      borderRadius={"10px"}
      bg={
        "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
      }
      height={newHeightPercentage ?? "100%"}
      boxShadow="0px 4px 16px rgba(208, 234, 53, 0.4)"
      background={"#19162F"}
    >
      <iframe
        src="https://lu.ma/embed/calendar/cal-i5SksIDn63DmCXs/events?lt=dark"
        frameBorder="0"
        width="100%"
        aria-hidden="false"
        style={{
          borderRadius: "10px",
          borderWidth: "1px",
        }}
      />
    </Flex>
  );
};

const ScrollableComponent = ({
  channels,
  loading,
  callback,
}: {
  channels: Channel[];
  loading: boolean;
  callback?: () => void;
}) => {
  const { data: dataNFCs, loading: loadingNFCs } = useQuery<NfcFeedQuery>(
    NFC_FEED_QUERY,
    {
      variables: {
        data: {
          limit: 30,
          orderBy: "createdAt",
        },
      },
    }
  );
  const router = useRouter();
  const { initialNotificationsGranted, userAddress } = useUser();
  const [indexOfOwner, setIndexOfOwner] = useState<number>(-1);

  const [endpoint, setEndpoint] = useState<string>("");
  const [sortedChannels, setSortedChannels] = useState<Channel[]>([]);

  const [getSubscription, { data: subscriptionData }] =
    useLazyQuery<GetSubscriptionQuery>(GET_SUBSCRIPTION, {
      fetchPolicy: "network-only",
    });

  const suggestedChannels =
    subscriptionData?.getSubscriptionByEndpoint?.allowedChannels;

  const handleSelectChannel = useCallback(
    (slug: string, redirect?: boolean) => {
      callback?.();
      if (redirect === undefined || redirect) router.push(`/channels/${slug}`);
    },
    []
  );

  const { addChannelToSubscription } = useAddChannelToSubscription({
    onError: () => {
      console.error("Failed to add channel to subscription.");
    },
  });

  const { removeChannelFromSubscription } = useRemoveChannelFromSubscription({
    onError: () => {
      console.error("Failed to remove channel from subscription.");
    },
  });

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
    const _suggestedChannels = suggestedChannels
      ? channels.filter((channel) =>
          suggestedChannels?.includes(String(channel.id))
        )
      : [];
    const otherChannels = suggestedChannels
      ? channels.filter(
          (channel) => !suggestedChannels?.includes(String(channel.id))
        )
      : channels.filter((channel) => !channel.isLive);
    const sortedSuggestedChannels = sortChannels(_suggestedChannels);
    const sortedOtherChannels = sortChannels(otherChannels);
    const sortedChannels = [...sortedSuggestedChannels, ...sortedOtherChannels];
    const indexOfOwner = sortedChannels.findIndex(
      (element) => element.owner.address === userAddress
    );
    const sortedChannelsWithOwnerInFront =
      indexOfOwner === -1
        ? sortedChannels
        : [
            sortedChannels[indexOfOwner],
            ...sortedChannels.slice(0, indexOfOwner),
            ...sortedChannels.slice(indexOfOwner + 1),
          ];
    setIndexOfOwner(indexOfOwner > -1 ? 0 : -1);
    setSortedChannels(sortedChannelsWithOwnerInFront);
  }, [channels, suggestedChannels, userAddress]);

  const nfcs = dataNFCs?.getNFCFeed;

  return (
    <>
      {/* <TokenLeaderboard callback={callback} /> */}
      <Flex direction="column" width="100%">
        <Flex
          height="300px"
          gap="5px"
          justifyContent={"space-between"}
          bg="#131323"
          p="5px"
          mb="10px"
          borderRadius={"10px"}
        >
          <VibesTokenInterface defaultTimeFilter="all" allStreams />
        </Flex>
        <Text
          fontSize={{ base: "30px", lg: "40px" }}
          lineHeight={{ base: "60px", lg: "80px" }}
          textAlign="center"
          fontFamily="LoRes15"
        >
          channels
        </Text>
        {loading ? (
          <Flex
            direction="row"
            overflowX="scroll"
            overflowY="clip"
            width="100%"
            height="18rem"
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <NfcCardSkeleton key={i} />
            ))}
          </Flex>
        ) : (
          <ChannelList
            channels={sortedChannels}
            suggestedChannels={
              suggestedChannels === null ? undefined : suggestedChannels
            }
            addChannelToSubscription={addChannelToSubscription}
            removeChannelFromSubscription={removeChannelFromSubscription}
            handleGetSubscription={handleGetSubscription}
            endpoint={endpoint}
            indexOfOwner={indexOfOwner}
            callback={handleSelectChannel}
          />
        )}
        <Text
          fontSize={{ base: "30px", lg: "40px" }}
          lineHeight={{ base: "60px", lg: "80px" }}
          textAlign="center"
          fontFamily="LoRes15"
        >
          non-fungible clips
        </Text>
        <Text fontSize={"24px"} className="gradient-text" textAlign="center">
          catch up on recent unlonely streams
        </Text>
        {!nfcs || loadingNFCs ? (
          <Flex
            direction="row"
            overflowX="scroll"
            overflowY="clip"
            width="100%"
            height="18rem"
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <NfcCardSkeleton key={i} />
            ))}
          </Flex>
        ) : (
          <NfcList nfcs={nfcs} />
        )}
        <Flex
          justifyContent={"space-between"}
          my="6"
          direction={["column", "row", "row", "row"]}
        >
          <Stack direction="row" spacing={["3", "8", "10", "16"]}>
            <Link
              href="https://www.unlonely.app/privacy"
              passHref
              target="_blank"
            >
              <Text fontFamily="LoRes15">privacy</Text>
            </Link>
            <Link
              href="https://super-okra-6ad.notion.site/Unlonely-Terms-of-Service-b3c0ea0272c943e98e3120243955cd75?pvs=4"
              passHref
              target="_blank"
            >
              <Text fontFamily="LoRes15">terms</Text>
            </Link>
            <Link href="https://bit.ly/unlonelyFAQs" passHref target="_blank">
              <Text fontFamily="LoRes15">about</Text>
            </Link>
          </Stack>
          <Stack direction="row" spacing={["3", "8", "10", "16"]}>
            <Link
              href="https://twitter.com/unlonely_app"
              passHref
              target="_blank"
            >
              <Text fontFamily="LoRes15">twitter</Text>
            </Link>
            <Link href="https://warpcast.com/unlonely" passHref target="_blank">
              <Text fontFamily="LoRes15">farcaster</Text>
            </Link>
            <Link
              href="https://t.me/+IE_BA-tyLIA5MzZh"
              passHref
              target="_blank"
            >
              <Text fontFamily="LoRes15">telegram</Text>
            </Link>
          </Stack>
        </Flex>
      </Flex>
    </>
  );
};

function DesktopPage({
  dataChannels,
  loading,
  error,
}: {
  dataChannels: any;
  loading: boolean;
  error?: ApolloError;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);

  const [directingToChannel, setDirectingToChannel] = useState<boolean>(false);

  const channels = dataChannels;

  const sideBarBreakpoints = useBreakpointValue({
    base: false,
    sm: false,
    md: true,
    xl: true,
  });

  return (
    <AppLayout isCustomHeader={false}>
      {!directingToChannel ? (
        <Flex
          direction="column"
          justifyContent="center"
          width="100vw"
          gap={"10px"}
          pb="10px"
        >
          <Drawer
            size={"full"}
            isOpen={isOpen}
            placement="right"
            onClose={onClose}
            finalFocusRef={btnRef}
          >
            <DrawerOverlay />
            <DrawerContent bg="#19162F">
              <DrawerCloseButton />
              <DrawerHeader bg="#19162F">schedule</DrawerHeader>
              <FixedComponent />
            </DrawerContent>
          </Drawer>
          <Flex direction="column" gap={5}>
            {/* <HeroBanner /> */}
            {!sideBarBreakpoints && !loading && (
              <Flex justifyContent={"center"}>
                <Button
                  color="white"
                  ref={btnRef}
                  onClick={onOpen}
                  bg="#CB520E"
                  _hover={{}}
                  _focus={{}}
                  _active={{}}
                  borderRadius="25px"
                >
                  see schedule
                </Button>
              </Flex>
            )}
            {error ? (
              <Flex
                alignItems={"center"}
                justifyContent={"center"}
                width="100%"
                fontSize={"30px"}
                gap="15px"
                my="2rem"
              >
                <Text fontFamily={"LoRes15"}>
                  an error has occurred when fetching channels
                </Text>
              </Flex>
            ) : !channels || loading ? (
              <Flex
                alignItems={"center"}
                justifyContent={"center"}
                width="100%"
                fontSize={"30px"}
                gap="15px"
                my="3rem"
              >
                <WavyText text="loading streams..." />
              </Flex>
            ) : (
              <LiveChannelList
                channels={channels}
                callback={() => setDirectingToChannel(true)}
              />
            )}
          </Flex>
          <Flex p="16px">
            <Box
              width={{
                base: "100%",
                md: "70%",
                xl: "70%",
              }}
            >
              <Container
                overflowY="auto"
                centerContent
                maxWidth={"100%"}
                gap="1rem"
              >
                <ScrollableComponent
                  channels={channels}
                  loading={loading}
                  callback={() => setDirectingToChannel(true)}
                />
              </Container>
            </Box>
            {sideBarBreakpoints && (
              <Box
                width={{
                  base: "0%",
                  md: "30%",
                  xl: "30%",
                }}
              >
                <Container height="100%">
                  <FixedComponent />
                </Container>
              </Box>
            )}
          </Flex>
        </Flex>
      ) : (
        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          width="100%"
          height="calc(100vh - 64px)"
          fontSize="50px"
        >
          <WavyText text="loading..." />
        </Flex>
      )}
    </AppLayout>
  );
}

function MobilePage({
  dataChannels,
  loading,
  error,
}: {
  dataChannels: any;
  loading: boolean;
  error?: ApolloError;
}) {
  const { initialNotificationsGranted } = useUser();
  const router = useRouter();
  const scrollRef = useRef<VirtuosoHandle>(null);

  const [loadingPage, setLoadingPage] = useState<boolean>(false);
  const [endpoint, setEndpoint] = useState<string>("");
  const [sortedChannels, setSortedChannels] = useState<Channel[]>([]);

  const [getSubscription, { data: subscriptionData }] =
    useLazyQuery<GetSubscriptionQuery>(GET_SUBSCRIPTION, {
      fetchPolicy: "network-only",
    });

  const channels: Channel[] = dataChannels;

  const suggestedChannels = useMemo(
    () => subscriptionData?.getSubscriptionByEndpoint?.allowedChannels,
    [subscriptionData]
  );

  const handleSelectChannel = useCallback((slug: string) => {
    setLoadingPage(true);
    router.push(`/channels/${slug}`);
  }, []);

  const { addChannelToSubscription } = useAddChannelToSubscription({
    onError: () => {
      console.error("Failed to add channel to subscription.");
    },
  });

  const { removeChannelFromSubscription } = useRemoveChannelFromSubscription({
    onError: () => {
      console.error("Failed to remove channel from subscription.");
    },
  });

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
    const liveChannels = channels.filter((channel) => channel.isLive);
    const _suggestedNonLiveChannels = suggestedChannels
      ? channels.filter(
          (channel) =>
            suggestedChannels?.includes(String(channel.id)) && !channel.isLive
        )
      : [];
    const otherChannels = suggestedChannels
      ? channels.filter(
          (channel) =>
            !suggestedChannels?.includes(String(channel.id)) && !channel.isLive
        )
      : channels.filter((channel) => !channel.isLive);
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
  }, [channels, suggestedChannels]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const debounceDelay = 200; // milliseconds

  const filteredChannels = useMemo(() => {
    return sortedChannels?.filter((c) =>
      debouncedSearch.length > 0
        ? (c.owner.username ?? c.owner.address).includes(debouncedSearch)
        : c
    );
  }, [sortedChannels, debouncedSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, debounceDelay);

    return () => {
      clearTimeout(handler);
    };
  }, [search, debounceDelay]);

  return (
    <AppLayout isCustomHeader={false}>
      {!loadingPage && !loading ? (
        <>
          <Flex
            direction="column"
            justifyContent="center"
            width="100vw"
            position="relative"
            height="100%"
          >
            <IconButton
              color="white"
              position="absolute"
              aria-label="refresh"
              icon={<BiRefresh size="20px" />}
              bg="rgb(0, 0, 0, 0.5)"
              onClick={() => window?.location?.reload()}
              _hover={{}}
              _focus={{}}
              _active={{}}
              borderWidth="1px"
              zIndex="1"
              borderRadius={"50%"}
              right="1rem"
              bottom="1rem"
            />
            <Input
              variant="glow"
              placeholder="search for a streamer"
              width={"100%"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              position={filteredChannels.length === 0 ? "absolute" : undefined}
              top={filteredChannels.length === 0 ? "0" : undefined}
            />
            {error ? (
              <Text
                textAlign={"center"}
                fontFamily={"LoRes15"}
                fontSize={"25px"}
              >
                an error has occurred when fetching channels
              </Text>
            ) : filteredChannels && filteredChannels.length > 0 ? (
              <Virtuoso
                followOutput={"auto"}
                ref={scrollRef}
                data={filteredChannels}
                totalCount={filteredChannels.length}
                initialTopMostItemIndex={0}
                itemContent={(index, data) => (
                  <SelectableChannel
                    key={data.id || index}
                    subscribed={
                      suggestedChannels?.includes(String(data.id)) ?? false
                    }
                    channel={data}
                    addChannelToSubscription={addChannelToSubscription}
                    removeChannelFromSubscription={
                      removeChannelFromSubscription
                    }
                    handleGetSubscription={handleGetSubscription}
                    endpoint={endpoint}
                    callback={handleSelectChannel}
                  />
                )}
              />
            ) : (
              <Text
                textAlign={"center"}
                fontFamily={"LoRes15"}
                fontSize={"25px"}
              >
                Could not fetch channels, please try again later
              </Text>
            )}
          </Flex>
        </>
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
    </AppLayout>
  );
}

export default function Page() {
  const { channelFeed, feedLoading, feedError } = useCacheContext();

  const { isStandalone, ready } = useUserAgent();

  if (feedError) console.error("channel feed query error:", feedError);

  return (
    <>
      {ready ? (
        <>
          {!isStandalone ? (
            <DesktopPage
              dataChannels={channelFeed}
              loading={feedLoading}
              error={feedError}
            />
          ) : (
            <MobilePage
              dataChannels={channelFeed}
              loading={feedLoading}
              error={feedError}
            />
          )}
        </>
      ) : (
        <AppLayout isCustomHeader={false}>
          <Spinner />
        </AppLayout>
      )}
    </>
  );
}
