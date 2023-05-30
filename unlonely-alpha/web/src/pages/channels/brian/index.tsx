import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Flex,
  Button,
  Stack,
  Container,
  Grid,
  GridItem,
  Box,
} from "@chakra-ui/react";
import { gql, useQuery } from "@apollo/client";
import { useAccount } from "wagmi";
import AppLayout from "../../../components/layout/AppLayout";
import { getEnsName } from "../../../utils/ens";
import centerEllipses from "../../../utils/centerEllipses";
import AblyChatComponent from "../../../components/chat/ChatComponent";
import NextStreamTimer from "../../../components/stream/NextStreamTimer";
import { useUser } from "../../../hooks/useUser";
import { useWindowSize } from "../../../hooks/useWindowSize";
import BuyButton from "../../../components/arcade/BuyButton";
import ControlButton from "../../../components/arcade/ControlButton";
import DiceButton from "../../../components/arcade/DiceButton";
import SwordButton from "../../../components/arcade/SwordButton";
import CoinButton from "../../../components/arcade/CoinButton";
import ChannelDesc from "../../../components/channels/ChannelDesc";
import { GetServerSidePropsContext } from "next";
import { initializeApollo } from "../../../apiClient/client";
import { ChannelDetailQuery } from "../../../generated/graphql";
import ChannelNextHead from "../../../components/layout/ChannelNextHead";

export type ChatBot = {
  username: string;
  address: string;
  taskType: string;
  title: string | null | undefined;
  description: string | null | undefined;
};

type UrlParams = {
  slug: string;
};

const CHANNEL_DETAIL_QUERY = gql`
  query ChannelDetail($slug: String!) {
    getChannelBySlug(slug: $slug) {
      awsId
      channelArn
      description
      id
      name
      slug
      allowNFCs
      owner {
        FCImageUrl
        lensImageUrl
        username
        address
      }
      playbackUrl
    }
  }
`;

const brianPlaybackUrl =
  "https://0ef8576db087.us-west-2.playback.live-video.net/api/video/v1/us-west-2.500434899882.channel.8e2oKm7LXNGq.m3u8";

const channelArn = "arn:aws:ivs:us-west-2:500434899882:channel/8e2oKm7LXNGq";

const awsId = "8e2oKm7LXNGq";

const ChannelDetail = ({
  slug,
  channelData,
}: UrlParams & { channelData: ChannelDetailQuery }) => {
  const { data, loading, error } = useQuery<ChannelDetailQuery>(
    CHANNEL_DETAIL_QUERY,
    {
      variables: {
        slug,
      },
    }
  );

  const channelSSR = useMemo(
    () => channelData?.getChannelBySlug,
    [channelData]
  );
  const channel = useMemo(() => data?.getChannelBySlug, [data]);

  const [width, height] = useWindowSize();
  const { user } = useUser();
  const isOwner = user?.address === channel?.owner.address;

  const [chatBot, setChatBot] = useState<ChatBot[]>([]);
  const [username, setUsername] = useState<string | null>();
  const accountData = useAccount();

  const ablyChatChannel = `${awsId}-chat-channel`;
  const ablyPresenceChannel = `${awsId}-presence-channel`;
  //used on mobile view
  const [hideChat, setHideChat] = useState<boolean>(false);
  const toggleChatVideos = function () {
    setHideChat(!hideChat);
  };

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

  const isHidden = useCallback(
    (isChat: boolean) => {
      //checks if width is <= 48 em (base size) if so checks switch tab is disabled
      return width <= 768 && (isChat ? hideChat : !hideChat);
    },
    [width, hideChat]
  );

  return (
    <>
      {channelSSR && <ChannelNextHead channel={channelSSR} />}
      <AppLayout
        title={channel?.name}
        image={channel?.owner?.FCImageUrl}
        isCustomHeader={true}
      >
        <Stack direction="column">
          <Stack
            mx={[8, 4]}
            alignItems={["center", "initial"]}
            mt="10px"
            spacing={8}
            direction={["column", "row", "row"]}
          >
            <Stack direction="column" width={"100%"}>
              <Flex width={{ base: "100%", sm: "70%", md: "70%", lg: "100%" }}>
                <NextStreamTimer
                  isTheatreMode={true}
                  playbackUrl={brianPlaybackUrl}
                />
              </Flex>
              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <GridItem colSpan={2}>
                  <ChannelDesc channel={channel} isOwner={isOwner} />
                </GridItem>
                <GridItem justifyItems={"center"}>
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    gap={5}
                  >
                    <Grid
                      templateColumns="repeat(2, 1fr)"
                      templateRows="repeat(2, 1fr)"
                      gridGap={4}
                      alignItems="flex-start"
                      justifyItems="flex-start"
                    >
                      <ControlButton />
                      <DiceButton />
                      <SwordButton />
                      <CoinButton />
                    </Grid>
                    <BuyButton tokenName="$BRIAN" />
                  </Box>
                </GridItem>
              </Grid>
            </Stack>
            <Button
              height={{
                //only show on mobile
                base: "100%", // 0-48em
                md: "0%", // 48em-80em,
                xl: "0%", // 80em+
              }}
              onClick={toggleChatVideos}
              id="xeedev-poaav"
              bg="#27415E"
            >
              Toggle Chat/Host Schedule
            </Button>
            <Container
              hidden={isHidden(true)}
              maxW={["768px", "380px"]}
              mr="10px"
              borderWidth="3px"
              borderColor="black"
              borderRadius={10}
              centerContent
              background={"#19162F"}
            >
              <AblyChatComponent
                username={username}
                chatBot={chatBot}
                user={user}
                ablyChatChannel={ablyChatChannel}
                ablyPresenceChannel={ablyPresenceChannel}
                channelArn={channelArn}
                channelId={3}
                allowNFCs={true}
              />
            </Container>
          </Stack>
          {/* <Flex hidden={isHidden(false)} direction="column">
        <Text align="center" fontSize="2rem" fontWeight="bold">
          Welcome to Unlonely! Control My Stream with $BRIAN!
        </Text>
        <Tabs
          className="xeedev-class-hide"
          align="center"
          variant="unstyled"
          width="100%"
        >
          <TabList width="100%">
            <Tab _selected={{ color: "white", bg: "blue.500" }}>scene tab</Tab>
            <Tab _selected={{ color: "white", bg: "green.400" }}>task tab</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Flex
                margin="auto"
                maxW={{
                  base: "100%",
                  sm: "533px",
                  md: "711px",
                  lg: "889px",
                }}
                w="100%"
                borderRadius="0.3125rem"
                pt="1rem"
                justifyContent="center"
                backgroundColor="rgba(0,0,0,0.2)"
              >
                <Flex
                  width="100%"
                  justifyContent="center"
                  alignItems="center"
                  direction="column"
                >
                  <BrianTokenTab chatBot={chatBot} setChatBot={setChatBot} />
                </Flex>
              </Flex>
            </TabPanel>
            <TabPanel>
              <Flex
                margin="auto"
                maxW={{
                  base: "100%",
                  sm: "533px",
                  md: "711px",
                  lg: "889px",
                }}
                borderRadius="0.3125rem"
                pt="1rem"
                justifyContent="center"
                backgroundColor="rgba(0,0,0,0.2)"
              >
                <TaskList chatBot={chatBot} setChatBot={setChatBot} />
              </Flex>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex> */}
        </Stack>
      </AppLayout>
    </>
  );
};

export default ChannelDetail;

export async function getServerSideProps(
  context: GetServerSidePropsContext<UrlParams>
) {
  const apolloClient = initializeApollo(null, context.req.cookies, true);

  const { data, error } = await apolloClient.query({
    query: CHANNEL_DETAIL_QUERY,
    variables: { slug: "brian" },
  });

  return { props: { slug: "brian", channelData: data } };
}
