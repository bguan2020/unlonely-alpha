import { gql, useQuery } from "@apollo/client";
import React, { useState, useEffect } from "react";
import { Text, Flex, Grid, GridItem, Box, Spinner } from "@chakra-ui/react";
import { useAccount } from "wagmi";

import AppLayout from "../../components/layout/AppLayout";
import VideoSort, { VideoAttribute } from "../../components/video/VideoSort";
import { getEnsName } from "../../utils/ens";
import centerEllipses from "../../utils/centerEllipses";
import { VideoCard_VideoFragment } from "../../generated/graphql";
import AblyChatComponent from "../../components/chat/AblyChataComponent";
import AddVideoModal from "../../components/video/AddVideoModal";
import { ChatBot } from "./youtube";

const VIDEO_LIST_QUERY = gql`
  query VideoFeed1808($data: VideoFeedInput!) {
    getVideoFeed(data: $data) {
      id
      title
      thumbnail
      description
      score
      createdAt
      owner {
        username
        address
      }
      liked
      skipped
    }
  }
`;

type Props = {
  videos: VideoCard_VideoFragment[];
  loading: boolean;
};

const Example: React.FunctionComponent<Props> = ({ videos, loading }) => {
  const [sortVideoAs, setSortVideoAs] = useState<VideoAttribute>("score");
  const [chatBot, setChatBot] = useState<ChatBot[]>([]);
  const [username, setUsername] = useState<string | null>();
  const [{ data: accountData }] = useAccount();

  useEffect(() => {
    const fetchEns = async () => {
      if (accountData?.address) {
        const ens = await getEnsName(accountData.address);
        const username = ens ? ens : centerEllipses(accountData.address, 9);
        setUsername(username);
      }
    };

    fetchEns();
  }, [accountData?.address]);

  return (
    <>
      <Grid
        gridTemplateColumns={"10% 60% 20% 10%"}
        minH="calc(100vh - 48px)"
        mb="20px"
      >
        <GridItem rowSpan={1} colSpan={2}></GridItem>
        <GridItem
          rowSpan={3}
          colSpan={1}
          border="2px"
          mt="10px"
          mb="190px"
          maxH="700px"
        >
          <Flex
            justifyContent="center"
            direction="column"
            bg="black"
            pb="10px"
            pt="10px"
          >
            <Box bg="black" margin="auto">
              <Text fontWeight={"bold"} fontSize="20px" color="white">
                The Chat Room!
              </Text>
            </Box>
          </Flex>
          <AblyChatComponent username={username} chatBot={chatBot} />
        </GridItem>
        <GridItem rowSpan={3} colSpan={1}></GridItem>
        <GridItem rowSpan={2} colSpan={1}></GridItem>
        <GridItem rowSpan={1} colSpan={1} mb="20px" mr="20px">
          <Flex
            flexDirection="row"
            justifyContent="center"
            width="100%"
            height={{ base: "80%", sm: "300px", md: "400px", lg: "500px" }}
            mt="10px"
          >
            <iframe
              src="https://player.castr.com/live_a998cbe00c7a11eda40d672859e3570c"
              width="100%"
              style={{ aspectRatio: "16/9", width: "100%", maxWidth: "889px" }}
              frameBorder="0"
              scrolling="no"
              allow="autoplay"
              allowFullScreen
            />
          </Flex>
        </GridItem>
        <GridItem rowSpan={1} colSpan={1} mr="20px">
          <Flex
            margin="auto"
            maxW={{ base: "100%", sm: "533px", md: "711px", lg: "889px" }}
            justifyContent="left"
            overflowX="auto"
            maxH="400px"
            mb="10px"
          >
            <AddVideoModal chatBot={chatBot} setChatBot={setChatBot} />
          </Flex>
          <Flex
            margin="auto"
            maxW={{ base: "100%", sm: "533px", md: "711px", lg: "889px" }}
            justifyContent="center"
            backgroundColor="rgba(0,0,0,0.2)"
            overflowX="auto"
            maxH="400px"
            height="400px"
          >
            {loading ? (
              <>
                <Spinner size="xl" mt="10px" />
              </>
            ) : (
              <VideoSort videos={videos} sort={sortVideoAs} />
            )}
          </Flex>
        </GridItem>
      </Grid>
    </>
  );
};

export default function Page() {
  const { data, loading, error, networkStatus } = useQuery(VIDEO_LIST_QUERY, {
    variables: {
      data: {
        searchString: null,
        skip: null,
        limit: null,
        orderBy: null,
      },
    },
    notifyOnNetworkStatusChange: true,
    pollInterval: 60000,
  });

  const videos = data?.getVideoFeed;

  return (
    <AppLayout error={error}>
      <Example videos={videos} loading={loading} />
    </AppLayout>
  );
}

// export async function getStaticProps() {
//   const API_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

//   return { props: {} };
// }
