import { Flex, Button, Text } from "@chakra-ui/react";
import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";

export const VersusTokenGameFinishedModal = ({
  title,
  isOpen,
  handleClose,
}: {
  title: string;
  isOpen: boolean;
  handleClose: () => void;
}) => {
  return (
    <TransactionModalTemplate
      title={title}
      isOpen={isOpen}
      handleClose={handleClose}
      bg={"#18162F"}
      hideFooter
    >
      <Text>This token will now be tradable from now on by itself</Text>
      <Flex justifyContent={"space-evenly"} gap="5px">
        <Button onClick={handleClose}>Continue</Button>
      </Flex>
    </TransactionModalTemplate>
  );
};
