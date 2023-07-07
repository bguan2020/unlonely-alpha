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
}: {
  title: string;
  confirmButton: string;
  isOpen: boolean;
  children: React.ReactNode;
  isModalLoading: boolean;
  loadingText?: string;
  canSend?: boolean;
  icon?: JSX.Element;
  needsApproval?: boolean;
  hideFooter?: boolean;
  approve?: () => void;
  handleClose: () => void;
  onSend?: () => void;
}) => {
  const { user, userAddress } = useUser();

  return (
    <Modal
      closeOnOverlayClick={!isModalLoading}
      isCentered
      isOpen={isOpen}
      onClose={handleClose}
    >
      <ModalOverlay />
      <ModalContent>
        <IconButton
          aria-label="close"
          _hover={{}}
          _active={{}}
          _focus={{}}
          bg="transparent"
          icon={<Image alt="close" src="/svg/close.svg" width="20px" />}
          onClick={handleClose}
          disabled={isModalLoading}
          position="absolute"
          left="5px"
          top="5px"
        />
        <ModalHeader flex="1" mt="15px">
          <Flex gap="10px" justifyContent={"space-around"} mx="20px">
            {icon && icon}
            {title && (
              <Text
                fontSize="25px"
                textAlign={"center"}
                fontFamily="Neue Pixel Sans"
                fontWeight="medium"
              >
                {title}
              </Text>
            )}
          </Flex>
        </ModalHeader>
        {!isModalLoading && (
          <>
            <ModalBody>{children}</ModalBody>
            {!hideFooter && (
              <ModalFooter>
                {needsApproval && (
                  <Button
                    bg="#CB520E"
                    _hover={{}}
                    _focus={{}}
                    _active={{}}
                    onClick={approve}
                    width="100%"
                    disabled={!approve}
                    borderRadius="25px"
                  >
                    approve tokens transfer
                  </Button>
                )}
                {!needsApproval && (
                  <Button
                    bg="#E09025"
                    _hover={{}}
                    _focus={{}}
                    _active={{}}
                    onClick={onSend}
                    width="100%"
                    disabled={
                      !canSend ||
                      !user ||
                      !userAddress ||
                      !isAddress(userAddress)
                    }
                    borderRadius="25px"
                  >
                    {confirmButton}
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
