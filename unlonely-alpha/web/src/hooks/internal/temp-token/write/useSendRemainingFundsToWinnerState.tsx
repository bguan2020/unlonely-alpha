import { useCallback, useEffect, useMemo, useState } from "react";
import { useNetworkContext } from "../../../context/useNetwork";
import { ContractData } from "../../../../constants/types";
import { Box, useToast } from "@chakra-ui/react";
import Link from "next/link";
import { useSendRemainingFundsToWinnerAfterTokenExpiration } from "../../../contracts/useTempTokenV1";
import { isAddress } from "viem";
import { useChannelContext } from "../../../context/useChannel";
import {
  CHAKRA_UI_TX_TOAST_DURATION,
  InteractionType,
} from "../../../../constants";
import { useUser } from "../../../context/useUser";
import { useApolloClient } from "@apollo/client";
import { GET_USER_QUERY } from "../../../../constants/queries";
import centerEllipses from "../../../../utils/centerEllipses";
import { usePublicClient } from "wagmi";
import { init, useQuery } from "@airstack/airstack-react";
import useDebounce from "../../useDebounce";
import { returnDecodedTopics } from "../../../../utils/contract";

init(String(process.env.NEXT_PUBLIC_AIRSTACK_API_KEY));

const getAddressFromEns = (ens: string) => {
  return `query GetAddressFromEns {
    Domains(input: {filter: {name: {_in: ["${ens}"]}}, blockchain: ethereum}) {
      Domain {
        resolvedAddress
        name
      }
    }
  }`;
};

export const useSendRemainingFundsToWinnerState = (
  tokenContractData: ContractData,
  callbackOnTxSuccess?: any
) => {
  const { user } = useUser();
  const toast = useToast();
  const client = useApolloClient();
  const publicClient = usePublicClient();

  const { chat } = useChannelContext();
  const { addToChatbot: addToChatbotForTempToken } = chat;
  const { network } = useNetworkContext();
  const { explorerUrl } = network;

  const [winner, setWinner] = useState("");
  const debouncedWinner = useDebounce(winner, 300);
  const [resultingWinnerAddress, setResultingWinnerAddress] = useState("");

  const query = useMemo(() => {
    if (!debouncedWinner || isAddress(debouncedWinner)) return "";
    return getAddressFromEns(debouncedWinner);
  }, [debouncedWinner]);

  const { data, loading } = useQuery(query);

  useEffect(() => {
    if (data?.Domains?.Domain?.[0]?.resolvedAddress) {
      setResultingWinnerAddress(data.Domains.Domain[0].resolvedAddress);
    } else {
      setResultingWinnerAddress(debouncedWinner);
    }
  }, [data, debouncedWinner]);

  const {
    sendRemainingFundsToWinnerAfterTokenExpiration,
    sendRemainingFundsToWinnerAfterTokenExpirationTxLoading,
  } = useSendRemainingFundsToWinnerAfterTokenExpiration(
    {
      winnerWalletAddress: resultingWinnerAddress,
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
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
      },
      onWriteError: (error) => {
        toast({
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
          render: () => (
            <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
              send remaining funds cancelled
            </Box>
          ),
        });
      },
      onTxSuccess: async (data) => {
        const topics = returnDecodedTopics(
          data.logs,
          tokenContractData.abi,
          "SendRemainingFundsToWinnerAfterTokenExpiration"
        );
        if (!topics) return;
        console.log("send remaining funds success", data, topics.args);
        const args: any = topics.args;
        const balance = args.balance as bigint;
        const winnerWallet = args.winnerWallet as `0x${string}`;
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
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
        const identifiedUser: string = await client
          .query({
            query: GET_USER_QUERY,
            variables: { data: { address: resultingWinnerAddress } },
          })
          .then(
            ({ data }) =>
              data?.getUser?.username ??
              centerEllipses(resultingWinnerAddress, 15)
          );
        const symbol = await publicClient?.readContract({
          address: tokenContractData.address as `0x${string}`,
          abi: tokenContractData.abi,
          functionName: "symbol",
          args: [],
        });
        const title = `The $${String(
          symbol
        )} token balance was sent to ${identifiedUser}!`;
        addToChatbotForTempToken({
          username: user?.username ?? "",
          address: user?.address ?? "",
          taskType:
            InteractionType.SEND_REMAINING_FUNDS_TO_WINNER_AFTER_TEMP_TOKEN_EXPIRATION,
          title,
          // description: `${user?.address}:${winnerWallet}:${
          //   tokenContractData.address
          // }:${String(balance)}`,
          description: JSON.stringify({
            userAddress: user?.address,
            winnerWallet,
            tokenContractAddress: tokenContractData.address,
            balance: String(balance),
          }),
        });
        setWinner("");
        callbackOnTxSuccess?.();
      },
      onTxError: (error) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              send remaining funds error
            </Box>
          ),
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
      },
    }
  );

  const handleWinnerChange = useCallback((input: string) => {
    setWinner(input);
  }, []);

  return {
    sendRemainingFundsToWinnerAfterTokenExpiration,
    loading: loading || sendRemainingFundsToWinnerAfterTokenExpirationTxLoading,
    handleWinnerChange,
    winner,
    resolvedAddress: data?.Domains?.Domain?.[0]?.resolvedAddress ?? undefined,
  };
};
