import { gql, useQuery } from "@apollo/client";
import { Text, Flex, Button, SimpleGrid } from "@chakra-ui/react";

import HostEventCardSkeleton from "../components/hostEvents/HostEventCardSkeleton";
import HostEventList from "../components/hostEvents/HostEventList";
import AppLayout from "../components/layout/AppLayout";
import NfcCardSkeleton from "../components/NFCs/NfcCardSkeleton";
import NfcList from "../components/NFCs/NfcList";

const HOSTEVENT_FEED_QUERY = gql`
  query HostEventFeed($data: HostEventFeedInput!) {
    getHostEventFeed(data: $data) {
      id
      hostDate
      title
      description
      score
      owner {
        username
        FCImageUrl
      }
      liked
      disliked
      challenge {
        id
        hostDate
        title
        description
        score
        owner {
          username
          FCImageUrl
        }
        liked
        disliked
      }
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
  const { data, loading, error } = useQuery(HOSTEVENT_FEED_QUERY, {
    variables: {
      data: {
        limit: 9,
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

  const hostEvents = data?.getHostEventFeed;
  const nfcs = dataNFCs?.getNFCFeed;

  return (
    <AppLayout isCustomHeader={false}>
      <Flex justifyContent="center">
        <Flex
          marginTop={{ base: "40px", md: "60px", lg: "100px" }}
          maxW="80%"
          flexDirection="column"
        >
          <Flex w="100%" justifyContent="center">
            <Text
              color="black"
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
                  sm: "18rem",
                  md: "18rem",
                  lg: "18rem",
                }}
              >
                <NfcList nfcs={nfcs} />
              </Flex>
            </>
          )}
          <Flex w="100%" justifyContent="center" mt="10px" mb="20px">
            <SimpleGrid columns={[1]} spacing="40px">
              <Flex w="100%" justifyContent="center">
                <Button
                  variantColor="white"
                  bgGradient="linear(to-r, #d16fce, #7655D2, #4173D6, #4ABBDF)"
                  variant="outline"
                  size="lg"
                  minW="50%"
                  h="50px"
                  borderRadius="20px"
                  mt="10px"
                  mb="10px"
                  pr="10px"
                  pl="10px"
                  color="white"
                  _hover={{ bg: "white", color: "black" }}
                  onClick={() => {
                    window.location.href = "/channels/brian";
                  }}
                >
                  Join Now!
                </Button>
              </Flex>
            </SimpleGrid>
          </Flex>
          {!hostEvents || loading ? (
            <Flex
              width="100%"
              justifyContent="center"
              alignItems="center"
              direction="column"
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <HostEventCardSkeleton />
              ))}
            </Flex>
          ) : (
            <>
              <Flex
                width="100%"
                justifyContent="center"
                alignItems="center"
                direction="column"
              >
                <HostEventList hostEvents={hostEvents} />
              </Flex>
            </>
          )}
        </Flex>
      </Flex>
    </AppLayout>
  );
}
