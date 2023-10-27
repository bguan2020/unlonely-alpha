import { Avatar, Text, Flex } from "@chakra-ui/react";

import { anonUrl } from "../presence/AnonUrl";
import { useChannelContext } from "../../hooks/context/useChannel";
import useUserAgent from "../../hooks/internal/useUserAgent";

const ChannelDesc = () => {
  const { isStandalone } = useUserAgent();
  const { channel } = useChannelContext();
  const { channelQueryData } = channel;

  const imageUrl = channelQueryData?.owner?.FCImageUrl
    ? channelQueryData?.owner.FCImageUrl
    : channelQueryData?.owner?.lensImageUrl
    ? channelQueryData?.owner.lensImageUrl
    : anonUrl;
  const ipfsUrl = imageUrl.startsWith("ipfs://")
    ? `https://ipfs.io/ipfs/${imageUrl.slice(7)}`
    : imageUrl;

  return (
    <Flex direction="row" m="1rem">
      <Avatar
        name={
          channelQueryData?.owner.username
            ? channelQueryData?.owner.username
            : channelQueryData?.owner.address
        }
        src={ipfsUrl}
        size="sm"
      />
      <Flex direction="column" gap={["0px", "16px"]} width="100%">
        <Flex
          maxH="400px"
          ml="32px"
          justifyContent="left"
          pr="32px"
          flexDirection="row"
          alignItems={"baseline"}
          gap="1rem"
          wordBreak={"break-all"}
        >
          <Text
            fontSize={["1rem", "1.2rem"]}
            fontWeight="bold"
            noOfLines={2}
            wordBreak={"break-word"}
            width={isStandalone ? "70%" : "unset"}
          >
            {channelQueryData?.name}
          </Text>
        </Flex>
        <Text
          px="30px"
          fontSize={["0.5rem", "0.8rem"]}
          width={isStandalone ? "70%" : "unset"}
        >
          {channelQueryData?.description}
        </Text>
      </Flex>
    </Flex>
  );
};

export default ChannelDesc;
