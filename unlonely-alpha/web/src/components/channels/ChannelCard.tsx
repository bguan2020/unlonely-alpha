import { Image, Text, Flex, IconButton, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { BiSolidBellOff, BiSolidBellRing } from "react-icons/bi";
import Link from "next/link";

import { Channel } from "../../generated/graphql";
import centerEllipses from "../../utils/centerEllipses";

const unlonelyAvatar = "https://i.imgur.com/MNArpwV.png";

type Props = {
  channel: Channel;
  subscribed: boolean;
  addChannelToSubscription: any;
  removeChannelFromSubscription: any;
  handleGetSubscription: () => void;
  endpoint: string;
  callback: (slug: string, redirect?: boolean) => void;
  isOwner: boolean;
};

const ChannelCard = ({
  channel,
  subscribed,
  addChannelToSubscription,
  removeChannelFromSubscription,
  handleGetSubscription,
  endpoint,
  callback,
  isOwner,
}: Props) => {
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
      const button = document.getElementById(
        "bellring-desktop".concat(channel.id)
      );

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
    <Flex
      onClick={() => callback(channel.slug, false)}
      bg={isOwner ? "#0a2c50" : "#131323"}
      transition="transform 0.2s"
      cursor="pointer"
      _hover={{
        position: "relative",
        transform: "scale(1.05)",
      }}
      borderRadius="1rem"
      position="relative"
    >
      <Link href={`/channels/${channel.slug}`} passHref>
        <Flex
          direction="column"
          justifyContent={"space-evenly"}
          padding="10px"
          height="100%"
          w={{ base: "16rem", sm: "16rem", md: "16rem", lg: "16rem" }}
        >
          {isOwner && (
            <Text
              position="absolute"
              top="0"
              left="50%"
              transform={"translate(-50%)"}
            >
              this is you!
            </Text>
          )}
          <Flex direction="row" justifyContent={"center"} position="relative">
            <Flex direction="column" alignItems="center">
              <Image
                height="5rem"
                width="5rem"
                objectFit="cover"
                src={
                  channel.owner.FCImageUrl
                    ? channel.owner.FCImageUrl
                    : unlonelyAvatar
                }
                borderRadius="full"
                mr="0.5rem"
              />
              <Text
                fontSize="20px"
                noOfLines={1}
                fontWeight="light"
                textAlign="center"
                fontFamily="LoRes15"
              >
                {channel.owner.username ??
                  centerEllipses(channel.owner.address, 15)}
              </Text>
            </Flex>
            {endpoint && (
              <IconButton
                position="absolute"
                top="0px"
                right="0px"
                color="white"
                _hover={{
                  transform: "scale(1.5)",
                }}
                _focus={{}}
                _active={{}}
                bg="transparent"
                opacity={subscribed || isLoading ? 1 : 0.2}
                aria-label="notify"
                id={"bellring-desktop".concat(channel.id)}
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
            )}
          </Flex>
          <Flex flexDirection="column">
            <Text fontSize={16} fontWeight="bold" noOfLines={2}>
              {channel.name}
            </Text>
            <Text fontSize="12px" noOfLines={1} fontWeight="light">
              {channel.description}
            </Text>
          </Flex>
        </Flex>
      </Link>
    </Flex>
  );
};

export default ChannelCard;
