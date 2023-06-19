import { useEffect, useMemo, useState } from "react";
import { erc20ABI, useNetwork } from "wagmi";
import { NETWORKS } from "../../constants/networks";
import { FetchBalanceResult } from "../../constants/types";
import { getContractFromNetwork } from "../../utils/contract";
import { useApproval } from "../../hooks/useApproval";
import { Flex, Text, useToast, Input } from "@chakra-ui/react";
import { formatUnits, parseUnits } from "viem";
import {
  filteredInput,
  formatIncompleteNumber,
} from "../../utils/validation/input";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { ModalButton } from "../general/button/ModalButton";
import { USER_APPROVAL_AMOUNT } from "../../constants";

export default function TokenSaleModal({
  title,
  isOpen,
  tokenContractAddress,
  tokenOwner,
  tokenBalanceData,
  callback,
  handleClose,
}: {
  title: string;
  isOpen: boolean;
  tokenContractAddress: string;
  tokenOwner: string;
  tokenBalanceData?: FetchBalanceResult;
  callback?: any;
  handleClose: () => void;
}) {
  const toast = useToast();

  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return (
      NETWORKS.find((n) => n.config.chainId === network.chain?.id) ??
      NETWORKS[1]
    );
  }, [network]);
  const contract = getContractFromNetwork("unlonelyArcade", localNetwork);

  const [sellTokenAmount, setSellTokenAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const sellTokenAmount_bigint = useMemo(
    () =>
      parseUnits(formatIncompleteNumber(sellTokenAmount) as `${number}`, 18),
    [sellTokenAmount]
  );

  const {
    allowance,
    writeApproval,
    isTxLoading: isApprovalLoading,
    refetchAllowance,
  } = useApproval(
    tokenContractAddress as `0x${string}`,
    erc20ABI,
    tokenOwner as `0x${string}`,
    contract?.address as `0x${string}`,
    contract?.chainId as number,
    isCustom
      ? sellTokenAmount_bigint
      : parseUnits(USER_APPROVAL_AMOUNT as `${number}`, 18),
    undefined,
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
      },
    }
  );

  const handleInputChange = (event: any) => {
    const input = event.target.value;
    const filtered = filteredInput(input);
    setSellTokenAmount(filtered);
  };

  const canSend = useMemo(() => {
    if (isCustom && sellTokenAmount_bigint === BigInt(0)) return false;
    if (!writeApproval) return false;
    return true;
  }, [isCustom, sellTokenAmount_bigint, writeApproval]);

  useEffect(() => {
    if (tokenContractAddress) refetchAllowance();
  }, [isApprovalLoading]);

  return (
    <TransactionModalTemplate
      title={title}
      confirmButton={"confirm"}
      isOpen={isOpen}
      isModalLoading={isApprovalLoading}
      canSend={canSend}
      onSend={writeApproval}
      handleClose={handleClose}
    >
      <Flex direction="column" gap="16px">
        <Text textAlign={"center"} fontSize="25px" color="#BABABA">
          you own{" "}
          {`${truncateValue(tokenBalanceData?.formatted ?? "0", 3)} $${
            tokenBalanceData?.symbol
          }`}
        </Text>
        <Text textAlign={"center"} fontSize="25px" color="#BABABA">
          {`${formatUnits(allowance, 18)} $${tokenBalanceData?.symbol} on sale`}
        </Text>
        <Flex justifyContent={"space-between"} direction="column" gap="10px">
          <ModalButton
            height="50px"
            fade={!isCustom ? 1 : 0.2}
            onClick={() => setIsCustom(false)}
          >
            <Text fontSize="20px">{USER_APPROVAL_AMOUNT}</Text>
          </ModalButton>
          <ModalButton
            height="50px"
            fade={isCustom ? 1 : 0.2}
            onClick={() => setIsCustom(true)}
          >
            <Text fontSize="20px">custom amount</Text>
          </ModalButton>
          {isCustom && (
            <Input
              placeholder={`enter amount of $${tokenBalanceData?.symbol}`}
              value={sellTokenAmount}
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
      </Flex>
    </TransactionModalTemplate>
  );
}
