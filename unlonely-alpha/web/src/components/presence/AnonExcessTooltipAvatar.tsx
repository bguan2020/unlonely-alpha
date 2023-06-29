import React from "react";
import { Avatar, Flex, Text } from "@chakra-ui/react";
import { anonUrl } from "./AnonUrl";

const AnonExcessTooltipAvatar = () => {
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
