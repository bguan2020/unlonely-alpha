import { Text, Input, Flex } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useUser } from "../../hooks/useUser";
import { ChatBot } from "../../pages/channels/brian";
import {
  filteredInput,
  formatIncompleteNumber,
} from "../../utils/validation/input";
import { TransactionModalTemplate } from "./TransactionModalTemplate";
import { ModalButton } from "../general/button/ModalButton";

export default function ChanceTransactionModal({
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
  const [amountOption, setAmountOption] = useState<
    "custom" | "5" | "10" | "15" | "25" | "50"
  >("5");

  const { user } = useUser();

  const handleSend = async () => {
    if (!addToChatbot) return;
    addToChatbot({
      username: user?.username ?? "",
      address: user?.address ?? "",
      taskType: "chance",
      title: "Chance",
      description: "CHANCE",
    });
  };

  const handleInputChange = (event: any) => {
    const input = event.target.value;
    const filtered = filteredInput(input);
    setAmount(filtered);
  };

  const formattedAmount = useMemo(
    () => formatIncompleteNumber(amount),
    [amount]
  );

  const canSend = useMemo(() => {
    // if (!balanceOfData) return false;
    // if (Number(formatEther(balanceOfData.value)) < Number(formattedAmount))
    //   return false;
    if (amountOption === "custom" && Number(formattedAmount) < 5) return false;
    return true;
  }, [formattedAmount, amountOption]);

  return (
    <TransactionModalTemplate
      title={title}
      contractAddress={contractAddress}
      isOpen={isOpen}
      icon={icon}
      canSend={canSend}
      onSend={handleSend}
      handleClose={handleClose}
    >
      <Flex direction={"column"} gap="16px">
        <Flex justifyContent={"space-between"}>
          <ModalButton
            width="120px"
            height="50px"
            fade={amountOption === "5" ? 1 : 0.2}
            onClick={() => setAmountOption("5")}
          >
            <Text fontSize="20px">5</Text>
          </ModalButton>
          <ModalButton
            width="120px"
            height="50px"
            fade={amountOption === "10" ? 1 : 0.2}
            onClick={() => setAmountOption("10")}
          >
            <Text fontSize="20px">10</Text>
          </ModalButton>
          <ModalButton
            width="120px"
            height="50px"
            fade={amountOption === "15" ? 1 : 0.2}
            onClick={() => setAmountOption("15")}
          >
            <Text fontSize="20px">15</Text>
          </ModalButton>
        </Flex>
        <Flex justifyContent={"space-between"}>
          <ModalButton
            width="190px"
            height="50px"
            fade={amountOption === "25" ? 1 : 0.2}
            onClick={() => setAmountOption("25")}
          >
            <Text fontSize="20px">25</Text>
          </ModalButton>
          <ModalButton
            width="190px"
            height="50px"
            fade={amountOption === "50" ? 1 : 0.2}
            onClick={() => setAmountOption("50")}
          >
            <Text fontSize="20px">50</Text>
          </ModalButton>
        </Flex>
        <Flex justifyContent={"space-between"}>
          <ModalButton
            width="100%"
            height="50px"
            fade={amountOption === "custom" ? 1 : 0.2}
            onClick={() => setAmountOption("custom")}
          >
            <Text fontSize="20px">custom amount</Text>
          </ModalButton>
        </Flex>
        {amountOption === "custom" && (
          <Input
            placeholder="enter amount of $brian"
            value={amount}
            onChange={handleInputChange}
            borderWidth="1px"
            borderRadius="10px"
            borderColor="#244FA7"
            bg="rgba(36, 79, 167, 0.05)"
            variant="unstyled"
            px="16px"
            py="10px"
          />
        )}
      </Flex>
    </TransactionModalTemplate>
  );
}
