import {
  Modal,
  ModalOverlay,
  ModalContent,
  Flex,
  IconButton,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Image,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { isAddress } from "viem";

import { useUser } from "../../hooks/context/useUser";

export const TransactionModalTemplate = ({
  title,
  confirmButton,
  isOpen,
  canSend,
  icon,
  children,
  isModalLoading,
  loadingText,
  needsApproval,
  hideFooter,
  approve,
  handleClose,
  onSend,
  cannotClose,
  size,
  blur,
  bg,
}: {
  title?: string;
  confirmButton?: string;
  isOpen: boolean;
  children?: React.ReactNode;
  isModalLoading?: boolean;
  loadingText?: string;
  canSend?: boolean;
  icon?: JSX.Element;
  needsApproval?: boolean;
  hideFooter?: boolean;
  approve?: () => void;
  handleClose: () => void;
  onSend?: () => void;
  cannotClose?: boolean;
  bg?: string;
  blur?: boolean;
  size?:
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "full";
}) => {
  const { user, wagmiAddress } = useUser();

  return (
    <Modal
      closeOnOverlayClick={!isModalLoading && !cannotClose}
      isCentered
      isOpen={isOpen}
      onClose={handleClose}
      size={size ?? "md"}
    >
      <ModalOverlay backdropFilter={blur ? "blur(10px)" : undefined} />
      <ModalContent bg={bg}>
        {!cannotClose && (
          <IconButton
            aria-label="close"
            _hover={{}}
            _active={{}}
            _focus={{}}
            bg="transparent"
            icon={<Image alt="close" src="/svg/close.svg" width="20px" />}
            onClick={handleClose}
            isDisabled={isModalLoading}
            position="absolute"
            left="5px"
            top="5px"
          />
        )}
        {(icon || title) && (
          <ModalHeader flex="1" mt="15px">
            <Flex direction="column" gap="10px">
              {icon && <Flex ml="40px">{icon}</Flex>}
              {title && (
                <Text
                  fontSize="25px"
                  textAlign={"center"}
                  fontFamily="LoRes15"
                  fontWeight="medium"
                >
                  {title}
                </Text>
              )}
            </Flex>
          </ModalHeader>
        )}
        {!isModalLoading && (
          <>
            {children && <ModalBody>{children}</ModalBody>}
            {!hideFooter && (
              <ModalFooter>
                {needsApproval && (
                  <Button
                    color="white"
                    bg="#CB520E"
                    _hover={{}}
                    _focus={{}}
                    _active={{}}
                    onClick={approve}
                    width="100%"
                    isDisabled={!approve}
                    borderRadius="25px"
                  >
                    approve tokens transfer
                  </Button>
                )}
                {!needsApproval && (
                  <Button
                    color="white"
                    bg="#E09025"
                    _hover={{}}
                    _focus={{}}
                    _active={{}}
                    onClick={onSend}
                    width="100%"
                    isDisabled={
                      !canSend ||
                      !user ||
                      !wagmiAddress ||
                      !isAddress(wagmiAddress)
                    }
                    borderRadius="25px"
                  >
                    {confirmButton ?? ""}
                  </Button>
                )}
              </ModalFooter>
            )}
          </>
        )}
        {isModalLoading && (
          <ModalBody>
            <Flex direction="column" gap="20px">
              <Flex justifyContent={"center"} p="10px">
                <Spinner size="xl" />
              </Flex>
              <Text textAlign={"center"}>
                {loadingText ??
                  "executing transaction, please do not exit this page"}
              </Text>
            </Flex>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};
