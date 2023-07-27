import { Text, Flex, Image } from "@chakra-ui/react";

import { Channel } from "../../generated/graphql";
import centerEllipses from "../../utils/centerEllipses";

const unlonelyAvatar = "https://i.imgur.com/MNArpwV.png";

type Props = {
  channel: Channel;
};

const ChannelCard = ({ channel }: Props) => {
  const handleRedirect = () => {
    window.location.href = `/channels/${channel.slug}`;
  };

  return (
    <>
      <Flex
        direction="column"
        padding="0.3rem"
        borderRadius="1rem"
        minH="8rem"
        minW={{ base: "16rem", sm: "25rem", md: "25rem", lg: "25rem" }}
        onClick={handleRedirect}
        bg={"#131323"}
        p={"10px"}
      >
        <Flex direction="row" justifyContent="left">
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
            fontWeight="light"
            textAlign="center"
            mt="1.2rem"
          >
            {channel.owner.username ??
              centerEllipses(channel.owner.address, 15)}
            's channel
          </Text>
        </Flex>
        <Flex justifyContent="space-between" flexDirection="column">
          <Text fontSize={24} fontWeight="medium" noOfLines={2}>
            {channel.name}
          </Text>
          <Text fontSize={12} fontWeight="medium" noOfLines={4}>
            {channel.description}
          </Text>
        </Flex>
      </Flex>
    </>
  );
};

export default ChannelCard;
