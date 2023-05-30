import { gql, useQuery } from "@apollo/client";
import { Text, Flex } from "@chakra-ui/react";

import AppLayout from "../components/layout/AppLayout";
import NfcCardSkeleton from "../components/NFCs/NfcCardSkeleton";
import NfcList from "../components/NFCs/NfcList";
import ChannelList from "../components/channels/ChannelList";
import LiveChannelList from "../components/channels/LiveChannelList";

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

export default function Page() {
  const { data, loading, error } = useQuery(CHANNEL_FEED_QUERY, {
    variables: {
      data: {
        limit: 10,
        orderBy: null,
      },
    },
  });

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

  const channels = data?.getChannelFeed;
  const nfcs = dataNFCs?.getNFCFeed;

  return (
    <AppLayout isCustomHeader={false}>
      <Flex justifyContent="center">
        <Flex
          marginTop={{ base: "40px", md: "60px", lg: "100px" }}
          maxW="80%"
          flexDirection="column"
        >
          {!channels || loading ? null : (
            <>
              <LiveChannelList channels={channels} />
            </>
          )}
          <Flex w="100%" justifyContent="center">
            <Text
              fontSize={{ base: "20px", md: "30px", lg: "40px" }}
              lineHeight={{ base: "40px", md: "60px", lg: "80px" }}
              fontWeight="bold"
              textAlign="center"
            >
              Non-Fungible Clips from Unlonely Streams
            </Text>
          </Flex>
          {!nfcs || loadingNFCs ? (
            <Flex
              direction="row"
              overflowX="scroll"
              overflowY="clip"
              width="100%"
              height="18rem"
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <NfcCardSkeleton />
              ))}
            </Flex>
          ) : (
            <>
              <Flex
                direction="row"
                overflowX="scroll"
                overflowY="clip"
                width="100%"
                height={{
                  base: "14rem",
                  sm: "19rem",
                  md: "19rem",
                  lg: "19rem",
                }}
              >
                <NfcList nfcs={nfcs} />
              </Flex>
            </>
          )}
          <Flex w="100%" justifyContent="center" mt="3rem">
            <Text
              fontSize={{ base: "20px", md: "30px", lg: "40px" }}
              lineHeight={{ base: "40px", md: "60px", lg: "80px" }}
              fontWeight="bold"
              textAlign="left"
            >
              All Unlonely Channels
            </Text>
          </Flex>
          <Flex
            direction="row"
            overflowX="scroll"
            overflowY="clip"
            width="100%"
            height={{
              base: "14rem",
              sm: "19rem",
              md: "19rem",
              lg: "19rem",
            }}
          >
            <ChannelList channels={channels} />
          </Flex>
        </Flex>
      </Flex>
    </AppLayout>
  );
}
