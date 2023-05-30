import React, { useState, useEffect, useCallback } from "react";
import {
  Flex,
  Button,
  Container,
  Stack,
  Grid,
  Box,
  GridItem,
  Tooltip,
} from "@chakra-ui/react";
import { GetServerSidePropsContext } from "next";
import { useAccount } from "wagmi";
import { gql, useQuery } from "@apollo/client";
import { useMemo } from "react";

import AppLayout from "../../components/layout/AppLayout";
import { getEnsName } from "../../utils/ens";
import centerEllipses from "../../utils/centerEllipses";
import AblyChatComponent from "../../components/chat/ChatComponent";
import NextStreamTimer from "../../components/stream/NextStreamTimer";
import { useUser } from "../../hooks/useUser";
import { useWindowSize } from "../../hooks/useWindowSize";
import { initializeApollo } from "../../apiClient/client";
import { ChannelDetailQuery } from "../../generated/graphql";
import ChannelNextHead from "../../components/layout/ChannelNextHead";
import ChannelDesc from "../../components/channels/ChannelDesc";
import BuyButton from "../../components/arcade/BuyButton";
import CoinButton from "../../components/arcade/CoinButton";
import ControlButton from "../../components/arcade/ControlButton";
import DiceButton from "../../components/arcade/DiceButton";
import SwordButton from "../../components/arcade/SwordButton";

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

  const ablyChatChannel = `${channel?.awsId}-chat-channel`;
  const ablyPresenceChannel = `${channel?.awsId}-presence-channel`;

  const [width, height] = useWindowSize();
  const { user } = useUser();
  const isOwner = user?.address === channel?.owner.address;

  const [chatBot, setChatBot] = useState<ChatBot[]>([]);
  const [username, setUsername] = useState<string | null>();
  const accountData = useAccount();
  //used on mobile view
  const [hideChat, setHideChat] = useState<boolean>(false);
  const toggleChatVideos = function () {
    setHideChat(!hideChat);
  };

  const isHidden = useCallback(
    (isChat: boolean) => {
      //checks if width is <= 48 em (base size) if so checks switch tab is disabled
      return width <= 768 && (isChat ? hideChat : !hideChat);
    },
    [width, hideChat]
  );

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

  if (!channel) {
    return null;
  }

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
                {channel.playbackUrl ? (
                  <NextStreamTimer
                    isTheatreMode={true}
                    hasTimer={false}
                    playbackUrl={channel.playbackUrl}
                  />
                ) : null}
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
                      <Tooltip label={"Not available"}>
                        <span>
                          <ControlButton />
                        </span>
                      </Tooltip>
                      <Tooltip label={"Not available"}>
                        <span>
                          <DiceButton />
                        </span>
                      </Tooltip>
                      <Tooltip label={"Not available"}>
                        <span>
                          <SwordButton />
                        </span>
                      </Tooltip>
                      <Tooltip label={"Not available"}>
                        <span>
                          <CoinButton />
                        </span>
                      </Tooltip>
                    </Grid>
                    <Tooltip label={"Not available"}>
                      <span>
                        <BuyButton tokenName="Token" />
                      </span>
                    </Tooltip>
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
            >
              Toggle Chat/Channel Details
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
              {channel ? (
                <AblyChatComponent
                  username={username}
                  chatBot={chatBot}
                  user={user}
                  ablyChatChannel={ablyChatChannel}
                  ablyPresenceChannel={ablyPresenceChannel}
                  channelArn={channel.channelArn || ""}
                  channelId={channel.id ? Number(channel.id) : 3}
                  allowNFCs={channel.allowNFCs || false}
                />
              ) : null}
            </Container>
          </Stack>
        </Stack>
      </AppLayout>
    </>
  );
};

export default ChannelDetail;

export async function getServerSideProps(
  context: GetServerSidePropsContext<UrlParams>
) {
  const { slug } = context.params!;

  const apolloClient = initializeApollo(null, context.req.cookies, true);

  const { data, error } = await apolloClient.query({
    query: CHANNEL_DETAIL_QUERY,
    variables: { slug },
  });

  return { props: { slug, channelData: data } };
}
