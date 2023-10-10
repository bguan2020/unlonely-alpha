import { useLazyQuery, useQuery } from "@apollo/client";
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
} from "@chakra-ui/react";
import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { useRouter } from "next/router";
import { BiRefresh } from "react-icons/bi";

import AppLayout from "../components/layout/AppLayout";
import NfcCardSkeleton from "../components/NFCs/NfcCardSkeleton";
import NfcList from "../components/NFCs/NfcList";
import LiveChannelList from "../components/channels/LiveChannelList";
import HeroBanner from "../components/layout/HeroBanner";
import TokenLeaderboard from "../components/arcade/TokenLeaderboard";
import { WavyText } from "../components/general/WavyText";
import useUserAgent from "../hooks/internal/useUserAgent";
import {
  Channel,
  GetSubscriptionQuery,
  NfcFeedQuery,
} from "../generated/graphql";
import { SelectableChannel } from "../components/mobile/SelectableChannel";
import {
  CHANNEL_FEED_QUERY,
  GET_SUBSCRIPTION,
  NFC_FEED_QUERY,
} from "../constants/queries";
import useAddChannelToSubscription from "../hooks/server/useAddChannelToSubscription";
import useRemoveChannelFromSubscription from "../hooks/server/useRemoveChannelFromSubscription";
import { useUser } from "../hooks/context/useUser";
import { sortChannels } from "../utils/channelSort";

const FixedComponent = () => {
  return (
    <Flex
      borderWidth="1px"
      borderRadius={"10px"}
      bg={
        "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
      }
      height="100%"
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

const ScrollableComponent = ({ callback }: { callback?: () => void }) => {
  const {
    data: dataNFCs,
    loading: loadingNFCs,
    error: errorNFCs,
  } = useQuery<NfcFeedQuery>(NFC_FEED_QUERY, {
    variables: {
      data: {
        limit: 30,
        orderBy: "createdAt",
      },
    },
  });

  const nfcs = dataNFCs?.getNFCFeed;

  return (
    <>
      <TokenLeaderboard callback={callback} />
      <Flex direction="column" width="100%">
        <Text
          fontSize={{ base: "30px", lg: "40px" }}
          lineHeight={{ base: "60px", lg: "80px" }}
          textAlign="center"
          fontFamily="Neue Pixel Sans"
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
              href="https://twitter.com/unlonely_app"
              passHref
              target="_blank"
            >
              <Text fontFamily="Neue Pixel Sans">twitter</Text>
            </Link>
            <Link href="https://warpcast.com/unlonely" passHref target="_blank">
              <Text fontFamily="Neue Pixel Sans">farcaster</Text>
            </Link>
            <Link
              href="https://t.me/+IE_BA-tyLIA5MzZh"
              passHref
              target="_blank"
            >
              <Text fontFamily="Neue Pixel Sans">telegram</Text>
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
}: {
  dataChannels: any;
  loading: boolean;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);

  const [directingToChannel, setDirectingToChannel] = useState<boolean>(false);

  const channels = dataChannels?.getChannelFeed;

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
            <HeroBanner />
            {!sideBarBreakpoints && !loading && (
              <Flex justifyContent={"center"}>
                <Button
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
            {!channels || loading ? (
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
}: {
  dataChannels: any;
  loading: boolean;
}) {
  const { initialNotificationsGranted } = useUser();
  const router = useRouter();
  const scrollRef = useRef<VirtuosoHandle>(null);

  const [loadingPage, setLoadingPage] = useState<boolean>(false);
  const [endpoint, setEndpoint] = useState<string>("");
  const [sortedChannels, setSortedChannels] = useState<Channel[]>([]);
  const [isSorted, setIsSorted] = useState<boolean>(false);

  const [getSubscription, { data: subscriptionData }] =
    useLazyQuery<GetSubscriptionQuery>(GET_SUBSCRIPTION, {
      fetchPolicy: "network-only",
    });

  const channels: Channel[] = dataChannels?.getChannelFeed;

  const suggestedChannels =
    subscriptionData?.getSubscriptionByEndpoint?.allowedChannels;

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
            {sortedChannels && sortedChannels.length > 0 ? (
              <Virtuoso
                followOutput={"auto"}
                ref={scrollRef}
                data={sortedChannels}
                totalCount={sortedChannels.length}
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
                fontFamily={"Neue Pixel Sans"}
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
  const { data: dataChannels, loading } = useQuery(CHANNEL_FEED_QUERY, {
    variables: {
      data: {},
    },
  });

  const { isStandalone, ready } = useUserAgent();

  return (
    <>
      {ready ? (
        <>
          {!isStandalone ? (
            <DesktopPage dataChannels={dataChannels} loading={loading} />
          ) : (
            <MobilePage dataChannels={dataChannels} loading={loading} />
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
