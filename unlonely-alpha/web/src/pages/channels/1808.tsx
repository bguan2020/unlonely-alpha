import { gql, useQuery } from "@apollo/client";
import React, { useState, useEffect } from "react";
import { Text, Flex, Grid, GridItem, Box, Spinner } from "@chakra-ui/react";
import { useAccount, useEnsName } from "wagmi";

import AppLayout from "../../components/layout/AppLayout";
import VideoSort, { VideoAttribute } from "../../components/video/VideoSort";
import centerEllipses from "../../utils/centerEllipses";
import { VideoCard_VideoFragment } from "../../generated/graphql";
import AblyChatComponent from "../../components/chat/ChatComponent";
import { ChatBot } from "../../constants/types";
import { useUser } from "../../hooks/useUser";
import useScript from "../../hooks/useScript";
import IVSPlayer from "../../components/stream/IVSPlayer";

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

const brianPlaybackUrl =
  "https://0ef8576db087.us-west-2.playback.live-video.net/api/video/v1/us-west-2.500434899882.channel.8e2oKm7LXNGq.m3u8";

const Example: React.FunctionComponent<Props> = ({ videos, loading }) => {
  const { user } = useUser();
  const [sortVideoAs, setSortVideoAs] = useState<VideoAttribute>("score");
  const [chatBot, setChatBot] = useState<ChatBot[]>([]);
  const [username, setUsername] = useState<string | null>();
  const accountData = useAccount();
  const { loading: scriptLoading, error } = useScript({
    src: "https://player.live-video.net/1.2.0/amazon-ivs-videojs-tech.min.js",
  });
  // Load IVS quality plugin
  const { loading: loadingPlugin, error: pluginError } = useScript({
    src: "https://player.live-video.net/1.2.0/amazon-ivs-quality-plugin.min.js",
  });

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

  if (scriptLoading || loadingPlugin) {
    return (
      <>
        <Spinner />
      </>
    );
  }

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
          <AblyChatComponent
            tokenContractAddress=""
            username={username}
            chatBot={chatBot}
            user={user}
            channelArn="arn:aws:ivs:us-west-2:500434899882:channel/8e2oKm7LXNGq"
            channelId={3}
            allowNFCs={true}
          />
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
            <IVSPlayer isTheatreMode={false} playbackUrl={brianPlaybackUrl} />
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
          ></Flex>
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
    <AppLayout error={error} isCustomHeader={false}>
      <Example videos={videos} loading={loading} />
    </AppLayout>
  );
}

// export async function getStaticProps() {
//   const API_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

//   return { props: {} };
// }
