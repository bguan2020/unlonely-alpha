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
import { ChatBot } from "./brian";
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
            username={username}
            chatBot={chatBot}
            user={user}
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
            <IVSPlayer />
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
    <AppLayout error={error}>
      <Example videos={videos} loading={loading} />
    </AppLayout>
  );
}

// export async function getStaticProps() {
//   const API_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

//   return { props: {} };
// }
