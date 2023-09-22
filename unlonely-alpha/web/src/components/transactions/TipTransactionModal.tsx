import { Text, Input, Flex, useToast, Box } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { parseUnits } from "viem";
import { useNetwork } from "wagmi";
import Link from "next/link";

import { useUser } from "../../hooks/context/useUser";
import {
  filteredInput,
  formatIncompleteNumber,
} from "../../utils/validation/input";
import centerEllipses from "../../utils/centerEllipses";
import { TransactionModalTemplate } from "./TransactionModalTemplate";
import { ModalButton } from "../general/button/ModalButton";
import { useUseFeature } from "../../hooks/contracts/useArcadeContract";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { NETWORKS } from "../../constants/networks";
import { useApproval } from "../../hooks/contracts/useApproval";
import { getContractFromNetwork } from "../../utils/contract";
import { InteractionType, USER_APPROVAL_AMOUNT } from "../../constants";
import CreatorTokenAbi from "../../constants/abi/CreatorToken.json";
import { useChannelContext } from "../../hooks/context/useChannel";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { useNetworkContext } from "../../hooks/context/useNetwork";

export default function TipTransactionModal({
  title,
  isOpen,
  icon,
  callback,
  handleClose,
}: {
  title: string;
  isOpen: boolean;
  icon?: JSX.Element;
  callback?: () => void;
  handleClose: () => void;
}) {
  const { channel, token, arcade } = useChannelContext();
  const { network: net } = useNetworkContext();
  const { addToChatbot } = arcade;
  const { matchingChain } = net;

  const { channelQueryData } = channel;
  const { userTokenBalance, refetchUserTokenBalance } = token;
  const { isStandalone } = useUserAgent();

  const [amount, setAmount] = useState("");
  const [amountOption, setAmountOption] = useState<
    "custom" | "5" | "10" | "15" | "25" | "50"
  >("5");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { user, userAddress, walletIsConnected } = useUser();
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
    channelQueryData?.token?.address as `0x${string}`,
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
      onWriteSuccess: (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#287ab0" px={4} h={8}>
              <Link
                target="_blank"
                href={`https://etherscan.io/tx/${data.hash}`}
                passHref
              >
                approve pending, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
      onTxSuccess: (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`https://etherscan.io/tx/${data.transactionHash}`}
                passHref
              >
                approve success, click to view
              </Link>
            </Box>
          ),
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
      creatorTokenAddress: channelQueryData?.token?.address as `0x${string}`,
      featurePrice: tokenAmount_bigint,
    },
    contract,
    {
      onWriteSuccess: (data) => {
        handleClose();
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#287ab0" px={4} h={8}>
              <Link
                target="_blank"
                href={`https://etherscan.io/tx/${data.hash}`}
                passHref
              >
                useFeature pending, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
      onTxSuccess: (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`https://etherscan.io/tx/${data.transactionHash}`}
                passHref
              >
                useFeature success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        callback?.();
        refetchUserTokenBalance?.();
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.TIP,
          title: `${user?.username ?? centerEllipses(userAddress, 15)} tipped ${
            amountOption === "custom" ? amount : amountOption
          } $${channelQueryData?.token?.symbol}!`,
          description: "Tip",
        });
      },
    }
  );

  const handleSend = async () => {
    if (!useFeature) return;
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
    if (!walletIsConnected) {
      setErrorMessage("connect wallet first");
    } else if (!matchingChain) {
      setErrorMessage("wrong network");
    } else if (
      !userTokenBalance?.value ||
      (userTokenBalance?.value && tokenAmount_bigint > userTokenBalance?.value)
    ) {
      setErrorMessage(
        `you don't have enough ${channelQueryData?.token?.symbol} to spend`
      );
    } else {
      setErrorMessage("");
    }
  }, [
    userTokenBalance,
    tokenAmount_bigint,
    walletIsConnected,
    channelQueryData,
    matchingChain,
  ]);

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
      size={isStandalone ? "sm" : "md"}
    >
      <Flex direction={"column"} gap="16px">
        <Text textAlign={"center"} fontSize="25px" color="#BABABA">
          you own{" "}
          {`${truncateValue(userTokenBalance?.formatted ?? "0", 3)} $${
            channelQueryData?.token?.symbol
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
            placeholder={`enter amount of $${channelQueryData?.token?.symbol}`}
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
