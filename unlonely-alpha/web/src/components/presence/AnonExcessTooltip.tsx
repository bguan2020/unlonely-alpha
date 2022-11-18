import React from "react";
import { Avatar, Flex, Text } from "@chakra-ui/react";
import { anonUrl } from "./AnonUrl";

const AnonExcessTooltip = () => {
  return (
    <>
      <Flex direction="column">
        <Avatar name="anon" src={anonUrl} bg="grey" size="sm" />
        <Text>mysterious anon👀</Text>
        <Flex direction="row"></Flex>
      </Flex>
    </>
  );
};

export default AnonExcessTooltip;
