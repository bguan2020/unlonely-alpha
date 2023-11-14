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
      confirmButton={"close"}
      onSend={closePrompt}
      canSend={true}
      blur
      bg="#e7e7e7"
    >
      <Flex direction="column" alignItems={"center"} margin="10px">
        <Image src="/icons/icon-192x192.png" h="80px" mb="10px" />
        <Text color="black" fontFamily="LoRes15" fontSize="25px" mb="10px">
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
        <Text textAlign={"center"} color="black" fontSize="12px" mt="10px">
          (Can't find the "add to home screen" button? make sure you're not in
          an in-app browser!)
        </Text>
      </Flex>
    </TransactionModalTemplate>
  );
}
