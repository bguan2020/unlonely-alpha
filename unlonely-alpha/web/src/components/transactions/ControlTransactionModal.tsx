import { Flex, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useUser } from "../../hooks/useUser";
import { ChatBot } from "../../pages/channels/brian";
import { ModalButton } from "../general/button/ModalButton";
import { TransactionModalTemplate } from "./TransactionModalTemplate";

export default function ControlTransactionModal({
  title,
  isOpen,
  contractAddress,
  icon,
  handleClose,
  addToChatbot,
}: {
  title: string;
  isOpen: boolean;
  contractAddress: string;
  icon?: JSX.Element;
  handleClose: () => void;
  addToChatbot?: (chatBotMessageToAdd: ChatBot) => void;
}) {
  const [amount, setAmount] = useState("");
  const [amountOption, setAmountOption] = useState<"5" | "10" | "25" | "50">(
    "5"
  );

  const { user } = useUser();

  const handleSend = async () => {
    if (!addToChatbot) return;
    addToChatbot({
      username: user?.username ?? "",
      address: user?.address ?? "",
      taskType: "control",
      title: "Control",
      description: "CONTROL",
    });
  };

  return (
    <TransactionModalTemplate
      title={title}
      contractAddress={contractAddress}
      isOpen={isOpen}
      icon={icon}
      canSend={true}
      onSend={handleSend}
      handleClose={handleClose}
    >
      <Flex direction="column" gap="16px">
        <Flex justifyContent={"space-evenly"} alignItems="center">
          <ModalButton
            width="120px"
            height="50px"
            fade={amountOption === "5" ? 1 : 0.2}
            onClick={() => setAmountOption("5")}
          >
            <Text fontSize="20px">5</Text>
          </ModalButton>
          <Text color="#EBE6E6">Change to a new scene</Text>
        </Flex>
        <Flex justifyContent={"space-evenly"} alignItems="center">
          <ModalButton
            width="120px"
            height="50px"
            fade={amountOption === "10" ? 1 : 0.2}
            onClick={() => setAmountOption("10")}
          >
            <Text fontSize="20px">10</Text>
          </ModalButton>
          <Text color="#EBE6E6">Change to a new scene</Text>
        </Flex>{" "}
        <Flex justifyContent={"space-evenly"} alignItems="center">
          <ModalButton
            width="120px"
            height="50px"
            fade={amountOption === "25" ? 1 : 0.2}
            onClick={() => setAmountOption("25")}
          >
            <Text fontSize="20px">25</Text>
          </ModalButton>
          <Text color="#EBE6E6">Change to a new scene</Text>
        </Flex>{" "}
        <Flex justifyContent={"space-evenly"} alignItems="center">
          <ModalButton
            width="120px"
            height="50px"
            fade={amountOption === "50" ? 1 : 0.2}
            onClick={() => setAmountOption("50")}
          >
            <Text fontSize="20px">50</Text>
          </ModalButton>
          <Text color="#EBE6E6">Change to a new scene</Text>
        </Flex>
      </Flex>
    </TransactionModalTemplate>
  );
}
