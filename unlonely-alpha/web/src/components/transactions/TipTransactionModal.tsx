import { Text, Input, Flex, useToast } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "../../hooks/context/useUser";
import { ChatBot } from "../../constants/types";
import {
  filteredInput,
  formatIncompleteNumber,
} from "../../utils/validation/input";
import centerEllipses from "../../utils/centerEllipses";
import { TransactionModalTemplate } from "./TransactionModalTemplate";
import { ModalButton } from "../general/button/ModalButton";
import { useUseFeature } from "../../hooks/contracts/useArcadeContract";
import { parseUnits } from "viem";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { useNetwork } from "wagmi";
import { NETWORKS } from "../../constants/networks";
import { useApproval } from "../../hooks/contracts/useApproval";
import { getContractFromNetwork } from "../../utils/contract";
import { InteractionType, USER_APPROVAL_AMOUNT } from "../../constants";
import CreatorTokenAbi from "../../constants/abi/CreatorToken.json";
import { useChannelContext } from "../../hooks/context/useChannel";

export default function TipTransactionModal({
  title,
  isOpen,
  icon,
  callback,
  handleClose,
  addToChatbot,
}: {
  title: string;
  isOpen: boolean;
  icon?: JSX.Element;
  callback?: () => void;
  handleClose: () => void;
  addToChatbot?: (chatBotMessageToAdd: ChatBot) => void;
}) {
  const { channel, token } = useChannelContext();
  const { channelBySlug } = channel;
  const { userTokenBalance, refetchUserTokenBalance } = token;

  const [amount, setAmount] = useState("");
  const [amountOption, setAmountOption] = useState<
    "custom" | "5" | "10" | "15" | "25" | "50"
  >("5");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { user, userAddress } = useUser();
  const toast = useToast();
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return (
      NETWORKS.find((n) => n.config.chainId === network.chain?.id) ??
      NETWORKS[0]
    );
  }, [network]);
  const contract = getContractFromNetwork("unlonelyArcade", localNetwork);

  const {
    requiresApproval,
    writeApproval,
    isTxLoading: isApprovalLoading,
    refetchAllowance,
  } = useApproval(
    channelBySlug?.token?.address as `0x${string}`,
    CreatorTokenAbi,
    userAddress as `0x${string}`,
    contract?.address as `0x${string}`,
    contract?.chainId as number,
    parseUnits(
      (amountOption === "custom" ? amount : amountOption) as `${number}`,
      18
    ),
    parseUnits(USER_APPROVAL_AMOUNT as `${number}`, 18),
    {
      onTxSuccess: (data) => {
        toast({
          title: "approve",
          description: "success",
          status: "success",
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        refetchAllowance();
      },
    }
  );

  const tokenAmount_bigint = useMemo(
    () =>
      requiresApproval
        ? BigInt(0)
        : parseUnits(
            formatIncompleteNumber(
              amountOption === "custom" ? amount : amountOption
            ) as `${number}`,
            18
          ),
    [amountOption, amount, requiresApproval]
  );

  const { useFeature, useFeatureTxLoading } = useUseFeature(
    {
      creatorTokenAddress: channelBySlug?.token?.address as `0x${string}`,
      featurePrice: tokenAmount_bigint,
    },
    {
      onTxSuccess: (data) => {
        toast({
          title: "useFeature",
          description: "success",
          status: "success",
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        callback?.();
        refetchUserTokenBalance?.();
        addToChatbot?.({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.TIP,
          title: "Tip",
          description: `${
            user?.username ?? centerEllipses(userAddress, 15)
          } tipped ${amountOption === "custom" ? amount : amountOption} $${
            channelBySlug?.token?.symbol
          }!`,
        });
        handleClose();
      },
    }
  );

  const handleSend = async () => {
    if (!useFeature || !addToChatbot) return;
    await useFeature();
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

  const masterLoading = useMemo(() => {
    return (useFeatureTxLoading ?? false) || isApprovalLoading;
  }, [useFeatureTxLoading, isApprovalLoading]);

  const canSend = useMemo(() => {
    if (requiresApproval) return false;
    if (amountOption === "custom" && Number(formattedAmount) === 0)
      return false;
    if (!useFeature) return false;
    return true;
  }, [formattedAmount, amountOption, requiresApproval, useFeature]);

  useEffect(() => {
    if (!userAddress) {
      setErrorMessage("connect wallet first");
    } else if (
      !userTokenBalance?.value ||
      (userTokenBalance?.value && tokenAmount_bigint > userTokenBalance?.value)
    ) {
      setErrorMessage(
        `you don't have enough ${channelBySlug?.token?.symbol} to spend`
      );
    } else {
      setErrorMessage("");
    }
  }, [userTokenBalance, tokenAmount_bigint, userAddress, channelBySlug]);

  return (
    <TransactionModalTemplate
      title={title}
      confirmButton={"tip"}
      isOpen={isOpen}
      icon={icon}
      isModalLoading={masterLoading}
      canSend={canSend}
      onSend={handleSend}
      handleClose={handleClose}
      needsApproval={requiresApproval}
      approve={writeApproval}
    >
      <Flex direction={"column"} gap="16px">
        <Text textAlign={"center"} fontSize="25px" color="#BABABA">
          you own{" "}
          {`${truncateValue(userTokenBalance?.formatted ?? "0", 3)} $${
            channelBySlug?.token?.symbol
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
            placeholder={`enter amount of $${channelBySlug?.token?.symbol}`}
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
        {errorMessage && (
          <Text textAlign={"center"} color="red.400">
            {errorMessage}
          </Text>
        )}
      </Flex>
    </TransactionModalTemplate>
  );
}
