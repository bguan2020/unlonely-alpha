import { gql, useQuery } from "@apollo/client";
import React, { useState, useEffect } from "react";
import { Text, Flex, Grid, GridItem, Box, Button } from "@chakra-ui/react";
import { useAccount } from "wagmi";

import AppLayout from "../../components/layout/AppLayout";
import VideoSort, { VideoAttribute } from "../../components/video/VideoSort";
import { getEnsName } from "../../utils/ens";
import centerEllipses from "../../utils/centerEllipses";
import { VideoCard_VideoFragment } from "../../generated/graphql";
import AblyChatComponent from "../../components/chat/AblyChataComponent";
import NextStreamTimer from "../../components/video/NextStreamTimer";
import AddVideoModal from "../../components/video/AddVideoModal";

const VIDEO_LIST_QUERY = gql`
  query VideoFeed($data: VideoFeedInput!) {
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

const Example: React.FunctionComponent<Props> = ({
  videos,
  loading,
}) => {
  const [sortVideoAs, setSortVideoAs] = useState<VideoAttribute>("score");
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
          id="xeedev-chat-div"
        >
          <Flex
            justifyContent="center"
            direction="column"
            bg="black"
            pb="10px"
            pt="10px"
          >
            <Box bg="black" margin="auto" >
              <Text fontWeight={"bold"} fontSize="20px" color="white">
                The Chat Room!
              </Text>
            </Box>
          </Flex>
          <AblyChatComponent username={username}/>
        </GridItem>
        <GridItem rowSpan={3} colSpan={1}></GridItem>
        <GridItem rowSpan={2} colSpan={1}></GridItem>
        <GridItem rowSpan={1} colSpan={1} mb="20px" mr="20px">
          <NextStreamTimer />
        </GridItem>
        <Button onClick={toggleChatVideos} id="xeedev-poaav">Pick or Add a video</Button>
        <GridItem rowSpan={1} colSpan={1} mr="20px" id="xeedev-video-modal" className="xeedev-class-hide">
          <Flex
            margin="auto"
            maxW={{ base: "100%", sm: "533px", md: "711px", lg: "889px" }}
            justifyContent="left"
            overflowX="auto"
            maxH="400px"
            mb="10px"
          >
            <AddVideoModal />
          </Flex>
          {loading && (
            <Box h="20px">{"updating videos..."}</Box>
          )}
          <Flex
            margin="auto"
            maxW={{ base: "100%", sm: "533px", md: "711px", lg: "889px" }}
            justifyContent="center"
            backgroundColor="rgba(0,0,0,0.2)"
            overflowX="auto"
            maxH="400px"
            height="400px"
          >
            <VideoSort videos={videos} sort={sortVideoAs} />
          </Flex>
        </GridItem>
      </Grid>
    </>
  );
};

const toggleChatVideos = function(){
  document.getElementById("xeedev-video-modal")?.classList.toggle("xeedev-class-block");
  document.getElementById("xeedev-chat-div")?.classList.toggle("xeedev-class-hide"); 

  const poaav = document.getElementById("xeedev-poaav");
  if(poaav?.innerHTML === "Pick or Add a video"){
    poaav.innerHTML = "Go back to chat";
  }else if(poaav?.innerHTML === "Go back to chat"){
    poaav.innerHTML = "Pick or Add a video";
  }

}

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
