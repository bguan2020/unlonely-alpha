import { gql, useQuery } from "@apollo/client";
import { Box, Container, Flex, Hide, Text } from "@chakra-ui/react";

import AppLayout from "../components/layout/AppLayout";
import NfcCardSkeleton from "../components/NFCs/NfcCardSkeleton";
import NfcList from "../components/NFCs/NfcList";
import LiveChannelList from "../components/channels/LiveChannelList";
import HeroBanner from "../components/layout/HeroBanner";
import AblyChatComponent from "../components/chat/ChatComponent";
import { useUser } from "../hooks/useUser";
import { useState, useEffect } from "react";
import { useAccount, useEnsName } from "wagmi";
import centerEllipses from "../utils/centerEllipses";
import TokenLeaderboard from "../components/arcade/TokenLeaderboard";
import { Channel } from "../generated/graphql";

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
  const [username, setUsername] = useState<string | null>();
  const accountData = useAccount();

  const { user } = useUser();
  const { data: ensData } = useEnsName({
    address: accountData?.address,
  });

  useEffect(() => {
    const fetchEns = async () => {
      if (accountData?.address) {
        const username = ensData ?? centerEllipses(accountData.address, 9);
        setUsername(username);
      }
    };

    fetchEns();
  }, [accountData?.address, ensData]);

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
      <AblyChatComponent
        username={username}
        chatBot={[]}
        user={user}
        ablyChatChannel={"home-page-chat"}
        ablyPresenceChannel={"home-page-presence"}
        channelArn={""}
        channelId={3}
        allowNFCs={false}
      />
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
        ranked
        headers={[
          "rank",
          "token name",
          "price (ETH)",
          "# hodlers",
          "channel owner",
        ]}
        dataset={[
          { data: ["$BRIAN", "0.0005", "50", "br1an.eth"] },
          { data: ["$H3IDI", "n/a", "n/a", "h3idi.eth"], obscureText: true },
          { data: ["$SIRSU", "n/a", "n/a", "sirsu.eth"], obscureText: true },
          { data: ["$GRACE", "n/a", "n/a", "0eggs.eth"], obscureText: true },
          { data: ["$SAM", "n/a", "n/a", "samchai.eth"], obscureText: true },
          {
            data: ["$CASSIE", "n/a", "n/a", "cassieheart.eth"],
            obscureText: true,
          },
          { data: ["$KATY", "n/a", "n/a", "katy.eth"], obscureText: true },
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
              <NfcCardSkeleton />
            ))}
          </Flex>
        ) : (
          <NfcList nfcs={nfcs} />
        )}
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

  return (
    <AppLayout isCustomHeader={false}>
      <Flex>
        <Flex
          direction="column"
          justifyContent="center"
          width="100vw"
          gap={10}
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
          <Flex>
            <Box
              width={{
                base: "100%",
                md: "70%",
                xl: "70%",
              }}
            >
              <Container
                overflowY="auto"
                maxHeight={"98vh"}
                centerContent
                maxWidth={"100%"}
                px={10}
              >
                <ScrollableComponent channels={channels} />
              </Container>
            </Box>
            <Hide below="md">
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
            </Hide>
          </Flex>
          {/* <Flex
          marginTop={{ base: "40px", md: "60px", lg: "100px" }}
          maxW="80%"
          flexDirection="column"
        >
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
        </Flex> */}
        </Flex>
      </Flex>
    </AppLayout>
  );
}
