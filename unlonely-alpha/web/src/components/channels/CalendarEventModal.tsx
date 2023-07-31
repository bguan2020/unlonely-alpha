import { Flex, Text } from "@chakra-ui/react";
import Link from "next/link";

import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";

export default function CalendarEventModal({
  title,
  isOpen,
  callback,
  handleClose,
}: {
  title: string;
  isOpen: boolean;
  callback?: any;
  handleClose: () => void;
}) {
  return (
    <TransactionModalTemplate
      confirmButton=""
      hideFooter
      title={title}
      isOpen={isOpen}
      handleClose={handleClose}
      isModalLoading={false}
    >
      <Flex direction="column" gap="16px">
        <Text textAlign="center">
          click on the following link to add your event, then ping Grace to have
          it approved
        </Text>
        <Link href={"https://lu.ma/unlonely"} passHref target="_blank">
          <Text textAlign="center" fontSize="20px" textDecoration="underline">
            ok, take me there
          </Text>
        </Link>
      </Flex>
    </TransactionModalTemplate>
  );
}