import React, { useState, useEffect, useCallback } from "react";
import { Text, Flex, Button, Container, Stack } from "@chakra-ui/react";
import { GetServerSidePropsContext } from "next";
import { useAccount } from "wagmi";
import { gql, useQuery } from "@apollo/client";
import { useMemo } from "react";

import AppLayout from "../../components/layout/AppLayout";
import { getEnsName } from "../../utils/ens";
import centerEllipses from "../../utils/centerEllipses";
import AblyChatComponent from "../../components/chat/AblyChataComponent";
import NextStreamTimer from "../../components/stream/NextStreamTimer";
import { useUser } from "../../hooks/useUser";
import { useWindowSize } from "../../hooks/useWindowSize";
import { initializeApollo } from "../../apiClient/client";
import { ChannelDetailQuery } from "../../generated/graphql";
import ChannelNextHead from "../../components/layout/ChannelNextHead";

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
      owner {
        FCImageUrl
        lensImageUrl
        username
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
            <Flex width={{ base: "100%", sm: "70%", md: "70%", lg: "100%" }}>
              {channel.playbackUrl ? (
                <NextStreamTimer
                  isTheatreMode={true}
                  hasTimer={false}
                  playbackUrl={channel.playbackUrl}
                />
              ) : null}
            </Flex>
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
              Toggle Chat/Host Schedule
            </Button>
            <Container
              hidden={isHidden(true)}
              maxW={["768px", "300px"]}
              mr="10px"
              borderWidth="3px"
              borderColor="black"
              centerContent
            >
              <Text
                mt="10px"
                align="center"
                fontWeight={"bold"}
                fontSize="20px"
                color="white"
              >
                The Chat Room!
              </Text>
              <AblyChatComponent
                username={username}
                chatBot={chatBot}
                user={user}
                ablyChatChannel={ablyChatChannel}
                ablyPresenceChannel={ablyPresenceChannel}
                channelArn={channel.channelArn ? channel.channelArn : ""}
              />
            </Container>
          </Stack>
          <Flex direction="column">
            <Flex
              maxH="400px"
              margin="auto"
              mb="16px"
              ml="32px"
              w="100%"
              justifyContent="space-between"
              pr="32px"
            >
              <Text fontSize="2rem" fontWeight="bold">
                {channel.name}
              </Text>
            </Flex>
            <Flex direction="row" width="100%" margin="auto" ml="32px">
              {channel.description}
            </Flex>
          </Flex>
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

  const { data } = await apolloClient.query({
    query: CHANNEL_DETAIL_QUERY,
    variables: { slug },
  });

  return { props: { slug, channelData: data } };
}
