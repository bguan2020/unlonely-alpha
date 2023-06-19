import React, { useState, useEffect, useCallback } from "react";
import {
  Flex,
  Container,
  Stack,
  Grid,
  Box,
  GridItem,
  Tooltip,
  useBreakpointValue,
} from "@chakra-ui/react";
import { GetServerSidePropsContext } from "next";
import { useAccount, useEnsName } from "wagmi";
import { gql, useQuery } from "@apollo/client";
import { useMemo } from "react";

import AppLayout from "../../components/layout/AppLayout";
import centerEllipses from "../../utils/centerEllipses";
import AblyChatComponent from "../../components/chat/ChatComponent";
import NextStreamTimer from "../../components/stream/NextStreamTimer";
import { useUser } from "../../hooks/useUser";
import { useWindowSize } from "../../hooks/useWindowSize";
import { initializeApollo } from "../../apiClient/client";
import {
  ChannelDetailQuery,
  GetRecentStreamInteractionsQuery,
} from "../../generated/graphql";
import ChannelNextHead from "../../components/layout/ChannelNextHead";
import ChannelDesc from "../../components/channels/ChannelDesc";
import BuyButton from "../../components/arcade/BuyButton";
import CoinButton from "../../components/arcade/CoinButton";
import ControlButton from "../../components/arcade/ControlButton";
import DiceButton from "../../components/arcade/DiceButton";
import SwordButton from "../../components/arcade/SwordButton";
import io, { Socket } from "socket.io-client";
import usePostStreamInteraction from "../../hooks/usePostStreamInteraction";
import { InteractionType } from "../../constants";

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

const GET_RECENT_STREAM_INTERACTIONS_BY_CHANNEL_QUERY = gql`
  query GetRecentStreamInteractions(
    $data: GetRecentStreamInteractionsByChannelInput
  ) {
    getRecentStreamInteractionsByChannel(data: $data) {
      id
      interactionType
      text
      createdAt
      updatedAt
      owner {
        address
      }
    }
  }
`;

const ChannelDetail = ({
  slug,
  channelData,
}: UrlParams & { channelData: ChannelDetailQuery }) => {
  const { data } = useQuery<ChannelDetailQuery>(CHANNEL_DETAIL_QUERY, {
    variables: {
      slug,
    },
  });

  const { data: recentStreamInteractionsData } =
    useQuery<GetRecentStreamInteractionsQuery>(
      GET_RECENT_STREAM_INTERACTIONS_BY_CHANNEL_QUERY,
      {
        variables: {
          data: {
            channelId: 3,
          },
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
  const { postStreamInteraction, loading } = usePostStreamInteraction({});

  const [chatBot, setChatBot] = useState<ChatBot[]>([]);
  const [username, setUsername] = useState<string | null>();
  const [showTipModal, setShowTipModal] = useState<boolean>(false);
  const [showChanceModal, setShowChanceModal] = useState<boolean>(false);
  const [showPvpModal, setShowPvpModal] = useState<boolean>(false);
  const [showControlModal, setShowControlModal] = useState<boolean>(false);
  const [showBuyModal, setShowBuyModal] = useState<boolean>(false);

  const [textOverVideo, setTextOverVideo] = useState<string[]>([]);

  const accountData = useAccount();
  //used on mobile view
  const [hideChat, setHideChat] = useState<boolean>(false);
  const toggleChatVideos = function () {
    setHideChat(!hideChat);
  };

  const [socket, setSocket] = useState<Socket | undefined>(undefined);

  const showArcadeButtons = useBreakpointValue({ md: false, lg: true });

  const handleSendMessage = (message: string) => {
    if (!socket) return;
    socket.emit("send-message", {
      message,
      username: accountData?.address,
    });
  };

  useEffect(() => {
    const socketInit = async () => {
      const newSocket = io("https://unlonely-vqeii.ondigitalocean.app", {
        transports: ["websocket"],
      });
      setSocket(newSocket);

      newSocket.on("receive-message", (data) => {
        /* eslint-disable no-console */
        console.log("received message", data);
      });
    };
    socketInit();

    return () => {
      if (!socket) return;
      socket.disconnect();
    };
  }, []);

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

  const isHidden = useCallback(
    (isChat: boolean) => {
      //checks if width is <= 48 em (base size) if so checks switch tab is disabled
      return width <= 768 && (isChat ? hideChat : !hideChat);
    },
    [width, hideChat]
  );

  const handleClose = useCallback(() => {
    setShowTipModal(false);
    setShowChanceModal(false);
    setShowPvpModal(false);
    setShowControlModal(false);
    setShowBuyModal(false);
  }, []);

  const addToChatbot = useCallback(
    (chatBotMessageToAdd: ChatBot) => {
      setChatBot((prev) => [...prev, chatBotMessageToAdd]);
    },
    [chatBot]
  );

  useEffect(() => {
    if (!recentStreamInteractionsData) return;
    const interactions =
      recentStreamInteractionsData.getRecentStreamInteractionsByChannel;
    if (interactions && interactions.length > 0) {
      const textInteractions = interactions.filter(
        (i) => i?.interactionType === InteractionType.CONTROL && i.text
      );
      setTextOverVideo(textInteractions.map((i) => String(i?.text)));
    }
  }, [recentStreamInteractionsData]);

  return (
    <>
      {channel && (
        <>
          {channelSSR && <ChannelNextHead channel={channelSSR} />}
          <AppLayout
            title={channel?.name}
            image={channel?.owner?.FCImageUrl}
            isCustomHeader={true}
          >
            <Stack direction="column" mt={"1rem"}>
              <Stack
                mx={[8, 4]}
                alignItems={["center", "initial"]}
                mt="10px"
                spacing={8}
                direction={["column", "row", "row"]}
              >
                <Stack direction="column" width={"100%"}>
                  <Flex width={"100%"}>
                    {channel.playbackUrl ? (
                      <NextStreamTimer
                        isTheatreMode={true}
                        hasTimer={false}
                        playbackUrl={channel.playbackUrl}
                      />
                    ) : null}
                  </Flex>
                  <Grid templateColumns="repeat(3, 1fr)" gap={4} mt="20px">
                    <GridItem colSpan={showArcadeButtons ? 2 : 3}>
                      <ChannelDesc channel={channel} user={user} />
                    </GridItem>
                    {showArcadeButtons && (
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
                                <CoinButton />
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
                          </Grid>
                          <Tooltip label={"Not available"}>
                            <span>
                              <BuyButton tokenName="Token" />
                            </span>
                          </Tooltip>
                        </Box>
                      </GridItem>
                    )}
                  </Grid>
                </Stack>
                {/* <Button
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
                </Button> */}
                {channel && (
                  <Flex
                    hidden={isHidden(true)}
                    borderWidth="1px"
                    borderRadius={"10px"}
                    p="1px"
                    bg={
                      "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
                    }
                    width="100%"
                    maxW={["768px", "380px"]}
                    maxH={["500px", "850px"]}
                    mr="10px"
                    boxShadow="0px 4px 16px rgba(208, 234, 53, 0.4)"
                  >
                    <Container
                      borderRadius={10}
                      background={"#19162F"}
                      centerContent
                    >
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
                    </Container>
                  </Flex>
                )}
              </Stack>
            </Stack>
          </AppLayout>
        </>
      )}
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
