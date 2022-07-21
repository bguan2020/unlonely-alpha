import {
  Modal,
  ModalOverlay,
  ModalContent,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";

type NFTModalRootProps = {
  TriggerButton: JSX.Element;
  children?: React.ReactNode;
};

const NFTModalRoot: React.FunctionComponent<NFTModalRootProps> = ({
  TriggerButton,
  children,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {React.cloneElement(TriggerButton, { onClick: onOpen })}
      <Modal isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backgroundColor="#282828e6" />
        <ModalContent
          maxW="500px"
          boxShadow="0px 8px 28px #0a061c40"
          padding="12px"
          borderRadius="5px"
          bg="#3A3A3A"
        >
          {children}
        </ModalContent>
      </Modal>
    </>
  );
};

export default NFTModalRoot;
