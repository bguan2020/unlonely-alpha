import { useEffect, useMemo, useState } from "react";
import { useNetwork } from "wagmi";
import { NETWORKS } from "../../constants/networks";
import { FetchBalanceResult } from "../../constants/types";
import { getContractFromNetwork } from "../../utils/contract";
import { useApproval } from "../../hooks/contracts/useApproval";
import { Flex, Text, useToast } from "@chakra-ui/react";
import { formatUnits, parseUnits } from "viem";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { ModalButton } from "../general/button/ModalButton";
import CreatorTokenAbi from "../../constants/abi/CreatorToken.json";
import { ChannelDetailQuery } from "../../generated/graphql";

export default function TokenSaleModal({
  title,
  channel,
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
  channel: ChannelDetailQuery["getChannelBySlug"];
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

  const [amountOption, setAmountOption] = useState<"10000" | "100000">(
    "100000"
  );

  const {
    allowance,
    writeApproval,
    isTxLoading: isApprovalLoading,
    refetchAllowance,
  } = useApproval(
    tokenContractAddress as `0x${string}`,
    CreatorTokenAbi,
    tokenOwner as `0x${string}`,
    contract?.address as `0x${string}`,
    contract?.chainId as number,
    parseUnits(amountOption as `${number}`, 18),
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

  const canSend = useMemo(() => {
    if (!writeApproval) return false;
    return true;
  }, [writeApproval]);

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
            channel?.token?.symbol
          }`}
        </Text>
        <Text textAlign={"center"} fontSize="25px" color="#BABABA">
          {`${formatUnits(allowance, 18)} $${channel?.token?.symbol} on sale`}
        </Text>
        <Flex justifyContent={"space-between"} direction="column" gap="10px">
          <ModalButton
            height="50px"
            fade={amountOption === "100000" ? 1 : 0.2}
            onClick={() => setAmountOption("100000")}
          >
            <Text fontSize="20px">100000</Text>
          </ModalButton>
          <ModalButton
            height="50px"
            fade={amountOption === "10000" ? 1 : 0.2}
            onClick={() => setAmountOption("10000")}
          >
            <Text fontSize="20px">10000</Text>
          </ModalButton>
        </Flex>
      </Flex>
    </TransactionModalTemplate>
  );
}
