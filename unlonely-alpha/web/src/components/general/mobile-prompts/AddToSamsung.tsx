import React from "react";
import { Button, Text, Flex } from "@chakra-ui/react";
import { FaBars } from "react-icons/fa";
import { TfiPlus } from "react-icons/tfi";

import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";

interface Props {
  closePrompt: () => void;
}

export default function AddToSamsung(props: Props) {
  const { closePrompt } = props;

  return (
    <TransactionModalTemplate
      isModalLoading={false}
      isOpen={true}
      handleClose={closePrompt}
      hideFooter={true}
    >
      <Text>
        For the best experience, we recommend adding the Unlonely app to your
        home screen!
      </Text>
      <Text>
        Click the <FaBars /> icon
      </Text>
      <Flex direction="column">
        <Text>Scroll down and then click</Text>
        <TfiPlus />
      </Flex>
      <Flex direction="column">
        <Text>Then click</Text>
        <Text>“Home Screen”</Text>
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
    </TransactionModalTemplate>
  );
}
