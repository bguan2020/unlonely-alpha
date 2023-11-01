import { useQuery } from "@apollo/client";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Image,
  Input,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { GetServerSidePropsContext } from "next";
import React, { useCallback, useMemo, useState } from "react";

import { initializeApollo } from "../../apiClient/client";
import ChannelDesc from "../../components/channels/ChannelDesc";
import ChannelStreamerPerspective from "../../components/channels/ChannelStreamerPerspective";
import ChannelViewerPerspective from "../../components/channels/ChannelViewerPerspective";
import ChatComponent from "../../components/chat/ChatComponentV2";
import { BorderType, OuterBorder } from "../../components/general/OuterBorder";
import { WavyText } from "../../components/general/WavyText";
import AppLayout from "../../components/layout/AppLayout";
import ChannelNextHead from "../../components/layout/ChannelNextHead";
import StandaloneAblyChatComponent from "../../components/mobile/StandAloneChatComponent";
// import PvpTransactionModal from "../../components/transactions/PvpTransactionModal";
import {
  CHANNEL_DETAIL_QUERY,
  GET_BADGE_HOLDERS_BY_CHANNEL_QUERY,
  GET_CHANNELS_BY_NUMBER_OF_BADGE_HOLDERS_QUERY,
} from "../../constants/queries";
import {
  ChannelDetailQuery,
  GetBadgeHoldersByChannelQuery,
  GetChannelsByNumberOfBadgeHoldersQuery,
} from "../../generated/graphql";
import {
  ChannelProvider,
  useChannelContext,
} from "../../hooks/context/useChannel";
import { useNetworkContext } from "../../hooks/context/useNetwork";
import { useUser } from "../../hooks/context/useUser";
import { useBuyVotes } from "../../hooks/contracts/useSharesContractV2";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { useWindowSize } from "../../hooks/internal/useWindowSize";
import usePostBadgeTrade from "../../hooks/server/gamblable/usePostBadgeTrade";
import usePostBet from "../../hooks/server/gamblable/usePostBet";
import usePostBetBuy from "../../hooks/server/gamblable/usePostBetBuy";
import { getContractFromNetwork } from "../../utils/contract";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { filteredInput } from "../../utils/validation/input";

const ChannelDetail = ({
  channelData,
}: {
  channelData: ChannelDetailQuery;
}) => {
  const { isStandalone } = useUserAgent();

  const channelSSR = useMemo(
    () => channelData?.getChannelBySlug,
    [channelData]
  );

  return (
    <ChannelProvider>
      {!isStandalone ? (
        <DesktopPage channelSSR={channelSSR} />
      ) : (
        <MobilePage channelSSR={channelSSR} />
      )}
    </ChannelProvider>
  );
};

const DesktopPage = ({
  channelSSR,
}: {
  channelSSR: ChannelDetailQuery["getChannelBySlug"];
}) => {
  const { channel, recentStreamInteractions, arcade } = useChannelContext();
  const { network } = useNetworkContext();
  const { localNetwork } = network;

  const {
    channelQueryData,
    loading: channelDataLoading,
    error: channelDataError,
  } = channel;
  const { handleCustomModal, handleBuyModal, handleTipModal } = arcade;
  const { loading: recentStreamInteractionsLoading } = recentStreamInteractions;
  const queryLoading = useMemo(
    () => channelDataLoading || recentStreamInteractionsLoading,
    [channelDataLoading, recentStreamInteractionsLoading]
  );

  const { data } = useQuery<GetBadgeHoldersByChannelQuery>(
    GET_BADGE_HOLDERS_BY_CHANNEL_QUERY,
    {
      variables: { data: { channelId: channelQueryData?.id } },
    }
  );

  const { data: _data } = useQuery<GetChannelsByNumberOfBadgeHoldersQuery>(
    GET_CHANNELS_BY_NUMBER_OF_BADGE_HOLDERS_QUERY
  );

  console.log(_data?.getChannelsByNumberOfBadgeHolders);

  console.log(data?.getBadgeHoldersByChannel);

  const [width] = useWindowSize();
  const { userAddress, user } = useUser();

  const isOwner = userAddress === channelQueryData?.owner.address;
  // const isOwner = true;

  const [previewStream, setPreviewStream] = useState<boolean>(false);

  //used on mobile view
  const [hideChat, setHideChat] = useState<boolean>(false);

  const isHidden = useCallback(
    (isChat: boolean) => {
      //checks if width is <= 48 em (base size) if so checks switch tab is disabled
      return width <= 768 && (isChat ? hideChat : !hideChat);
    },
    [width, hideChat]
  );

  const { postBet, loading: postBetLoading } = usePostBet({
    onError: (err) => {
      console.log(err);
    },
  });

  const { postBetBuy, loading: postBetBuyLoading } = usePostBetBuy({
    onError: (err) => {
      console.log(err);
    },
  });
  const { postBadgeTrade, loading: postBadgeTradeLoading } = usePostBadgeTrade({
    onError: (err) => {
      console.log(err);
    },
  });

  // const [isBuying, setIsBuying] = useState<boolean>(true);
  const [amountOfBadges, setAmountOfBadges] = useState<string>("0");

  const handleInputChange = (event: any) => {
    const input = event.target.value;
    const filtered = filteredInput(input);
    setAmountOfBadges(filtered);
  };

  const v2contract = getContractFromNetwork("unlonelySharesV2", localNetwork);

  const { buyVotes } = useBuyVotes(
    {
      eventAddress: "0x34Bb9e91dC8AC1E13fb42A0e23f7236999e063D4",
      eventId: 1,
      isYay: true,
      amountOfVotes: BigInt(1),
      value: BigInt(1),
    },
    v2contract,
    {}
  );

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
            <Stack
              mx={[0, 8, 4]}
              alignItems={["center", "initial"]}
              spacing={[4, 8]}
              direction={["column", "column", "row", "row"]}
            >
              {/* <Button
                  bg="#000000"
                  onClick={() =>
                    postBet({
                      channelId: channelQueryData?.id,
                      userAddress: user?.address,
                    })
                  }
                >
                  create bet
                </Button>
                <Button
                  bg="#000000"
                  onClick={() => {
                    if (!buyVotes) return;
                    buyVotes?.();
                    postBetBuy({
                      channelId: channelQueryData?.id,
                      userAddress: user?.address,
                      isYay: true,
                    });
                  }}
                >
                  buy bet
                </Button>
                <Button
                  bg="#000000"
                  onClick={() =>
                    postBadgeTrade({
                      channelId: channelQueryData?.id,
                      userAddress: user?.address,
                      isBuying: false,
                    })
                  }
                >
                  trade badge
                </Button> */}
              <Stack direction="column" width={"100%"}>
                {isOwner && !previewStream ? (
                  <ChannelStreamerPerspective />
                ) : (
                  <ChannelViewerPerspective />
                )}
                <Grid templateColumns="50% 50%" gap={4} mt="20px">
                  <ChannelDesc />
                  <Flex gap="1rem" margin="1rem" justifyContent={"flex-end"}>
                    {/* <Flex
                      bg={"#131323"}
                      borderRadius="15px"
                      height="fit-content"
                      margin="auto"
                    >
                      <Button
                        bg={isBuying ? "#46a800" : "transparent"}
                        _focus={{}}
                        _hover={{}}
                        _active={{}}
                        onClick={() => setIsBuying(true)}
                        borderRadius="15px"
                      >
                        BUY
                      </Button>
                      <Button
                        bg={!isBuying ? "#fe2815" : "transparent"}
                        _focus={{}}
                        _hover={{}}
                        _active={{}}
                        onClick={() => setIsBuying(false)}
                        borderRadius="15px"
                      >
                        SELL
                      </Button>
                    </Flex> */}
                    <Flex
                      direction="column"
                      bg={"#131323"}
                      borderRadius="15px"
                      p="1rem"
                    >
                      <Text fontFamily={"LoRes15"} fontSize="20px">
                        BECOME A VIP
                      </Text>
                      <Flex gap="1rem" mb="5px">
                        <Flex direction="column">
                          <Text fontSize="10px" textAlign="center">
                            how many
                          </Text>
                          <Flex alignItems={"center"}>
                            <IconButton
                              bg="transparent"
                              _active={{}}
                              _focus={{}}
                              _hover={{}}
                              aria-label="decrease badges"
                              icon={<MinusIcon />}
                              onClick={() => {
                                if (Number(amountOfBadges) <= 0) return;
                                setAmountOfBadges(
                                  String(Number(amountOfBadges) - 1)
                                );
                              }}
                            />
                            <Input
                              textAlign="center"
                              width={"70px"}
                              value={amountOfBadges}
                              onChange={handleInputChange}
                            />
                            <IconButton
                              bg="transparent"
                              _active={{}}
                              _focus={{}}
                              _hover={{}}
                              aria-label="decrease badges"
                              icon={<AddIcon />}
                              onClick={() => {
                                setAmountOfBadges(
                                  String(Number(amountOfBadges) + 1)
                                );
                              }}
                            />
                          </Flex>
                        </Flex>
                        <Flex direction="column">
                          <Text fontSize="10px" textAlign="center">
                            price
                          </Text>
                          <Text whiteSpace={"nowrap"} margin="auto">
                            0.003 ETH
                          </Text>
                        </Flex>
                        <Flex direction="column">
                          <Text fontSize="10px" textAlign="center">
                            have
                          </Text>
                          <Text whiteSpace={"nowrap"} margin="auto">
                            {truncateValue(3, 0)}
                          </Text>
                        </Flex>
                      </Flex>
                      <Flex gap="5px">
                        <Button
                          bg={"#46a800"}
                          _focus={{}}
                          _hover={{}}
                          _active={{}}
                          width="100%"
                        >
                          BUY
                        </Button>
                        <Button
                          bg={"#fe2815"}
                          _focus={{}}
                          _hover={{}}
                          _active={{}}
                          width="100%"
                        >
                          SELL
                        </Button>
                      </Flex>
                    </Flex>
                  </Flex>
                  {isOwner && (
                    <GridItem>
                      <Flex justifyContent={"center"} gap="10px">
                        <Tooltip
                          label={`${previewStream ? "hide" : "preview"} stream`}
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
                      </Flex>
                    </GridItem>
                  )}
                  {/* {showArcadeButtons && !isOwner && (
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
                                  templateRows="repeat(1, 1fr)"
                                  gridGap={4}
                                  alignItems="flex-start"
                                  justifyItems="flex-start"
                                >
                                  <Tooltip label={"make streamer do X"}>
                                    <span>
                                      <CustomButton
                                        callback={() => handleCustomModal(true)}
                                      />
                                    </span>
                                  </Tooltip>
                                  <Tooltip label={"tip the streamer"}>
                                    <span>
                                      <CoinButton
                                        callback={() => handleTipModal(true)}
                                      />
                                    </span>
                                  </Tooltip>
                                </Grid>
                                <BuyButton
                                  tokenName={
                                    channelQueryData?.token?.symbol
                                      ? `$${channelQueryData?.token?.symbol}`
                                      : "token"
                                  }
                                  callback={() => handleBuyModal(true)}
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
                                templateRows="repeat(1, 1fr)"
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
                    )} */}
                </Grid>
              </Stack>
              {/* <Flex
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
                    <AblyChatComponent />
                  </Container>
                </Flex> */}
              <Stack
                direction="column"
                minW={["100%", "100%", "380px", "380px"]}
                maxW={["100%", "100%", "380px", "380px"]}
                gap="1rem"
              >
                <ChatComponent />
                <OuterBorder type={BorderType.FIRE}>
                  <Flex width="100%" bg="rgba(19, 18, 37, 1)"></Flex>
                </OuterBorder>
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
              <Text fontFamily="LoRes15">
                server error, please try again later
              </Text>
            )}
          </Flex>
        )}
      </AppLayout>
    </>
  );
};

const MobilePage = ({
  channelSSR,
}: {
  channelSSR: ChannelDetailQuery["getChannelBySlug"];
}) => {
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

  const { userAddress } = useUser();

  const isOwner = userAddress === channelQueryData?.owner.address;

  const [previewStream, setPreviewStream] = useState<boolean>(false);

  const handleShowPreviewStream = useCallback(() => {
    setPreviewStream((prev) => !prev);
  }, []);

  return (
    <AppLayout
      title={channelSSR?.name}
      image={channelSSR?.owner?.FCImageUrl}
      pageUrl={`/channels/${channelSSR?.slug}`}
      description={channelSSR?.description}
      isCustomHeader={true}
    >
      {!queryLoading && !channelDataError ? (
        <>
          {(previewStream || !isOwner) && <ChannelViewerPerspective mobile />}
          <StandaloneAblyChatComponent
            previewStream={previewStream}
            handleShowPreviewStream={handleShowPreviewStream}
          />
        </>
      ) : (
        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          direction="column"
          width="100%"
          height="100vh"
          fontSize="50px"
        >
          {!channelDataError ? (
            <>
              <Image
                src="/icons/icon-192x192.png"
                borderRadius="10px"
                height="96px"
              />
              <Flex>
                <WavyText text="..." />
              </Flex>
            </>
          ) : (
            <Text fontFamily="LoRes15">
              server error, please try again later
            </Text>
          )}
        </Flex>
      )}
    </AppLayout>
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
