import React from "react";
import { Text, Flex, Image } from "@chakra-ui/react";
import { FaBars } from "react-icons/fa";
import { FiShare } from "react-icons/fi";

import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";

interface Props {
  closePrompt: () => void;
}

export default function AddToMobileFirefoxIos(props: Props) {
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
          <p>1. click </p> <FaBars />
        </Flex>
        <Flex alignItems={"center"} gap="5px" color="black">
          <p>2. click</p> <FiShare />
        </Flex>
        <Flex direction="column">
          <Text textAlign={"center"} color="black">
            3. scroll down
          </Text>
          <Text textAlign={"center"} color="black">
            4. “add to home screen”
          </Text>
        </Flex>
        <Text textAlign={"center"} color="black" fontSize="12px" mt="10px">
          (Can't find the "add to home screen" button? make sure you're not in
          an in-app browser!)
        </Text>
      </Flex>
    </TransactionModalTemplate>
  );
}
