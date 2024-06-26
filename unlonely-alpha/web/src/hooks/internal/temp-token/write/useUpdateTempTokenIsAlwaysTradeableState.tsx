import { useNetworkContext } from "../../../context/useNetwork";
import { CHAKRA_UI_TX_TOAST_DURATION, Contract } from "../../../../constants";
import {
  getContractFromNetwork,
  returnDecodedTopics,
} from "../../../../utils/contract";
import { useToast, Box } from "@chakra-ui/react";
import { useSetAlwaysTradeableForTokens as use_call_updateOnchain_alwaysTradeable } from "../../../contracts/useTempTokenFactoryV1";
import Link from "next/link";
import useUpdateTempTokenIsAlwaysTradeable from "../../../server/temp-token/useUpdateTempTokenIsAlwaysTradeable";

export const useUpdateTempTokenIsAlwaysTradeableState = (
  tokenAddresses: string[],
  onSuccess?: () => void
) => {
  const { network } = useNetworkContext();
  const { localNetwork, explorerUrl } = network;

  const factoryContract = getContractFromNetwork(
    Contract.TEMP_TOKEN_FACTORY_V1,
    localNetwork
  );
  const toast = useToast();

  const {
    updateTempTokenIsAlwaysTradeable,
    loading: updateTempTokenIsAlwaysTradeableLoading,
  } = useUpdateTempTokenIsAlwaysTradeable({});

  const {
    setAlwaysTradeableForTokens,
    setAlwaysTradeableForTokensData,
    setAlwaysTradeableForTokensTxData,
    isSetAlwaysTradeableForTokensLoading,
  } = use_call_updateOnchain_alwaysTradeable(
    {
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
                setAlwaysTradeableForTokens pending, click to view
              </Link>
            </Box>
          ),
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
      },
      onWriteError: (error) => {
        console.log("setAlwaysTradeableForTokens error", error);
        toast({
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
          render: () => (
            <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
              setAlwaysTradeableForTokens cancelled
            </Box>
          ),
        });
      },
      onTxSuccess: async (data) => {
        const topics = returnDecodedTopics(
          data.logs,
          factoryContract.abi,
          "AlwaysTradeableSetForTokens"
        );
        if (!topics) return;
        const args: any = topics.args;
        console.log("setAlwaysTradeableForTokens success", data, args);
        await updateTempTokenIsAlwaysTradeable({
          tokenAddressesSetTrue: args.tokenAddresses,
          tokenAddressesSetFalse: [],
          chainId: localNetwork.config.chainId,
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
                setAlwaysTradeableForTokens success, click to view
              </Link>
            </Box>
          ),
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
      },
      onTxError: (error) => {
        console.log("setAlwaysTradeableForTokens error", error);
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              setAlwaysTradeableForTokens error
            </Box>
          ),
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
      },
    }
  );

  return {
    setAlwaysTradeableForTokens,
    setAlwaysTradeableForTokensData,
    setAlwaysTradeableForTokensTxData,
    loading:
      isSetAlwaysTradeableForTokensLoading ||
      updateTempTokenIsAlwaysTradeableLoading,
  };
};
