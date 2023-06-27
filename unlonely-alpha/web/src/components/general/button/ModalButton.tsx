import { ButtonProps, Button } from "@chakra-ui/react";

interface ModalButtonProps extends ButtonProps {
  fade?: number;
}

export const ModalButton: React.FC<ModalButtonProps> = ({
  fade,
  children,
  ...rest
}) => {
  return (
    <Button
      {...rest}
      borderWidth="3px"
      borderRadius="25px"
      borderColor="#244FA7"
      bg={`rgba(36, 79, 167, ${fade ?? 1})`}
      _hover={{}}
      _focus={{}}
      _active={{}}
    >
      {children}
    </Button>
  );
};
