import {
  Avatar,
  Box,
  Flex,
  Text,
  Image,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { BiSolidBellOff, BiSolidBellRing } from "react-icons/bi";

import { Channel } from "../../generated/graphql";
import { getColorFromString } from "../../styles/Colors";
import centerEllipses from "../../utils/centerEllipses";
import { anonUrl } from "../presence/AnonUrl";

export const SelectableChannel = ({
  subscribed,
  channel,
  callback,
  addChannelToSubscription,
  removeChannelFromSubscription,
  handleGetSubscription,
  endpoint,
}: {
  subscribed: boolean;
  channel: Channel;
  callback: (slug: string) => void;
  addChannelToSubscription?: (channel: any) => Promise<any>;
  removeChannelFromSubscription?: (channel: any) => Promise<any>;
  handleGetSubscription?: () => Promise<void>;
  endpoint: string;
}) => {
  const imageUrl = channel?.owner?.FCImageUrl
    ? channel?.owner.FCImageUrl
    : channel?.owner?.lensImageUrl
    ? channel?.owner.lensImageUrl
    : anonUrl;
  const ipfsUrl = imageUrl.startsWith("ipfs://")
    ? `https://ipfs.io/ipfs/${imageUrl.slice(7)}`
    : imageUrl;

  const isLive = channel?.isLive ?? false;

  const [isBellAnimating, setIsBellAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddChannelToSubscription = async () => {
    if (!endpoint) return;
    setIsLoading(true);
    await addChannelToSubscription?.({
      endpoint,
      channelId: channel.id,
    });
    await handleGetSubscription?.();
    setIsLoading(false);
    setIsBellAnimating(true);
  };

  const handleRemoveChannelFromSubscription = async () => {
    if (!endpoint) return;
    setIsLoading(true);
    await removeChannelFromSubscription?.({
      endpoint,
      channelId: channel.id,
    });
    await handleGetSubscription?.();
    setIsLoading(false);
  };

  useEffect(() => {
    if (isBellAnimating) {
      const button = document.getElementById("bellring".concat(channel.id));

      const handleAnimationEnd = () => {
        setIsBellAnimating(false);
      };

      button?.addEventListener("animationend", handleAnimationEnd);

      // Cleanup function
      return () => {
        button?.removeEventListener("animationend", handleAnimationEnd);
      };
    }
  }, [isBellAnimating, channel]);

  return (
    <Box>
      <Flex
        p="10px"
        bg={!isLive ? "black" : "#19162F"}
        justifyContent={"space-between"}
        onClick={() => callback(channel.slug)}
        _hover={{}}
      >
        {!isLive ? (
          <Flex width="100%" overflow="hidden" justifyContent={"space-between"}>
            <Flex gap="15px">
              <Avatar
                name={channel?.owner.username ?? channel?.owner.address}
                src={ipfsUrl}
                bg={getColorFromString(
                  channel?.owner.username ?? channel?.owner.address
                )}
                size="md"
              />
              <Flex direction="column">
                <Text fontFamily="LoRes15">{channel.name}</Text>
                <Text fontFamily="LoRes15" color="#9d9d9d">
                  {channel?.owner.username ??
                    centerEllipses(channel?.owner.address, 13)}
                </Text>
              </Flex>
            </Flex>
            <IconButton
              color="white"
              _hover={{}}
              _focus={{}}
              _active={{}}
              bg="transparent"
              opacity={subscribed || isLoading ? 1 : 0.2}
              aria-label="notify"
              id={"bellring".concat(channel.id)}
              className={isBellAnimating ? "bell" : ""}
              width="unset"
              icon={
                isLoading ? (
                  <Spinner />
                ) : subscribed ? (
                  <BiSolidBellRing height={"100%"} />
                ) : (
                  <BiSolidBellOff height={"100%"} />
                )
              }
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (subscribed) {
                  handleRemoveChannelFromSubscription();
                } else {
                  handleAddChannelToSubscription();
                }
              }}
            />
          </Flex>
        ) : (
          <Flex
            gap="15px"
            position="relative"
            overflow="hidden"
            borderRadius="10px"
            boxShadow="0px 0px 10px rgba(208, 234, 53, 1)"
          >
            <Flex
              position="absolute"
              backgroundImage={
                "linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0) 50%)"
              }
              width="100%"
              height="100%"
            />
            <Flex
              position="absolute"
              bottom="10px"
              overflow="hidden"
              width={"100%"}
              justifyContent={"space-between"}
            >
              <Flex gap="10px">
                <Avatar
                  name={channel?.owner.username ?? channel?.owner.address}
                  src={ipfsUrl}
                  bg={getColorFromString(
                    channel?.owner.username ?? channel?.owner.address
                  )}
                  size="md"
                />
                <Flex direction="column">
                  <Text noOfLines={2} fontFamily="LoRes15">
                    {channel.name}
                  </Text>
                  <Text fontFamily="LoRes15" color="#9d9d9d">
                    {channel?.owner.username ??
                      centerEllipses(channel?.owner.address, 13)}
                  </Text>
                </Flex>
              </Flex>
              <IconButton
                color="white"
                _hover={{}}
                _focus={{}}
                _active={{}}
                bg="transparent"
                opacity={subscribed || isLoading ? 1 : 0.2}
                aria-label="notify"
                id={"bellring".concat(channel.id)}
                className={isBellAnimating ? "bell" : ""}
                width="unset"
                icon={
                  isLoading ? (
                    <Spinner />
                  ) : subscribed ? (
                    <BiSolidBellRing height={"100%"} />
                  ) : (
                    <BiSolidBellOff height={"100%"} />
                  )
                }
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (subscribed) {
                    handleRemoveChannelFromSubscription();
                  } else {
                    handleAddChannelToSubscription();
                  }
                }}
              />
            </Flex>
            <Flex
              position="absolute"
              right="10px"
              top="10px"
              p="1px"
              bg={
                "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
              }
              borderRadius="10px"
              boxShadow="0px 4px 16px rgba(208, 234, 53, 0.4)"
            >
              <Flex
                bg={"#131323"}
                borderRadius="10px"
                px="10px"
                whiteSpace="nowrap"
                alignItems={"center"}
              >
                <Text>🔴 Live</Text>
              </Flex>
            </Flex>
            <Image
              src={channel.thumbnailUrl ?? "/svg/defaultThumbnail.svg"}
              borderRadius={"10px"}
            />
            <Image
              src="/images/playIcon.png"
              opacity={0.5}
              style={
                {
                  position: "absolute",
                  zIndex: 1,
                  visibility: "visible",
                  margin: "auto",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                } as React.CSSProperties
              }
            />
          </Flex>
        )}
      </Flex>
    </Box>
  );
};
