import React from "react";
import { Text, Flex } from "@chakra-ui/react";
import { TbShare2 } from "react-icons/tb";

import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";

interface Props {
  closePrompt: () => void;
}

export default function AddToMobileChromeIos(props: Props) {
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
          <p>Click the</p> <TbShare2 /> <p>icon</p>
        </Flex>
        <Flex direction="column">
          <Text textAlign={"center"}>Scroll down and then click</Text>
          <Text textAlign={"center"}>“Add to Home Screen”</Text>
        </Flex>
      </Flex>
    </TransactionModalTemplate>
  );
}
