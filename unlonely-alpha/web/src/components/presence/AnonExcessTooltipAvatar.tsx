import React from "react";
import { Avatar, Flex, Text } from "@chakra-ui/react";
import { anonUrl } from "./AnonUrl";
import Link from "next/link";
import { User } from "../../generated/graphql";

const AnonExcessTooltipAvatar = ({ user }: { user: User }) => {
  return (
    <Flex direction="column" p="2px" borderRadius="10px">
      <Avatar margin="auto" name="anon" src={anonUrl} bg="grey" size="sm" />
      <Text textAlign={"center"} fontSize="12px">
        mysterious anon👀
      </Text>
    </Flex>
  );
};

export default AnonExcessTooltipAvatar;
