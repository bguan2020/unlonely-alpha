import { useState } from "react";
import { useNetworkContext } from "../../../context/useNetwork";
import { filteredInput } from "../../../../utils/validation/input";
import { Box, useToast } from "@chakra-ui/react";
import { Contract } from "../../../../constants";
import { getContractFromNetwork } from "../../../../utils/contract";
import { useIncreaseEndTimestampForTokens as use_call_updateOnchain_increaseEndTimestamps } from "../../../contracts/useTempTokenFactoryV1";
import Link from "next/link";
import { decodeEventLog } from "viem";
import useUpdateEndTimestampForTokens from "../../../server/temp-token/useUpdateEndTimestampForTokens";

export const useUpdateEndTimestampForTokensState = (
  tokenAddresses: string[],
  onSuccess?: () => void
) => {
  const { network } = useNetworkContext();
  const { localNetwork, explorerUrl } = network;

  const [additionalSeconds, setAdditionalSeconds] = useState<string>("");

  const factoryContract = getContractFromNetwork(
    Contract.TEMP_TOKEN_FACTORY_V1,
    localNetwork
  );
  const toast = useToast();

  const handleInputChange = (event: any) => {
    const input = event.target.value;
    const filtered = filteredInput(input);
    setAdditionalSeconds(filtered);
  };

  const {
    updateEndTimestampForTokens,
    loading: updateEndTimestampForTokensLoading,
  } = useUpdateEndTimestampForTokens({
    onError: (e) => {
      console.log("useUpdateEndTimestampForTokens", e);
    },
  });

  const {
    increaseEndTimestampForTokens,
    increaseEndTimestampForTokensData,
    increaseEndTimestampForTokensTxData,
    isIncreaseEndTimestampForTokensLoading,
  } = use_call_updateOnchain_increaseEndTimestamps(
    {
      _additionalDurationInSeconds: BigInt(additionalSeconds),
      tokenAddresses,
    },
    factoryContract,
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
                increaseEndTimestampForTokens pending, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
      },
      onWriteError: (error) => {
        console.log("increaseEndTimestampForTokens error", error);
        toast({
          duration: 9000,
          isClosable: true,
          position: "bottom", // chakra ui toast position
          render: () => (
            <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
              increaseEndTimestampForTokens cancelled
            </Box>
          ),
        });
      },
      onTxSuccess: async (data) => {
        const topics = decodeEventLog({
          abi: factoryContract.abi,
          data: data.logs[1].data,
          topics: data.logs[1].topics,
        });
        const args: any = topics.args;
        console.log("increaseEndTimestampForTokens success", data, args);
        await updateEndTimestampForTokens({
          tokenAddresses,
          chainId: localNetwork.config.chainId,
          additionalDurationInSeconds: Number(args.additionalDuration),
        });
        onSuccess && onSuccess();
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                increaseEndTimestampForTokens success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
      },
      onTxError: (error) => {
        console.log("increaseEndTimestampForTokens error", error);
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              increaseEndTimestampForTokens error
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
      },
    }
  );

  return {
    additionalSeconds,
    handleInputChange,
    increaseEndTimestampForTokens,
    increaseEndTimestampForTokensData,
    increaseEndTimestampForTokensTxData,
    loading:
      updateEndTimestampForTokensLoading ||
      isIncreaseEndTimestampForTokensLoading,
  };
};
