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
    parseUnits("100000" as `${number}`, 18),
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
        <Text textAlign="center">
          click to make your tokens available for your viewers to purchase
        </Text>
      </Flex>
    </TransactionModalTemplate>
  );
}
