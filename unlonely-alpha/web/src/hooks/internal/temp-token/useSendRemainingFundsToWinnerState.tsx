import { useCallback, useState } from "react";
import { useNetworkContext } from "../../context/useNetwork";
import { ContractData } from "../../../constants/types";
import { Box, useToast } from "@chakra-ui/react";
import Link from "next/link";
import { useSendRemainingFundsToWinnerAfterTokenExpiration } from "../../contracts/useTempTokenV1";
import { decodeEventLog } from "viem";
import { useChannelContext } from "../../context/useChannel";
import { InteractionType } from "../../../constants";
import { useUser } from "../../context/useUser";
import { useApolloClient } from "@apollo/client";
import { GET_USER_QUERY } from "../../../constants/queries";
import centerEllipses from "../../../utils/centerEllipses";

export const useSendRemainingFundsToWinnerState = (
  tokenContractData: ContractData,
  tokenSymbol: string,
  callbackOnTxSuccess?: any
) => {
  const { userAddress, user } = useUser();
  const toast = useToast();
  const client = useApolloClient();

  const { chat } = useChannelContext();
  const { addToChatbot } = chat;
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
    tokenContractData,
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
          abi: tokenContractData.abi,
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
        const identifiedUser: string = await client
          .query({
            query: GET_USER_QUERY,
            variables: { data: { address: winnerAddress } },
          })
          .then(
            ({ data }) =>
              data?.getUser?.username ?? centerEllipses(winnerAddress, 15)
          );
        const title = `The $${tokenSymbol} token balance was sent to ${identifiedUser}!`;
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.CREATE_TEMP_TOKEN,
          title,
          description: "",
        });
        setWinnerAddress("");
        callbackOnTxSuccess?.();
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

  const handleWinnerAddressChange = useCallback((input: string) => {
    setWinnerAddress(input);
  }, []);

  return {
    sendRemainingFundsToWinnerAfterTokenExpiration,
    sendRemainingFundsToWinnerAfterTokenExpirationTxLoading,
    handleWinnerAddressChange,
    winnerAddress,
  };
};
