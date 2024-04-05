import {
  Box,
  Button,
  Flex,
  Input,
  Spinner,
  useToast,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { decodeEventLog, isAddress } from "viem";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { useNetworkContext } from "../../../hooks/context/useNetwork";
import { useSendRemainingFundsToWinnerAfterTokenExpiration } from "../../../hooks/contracts/useTempTokenV1";
import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";
import Link from "next/link";

export const SendRemainingFundsFromCurrentInactiveTokenModal = ({
  title,
  handleClose,
  isOpen,
}: {
  title: string;
  handleClose: () => void;
  isOpen: boolean;
}) => {
  const toast = useToast();
  const { channel } = useChannelContext();
  const { currentTempTokenContract } = channel;
  const { network } = useNetworkContext();
  const { explorerUrl } = network;

  const [winnerAddress, setWinnerAddress] = useState("");

  const {
    sendRemainingFundsToWinnerAfterTokenExpiration,
    sendRemainingFundsToWinnerAfterTokenExpirationTxLoading,
  } = useSendRemainingFundsToWinnerAfterTokenExpiration(
    {
      winnerWalletAddress: winnerAddress,
    },
    currentTempTokenContract,
    {
      onWriteSuccess: (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#287ab0" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.hash}`}
                passHref
              >
                send remaining funds pending, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
      onWriteError: (error) => {
        toast({
          duration: 9000,
          isClosable: true,
          position: "top-right",
          render: () => (
            <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
              send remaining funds cancelled
            </Box>
          ),
        });
      },
      onTxSuccess: async (data) => {
        const topics = decodeEventLog({
          abi: currentTempTokenContract.abi,
          data: data.logs[0].data,
          topics: data.logs[0].topics,
        });
        console.log("send remaining funds success", data, topics.args);
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                send remaining funds success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        handleClose();
      },
      onTxError: (error) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              send remaining funds error
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
    }
  );

  return (
    <TransactionModalTemplate
      title={title}
      handleClose={handleClose}
      isOpen={isOpen}
      hideFooter
    >
      <Flex direction="column" gap="5px">
        <Text>Please provide an address to send it</Text>
        <Input
          variant="glow"
          value={winnerAddress}
          onChange={(e) => setWinnerAddress(e.target.value)}
        />
        <Button
          isDisabled={
            !isAddress(winnerAddress) ||
            sendRemainingFundsToWinnerAfterTokenExpirationTxLoading ||
            !sendRemainingFundsToWinnerAfterTokenExpiration
          }
          onClick={sendRemainingFundsToWinnerAfterTokenExpiration}
        >
          {sendRemainingFundsToWinnerAfterTokenExpirationTxLoading ? (
            <Spinner />
          ) : (
            "send"
          )}
        </Button>
      </Flex>
    </TransactionModalTemplate>
  );
};
