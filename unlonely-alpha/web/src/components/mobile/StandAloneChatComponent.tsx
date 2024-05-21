import {
  Flex,
  Box,
  Text,
  Image,
  IconButton,
  Spinner,
  SimpleGrid,
  Stack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useLazyQuery } from "@apollo/client";
import { BiSolidBellOff, BiSolidBellRing } from "react-icons/bi";

import { GetSubscriptionQuery } from "../../generated/graphql";
import { useChannelContext } from "../../hooks/context/useChannel";
import ChannelDesc from "../channels/ChannelDesc";
import { ChatReturnType } from "../../hooks/chat/useChat";
import { GET_SUBSCRIPTION } from "../../constants/queries";
import useAddChannelToSubscription from "../../hooks/server/useAddChannelToSubscription";
import useRemoveChannelFromSubscription from "../../hooks/server/channel/useRemoveChannelFromSubscription";
import { useOnClickOutside } from "../../hooks/internal/useOnClickOutside";
import { TabsComponent } from "./TabsComponent";
import { useIsGameOngoingMobile } from "../../hooks/internal/temp-token/ui/useIsGameOngoingMobile";
import { MobileTempTokenInterface } from "../channels/layout/temptoken/MobileTempTokenInterface";
import { MobileVersusTempTokensInterface } from "../channels/layout/versus/MobileVersusTempTokensInterface";

export const EXCLUDED_SLUGS = ["loveonleverage"];

const StandaloneChatComponent = ({
  chat,
  channelStaticError,
  channelStaticLoading,
}: {
  chat: ChatReturnType;
  channelStaticError?: any;
  channelStaticLoading?: boolean;
}) => {
  const { channel: channelContext, chat: chatInfo } = useChannelContext();
  const { channelQueryData } = channelContext;
  const { chatChannel } = chatInfo;

  const router = useRouter();
  const [isBellAnimating, setIsBellAnimating] = useState(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [showVip, setShowVip] = useState<boolean>(false);
  const [endpoint, setEndpoint] = useState<string>("");
  const clickedOutsideInfo = useRef(false);
  const clickedOutsideVip = useRef(false);
  const infoRef = useRef<HTMLDivElement>(null);
  const vipRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { tokenStateView } = useIsGameOngoingMobile();

  useOnClickOutside(infoRef, () => {
    if (showInfo) {
      setShowInfo(false);
      clickedOutsideInfo.current = true;
    }
    clickedOutsideVip.current = false;
  });

  useOnClickOutside(vipRef, () => {
    if (showVip) {
      setShowVip(false);
      clickedOutsideVip.current = true;
    }
    clickedOutsideInfo.current = false;
  });

  const channelId = useMemo(
    () => (channelQueryData?.id ? Number(channelQueryData?.id) : 3),
    [channelQueryData?.id]
  );

  const [getSubscription, { data }] = useLazyQuery<GetSubscriptionQuery>(
    GET_SUBSCRIPTION,
    {
      fetchPolicy: "network-only",
    }
  );

  const { addChannelToSubscription } = useAddChannelToSubscription({
    onError: () => {
      console.error("Failed to add channel to subscription.");
    },
  });

  const { removeChannelFromSubscription } = useRemoveChannelFromSubscription({
    onError: () => {
      console.error("Failed to remove channel from subscription.");
    },
  });

  const handleGetSubscription = useCallback(async () => {
    await getSubscription({
      variables: { data: { endpoint } },
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
    if (!endpoint) return;
    setIsLoading(true);
    await addChannelToSubscription({
      endpoint,
      channelId,
    });
    await handleGetSubscription();
    setIsLoading(false);
    setIsBellAnimating(true);
  };

  const handleRemoveChannelFromSubscription = async () => {
    if (!endpoint) return;
    setIsLoading(true);
    await removeChannelFromSubscription({
      endpoint,
      channelId,
    });
    await handleGetSubscription();
    setIsLoading(false);
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
      h={"75vh"}
      p="5px"
      id="chat"
      position={"relative"}
      marginTop={"25vh"}
    >
      {chatChannel?.includes("channel") ? (
        <Flex justifyContent={"space-between"} py="2px">
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
            <Flex
              px="8px"
              borderRadius="15px"
              bg="rgba(255, 255, 255, 0.1)"
              onClick={() => {
                if (clickedOutsideInfo.current) {
                  clickedOutsideInfo.current = false;
                  return;
                }
                setShowInfo(!showInfo);
              }}
            >
              <Text fontSize="20px" cursor={"pointer"} color="#8793FF">
                /
                {(channelQueryData?.slug?.length ?? 0) > 10
                  ? channelQueryData?.slug.substring(0, 10).concat("...")
                  : channelQueryData?.slug}
              </Text>
            </Flex>
          </Flex>
          <Flex gap="10px">
            <IconButton
              color="white"
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
                isLoading ? (
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
        <Flex ref={infoRef}>
          <InfoComponent />
        </Flex>
      )}
      {tokenStateView === "chat" ? (
        <TabsComponent chat={chat} />
      ) : tokenStateView === "single" ? (
        <MobileTempTokenInterface ablyChannel={chat.channel} />
      ) : (
        <MobileVersusTempTokensInterface ablyChannel={chat.channel} />
      )}
    </Flex>
  );
};

const InfoComponent = () => {
  const { channel: channelContext, ui } = useChannelContext();
  const {
    handleNotificationsModal,
    handleEditModal,
    handleChatCommandModal,
    handleModeratorModal,
  } = ui;
  const { isOwner } = channelContext;

  return (
    <Flex
      borderRadius={"5px"}
      p="1px"
      position="absolute"
      top="50px"
      left="0"
      width={"100%"}
      zIndex={5}
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
        </Flex>
        {isOwner && (
          <Stack
            my={["0", "5rem"]}
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
                <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
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
                <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
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
                <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
                  <Text textAlign={"center"}>moderators</Text>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="10px"
                    onClick={() => handleModeratorModal(true)}
                    _hover={{
                      cursor: "pointer",
                      transform: "scale(1.1)",
                      transitionDuration: "0.3s",
                    }}
                    _active={{
                      transform: "scale(1)",
                    }}
                  >
                    <Image src="/svg/mods.svg" width="100%" />
                  </Box>
                </Flex>
              </SimpleGrid>
            </Flex>
          </Stack>
        )}
      </Flex>
    </Flex>
  );
};

export default StandaloneChatComponent;
