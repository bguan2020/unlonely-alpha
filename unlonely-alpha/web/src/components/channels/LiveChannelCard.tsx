import { Text, Flex } from "@chakra-ui/layout";
import { Image } from "@chakra-ui/react";

import { Channel } from "../../generated/graphql";

const unlonelyAvatar = "https://i.imgur.com/MNArpwV.png";

type Props = {
  channel: Channel;
};

const LiveChannelCard = ({ channel }: Props) => {
  const handleRedirect = () => {
    window.location.href = `/channels/${channel.slug}`;
  };

  if (!channel.isLive) return null;

  return (
    <>
      <Flex
        direction="column"
        w={{ base: "60%", md: "60%", lg: "60%", sm: "60%" }}
        h={{ base: "24rem", sm: "24rem", md: "24rem", lg: "24rem" }}
        padding="0.3rem"
        borderRadius="1rem"
        minH="8rem"
        minW={{ base: "16rem", sm: "25rem", md: "25rem", lg: "25rem" }}
        maxW={"48rem"}
        mb="1.5rem"
        mt="8px"
        mr="1rem"
        onClick={handleRedirect}
      >
        <Flex
          _hover={{
            filter: "brightness(80%)",
            position: "relative",
          }}
        >
          {channel.thumbnailUrl && <video poster={channel.thumbnailUrl} />}
          <Image
            src="/images/playIcon.png"
            opacity={0.5}
            style={
              {
                position: "relative",
                zIndex: 1,
                visibility: "visible",
                margin: "auto",
                top: "0%",
                left: "-65%",
              } as React.CSSProperties
            }
          />
        </Flex>
        <Flex direction="row" justifyContent="left" mt="1rem">
          <Image
            height="2.5rem"
            width="2.5rem"
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
            fontSize="16px"
            noOfLines={1}
            color="#4E5153"
            fontWeight="light"
            textAlign="center"
            fontFamily="Inter"
            mt="1.2rem"
          >
            {channel.owner.username}'s channel
          </Text>
        </Flex>
        <Flex justifyContent="space-between" flexDirection="column">
          <Text
            fontSize={24}
            fontWeight="medium"
            noOfLines={2}
            fontFamily="Inter"
          >
            {channel.name}
          </Text>
          <Text
            fontSize={12}
            fontWeight="medium"
            noOfLines={4}
            fontFamily="Inter"
          >
            {channel.description}
          </Text>
        </Flex>
      </Flex>
    </>
  );
};

export default LiveChannelCard;
