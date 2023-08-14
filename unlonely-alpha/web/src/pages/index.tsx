import { gql, useQuery } from "@apollo/client";
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
} from "@chakra-ui/react";
import Link from "next/link";
import { useState, useRef, useMemo } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";

import AppLayout from "../components/layout/AppLayout";
import NfcCardSkeleton from "../components/NFCs/NfcCardSkeleton";
import NfcList from "../components/NFCs/NfcList";
import LiveChannelList from "../components/channels/LiveChannelList";
import HeroBanner from "../components/layout/HeroBanner";
import TokenLeaderboard from "../components/arcade/TokenLeaderboard";
import { WavyText } from "../components/general/WavyText";
import useUserAgent from "../hooks/internal/useUserAgent";
import { Channel, NfcFeedQuery } from "../generated/graphql";
import { SelectableChannel } from "../components/mobile/SelectableChannel";
import { useUser } from "../hooks/context/useUser";
import usePostSubscription from "../hooks/server/usePostSubscription";

const CHANNEL_FEED_QUERY = gql`
  query GetChannelFeed {
    getChannelFeed {
      id
      isLive
      name
      description
      slug
      owner {
        username
        address
        FCImageUrl
        lensImageUrl
      }
      thumbnailUrl
    }
  }
`;

export const NFC_FEED_QUERY = gql`
  query NFCFeed($data: NFCFeedInput!) {
    getNFCFeed(data: $data) {
      createdAt
      id
      videoLink
      videoThumbnail
      openseaLink
      score
      liked
      owner {
        username
        address
        FCImageUrl
        powerUserLvl
        videoSavantLvl
      }
      title
    }
  }
`;

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
  const { isIOS } = useUserAgent();

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
          <Link
            href={
              isIOS
                ? "https://testflight.apple.com/join/z4PpYxXz"
                : "https://dub.sh/unlonely-android"
            }
            passHref
            target="_blank"
          >
            <Text fontFamily="Neue Pixel Sans">download for mobile</Text>
          </Link>
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
  const { user } = useUser();
  const [error, setError] = useState<string>("notify");
  const { postSubscription } = usePostSubscription({
    onError: () => {
      console.error("Failed to save subscription to server.");
    },
  });

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

  const handleMobileNotifications = async () => {
    console.log("hit this");
    setError("hit function");
    if (user && "serviceWorker" in navigator && "Notification" in window) {
      setError("hit function + sw and notification found");
      try {
        const registration = await navigator.serviceWorker.register(
          "serviceworker.js",
          {
            scope: "./",
          }
        );
        setError("hit function + sw and notification found + registered");

        setError(`notification ${Notification.permission}`);
        if (Notification.permission === "default") {
          setError(`notification ${Notification.permission}`);

          // add 2 second delay to make sure service worker is ready
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const result = await window.Notification.requestPermission();

          setError("requested permission");
          if (result === "granted") {
            console.log("Notification permission granted");
            await registration.showNotification("Welcome to Unlonely", {
              body: "Excited to have you here!",
            });

            // Here's where you send the subscription to your server
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            });
            const subscriptionJSON = subscription.toJSON();
            console.log("subscription", subscription.toJSON());
            if (subscriptionJSON) {
              postSubscription({
                endpoint: subscriptionJSON.endpoint,
                expirationTime: null,
                p256dh: subscriptionJSON.keys?.p256dh,
                auth: subscriptionJSON.keys?.auth,
              });
            } else {
              console.error("Failed to get subscription from service worker.");
            }
          }
        }
        // If permission is "denied", you can handle it as needed. For example, showing some UI/UX elements guiding the user on how to enable notifications from browser settings.
        // If permission is "granted", it means the user has already enabled notifications.
        if (Notification.permission === "denied") {
          setError(
            "hit function + sw and notification found + registered + denied"
          );
          // tslint:disable-next-line:no-console
          console.log("Notification permission denied");
        }
        if (Notification.permission === "granted") {
          setError(
            "hit function + sw and notification found + registered + granted"
          );
          // tslint:disable-next-line:no-console
          console.log("Notification permission granted");
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          });
          console.log("subscription", subscription.toJSON());
          const subscriptionJSON = subscription.toJSON();
          if (subscriptionJSON) {
            postSubscription({
              endpoint: subscriptionJSON.endpoint,
              expirationTime: null,
              p256dh: subscriptionJSON.keys?.p256dh,
              auth: subscriptionJSON.keys?.auth,
            });
          } else {
            console.error("Failed to get subscription from service worker.");
          }
        }
      } catch (error) {
        console.error(
          "Error registering service worker or requesting permission:",
          error
        );
        console.log("error", error);
      }
    }
    console.log(
      user,
      "user",
      "serviceWorker" in navigator,
      "Notification" in window
    );
  };

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
                <Button
                  onClick={handleMobileNotifications}
                  bg="#CB520E"
                  _hover={{}}
                  _focus={{}}
                  _active={{}}
                  borderRadius="25px"
                >
                  {error}
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
                <Container height="100vh">
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
  const scrollRef = useRef<VirtuosoHandle>(null);

  const [loadingPage, setLoadingPage] = useState<boolean>(false);

  const channels: Channel[] = dataChannels?.getChannelFeed;

  const channelsWithLiveFirst = useMemo(
    () =>
      channels && channels.length > 0
        ? [...channels].sort((a, b) => {
            if (a.isLive && !b.isLive) {
              return -1;
            } else if (!a.isLive && b.isLive) {
              return 1;
            } else {
              return 0;
            }
          })
        : [],
    [channels]
  );

  return (
    <AppLayout isCustomHeader={false}>
      {!loadingPage && !loading ? (
        <Flex
          direction="column"
          justifyContent="center"
          width="100vw"
          position="relative"
          height="100%"
        >
          {channelsWithLiveFirst.length > 0 && (
            <Virtuoso
              followOutput={"auto"}
              ref={scrollRef}
              data={channelsWithLiveFirst}
              totalCount={channelsWithLiveFirst.length}
              initialTopMostItemIndex={0}
              itemContent={(index, data) => (
                <SelectableChannel key={data.id || index} channel={data} />
              )}
            />
          )}
        </Flex>
      ) : (
        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          direction="column"
          width="100%"
          height="calc(100vh - 98px)"
          fontSize="50px"
        >
          <Image src="/icons/icon-192x192.png" borderRadius="10px" />
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
      data: {
        limit: 10,
        orderBy: null,
      },
    },
  });

  const { isStandalone } = useUserAgent();

  return (
    <>
      {isStandalone ? (
        <DesktopPage dataChannels={dataChannels} loading={loading} />
      ) : (
        <MobilePage dataChannels={dataChannels} loading={loading} />
      )}
    </>
  );
}
