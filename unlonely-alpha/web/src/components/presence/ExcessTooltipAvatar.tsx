import React from "react";
import { Avatar, Flex, Text, Image } from "@chakra-ui/react";

import centerEllipses from "../../utils/centerEllipses";
import { CustomUser } from "../../constants/types";
import { useGetBadges } from "../../hooks/internal/useGetBadges";
import { getColorFromString } from "../../styles/Colors";
import { useChannelContext } from "../../hooks/context/useChannel";

const ExcessTooltipAvatar = ({ user }: { user: CustomUser }) => {
  const { rankUrl } = useGetBadges(user.channelUserRank);

  const { ui } = useChannelContext();
  const { handleSelectedUserInChat } = ui;
  return (
    <Flex mx="auto" p="0.5rem">
      <Flex
        alignItems={"center"}
        gap="5px"
        _hover={{
          cursor: "pointer",
          transform: "scale(1.1)",
          bg: "rgba(255, 255, 255, 0.1)",
        }}
        p="2px"
        borderRadius="10px"
        onClick={() =>
          handleSelectedUserInChat({
            address: user.address,
            username: user.username ?? undefined,
          })
        }
      >
        <Avatar
          margin="auto"
          src={user.FCImageUrl ? user.FCImageUrl : ""}
          name={user.username ? user.username : user.address}
          size="sm"
          bg={getColorFromString(user.username ? user.username : user.address)}
        />
        <Text fontSize="12px" textAlign={"center"}>
          {user.username ? user.username : centerEllipses(user.address, 8)}
        </Text>
        <Flex direction="row" margin="auto">
          {rankUrl && (
            <Image src={rankUrl} width="20px" height="20px" mr="5px" />
          )}
          {user.isFCUser && (
            <Image
              src="/images/farcaster_logo.png"
              width="20px"
              height="20px"
              mr="5px"
            />
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ExcessTooltipAvatar;
