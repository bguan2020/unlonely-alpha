import { gql, useQuery } from "@apollo/client";
import {
  Box,
  Container,
  Flex,
  Stack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";

import AppLayout from "../components/layout/AppLayout";
import NfcCardSkeleton from "../components/NFCs/NfcCardSkeleton";
import NfcList from "../components/NFCs/NfcList";
import LiveChannelList from "../components/channels/LiveChannelList";
import HeroBanner from "../components/layout/HeroBanner";
import AblyHomeChatComponent from "../components/chat/HomeChatComponent";
import TokenLeaderboard from "../components/arcade/TokenLeaderboard";
import { Channel } from "../generated/graphql";
import Link from "next/link";
import { isIosDevice } from "../components/mobile/Banner";

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
      px="12px"
      bg={
        "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
      }
      height="100%"
      boxShadow="0px 4px 16px rgba(208, 234, 53, 0.4)"
      background={"#19162F"}
    >
      <AblyHomeChatComponent />
    </Flex>
  );
};

const ScrollableComponent = ({ channels }: { channels: Channel[] }) => {
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
      <TokenLeaderboard
        dataset={[
          {
            data: ["1", "TED", "0.0005", "50000", "tednotlasso.eth"],
            channelLink: "ted",
          },
          {
            data: ["2", "JONNY", "0.0005", "20000", "jonnyringo.eth"],
            channelLink: "jonnyringo",
          },
          {
            data: ["3", "TLDR", "0.0005", "15004", "tldr.eth"],
            channelLink: "tldr",
          },
          {
            data: ["4", "SIRSU", "0.0005", "2370", "sirsu.eth"],
            channelLink: "sirsu",
          },
          {
            data: ["5", "KATY", "0.0005", "978", "katherholt.eth"],
            channelLink: "seam",
          },
          {
            data: ["6", "H3IDI", "0.0005", "140", "h3idi.eth"],
            channelLink: "h3idi",
          },
          {
            data: ["7", "ANTIMO", "0.0005", "12", "antimo.eth"],
            channelLink: "antimo",
          },
          {
            data: ["8", "BRIAN", "0.0005", "11", "br1an.eth"],
            channelLink: "brian",
          },
        ]}
      />
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
            <Link href="https://nf.td/unlonely" passHref target="_blank">
              <Text fontFamily="Neue Pixel Sans">nf.td</Text>
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
            <Text fontFamily="Neue Pixel Sans">download on ios | android</Text>
          </Link>
        </Flex>
      </Flex>
    </>
  );
};

export default function Page() {
  const { data, loading, error } = useQuery(CHANNEL_FEED_QUERY, {
    variables: {
      data: {
        limit: 10,
        orderBy: null,
      },
    },
  });

  const channels = data?.getChannelFeed;

  const chatBoxBreakpoints = useBreakpointValue({
    base: false,
    sm: false,
    md: true,
    xl: true,
  });

  return (
    <AppLayout isCustomHeader={false}>
      <Flex
        direction="column"
        justifyContent="center"
        width="100vw"
        gap={"10px"}
        pb="10px"
      >
        <Flex direction="column" gap={5}>
          <HeroBanner />
          {!channels || loading ? null : (
            <>
              <LiveChannelList channels={channels} />
            </>
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
              <ScrollableComponent channels={channels} />
            </Container>
          </Box>
          {chatBoxBreakpoints && (
            <Box
              width={{
                base: "0%",
                md: "30%",
                xl: "30%",
              }}
            >
              <Container height="98vh">
                <FixedComponent />
              </Container>
            </Box>
          )}
        </Flex>
      </Flex>
    </AppLayout>
  );
}
