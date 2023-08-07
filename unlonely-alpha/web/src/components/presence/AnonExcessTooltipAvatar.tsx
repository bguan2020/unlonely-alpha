import React from "react";
import { Avatar, Flex } from "@chakra-ui/react";

import { anonUrl } from "./AnonUrl";

const AnonExcessTooltipAvatar = () => {
  return (
    <Flex p="0.5rem" mx="auto">
      <Avatar m="auto" name="anon" src={anonUrl} bg="grey" size="sm" />
    </Flex>
  );
};

export default AnonExcessTooltipAvatar;
