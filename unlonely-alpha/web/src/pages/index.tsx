import { ApolloError, useLazyQuery } from "@apollo/client";
import {
  // Box,
  // Button,
  // Container,
  // Drawer,
  // DrawerCloseButton,
  // DrawerContent,
  // DrawerHeader,
  // DrawerOverlay,
  Flex,
  // Stack,
  Text,
  // useBreakpointValue,
  // useDisclosure,
  Image,
  Spinner,
  IconButton,
  Input,
  // useBreakpointValue,
} from "@chakra-ui/react";
// import Link from "next/link";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { useRouter } from "next/router";
import { BiRefresh } from "react-icons/bi";

import AppLayout from "../components/layout/AppLayout";
// import LiveChannelList from "../components/channels/LiveChannelList";
import { WavyText } from "../components/general/WavyText";
import useUserAgent from "../hooks/internal/useUserAgent";
import { Channel, GetSubscriptionQuery } from "../generated/graphql";
import { SelectableChannel } from "../components/mobile/SelectableChannel";
import { GET_SUBSCRIPTION } from "../constants/queries";
import useAddChannelToSubscription from "../hooks/server/useAddChannelToSubscription";
import useRemoveChannelFromSubscription from "../hooks/server/channel/useRemoveChannelFromSubscription";
import { useUser } from "../hooks/context/useUser";
import { sortChannels } from "../utils/channelSort";
import { useCacheContext } from "../hooks/context/useCache";
// import NfcLeaderboard from "../components/leaderboards/NfcLeaderboard";
import Header from "../components/navigation/Header";
import BooEventWrapper from "../components/layout/BooEventWrapper";

// const FixedComponent = ({
//   newHeightPercentage,
// }: {
//   newHeightPercentage?: string;
// }) => {
//   return (
//     <Flex
//       borderWidth="1px"
//       borderRadius={"10px"}
//       bg={
//         "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
//       }
//       height={newHeightPercentage ?? "100%"}
//       boxShadow="0px 4px 16px rgba(208, 234, 53, 0.4)"
//       background={"#19162F"}
//     >
//       <iframe
//         src="https://lu.ma/embed/calendar/cal-i5SksIDn63DmCXs/events?lt=dark"
//         frameBorder="0"
//         width="100%"
//         aria-hidden="false"
//         style={{
//           borderRadius: "10px",
//           borderWidth: "1px",
//         }}
//       />
//     </Flex>
//   );
// };

// const ScrollableComponent = () => {
//   return (
//     <Flex direction="column" width="100%" overflowX={"hidden"} gap="10px">
//       <NfcLeaderboard />
//       <Flex
//         justifyContent={"space-between"}
//         my="6"
//         direction={["column", "row", "row", "row"]}
//       >
//         <Stack direction="row" spacing={["3", "8", "10", "16"]}>
//           <Link
//             href="https://www.unlonely.app/privacy"
//             passHref
//             target="_blank"
//           >
//             <Text fontFamily="LoRes15">privacy</Text>
//           </Link>
//           <Link
//             href="https://super-okra-6ad.notion.site/Unlonely-Terms-of-Service-b3c0ea0272c943e98e3120243955cd75?pvs=4"
//             passHref
//             target="_blank"
//           >
//             <Text fontFamily="LoRes15">terms</Text>
//           </Link>
//           <Link href="https://bit.ly/unlonelyFAQs" passHref target="_blank">
//             <Text fontFamily="LoRes15">about</Text>
//           </Link>
//         </Stack>
//         <Stack direction="row" spacing={["3", "8", "10", "16"]}>
//           <Link
//             href="https://twitter.com/unlonely_app"
//             passHref
//             target="_blank"
//           >
//             <Text fontFamily="LoRes15">twitter</Text>
//           </Link>
//           <Link href="https://warpcast.com/unlonely" passHref target="_blank">
//             <Text fontFamily="LoRes15">farcaster</Text>
//           </Link>
//           <Link href="https://t.me/+IE_BA-tyLIA5MzZh" passHref target="_blank">
//             <Text fontFamily="LoRes15">telegram</Text>
//           </Link>
//         </Stack>
//       </Flex>
//     </Flex>
//   );
// };

function DesktopHomePage({
  dataChannels,
  loading,
  error,
}: {
  dataChannels: any;
  loading: boolean;
  error?: ApolloError;
}) {
  const { isMobile } = useUserAgent();
  // const { isOpen, onOpen, onClose } = useDisclosure();
  // const btnRef = useRef<HTMLButtonElement>(null);

  // const [directingToChannel, setDirectingToChannel] = useState<boolean>(false);

  // const channels = dataChannels;

  // const sideBarBreakpoints = useBreakpointValue({
  //   base: false,
  //   sm: false,
  //   md: true,
  //   xl: true,
  // });

  return (
    <AppLayout isCustomHeader={false} noHeader>
      <Flex
        h="100dvh"
        bg="rgba(5, 0, 31, 1)"
        position={"relative"}
        direction="column"
        overflowY={"hidden"}
      >
        {!isMobile && <Header />}
        <BooEventWrapper />
      </Flex>
      {/* {!directingToChannel ? (
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
                <ScrollableComponent />
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
      )} */}
    </AppLayout>
  );
}

function MobileHomePage({
  dataChannels,
  loading,
  error,
}: {
  dataChannels: any;
  loading: boolean;
  error?: ApolloError;
}) {
  const { isStandalone } = useUserAgent();
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
        ? c.owner.username
            ?.toLowerCase()
            .includes(debouncedSearch?.toLowerCase()) ||
          c.owner.address
            .toLowerCase()
            .includes(debouncedSearch?.toLowerCase()) ||
          c.slug.toLowerCase().includes(debouncedSearch?.toLowerCase())
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
              fontSize={isStandalone ? "16px" : "unset"}
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
            <DesktopHomePage
              dataChannels={channelFeed}
              loading={feedLoading}
              error={feedError}
            />
          ) : (
            <MobileHomePage
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
