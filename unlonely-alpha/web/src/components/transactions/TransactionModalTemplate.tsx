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
import { useState } from "react";
import { useBalance } from "wagmi";
import { useUser } from "../../hooks/useUser";

export const TransactionModalTemplate = ({
  title,
  contractAddress,
  isOpen,
  canSend,
  icon,
  children,
  handleClose,
  onSend,
}: {
  title: string;
  contractAddress: string;
  isOpen: boolean;
  canSend?: boolean;
  icon?: JSX.Element;
  children: React.ReactNode;
  handleClose: () => void;
  onSend?: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const {
    data: balanceOfData,
    isError: balanceOfError,
    isLoading: balanceOfLoading,
  } = useBalance({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    address: user?.address ?? "",
    token: contractAddress as `0x${string}`,
  });

  const handleSend = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSend && onSend();
      handleClose();
    }, 7000);
  };

  return (
    <Modal
      closeOnOverlayClick={!loading}
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
          disabled={loading}
          position="absolute"
          left="5px"
          top="5px"
        />
        <ModalHeader flex="1" mt="15px">
          <Flex gap="10px" justifyContent={"space-around"} mx="20px">
            {icon && icon}
            <Text
              fontSize="25px"
              textAlign={"center"}
              fontFamily="Neue Pixel Sans"
              fontWeight="medium"
            >
              {title}
            </Text>
          </Flex>
        </ModalHeader>
        {!loading && (
          <>
            <ModalBody>{children}</ModalBody>
            <ModalFooter>
              <Button
                bg="#131323"
                _hover={{}}
                _focus={{}}
                _active={{}}
                onClick={handleSend}
                disabled={!canSend || !user}
              >
                Send
              </Button>
            </ModalFooter>
          </>
        )}
        {loading && (
          <ModalBody>
            <Flex justifyContent={"center"}>
              <Spinner size="xl" />
            </Flex>
            <Text textAlign={"center"}>
              Executing transaction, please do not exit this page
            </Text>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};
