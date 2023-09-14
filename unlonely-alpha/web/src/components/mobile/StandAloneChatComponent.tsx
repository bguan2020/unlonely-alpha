import {
  Text,
  Image,
  Flex,
  Box,
  Grid,
  GridItem,
  Spinner,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  IconButton,
  SimpleGrid,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isAddress } from "viem";
import { useRouter } from "next/router";
import { BiSolidBellOff, BiSolidBellRing } from "react-icons/bi";
import { useLazyQuery } from "@apollo/client";

import { GetSubscriptionQuery } from "../../generated/graphql";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useUser } from "../../hooks/context/useUser";
import { useOnClickOutside } from "../../hooks/internal/useOnClickOutside";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import BuyButton from "../arcade/BuyButton";
import CoinButton from "../arcade/CoinButton";
import CustomButton from "../arcade/CustomButton";
import ChatForm from "../chat/ChatForm";
import MessageList from "../chat/MessageList";
import ChannelDesc from "../channels/ChannelDesc";
import { GET_SUBSCRIPTION } from "../../constants/queries";
import useAddChannelToSubscription from "../../hooks/server/useAddChannelToSubscription";
import useRemoveChannelFromSubscription from "../../hooks/server/useRemoveChannelFromSubscription";
import { useChat } from "../../hooks/chat/useChat";
import { getHolders } from "../../utils/getHolders";
import { SharesInterface } from "../chat/SharesInterface";

type Props = {
  previewStream?: boolean;
  handleShowPreviewStream: () => void;
};

const StandaloneAblyChatComponent = ({
  previewStream,
  handleShowPreviewStream,
}: Props) => {
  const {
    channel: channelContext,
    chat,
    holders: holdersContext,
    arcade,
  } = useChannelContext();
  const {
    data: holdersData,
    loading: holdersLoading,
    error: holdersError,
    refetchTokenHolders,
  } = holdersContext;
  const {
    chatBot,
    handleNotificationsModal,
    handleTokenSaleModal,
    handleEventModal,
    handleEditModal,
    handleChatCommandModal,
    handleCustomModal,
    handleBuyModal,
    handleTipModal,
  } = arcade;
  const { chatChannel } = chat;

  const { channelQueryData } = channelContext;

  const channelId = useMemo(
    () => (channelQueryData?.id ? Number(channelQueryData?.id) : 3),
    [channelQueryData?.id]
  );

  const {
    handleScrollToPresent,
    handleIsAtBottom,
    channel,
    hasMessagesLoaded,
    receivedMessages,
    isAtBottom,
    scrollRef,
    channelChatCommands,
    sendChatMessage,
    inputBox,
  } = useChat(chatBot, true);
  const router = useRouter();

  const { userAddress, user, userAddress: address } = useUser();

  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showArcade, setShowArcade] = useState<boolean>(false);
  const [endpoint, setEndpoint] = useState<string>("");
  const [holders, setHolders] = useState<{ name: string; quantity: number }[]>(
    []
  );
  const [isBellAnimating, setIsBellAnimating] = useState(false);

  const clickedOutsideInfo = useRef(false);
  const clickedOutsideLeaderBoard = useRef(false);
  const clickedOutsideArcade = useRef(false);
  const infoRef = useRef<HTMLDivElement>(null);
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const arcadeRef = useRef<HTMLDivElement>(null);

  const [getSubscription, { loading, data }] =
    useLazyQuery<GetSubscriptionQuery>(GET_SUBSCRIPTION, {
      fetchPolicy: "network-only",
    });

  const { addChannelToSubscription, loading: addLoading } =
    useAddChannelToSubscription({
      onError: () => {
        console.error("Failed to add channel to subscription.");
      },
    });

  const { removeChannelFromSubscription, loading: removeLoading } =
    useRemoveChannelFromSubscription({
      onError: () => {
        console.error("Failed to remove channel from subscription.");
      },
    });

  const handleGetSubscription = useCallback(async () => {
    await getSubscription({
      variables: { data: { endpoint } },
      fetchPolicy: "network-only",
    });
  }, [endpoint]);

  const channelCanNotify = useMemo(
    () =>
      data?.getSubscriptionByEndpoint?.allowedChannels?.includes(
        String(channelId)
      ),
    [channelId, data]
  );

  useEffect(() => {
    if (endpoint) {
      handleGetSubscription();
    }
  }, [endpoint]);

  useEffect(() => {
    if (showLeaderboard && !holdersLoading && !holdersData) {
      refetchTokenHolders?.();
    }
  }, [showLeaderboard]);

  useEffect(() => {
    if (!holdersLoading && !holdersError && holdersData) {
      const _holders: { name: string; quantity: number }[] = getHolders(
        holdersData.getTokenHoldersByChannel
      );
      setHolders(_holders);
    }
  }, [holdersLoading, holdersError, holdersData]);

  useOnClickOutside(infoRef, () => {
    if (showInfo) {
      setShowInfo(false);
      clickedOutsideInfo.current = true;
    }
    clickedOutsideLeaderBoard.current = false;
    clickedOutsideArcade.current = false;
  });

  useOnClickOutside(leaderboardRef, () => {
    if (showLeaderboard) {
      setShowLeaderboard(false);
      clickedOutsideLeaderBoard.current = true;
    }
    clickedOutsideArcade.current = false;
    clickedOutsideInfo.current = false;
  });
  useOnClickOutside(arcadeRef, () => {
    if (showArcade) {
      setShowArcade(false);
      clickedOutsideArcade.current = true;
    }
    clickedOutsideLeaderBoard.current = false;
    clickedOutsideInfo.current = false;
  });

  const isOwner = userAddress === channelQueryData?.owner.address;

  useEffect(() => {
    const init = async () => {
      if ("serviceWorker" in navigator) {
        const registrationExists =
          await navigator.serviceWorker.getRegistration("/");
        if (registrationExists) {
          const subscription =
            await registrationExists.pushManager.getSubscription();
          if (subscription) {
            const endpoint = subscription.endpoint;
            setEndpoint(endpoint);
          }
        }
      }
    };
    init();
  }, []);

  const handleAddChannelToSubscription = async () => {
    await addChannelToSubscription({
      endpoint,
      channelId,
    });
    await handleGetSubscription();
    setIsBellAnimating(true);
  };

  const handleRemoveChannelFromSubscription = async () => {
    await removeChannelFromSubscription({
      endpoint,
      channelId,
    });
    await handleGetSubscription();
  };

  const share = async () => {
    if (navigator.share && channelQueryData) {
      navigator
        .share({
          title: channelQueryData?.name ?? "Unlonely Stream",
          url: `${window.location.origin}/channels/${channelQueryData.slug}`,
        })
        .then(() => {
          console.log("Thanks for sharing!");
        })
        .catch(console.error);
    } else {
      // Fallback for browsers that do not support the Web Share API
      console.log("Your browser does not support the Web Share API.");
    }
  };

  useEffect(() => {
    if (isBellAnimating) {
      const button = document.getElementById("bellring");

      const handleAnimationEnd = () => {
        setIsBellAnimating(false);
      };

      button?.addEventListener("animationend", handleAnimationEnd);

      // Cleanup function
      return () => {
        button?.removeEventListener("animationend", handleAnimationEnd);
      };
    }
  }, [isBellAnimating]);

  return (
    <Flex
      direction="column"
      h={!previewStream && isOwner ? "100vh" : "75vh"}
      p="5px"
      id="chat"
      position={"relative"}
      marginTop={!previewStream && isOwner ? "0" : "25vh"}
    >
      {chatChannel?.includes("channel") ? (
        <Flex justifyContent={"space-between"}>
          <Flex alignItems="center">
            <IconButton
              _hover={{}}
              _focus={{}}
              _active={{}}
              minWidth="6"
              aria-label="Back"
              bg="transparent"
              icon={<Image src="/svg/mobile/back.svg" h="50%" />}
              onClick={() => router.push("/")}
            />
            <IconButton
              _hover={{}}
              _focus={{}}
              _active={{}}
              minWidth="6"
              aria-label="Back"
              bg="transparent"
              icon={<Image src="/svg/mobile/share.svg" h="50%" />}
              onClick={share}
            />
            <IconButton
              _hover={{}}
              _focus={{}}
              _active={{}}
              minWidth="6"
              aria-label="leaderboard"
              bg="transparent"
              icon={<Image src="/svg/mobile/leaderboard.svg" h="50%" />}
              onClick={() => {
                if (clickedOutsideLeaderBoard.current) {
                  clickedOutsideLeaderBoard.current = false;
                  return;
                }
                setShowLeaderboard(!showLeaderboard);
              }}
            />
            <Text
              pl="5px"
              fontSize="20px"
              cursor={"pointer"}
              color="#8793FF"
              onClick={() => {
                if (clickedOutsideInfo.current) {
                  clickedOutsideInfo.current = false;
                  return;
                }
                setShowInfo(!showInfo);
              }}
            >
              /{channelQueryData?.slug}
            </Text>
          </Flex>
          <Flex gap="10px">
            <IconButton
              _hover={{}}
              _focus={{}}
              _active={{}}
              bg="transparent"
              opacity={channelCanNotify ? 1 : 0.5}
              aria-label="notify"
              id="bellring"
              className={isBellAnimating ? "bell" : ""}
              width="unset"
              icon={
                addLoading || removeLoading ? (
                  <Spinner />
                ) : channelCanNotify ? (
                  <BiSolidBellRing height={"100%"} />
                ) : (
                  <BiSolidBellOff height={"100%"} />
                )
              }
              onClick={() => {
                if (channelCanNotify) {
                  handleRemoveChannelFromSubscription();
                } else {
                  handleAddChannelToSubscription();
                }
              }}
            />
            <BuyButton
              tokenName={
                channelQueryData?.token?.symbol
                  ? `$${channelQueryData?.token?.symbol}`
                  : "token"
              }
              small
              callback={() => {
                if (clickedOutsideArcade.current) {
                  clickedOutsideArcade.current = false;
                  return;
                }
                setShowArcade(!showArcade);
              }}
            />
          </Flex>
        </Flex>
      ) : (
        <IconButton
          aria-label="Back"
          bg="transparent"
          icon={<Image src="/svg/mobile/back.svg" />}
          onClick={() => router.push("/")}
        />
      )}
      {showInfo && (
        <Flex
          ref={infoRef}
          borderRadius={"5px"}
          p="1px"
          position="absolute"
          top="50px"
          left="0"
          width={"100%"}
          zIndex={3}
          style={{
            border: "1px solid",
            borderWidth: "1px",
            borderImageSource:
              "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)",
            borderImageSlice: 1,
            borderRadius: "5px",
          }}
        >
          <Flex
            direction="column"
            bg={"rgba(19, 19, 35, 1)"}
            borderRadius={"5px"}
            width={"100%"}
            padding="10px"
          >
            <Flex justifyContent={"space-between"}>
              <ChannelDesc />
              {isOwner && (
                <IconButton
                  onClick={handleShowPreviewStream}
                  aria-label="preview"
                  _hover={{}}
                  _active={{}}
                  _focus={{}}
                  icon={
                    <Image
                      src="/svg/preview-video.svg"
                      height={12}
                      style={{
                        filter: previewStream ? "grayscale(100%)" : "none",
                      }}
                    />
                  }
                />
              )}
            </Flex>
            {isOwner && (
              <Stack
                my="5rem"
                direction="column"
                width={"100%"}
                justifyContent="center"
              >
                <Flex
                  width={"100%"}
                  position="relative"
                  justifyContent={"center"}
                >
                  <SimpleGrid columns={3} spacing={10}>
                    <Flex
                      direction="column"
                      gap="10px"
                      justifyContent={"flex-end"}
                    >
                      <Text textAlign="center">send notifications</Text>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="10px"
                        onClick={() => handleNotificationsModal(true)}
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
                    <Flex
                      direction="column"
                      gap="10px"
                      justifyContent={"flex-end"}
                    >
                      <Text textAlign="center">offer tokens for sale</Text>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="10px"
                        onClick={() => handleTokenSaleModal(true)}
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
                    <Flex
                      direction="column"
                      gap="10px"
                      justifyContent={"flex-end"}
                    >
                      <Text textAlign="center">add event</Text>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="10px"
                        onClick={() => handleEventModal(true)}
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
                    <Flex
                      direction="column"
                      gap="10px"
                      justifyContent={"flex-end"}
                    >
                      <Text textAlign="center">
                        edit channel title / description
                      </Text>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="10px"
                        onClick={() => handleEditModal(true)}
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
                    <Flex
                      direction="column"
                      gap="10px"
                      justifyContent={"flex-end"}
                    >
                      <Text textAlign="center">custom commands</Text>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="10px"
                        onClick={() => handleChatCommandModal(true)}
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
                    <Flex
                      direction="column"
                      gap="10px"
                      justifyContent={"flex-end"}
                    >
                      <Text textAlign="center">paid custom action</Text>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="10px"
                        onClick={() => handleCustomModal?.(true)}
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
            )}
          </Flex>
        </Flex>
      )}
      {showArcade && (
        <Flex
          ref={arcadeRef}
          borderRadius={"5px"}
          p="1px"
          position="absolute"
          top="50px"
          left="0"
          width={"100%"}
          zIndex={3}
          style={{
            border: "1px solid",
            borderWidth: "1px",
            borderImageSource:
              "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)",
            borderImageSlice: 1,
            borderRadius: "5px",
          }}
        >
          <Flex
            direction="column"
            bg={"rgba(19, 19, 35, 1)"}
            borderRadius={"5px"}
            width={"100%"}
            padding={"40px"}
          >
            {isAddress(String(channelQueryData?.token?.address)) &&
              user &&
              address && (
                <>
                  <BuyButton
                    tokenName={
                      channelQueryData?.token?.symbol
                        ? `$${channelQueryData?.token?.symbol}`
                        : "token"
                    }
                    callback={() => handleBuyModal?.(true)}
                  />
                  <Grid
                    mt="50px"
                    templateColumns="repeat(2, 1fr)"
                    gap={12}
                    alignItems="center"
                    justifyItems="center"
                  >
                    <GridItem>
                      <Tooltip label={"make streamer do X"}>
                        <span>
                          <CustomButton
                            callback={() => handleCustomModal?.(true)}
                          />
                        </span>
                      </Tooltip>
                    </GridItem>
                    <GridItem>
                      <Tooltip label={"tip the streamer"}>
                        <span>
                          <CoinButton callback={() => handleTipModal?.(true)} />
                        </span>
                      </Tooltip>
                    </GridItem>
                  </Grid>
                </>
              )}
            {(!isAddress(String(channelQueryData?.token?.address)) ||
              !user) && (
              <>
                <Tooltip
                  label={!user ? "connect wallet first" : "not available"}
                >
                  <span>
                    <BuyButton tokenName={"token"} />
                  </span>
                </Tooltip>
                <Grid
                  mt="50px"
                  templateColumns="repeat(2, 1fr)"
                  gap={12}
                  alignItems="center"
                  justifyItems="center"
                >
                  <GridItem>
                    <Tooltip
                      label={!user ? "connect wallet first" : "not available"}
                    >
                      <span>
                        <CustomButton />
                      </span>
                    </Tooltip>
                  </GridItem>
                  <GridItem>
                    <Tooltip
                      label={!user ? "connect wallet first" : "not available"}
                    >
                      <span>
                        <CoinButton />
                      </span>
                    </Tooltip>
                  </GridItem>
                </Grid>
              </>
            )}
          </Flex>
        </Flex>
      )}
      {showLeaderboard && (
        <Flex
          ref={leaderboardRef}
          borderRadius={"5px"}
          p="1px"
          position="absolute"
          top="50px"
          bottom="10px"
          left="0"
          width={"100%"}
          zIndex={3}
          style={{
            border: "1px solid",
            borderWidth: "1px",
            borderImageSource:
              "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)",
            borderImageSlice: 1,
            borderRadius: "5px",
          }}
        >
          <Flex
            direction="column"
            bg={"rgba(19, 19, 35, 1)"}
            borderRadius={"5px"}
            width={"100%"}
          >
            <Text fontSize={"36px"} fontWeight="bold" textAlign={"center"}>
              HIGH SCORES
            </Text>
            {channelQueryData?.token?.symbol && (
              <Text
                color={"#B6B6B6"}
                fontSize={"14px"}
                fontWeight="400"
                textAlign={"center"}
              >
                {`who owns the most $${channelQueryData?.token?.symbol}?`}
              </Text>
            )}
            {holdersLoading && (
              <Flex justifyContent={"center"} p="20px">
                <Spinner />
              </Flex>
            )}
            {!holdersLoading && holders.length > 0 && (
              <TableContainer overflowX={"auto"} overflowY="scroll">
                <Table variant="unstyled">
                  <Thead>
                    <Tr>
                      <Th
                        textTransform={"lowercase"}
                        fontSize={"20px"}
                        p="10px"
                        textAlign="center"
                      >
                        rank
                      </Th>
                      <Th
                        textTransform={"lowercase"}
                        fontSize={"20px"}
                        p="10px"
                        textAlign="center"
                      >
                        name
                      </Th>
                      <Th
                        textTransform={"lowercase"}
                        fontSize={"20px"}
                        p="10px"
                        textAlign="center"
                        isNumeric
                      >
                        amount
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {holders.map((holder, index) => (
                      <Tr key={index}>
                        <Td fontSize={"20px"} p="10px" textAlign="center">
                          {index + 1}
                        </Td>
                        <Td fontSize={"20px"} p="10px" textAlign="center">
                          {holder.name}
                        </Td>
                        <Td
                          fontSize={"20px"}
                          p="10px"
                          textAlign="center"
                          isNumeric
                        >
                          {truncateValue(holder.quantity, 2)}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
            {!holdersLoading && holders.length === 0 && (
              <Text textAlign={"center"} p="20px">
                no holders found
              </Text>
            )}
          </Flex>
        </Flex>
      )}
      <SharesInterface />
      <MessageList
        scrollRef={scrollRef}
        messages={receivedMessages}
        channel={channel}
        isAtBottomCallback={handleIsAtBottom}
      />
      <Flex justifyContent="center">
        {!isAtBottom && hasMessagesLoaded && receivedMessages.length > 0 && (
          <Box
            bg="rgba(98, 98, 98, 0.6)"
            p="4px"
            borderRadius="4px"
            _hover={{
              background: "rgba(98, 98, 98, 0.3)",
              cursor: "pointer",
            }}
            onClick={handleScrollToPresent}
          >
            <Text fontSize="12px" textAlign={"center"}>
              scroll to present
            </Text>
          </Box>
        )}
      </Flex>
      <ChatForm
        sendChatMessage={sendChatMessage}
        inputBox={inputBox}
        additionalChatCommands={channelChatCommands}
      />
    </Flex>
  );
};

export default StandaloneAblyChatComponent;
