import { useVersusTempTokenContext } from "../../../context/useVersusTempToken";
import { useSetWinningTokenTradeableAndTransferLiquidity } from "../../../contracts/useTempTokenFactoryV1";
import { decodeEventLog } from "viem";
import { Contract } from "../../../../constants";
import { getContractFromNetwork } from "../../../../utils/contract";
import { useNetworkContext } from "../../../context/useNetwork";
import { Box, useToast } from "@chakra-ui/react";
import Link from "next/link";
import useUpdateTempTokenTransferredLiquidityOnExpiration from "../../../server/temp-token/useUpdateTempTokenTransferredLiquidityOnExpiration";

export const useSetWinningTokenTradeableAndTransferLiquidityState = (
  callbackOnTxSuccess?: any
) => {
  const toast = useToast();

  const { gameState } = useVersusTempTokenContext();
  const { tokenA, tokenB } = gameState;

  const { network } = useNetworkContext();
  const { localNetwork, explorerUrl } = network;

  const factoryContract = getContractFromNetwork(
    Contract.TEMP_TOKEN_FACTORY_V1,
    localNetwork
  );

  const { updateTempTokenTransferredLiquidityOnExpiration, loading } =
    useUpdateTempTokenTransferredLiquidityOnExpiration({});

  const {
    setWinningTokenTradeableAndTransferLiquidity,
    setWinningTokenTradeableAndTransferLiquidityData,
    setWinningTokenTradeableAndTransferLiquidityTxData,
    isSetWinningTokenTradeableAndTransferLiquidityLoading,
  } = useSetWinningTokenTradeableAndTransferLiquidity(
    {
      tokenAddresses: [tokenA.address, tokenB.address],
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
                (1/3) transfer funds pending
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
              transfer funds cancelled
            </Box>
          ),
        });
      },
      onTxSuccess: async (data) => {
        const topics = decodeEventLog({
          abi: factoryContract.abi,
          data: data.logs[data.logs.length - 1].data,
          topics: data.logs[data.logs.length - 1].topics,
        });
        const args: any = topics.args;
        console.log("transfer funds success", data, args);
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                (2/3) transfer funds success
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        const loserTokenAddress = args.loserTokenAddress as `0x${string}`;
        const transferredLiquidityInWei = args.transferredLiquidity as bigint;
        await updateTempTokenTransferredLiquidityOnExpiration({
          losingTokenAddress: loserTokenAddress,
          chainId: localNetwork.config.chainId,
          finalLiquidityInWei: String(transferredLiquidityInWei),
        })
          .then(() => {
            toast({
              render: () => (
                <Box as="button" borderRadius="md" bg="#5058c8" px={4} h={8}>
                  (3/3) transfer loser liquidity update database success
                </Box>
              ),
              duration: 9000,
              isClosable: true,
              position: "top-right",
            });
          })
          .catch((err) => {
            console.log("transfer loser liquidity update database error", err);
            toast({
              render: () => (
                <Box as="button" borderRadius="md" bg="#c87850" px={4} h={8}>
                  transfer loser liquidity update database error
                </Box>
              ),
              duration: 9000,
              isClosable: true,
              position: "top-right",
            });
          });
        callbackOnTxSuccess?.();
      },
      onTxError: (error) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              transfer funds error
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
    }
  );

  return {
    setWinningTokenTradeableAndTransferLiquidity,
    setWinningTokenTradeableAndTransferLiquidityData,
    setWinningTokenTradeableAndTransferLiquidityTxData,
    loading: loading || isSetWinningTokenTradeableAndTransferLiquidityLoading,
  };
};