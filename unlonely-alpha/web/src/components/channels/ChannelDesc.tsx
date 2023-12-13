import { Avatar, Text, Flex } from "@chakra-ui/react";

import { anonUrl } from "../presence/AnonUrl";
import { useChannelContext } from "../../hooks/context/useChannel";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { BorderType, OuterBorder } from "../general/OuterBorder";
import { getColorFromString } from "../../styles/Colors";

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
            bg={getColorFromString(
              channelQueryData?.owner.username
                ? channelQueryData?.owner.username
                : channelQueryData?.owner.address ?? ""
            )}
            size="md"
          />
        </Flex>
        <OuterBorder flex={"0"} type={BorderType.FIRE}>
          <Flex
            p="0.5rem"
            bg={
              "linear-gradient(163deg, rgba(231,204,126,1) 0%, rgba(203,167,60,1) 7%, rgba(201,149,13,1) 32%, rgba(195,128,27,1) 43%, rgba(167,103,0,1) 63%, rgba(112,53,0,1) 100%)"
            }
          >
            <Text fontSize="14px" textAlign={"center"} fontFamily="LoRes15">
              <Text fontSize="20px">{truncateValue(totalBadges, 0)}</Text>
              badges
            </Text>
          </Flex>
        </OuterBorder>
      </Flex>
      <Flex direction="column" gap={["4px", "16px"]} width="100%" pl="30px">
        <Flex
          maxH="400px"
          justifyContent="left"
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
