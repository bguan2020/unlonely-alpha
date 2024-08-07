import { Box, Image, Stack, Text, Flex } from "@chakra-ui/react";
import { useState } from "react";

import { Channel } from "../../generated/graphql";
import centerEllipses from "../../utils/centerEllipses";
const unlonelyAvatar = "/icons/icon-192x192.png";
type Props = {
  channel: Channel;
  callback: () => void;
};
const LiveChannelCard = ({ channel, callback }: Props) => {
  const handleRedirect = () => {
    callback();
    window.location.href = `/channels/${channel.slug}`;
  };
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <>
      <Flex
        direction="column"
        padding="0.3rem"
        borderRadius="1rem"
        minH="8rem"
        maxW={{ base: "16rem", sm: "25rem", md: "25rem", lg: "25rem" }}
        minW={{ base: "16rem", sm: "25rem", md: "25rem", lg: "25rem" }}
        onClick={handleRedirect}
        p={"10px"}
        transform={isHovered ? "scale(1.05)" : "scale(1)"}
        transition="transform 0.2s"
        cursor="pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Flex mb="1rem">
          <Image
            height="1.5rem"
            width="1.5rem"
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
            textShadow="rgba(208, 234, 53, 0.4) 1px 0 5px"
            color={"#D094FF"}
          >
            {channel.owner.username ??
              centerEllipses(channel.owner.address, 15)}
          </Text>
        </Flex>
        <Flex
          _hover={{
            filter: "brightness(80%)",
            position: "relative",
          }}
        >
          <Box position="relative">
            <Box
              position="absolute"
              bg="red"
              px="5px"
              borderRadius={"5px"}
              m="10px"
            >
              <Text fontFamily={"LoRes15"}>LIVE</Text>
            </Box>
            <Image
              src={channel.thumbnailUrl ?? "/svg/defaultThumbnail.svg"}
              width={["236px", "380px"]}
              height={["132px", "213px"]}
              borderRadius={"10px"}
              boxShadow="0px 4px 16px rgba(208, 234, 53, 0.4)"
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
          </Box>
        </Flex>
        <Flex direction="row" justifyContent="left" mt="1rem"></Flex>
        <Flex justifyContent="space-between" flexDirection="column">
          <Stack direction="column">
            <Stack direction="row" alignItems={"center"}>
              <Text
                fontSize={20}
                fontWeight="bold"
                noOfLines={2}
                textShadow="rgba(208, 234, 53, 0.4) 1px 0 5px"
              >
                {channel.name}
              </Text>
            </Stack>
            <Text
              fontSize={12}
              fontWeight="medium"
              noOfLines={2}
              color={"#d3d3d3"}
              textShadow="rgba(208, 234, 53, 0.4) 1px 0 5px"
            >
              {channel.description}
            </Text>
          </Stack>
        </Flex>
      </Flex>
    </>
  );
};

export default LiveChannelCard;
