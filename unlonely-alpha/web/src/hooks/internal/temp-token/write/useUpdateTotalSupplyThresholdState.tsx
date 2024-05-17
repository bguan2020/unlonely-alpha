import { useState } from "react";
import { useNetworkContext } from "../../../context/useNetwork";
import { getContractFromNetwork } from "../../../../utils/contract";
import useUpdateTempTokenHasHitTotalSupplyThreshold from "../../../server/temp-token/useUpdateTempTokenHasHitTotalSupplyThreshold";
import { Contract } from "../../../../constants";

import { useSetTotalSupplyThresholdForTokens as use_call_updateOnchain_hasHitTotalSupplyThreshold } from "../../../contracts/useTempTokenFactoryV1";
import { useToast, Box } from "@chakra-ui/react";
import Link from "next/link";
import { decodeEventLog } from "viem";
import { filteredInput } from "../../../../utils/validation/input";

// for admins
export const useUpdateTotalSupplyThresholdState = (
  tokenAddresses: string[],
  onSuccess?: () => void
) => {
  const { network } = useNetworkContext();
  const { localNetwork, explorerUrl } = network;
  const [newSupplyThreshold, setNewSupplyThreshold] = useState<string>("");

  const factoryContract = getContractFromNetwork(
    Contract.TEMP_TOKEN_FACTORY_V1,
    localNetwork
  );
  const toast = useToast();

  const handleInputChange = (event: any) => {
    const input = event.target.value;
    const filtered = filteredInput(input);
    setNewSupplyThreshold(filtered);
  };

  const {
    updateTempTokenHasHitTotalSupplyThreshold:
      call_updateDb_hasHitTotalSupplyThreshold,
    loading: updateTempTokenHasHitTotalSupplyThresholdLoading,
  } = useUpdateTempTokenHasHitTotalSupplyThreshold({
    onError: (e) => {
      console.log("useUpdateTempTokenHasHitTotalSupplyThreshold", e);
    },
  });

  const {
    setTotalSupplyThresholdForTokens,
    setTotalSupplyThresholdForTokensData,
    setTotalSupplyThresholdForTokensTxData,
    isSetTotalSupplyThresholdForTokensLoading,
  } = use_call_updateOnchain_hasHitTotalSupplyThreshold(
    {
      _totalSupplyThreshold: BigInt(newSupplyThreshold),
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
                setTotalSupplyThresholdForTokens pending, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
      },
      onWriteError: (error) => {
        console.log("setTotalSupplyThresholdForTokens error", error);
        toast({
          duration: 9000,
          isClosable: true,
          position: "bottom", // chakra ui toast position
          render: () => (
            <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
              setTotalSupplyThresholdForTokens cancelled
            </Box>
          ),
        });
      },
      onTxSuccess: async (data) => {
        await call_updateDb_hasHitTotalSupplyThreshold({
          tokenAddressesSetTrue: [],
          tokenAddressesSetFalse: tokenAddresses,
          chainId: localNetwork.config.chainId,
        });
        const topics = decodeEventLog({
          abi: factoryContract.abi,
          data: data.logs[0].data,
          topics: data.logs[0].topics,
        });
        const args: any = topics.args;
        console.log("setTotalSupplyThresholdForTokens success", data, args);

        onSuccess && onSuccess();
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                setTotalSupplyThresholdForTokens success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
      },
      onTxError: (error) => {
        console.log("setTotalSupplyThresholdForTokens error", error);
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              setTotalSupplyThresholdForTokens error
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
    newSupplyThreshold,
    handleInputChange,
    setTotalSupplyThresholdForTokens,
    setTotalSupplyThresholdForTokensData,
    setTotalSupplyThresholdForTokensTxData,
    loading:
      isSetTotalSupplyThresholdForTokensLoading ||
      updateTempTokenHasHitTotalSupplyThresholdLoading,
  };
};
