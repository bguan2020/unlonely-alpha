import {
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Image,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
  useBreakpointValue,
} from "@chakra-ui/react";
import { GetServerSidePropsContext } from "next";
import React, { useCallback, useMemo, useState } from "react";
import { isAddress } from "viem";

import { initializeApollo } from "../../apiClient/client";
import BuyButton from "../../components/arcade/BuyButton";
import CoinButton from "../../components/arcade/CoinButton";
import ControlButton from "../../components/arcade/ControlButton";
import CustomButton from "../../components/arcade/CustomButton";
import ChannelDesc from "../../components/channels/ChannelDesc";
import ChannelViewerPerspective from "../../components/channels/ChannelViewerPerspective";
import CalendarEventModal from "../../components/channels/CalendarEventModal";
import ChatCommandModal from "../../components/channels/ChatCommandModal";
import EditChannelModal from "../../components/channels/EditChannelModal";
import NotificationsModal from "../../components/channels/NotificationsModal";
import TokenSaleModal from "../../components/channels/TokenSaleModal";
import AblyChatComponent from "../../components/chat/ChatComponent";
import { WavyText } from "../../components/general/WavyText";
import AppLayout from "../../components/layout/AppLayout";
import ChannelNextHead from "../../components/layout/ChannelNextHead";
import BuyTransactionModal from "../../components/transactions/BuyTransactionModal";
import ChanceTransactionModal from "../../components/transactions/ChanceTransactionModal";
import ControlTransactionModal from "../../components/transactions/ControlTransactionModal";
import CustomTransactionModal from "../../components/transactions/CustomTransactionModal";
// import PvpTransactionModal from "../../components/transactions/PvpTransactionModal";
import TipTransactionModal from "../../components/transactions/TipTransactionModal";
import { CHANNEL_DETAIL_QUERY } from "../../constants/queries";
import { ChatBot } from "../../constants/types";
import { ChannelDetailQuery } from "../../generated/graphql";
import {
  ChannelProvider,
  useChannelContext,
} from "../../hooks/context/useChannel";
import { useScreenAnimationsContext } from "../../hooks/context/useScreenAnimations";
import { useUser } from "../../hooks/context/useUser";
import { useWindowSize } from "../../hooks/internal/useWindowSize";

const ChannelDetail = ({
  channelData,
}: {
  channelData: ChannelDetailQuery;
}) => {
  const channelSSR = useMemo(
    () => channelData?.getChannelBySlug,
    [channelData]
  );

  return (
    <ChannelProvider>
      <ChannelPage channelSSR={channelSSR} />
    </ChannelProvider>
  );
};

const ChannelPage = ({
  channelSSR,
}: {
  channelSSR: ChannelDetailQuery["getChannelBySlug"];
}) => {
  const { fireworks } = useScreenAnimationsContext();
  const { channel, recentStreamInteractions } = useChannelContext();
  const {
    channelQueryData,
    loading: channelDataLoading,
    error: channelDataError,
  } = channel;
  const { loading: recentStreamInteractionsLoading } = recentStreamInteractions;

  const queryLoading = useMemo(
    () => channelDataLoading || recentStreamInteractionsLoading,
    [channelDataLoading, recentStreamInteractionsLoading]
  );

  const [width, height] = useWindowSize();
  const { username, userAddress, user } = useUser();

  const isOwner = userAddress === channelQueryData?.owner.address;
  // const isOwner = true;

  const [chatBot, setChatBot] = useState<ChatBot[]>([]);
  const [showTipModal, setShowTipModal] = useState<boolean>(false);
  const [showChanceModal, setShowChanceModal] = useState<boolean>(false);
  const [showPvpModal, setShowPvpModal] = useState<boolean>(false);
  const [showControlModal, setShowControlModal] = useState<boolean>(false);
  const [showBuyModal, setShowBuyModal] = useState<boolean>(false);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  const [previewStream, setPreviewStream] = useState<boolean>(false);

  const showArcadeButtons = useBreakpointValue({ md: false, lg: true });

  const handleControlModal = useCallback(() => {
    setShowControlModal(true);
  }, []);

  const handleBuyModal = useCallback(() => {
    setShowBuyModal(true);
  }, []);

  const handleCustomModal = useCallback(() => {
    setShowCustomModal(true);
  }, []);

  const handleTipModal = useCallback(() => {
    setShowTipModal(true);
  }, []);

  const handleChanceModal = useCallback(() => {
    setShowChanceModal(true);
  }, []);

  const handlePvpModal = useCallback(() => {
    setShowPvpModal(true);
  }, []);

  //used on mobile view
  const [hideChat, setHideChat] = useState<boolean>(false);

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
    setShowCustomModal(false);
  }, []);

  const addToChatbot = useCallback((chatBotMessageToAdd: ChatBot) => {
    setChatBot((prev) => [...prev, chatBotMessageToAdd]);
  }, []);

  const openChatPopout = () => {
    if (!channelQueryData) return;
    const windowFeatures = "width=400,height=600,menubar=yes,toolbar=yes";
    // window.open(
    //   `https://www.unlonely.app/mobile/chat/${channelQueryData?.awsId}`,
    //   "_blank",
    //   windowFeatures
    // );
    window.open(
      `http://localhost:3000/mobile/chat/${channelQueryData?.awsId}`,
      "_blank",
      windowFeatures
    );
  };

  return (
    <>
      {channelSSR && <ChannelNextHead channel={channelSSR} />}
      <AppLayout
        title={channelSSR?.name}
        image={channelSSR?.owner?.FCImageUrl}
        pageUrl={`/channels/${channelSSR?.slug}`}
        description={channelSSR?.description}
        isCustomHeader={true}
      >
        {!queryLoading && !channelDataError ? (
          <>
            <CustomTransactionModal
              icon={
                <Image
                  alt="custom"
                  src="/svg/arcade/custom.svg"
                  width="60px"
                  height="60px"
                />
              }
              title={isOwner ? "customize your button!" : "make streamer do X"}
              isOpen={showCustomModal}
              handleClose={handleClose}
              addToChatbot={addToChatbot}
            />
            <ControlTransactionModal
              icon={
                <Image
                  alt="control"
                  src="/svg/arcade/control.svg"
                  width="60px"
                  height="60px"
                />
              }
              title="control the stream!"
              isOpen={showControlModal}
              handleClose={handleClose}
              addToChatbot={addToChatbot}
            />
            <BuyTransactionModal
              title=""
              icon={
                <BuyButton
                  tokenName={`$${channelQueryData?.token?.symbol}`}
                  noHover
                />
              }
              isOpen={showBuyModal}
              handleClose={handleClose}
              addToChatbot={addToChatbot}
            />
            <TipTransactionModal
              icon={
                <Image
                  alt="coin"
                  src="/svg/arcade/coin.svg"
                  width="60px"
                  height="60px"
                />
              }
              title="tip on the stream!"
              isOpen={showTipModal}
              handleClose={handleClose}
              addToChatbot={addToChatbot}
            />
            <ChanceTransactionModal
              icon={
                <Image
                  alt="dice"
                  src="/svg/arcade/dice.svg"
                  width="60px"
                  height="60px"
                />
              }
              title="feeling lucky? roll the die for a surprise!"
              isOpen={showChanceModal}
              handleClose={handleClose}
              addToChatbot={addToChatbot}
            />
            <Stack direction="column" mt={"1rem"}>
              <Stack
                mx={[0, 8, 4]}
                alignItems={["center", "initial"]}
                mt="10px"
                spacing={[4, 8]}
                direction={["column", "column", "row", "row"]}
              >
                <Stack direction="column" width={"100%"}>
                  {isOwner && !previewStream ? (
                    <ChannelStreamerPerspective
                      setCustomActionModal={setShowCustomModal}
                    />
                  ) : (
                    <ChannelViewerPerspective />
                  )}
                  <Grid templateColumns="repeat(3, 1fr)" gap={4} mt="20px">
                    <GridItem colSpan={showArcadeButtons ? 2 : 3}>
                      <ChannelDesc />
                    </GridItem>
                    {isOwner && (
                      <GridItem>
                        <Flex justifyContent={"center"} gap="10px">
                          <Tooltip
                            label={`${
                              previewStream ? "hide" : "preview"
                            } stream`}
                          >
                            <IconButton
                              onClick={() => setPreviewStream((prev) => !prev)}
                              aria-label="preview"
                              _hover={{}}
                              _active={{}}
                              _focus={{}}
                              icon={
                                <Image
                                  src="/svg/preview-video.svg"
                                  height={12}
                                  style={{
                                    filter: previewStream
                                      ? "grayscale(100%)"
                                      : "none",
                                  }}
                                />
                              }
                            />
                          </Tooltip>
                          <Tooltip label={"chat popout"}>
                            <IconButton
                              onClick={openChatPopout}
                              aria-label="chat-popout"
                              _hover={{}}
                              _active={{}}
                              _focus={{}}
                              icon={
                                <Image src="/svg/pop-out.svg" height={12} />
                              }
                            />
                          </Tooltip>
                        </Flex>
                      </GridItem>
                    )}
                    {showArcadeButtons && !isOwner && (
                      <GridItem justifyItems={"center"}>
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          gap={5}
                        >
                          {isAddress(
                            String(channelQueryData?.token?.address)
                          ) &&
                            user &&
                            userAddress && (
                              <>
                                <Grid
                                  templateColumns="repeat(2, 1fr)"
                                  templateRows="repeat(2, 1fr)"
                                  gridGap={4}
                                  alignItems="flex-start"
                                  justifyItems="flex-start"
                                >
                                  <Tooltip label={"make streamer do X"}>
                                    <span>
                                      <CustomButton
                                        callback={() =>
                                          setShowCustomModal(true)
                                        }
                                      />
                                    </span>
                                  </Tooltip>
                                  <Tooltip label={"tip the streamer"}>
                                    <span>
                                      <CoinButton
                                        callback={() => setShowTipModal(true)}
                                      />
                                    </span>
                                  </Tooltip>
                                  <Tooltip label={"control text on the stream"}>
                                    <span>
                                      <ControlButton
                                        callback={() =>
                                          setShowControlModal(true)
                                        }
                                      />
                                    </span>
                                  </Tooltip>
                                </Grid>
                                <BuyButton
                                  tokenName={`$${channelQueryData?.token?.symbol}`}
                                  callback={() => setShowBuyModal(true)}
                                />
                              </>
                            )}
                          {(!isAddress(
                            String(channelQueryData?.token?.address)
                          ) ||
                            !user) && (
                            <>
                              <Grid
                                templateColumns="repeat(2, 1fr)"
                                templateRows="repeat(2, 1fr)"
                                gridGap={4}
                                alignItems="flex-start"
                                justifyItems="flex-start"
                              >
                                <Tooltip
                                  label={
                                    !user
                                      ? "connect wallet first"
                                      : "not available"
                                  }
                                >
                                  <span>
                                    <CustomButton />
                                  </span>
                                </Tooltip>
                                <Tooltip
                                  label={
                                    !user
                                      ? "connect wallet first"
                                      : "not available"
                                  }
                                >
                                  <span>
                                    <CoinButton />
                                  </span>
                                </Tooltip>
                                <Tooltip
                                  label={
                                    !user
                                      ? "connect wallet first"
                                      : "not available"
                                  }
                                >
                                  <span>
                                    <ControlButton />
                                  </span>
                                </Tooltip>
                              </Grid>
                              <Tooltip
                                label={
                                  !user
                                    ? "connect wallet first"
                                    : "not available"
                                }
                              >
                                <span>
                                  <BuyButton tokenName={"token"} />
                                </span>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </GridItem>
                    )}
                  </Grid>
                </Stack>
                <Flex
                  hidden={isHidden(true)}
                  borderWidth="1px"
                  borderRadius={"10px"}
                  p="1px"
                  bg={
                    "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
                  }
                  width="100%"
                  maxW={["768px", "100%", "380px"]}
                  maxH={["500px", "600px", "600px", "700px"]}
                  minH={["500px", "600px", "600px", "700px"]}
                  boxShadow="0px 4px 16px rgba(208, 234, 53, 0.4)"
                >
                  <Container
                    borderRadius={10}
                    background={"#19162F"}
                    centerContent
                    maxW="100%"
                    px="10px"
                  >
                    <AblyChatComponent
                      chatBot={chatBot}
                      addToChatbot={addToChatbot}
                      handleBuyModal={handleBuyModal}
                      handleTipModal={handleTipModal}
                      handleChanceModal={handleChanceModal}
                      handlePvpModal={handlePvpModal}
                      handleControlModal={handleControlModal}
                      handleCustomModal={handleCustomModal}
                    />
                  </Container>
                </Flex>
              </Stack>
            </Stack>
          </>
        ) : (
          <Flex
            alignItems={"center"}
            justifyContent={"center"}
            width="100%"
            height="calc(100vh - 64px)"
            fontSize="50px"
          >
            {!channelDataError ? (
              <WavyText text="loading..." />
            ) : (
              <Text fontFamily="Neue Pixel Sans">
                server error, please try again later
              </Text>
            )}
          </Flex>
        )}
      </AppLayout>
    </>
  );
};

const ChannelStreamerPerspective = ({
  setCustomActionModal,
}: {
  setCustomActionModal: (value: boolean) => void;
}) => {
  const [tokenSaleModal, setTokenSaleModal] = useState<boolean>(false);
  const [chatCommandModal, setChatCommandModal] = useState<boolean>(false);
  const [editModal, setEditModal] = useState<boolean>(false);
  const [notificationsModal, setNotificationsModal] = useState<boolean>(false);
  const [eventModal, setEventModal] = useState<boolean>(false);

  return (
    <Flex direction="column" width={"100%"}>
      <TokenSaleModal
        title={"offer tokens for sale"}
        isOpen={tokenSaleModal}
        handleClose={() => setTokenSaleModal(false)}
      />
      <ChatCommandModal
        title={"custom commands"}
        isOpen={chatCommandModal}
        handleClose={() => setChatCommandModal(false)}
      />
      <EditChannelModal
        title={"edit title / description"}
        isOpen={editModal}
        handleClose={() => setEditModal(false)}
      />
      <NotificationsModal
        title={"send notifications"}
        isOpen={notificationsModal}
        handleClose={() => setNotificationsModal(false)}
      />
      <CalendarEventModal
        title={"add event"}
        isOpen={eventModal}
        handleClose={() => setEventModal(false)}
      />
      <Stack
        my="5rem"
        direction="column"
        width={"100%"}
        justifyContent="center"
      >
        <Flex width={"100%"} position="relative" justifyContent={"center"}>
          <SimpleGrid columns={3} spacing={10}>
            <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
              <Text textAlign="center">send notifications</Text>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="10px"
                onClick={() => setNotificationsModal(true)}
                _hover={{
                  cursor: "pointer",
                  transform: "scale(1.1)",
                  transitionDuration: "0.3s",
                }}
                _active={{
                  transform: "scale(1)",
                }}
              >
                <Image src="/svg/notifications.svg" width="100%" />
              </Box>
            </Flex>
            <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
              <Text textAlign="center">offer tokens for sale</Text>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="10px"
                onClick={() => setTokenSaleModal(true)}
                _hover={{
                  cursor: "pointer",
                  transform: "scale(1.1)",
                  transitionDuration: "0.3s",
                }}
                _active={{
                  transform: "scale(1)",
                }}
              >
                <Image src="/svg/token-sale.svg" width="100%" />
              </Box>
            </Flex>
            <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
              <Text textAlign="center">add event</Text>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="10px"
                onClick={() => setEventModal(true)}
                _hover={{
                  cursor: "pointer",
                  transform: "scale(1.1)",
                  transitionDuration: "0.3s",
                }}
                _active={{
                  transform: "scale(1)",
                }}
              >
                <Image src="/svg/calendar.svg" width="100%" />
              </Box>
            </Flex>
            <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
              <Text textAlign="center">edit channel title / description</Text>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="10px"
                onClick={() => setEditModal(true)}
                _hover={{
                  cursor: "pointer",
                  transform: "scale(1.1)",
                  transitionDuration: "0.3s",
                }}
                _active={{
                  transform: "scale(1)",
                }}
              >
                <Image src="/svg/edit.svg" width="100%" />
              </Box>
            </Flex>
            <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
              <Text textAlign="center">custom commands</Text>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="10px"
                onClick={() => setChatCommandModal(true)}
                _hover={{
                  cursor: "pointer",
                  transform: "scale(1.1)",
                  transitionDuration: "0.3s",
                }}
                _active={{
                  transform: "scale(1)",
                }}
              >
                <Image src="/svg/custom-commands.svg" width="100%" />
              </Box>
            </Flex>
            <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
              <Text textAlign="center">paid custom action</Text>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="10px"
                onClick={() => setCustomActionModal(true)}
                _hover={{
                  cursor: "pointer",
                  transform: "scale(1.1)",
                  transitionDuration: "0.3s",
                }}
                _active={{
                  transform: "scale(1)",
                }}
              >
                <Image src="/svg/custom-actions.svg" width="100%" />
              </Box>
            </Flex>
          </SimpleGrid>
        </Flex>
      </Stack>
    </Flex>
  );
};

export default ChannelDetail;

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ slug: string }>
) {
  const { slug } = context.params!;

  const apolloClient = initializeApollo(null, context.req.cookies, true);

  const { data, error } = await apolloClient.query({
    query: CHANNEL_DETAIL_QUERY,
    variables: { slug },
  });

  return { props: { channelData: data } };
}
