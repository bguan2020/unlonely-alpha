import { Text, Flex, Image } from "@chakra-ui/react";
import React from "react";
import { HiDotsVertical } from "react-icons/hi";

import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";

interface Props {
  closePrompt: () => void;
}

export default function AddToMobileChrome(props: Props) {
  const { closePrompt } = props;

  return (
    <TransactionModalTemplate
      size="xs"
      isModalLoading={false}
      isOpen={true}
      handleClose={closePrompt}
      hideFooter={true}
      cannotClose
      blur
      bg="white"
    >
      <Flex direction="column" alignItems={"center"} margin="10px">
        <Image src="/icons/icon-192x192.png" h="80px" mb="10px" />
        <Text
          color="black"
          fontFamily="Neue Pixel Sans"
          fontSize="25px"
          mb="10px"
        >
          add to home screen
        </Text>
        <Flex alignItems={"center"} gap="5px" color="black">
          <p>1. click </p> <HiDotsVertical />
        </Flex>
        <Flex direction="column">
          <Text textAlign={"center"} color="black">
            2. scroll down
          </Text>
          <Text textAlign={"center"} color="black">
            3. “add to home screen”
          </Text>
        </Flex>
      </Flex>
    </TransactionModalTemplate>
  );
}
