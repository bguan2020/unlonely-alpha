import { Text, Input, Flex, useToast } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useUser } from "../../hooks/useUser";
import { ChatBot } from "../../pages/channels/brian";
import {
  filteredInput,
  formatIncompleteNumber,
} from "../../utils/validation/input";
import centerEllipses from "../../utils/centerEllipses";
import { TransactionModalTemplate } from "./TransactionModalTemplate";
import { ModalButton } from "../general/button/ModalButton";
import {
  useBuyCreatorToken,
  useCalculateEthAmount,
  useReadPublic,
} from "../../hooks/contracts/useArcadeContract";
import { useNetwork } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { NETWORKS } from "../../constants/networks";
import { FetchBalanceResult } from "../../constants/types";

export default function BuyTransactionModal({
  title,
  isOpen,
  tokenContractAddress,
  tokenBalanceData,
  icon,
  callback,
  handleClose,
  addToChatbot,
}: {
  title: string;
  isOpen: boolean;
  tokenContractAddress: string;
  tokenBalanceData?: FetchBalanceResult;
  icon?: JSX.Element;
  callback?: () => void;
  handleClose: () => void;
  addToChatbot?: (chatBotMessageToAdd: ChatBot) => void;
}) {
  const [amount, setAmount] = useState("");
  const [amountOption, setAmountOption] = useState<
    "custom" | "5" | "10" | "15" | "25" | "50"
  >("5");

  const { user } = useUser();
  const toast = useToast();
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return (
      NETWORKS.find((n) => n.config.chainId === network.chain?.id) ??
      NETWORKS[1]
    );
  }, [network]);
  // const contract = getContractFromNetwork("unlonelyArcade", localNetwork);

  const buyTokenAmount_bigint = useMemo(
    () =>
      parseUnits(
        formatIncompleteNumber(
          amountOption === "custom" ? amount : amountOption
        ) as `${number}`,
        18
      ),
    [amountOption, amount]
  );

  const { refetch: refetchPublic, tokenOwner } = useReadPublic(
    tokenContractAddress as `0x${string}`
  );

  const { amountIn } = useCalculateEthAmount(
    tokenContractAddress as `0x${string}`,
    buyTokenAmount_bigint
  );

  const { buyCreatorToken, buyCreatorTokenTxLoading } = useBuyCreatorToken(
    {
      creatorTokenAddress: tokenContractAddress as `0x${string}`,
      amountIn,
      amountOut: buyTokenAmount_bigint,
    },
    {
      onTxSuccess: (data) => {
        toast({
          title: "buyCreatorToken",
          description: "success",
          status: "success",
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        refetchPublic();
        callback?.();
      },
    }
  );

  const handleSend = async () => {
    if (!buyCreatorToken || !addToChatbot) return;
    await buyCreatorToken();
    addToChatbot({
      username: user?.username ?? "",
      address: user?.address ?? "",
      taskType: "tip",
      title: "Tip",
      description: `${
        user?.username ?? centerEllipses(user?.address, 15)
      } tipped ${amountOption === "custom" ? amount : amountOption} $${
        tokenBalanceData?.symbol
      }`,
    });
  };

  const handleInputChange = (event: any) => {
    const input = event.target.value;
    const filtered = filteredInput(input);
    setAmount(filtered);
  };

  const canSend = useMemo(() => {
    if (amountOption === "custom" && buyTokenAmount_bigint <= BigInt(0))
      return false;
    if (!buyCreatorToken) return false;
    return true;
  }, [buyTokenAmount_bigint, amountOption, buyCreatorToken]);

  return (
    <TransactionModalTemplate
      title={title}
      confirmButton={"purchase"}
      isOpen={isOpen}
      icon={icon}
      isModalLoading={buyCreatorTokenTxLoading ?? false}
      canSend={canSend}
      onSend={handleSend}
      handleClose={handleClose}
    >
      <Flex direction={"column"} gap="16px">
        <Text textAlign={"center"} fontSize="25px" color="#BABABA">
          you own{" "}
          {`${truncateValue(tokenBalanceData?.formatted ?? "0", 3)} $${
            tokenBalanceData?.symbol
          }`}
        </Text>
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
            placeholder={`enter amount of $${tokenBalanceData?.symbol}`}
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
        <Text textAlign={"right"} fontSize="25px" color="#BABABA">
          cost: {`${truncateValue(formatUnits(amountIn, 18) ?? "0", 3)} eth`}
        </Text>
      </Flex>
    </TransactionModalTemplate>
  );
}
