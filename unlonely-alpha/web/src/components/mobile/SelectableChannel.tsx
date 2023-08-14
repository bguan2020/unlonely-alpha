import { Avatar, Box, Flex, Text } from "@chakra-ui/react";

import { Channel } from "../../generated/graphql";
import centerEllipses from "../../utils/centerEllipses";
import { anonUrl } from "../presence/AnonUrl";

export const SelectableChannel = ({
  channel,
  callback,
}: {
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
        bg="black"
        justifyContent={"space-between"}
        onClick={() => callback(channel.slug)}
        _hover={{ background: "#615C5C" }}
      >
        <Flex gap="15px">
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
        </Flex>
        {isLive && (
          <Flex
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
        )}
      </Flex>
    </Box>
  );
};
