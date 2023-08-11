import React from "react";
import { Button, Text, Flex } from "@chakra-ui/react";
import { TbShare2 } from "react-icons/tb";

import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";

interface Props {
  closePrompt: () => void;
}

export default function AddToIosSafari(props: Props) {
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
        Click the <TbShare2 /> icon
      </Text>
      <Flex direction="column">
        <Text>Scroll down and then click</Text>
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
    </TransactionModalTemplate>
  );
}
