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
} from "@chakra-ui/react";
import Link from "next/link";
import { useState, useRef } from "react";

import AppLayout from "../components/layout/AppLayout";
import NfcCardSkeleton from "../components/NFCs/NfcCardSkeleton";
import NfcList from "../components/NFCs/NfcList";
import LiveChannelList from "../components/channels/LiveChannelList";
import HeroBanner from "../components/layout/HeroBanner";
import TokenLeaderboard from "../components/arcade/TokenLeaderboard";
import { isIosDevice } from "../components/mobile/Banner";
import { WavyText } from "../components/general/WavyText";
import { useUser } from "../hooks/context/useUser";

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

const NFC_FEED_QUERY = gql`
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
  } = useQuery(NFC_FEED_QUERY, {
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
          <Link
            href={
              isIosDevice()
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

export default function Page() {
  const { user } = useUser();
  console.log(user);
  const { data, loading } = useQuery(CHANNEL_FEED_QUERY, {
    variables: {
      data: {
        limit: 10,
        orderBy: null,
      },
    },
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);

  const [directingToChannel, setDirectingToChannel] = useState<boolean>(false);

  const channels = data?.getChannelFeed;

  const sideBarBreakpoints = useBreakpointValue({
    base: false,
    sm: false,
    md: true,
    xl: true,
  });

  const handleMobileNotifications = async () => {
    console.log("hit this");
    if (user && "serviceWorker" in navigator && "Notification" in window) {
      try {
        const registration = await navigator.serviceWorker.register("sw.js", {
          scope: "./",
        });
  
        if (Notification.permission === "default") {
          const result = await Notification.requestPermission();
          // tslint:disable-next-line:no-console
          console.log(result);
  
          if (result === "granted") {
            // tslint:disable-next-line:no-console
            console.log("Notification permission granted")
            await registration.showNotification("Hello World", {
              body: "My first notification on iOS",
            });
          }
        }
        // If permission is "denied", you can handle it as needed. For example, showing some UI/UX elements guiding the user on how to enable notifications from browser settings.
        // If permission is "granted", it means the user has already enabled notifications.
      } catch (error) {
        console.error(
          "Error registering service worker or requesting permission:",
          error
        );
      }
    }
    console.log(user, "user", "serviceWorker" in navigator, "Notification" in window)
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
                  notifications
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
