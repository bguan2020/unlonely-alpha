import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Flex,
  Button,
  Stack,
  Container,
  Grid,
  GridItem,
  Box,
  useBreakpointValue,
  Image,
  Text,
} from "@chakra-ui/react";
import { gql, useQuery } from "@apollo/client";
import { useAccount, useEnsName } from "wagmi";
import AppLayout from "../../../components/layout/AppLayout";
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
import io, { Socket } from "socket.io-client";
import { BRIAN_TOKEN_ADDRESS } from "../../../constants";
import TipTransactionModal from "../../../components/transactions/TipTransactionModal";
import ControlTransactionModal from "../../../components/transactions/ControlTransactionModal";
import ChanceTransactionModal from "../../../components/transactions/ChanceTransactionModal";
import PvpTransactionModal from "../../../components/transactions/PvpTransactionModal";
import usePostStreamInteraction from "../../../hooks/usePostStreamInteraction";

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
      channel {
        id
      }
      owner {
        id
      }
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
  const { data } = useQuery<ChannelDetailQuery>(CHANNEL_DETAIL_QUERY, {
    variables: {
      slug,
    },
  });

  const { data: recentStreamInteractionsData } = useQuery(
    GET_RECENT_STREAM_INTERACTIONS_BY_CHANNEL_QUERY,
    {
      variables: {
        data: {
          channelId: data?.getChannelBySlug?.id,
        },
      },
    }
  );

  console.log("recentStreamInteractionsData", recentStreamInteractionsData);

  const channelSSR = useMemo(
    () => channelData?.getChannelBySlug,
    [channelData]
  );
  const channel = useMemo(() => data?.getChannelBySlug, [data]);

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

  const ablyChatChannel = `${awsId}-chat-channel`;
  const ablyPresenceChannel = `${awsId}-presence-channel`;
  //used on mobile view
  const [hideChat, setHideChat] = useState<boolean>(false);
  const toggleChatVideos = function () {
    setHideChat(!hideChat);
  };

  const [socket, setSocket] = useState<Socket | undefined>(undefined);

  const showArcadeButtons = useBreakpointValue({ md: false, lg: true });

  const callbackMessage = (any: any) => {
    /* eslint-disable no-console */
    console.log("callbackMessage", any);
  };

  const handleSendMessage = (message: string) => {
    callbackMessage(`send ${message}`);
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
        callbackMessage(`received ${data}`);
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

  useEffect(() => {
    if (textOverVideo.length > 0) {
      const timer = setTimeout(() => {
        setTextOverVideo((prev) => prev.slice(2));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [textOverVideo]);

  const addTextOverVideo = () => {
    const message = "test";
    postStreamInteraction({
      text: message,
      channelId: channel?.id ? Number(channel?.id) : 3,
      interactionType: "control-text",
    });
    setTextOverVideo((prev) => [...prev, message]);
  };

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
  }, []);

  const addToChatbot = useCallback(
    (chatBotMessageToAdd: ChatBot) => {
      setChatBot((prev) => [...prev, chatBotMessageToAdd]);
    },
    [chatBot]
  );

  // useEffect(() => {
  //   // add check in case recentStreamInteractionsData is undefined
  //   const interactions =
  //     recentStreamInteractionsData.getRecentStreamInteractionsByChannel;
  //   if (interactions.length > 0) {
  //     setTextOverVideo(interactions);
  //   }
  // }, [recentStreamInteractionsData]);

  return (
    <>
      {channelSSR && <ChannelNextHead channel={channelSSR} />}
      <AppLayout
        title={channel?.name}
        image={channel?.owner?.FCImageUrl}
        isCustomHeader={true}
      >
        <ControlTransactionModal
          icon={
            <Image
              alt="control"
              src="/svg/control.svg"
              width="60px"
              height="60px"
            />
          }
          title="control the stream!"
          isOpen={showControlModal}
          handleClose={handleClose}
          contractAddress={BRIAN_TOKEN_ADDRESS}
          addToChatbot={addToChatbot}
        />
        <TipTransactionModal
          icon={
            <Image alt="coin" src="/svg/coin.svg" width="60px" height="60px" />
          }
          title="tip on the stream!"
          isOpen={showTipModal}
          handleClose={handleClose}
          contractAddress={BRIAN_TOKEN_ADDRESS}
          addToChatbot={addToChatbot}
        />
        <ChanceTransactionModal
          icon={
            <Image alt="dice" src="/svg/dice.svg" width="60px" height="60px" />
          }
          title="feeling lucky? roll the die for a surprise!"
          isOpen={showChanceModal}
          handleClose={handleClose}
          contractAddress={BRIAN_TOKEN_ADDRESS}
          addToChatbot={addToChatbot}
        />
        <PvpTransactionModal
          icon={
            <Image
              alt="sword"
              src="/svg/sword.svg"
              width="60px"
              height="60px"
            />
          }
          title="unlock player vs player features in chat"
          isOpen={showPvpModal}
          handleClose={handleClose}
          contractAddress={BRIAN_TOKEN_ADDRESS}
          addToChatbot={addToChatbot}
        />
        <Stack direction="column">
          <Stack
            mx={[8, 4]}
            alignItems={["center", "initial"]}
            mt="10px"
            spacing={8}
            direction={["column", "row", "row"]}
          >
            <Stack direction="column" width={"100%"}>
              <Button onClick={addTextOverVideo}>Add Message</Button>
              <Flex width={"100%"} position="relative">
                <Box
                  position="absolute"
                  zIndex={10}
                  maxHeight={{
                    base: "100%",
                    sm: "700px",
                    md: "700px",
                    lg: "700px",
                  }}
                  overflow="hidden"
                >
                  {textOverVideo.map((data: string, index: number) => (
                    <Text key={index}>{data}</Text>
                  ))}
                </Box>
                <NextStreamTimer
                  isTheatreMode={true}
                  playbackUrl={brianPlaybackUrl}
                />
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
                        <ControlButton
                          callback={() => setShowControlModal(true)}
                        />
                        <DiceButton callback={() => setShowChanceModal(true)} />
                        <SwordButton callback={() => setShowPvpModal(true)} />
                        <CoinButton callback={() => setShowTipModal(true)} />
                      </Grid>
                      <BuyButton
                        tokenName="$BRIAN"
                        callback={() => setShowBuyModal(true)}
                      />
                    </Box>
                  </GridItem>
                )}
              </Grid>
            </Stack>
            <Button onClick={() => handleSendMessage("hola")}>
              Test socket
            </Button>
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
              <Container borderRadius={10} background={"#19162F"} centerContent>
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
            </Flex>
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
  const apolloClient = initializeApollo(null, context.req.cookies, true);

  const { data, error } = await apolloClient.query({
    query: CHANNEL_DETAIL_QUERY,
    variables: { slug: "brian" },
  });

  return { props: { slug: "brian", channelData: data } };
}
