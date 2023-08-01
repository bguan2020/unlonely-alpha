import React, { useState } from "react";
import { Avatar, Flex, Text, Image } from "@chakra-ui/react";
import Link from "next/link";
import { ExternalLinkIcon } from "@chakra-ui/icons";

import centerEllipses from "../../utils/centerEllipses";
import { CustomUser } from "../../constants/types";
import { useGetBadges } from "../../hooks/internal/useGetBadges";

const ExcessTooltipAvatar = ({ user }: { user: CustomUser }) => {
  const { rankUrl } = useGetBadges(user.tokenHolderRank);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Flex
      mx="auto"
      p="0.5rem"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        target="_blank"
        href={`https://etherscan.io/address/${
          user?.address ? user.address : ""
        }`}
        passHref
      >
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
        >
          <Avatar
            margin="auto"
            src={user.FCImageUrl ? user.FCImageUrl : ""}
            name={user.username ? user.username : user.address}
            size="sm"
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
          {isHovered && <ExternalLinkIcon />}
        </Flex>
      </Link>
    </Flex>
  );
};

export default ExcessTooltipAvatar;
