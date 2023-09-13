import { useEffect, useMemo } from "react";
import { useNetwork } from "wagmi";
import { Box, Flex, Text, useToast } from "@chakra-ui/react";
import Link from "next/link";
import { parseUnits } from "viem";

import { NETWORKS } from "../../constants/networks";
import { getContractFromNetwork } from "../../utils/contract";
import { useApproval } from "../../hooks/contracts/useApproval";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";
import { useUser } from "../../hooks/context/useUser";
import { useChannelContext } from "../../hooks/context/useChannel";
import CreatorTokenAbi from "../../constants/abi/CreatorToken.json";
import useUserAgent from "../../hooks/internal/useUserAgent";

export default function TokenSaleModal({
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
  const { user } = useUser();
  const { channel } = useChannelContext();
  const { channelQueryData } = channel;
  const toast = useToast();
  const { isStandalone } = useUserAgent();

  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return (
      NETWORKS.find((n) => n.config.chainId === network.chain?.id) ??
      NETWORKS[0]
    );
  }, [network]);
  const contract = getContractFromNetwork("unlonelyArcade", localNetwork);

  const {
    writeApproval,
    isTxLoading: isApprovalLoading,
    refetchAllowance,
  } = useApproval(
    channelQueryData?.token?.address as `0x${string}`,
    CreatorTokenAbi,
    user?.address as `0x${string}`,
    contract?.address as `0x${string}`,
    contract?.chainId as number,
    parseUnits("100000" as `${number}`, 18),
    undefined,
    {
      onWriteSuccess: (data) => {
        handleClose();
        toast({
          duration: 9000,
          isClosable: true,
          position: "top-right",
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
        });
      },
      onTxSuccess: (data) => {
        toast({
          duration: 9000,
          isClosable: true,
          position: "top-right",
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
        });
        callback?.();
      },
    }
  );

  const canSend = useMemo(() => {
    if (!writeApproval) return false;
    return true;
  }, [writeApproval]);

  useEffect(() => {
    if (channelQueryData?.token?.address) refetchAllowance();
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
      size={isStandalone ? "sm" : "md"}
    >
      <Flex direction="column" gap="16px">
        <Text textAlign="center">
          click to make your tokens available for your viewers to purchase
        </Text>
      </Flex>
    </TransactionModalTemplate>
  );
}
