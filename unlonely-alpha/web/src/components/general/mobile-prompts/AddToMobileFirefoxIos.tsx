import React from "react";
import { Button, Text, Flex } from "@chakra-ui/react";
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
      isModalLoading={false}
      isOpen={true}
      handleClose={closePrompt}
      hideFooter={true}
      cannotClose
    >
      <Flex direction="column" alignItems={"center"} gap="10px">
        <Text textAlign={"center"}>
          For the best experience, we recommend adding the Unlonely app to your
          home screen!
        </Text>
        <Flex alignItems={"center"} gap="5px">
          <p>Click the</p> <FaBars /> <p>icon</p>
        </Flex>
        <Flex alignItems={"center"} gap="5px">
          <p>Scroll down and then click</p>
          <FiShare />
        </Flex>
        <Flex direction="column">
          <Text>Then click</Text>
          <Text>“Add to Home Screen”</Text>
        </Flex>
        <Button
          bg="#30b70e"
          _hover={{}}
          _focus={{}}
          _active={{}}
          onClick={closePrompt}
          width="100%"
          borderRadius="25px"
        >
          ok
        </Button>
      </Flex>
    </TransactionModalTemplate>
  );
}
