import { Avatar, Text, Flex } from "@chakra-ui/react";

import { anonUrl } from "../presence/AnonUrl";
import { useChannelContext } from "../../hooks/context/useChannel";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { truncateValue } from "../../utils/tokenDisplayFormatting";

const ChannelDesc = () => {
  const { isStandalone } = useUserAgent();
  const { channel } = useChannelContext();
  const { channelQueryData, totalBadges } = channel;

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
      <Flex direction="column" gap={["4px", "16px"]}>
        <Flex justifyContent={"center"}>
          <Avatar
            name={
              channelQueryData?.owner.username
                ? channelQueryData?.owner.username
                : channelQueryData?.owner.address
            }
            src={ipfsUrl}
            size="md"
          />
        </Flex>
        <Flex p="0.5rem" bg={"#570d5f"} borderRadius="15px">
          <Text fontSize="14px" textAlign={"center"}>
            {truncateValue(totalBadges, 0)} badges
          </Text>
        </Flex>
      </Flex>
      <Flex direction="column" gap={["4px", "16px"]} width="100%" pl="30px">
        <Flex
          maxH="400px"
          justifyContent="left"
          pr="32px"
          flexDirection="row"
          alignItems={"baseline"}
          gap="1rem"
          wordBreak={"break-all"}
        >
          <Text
            fontSize={["1rem", "25px"]}
            fontWeight="bold"
            noOfLines={2}
            wordBreak={"break-word"}
            width={isStandalone ? "70%" : "unset"}
          >
            {channelQueryData?.name}
          </Text>
        </Flex>
        <Text
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
