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
      <Flex direction="column" alignItems={"center"} gap="10px">
        <Text textAlign={"center"}>
          For the best experience, we recommend adding the Unlonely app to your
          home screen!
        </Text>
        <Flex alignItems={"center"} gap="5px">
          <p>Click the</p> <TbShare2 /> <p>icon</p>
        </Flex>
        <Flex direction="column" justifyContent={"center"}>
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
      </Flex>
    </TransactionModalTemplate>
  );
}
