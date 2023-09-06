import { Avatar, Box, Flex, Text, Image } from "@chakra-ui/react";
import { BiSolidBellRing } from "react-icons/bi";

import { Channel } from "../../generated/graphql";
import centerEllipses from "../../utils/centerEllipses";
import { anonUrl } from "../presence/AnonUrl";

export const SelectableChannel = ({
  subscribed,
  channel,
  callback,
}: {
  subscribed?: boolean;
  channel: Channel;
  callback: (slug: string) => void;
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
          <Flex gap="15px" overflow="hidden">
            <Avatar
              name={channel?.owner.username ?? channel?.owner.address}
              src={ipfsUrl}
              size="md"
            />
            <Flex direction="column">
              <Text fontFamily="Neue Pixel Sans">{channel.name}</Text>
              <Text fontFamily="Neue Pixel Sans" color="#9d9d9d">
                {channel?.owner.username ??
                  centerEllipses(channel?.owner.address, 13)}
              </Text>
            </Flex>
            {subscribed && <BiSolidBellRing />}
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
            <Flex position="absolute" bottom="10px" left="10px" gap="10px">
              <Avatar
                name={channel?.owner.username ?? channel?.owner.address}
                src={ipfsUrl}
                size="md"
              />
              <Flex direction="column">
                <Text noOfLines={2} fontFamily="Neue Pixel Sans">
                  {channel.name}
                </Text>
                <Text fontFamily="Neue Pixel Sans" color="#9d9d9d">
                  {channel?.owner.username ??
                    centerEllipses(channel?.owner.address, 13)}
                </Text>
              </Flex>
              {subscribed && <BiSolidBellRing />}
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

            <Image src={channel.thumbnailUrl ?? ""} borderRadius={"10px"} />
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
