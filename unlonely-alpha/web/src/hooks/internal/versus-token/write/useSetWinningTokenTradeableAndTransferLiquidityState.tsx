import { useMemo } from "react";
import { useVersusTempTokenContext } from "../../../context/useVersusTempToken";
import { useSetWinningTokenTradeableAndTransferLiquidity } from "../../../contracts/useTempTokenFactoryV1";
import { decodeEventLog, isAddressEqual } from "viem";
import { Contract, InteractionType } from "../../../../constants";
import { getContractFromNetwork } from "../../../../utils/contract";
import { useNetworkContext } from "../../../context/useNetwork";
import { Box, useToast } from "@chakra-ui/react";
import Link from "next/link";
import { useChannelContext } from "../../../context/useChannel";
import { useUser } from "../../../context/useUser";
import useUpdateTempTokenTransferredLiquidityOnExpiration from "../../../server/temp-token/useUpdateTempTokenTransferredLiquidityOnExpiration";

export const useSetWinningTokenTradeableAndTransferLiquidityState = (
  callbackOnTxSuccess?: any
) => {
  const { userAddress, user } = useUser();
  const toast = useToast();

  const { gameState } = useVersusTempTokenContext();
  const { winningToken, tokenA, tokenB } = gameState;

  const { network } = useNetworkContext();
  const { localNetwork, explorerUrl } = network;

  const { chat } = useChannelContext();
  const { addToChatbot } = chat;

  const factoryContract = getContractFromNetwork(
    Contract.TEMP_TOKEN_FACTORY_V1,
    localNetwork
  );

  const { updateTempTokenTransferredLiquidityOnExpiration, loading } =
    useUpdateTempTokenTransferredLiquidityOnExpiration({});

  const losingToken = useMemo(() => {
    if (!winningToken || !winningToken.address) return null;
    return isAddressEqual(
      winningToken.address as `0x${string}`,
      tokenA.address as `0x${string}`
    )
      ? tokenB
      : tokenA;
  }, [winningToken, tokenA, tokenB]);

  const {
    setWinningTokenTradeableAndTransferLiquidity,
    setWinningTokenTradeableAndTransferLiquidityData,
    setWinningTokenTradeableAndTransferLiquidityTxData,
    isSetWinningTokenTradeableAndTransferLiquidityLoading,
  } = useSetWinningTokenTradeableAndTransferLiquidity(
    {
      winnerTokenAddress: winningToken?.address as `0x${string}`,
      loserTokenAddress: losingToken?.address as `0x${string}`,
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
                transfer funds pending, click to view
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
                transfer funds success, click to view
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
          .then((res) => {
            console.log(
              "transfer loser liquidity update database success",
              res
            );
            toast({
              render: () => (
                <Box as="button" borderRadius="md" bg="#5058c8" px={4} h={8}>
                  transfer loser liquidity update database success
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
        const title = `The $${String(
          winningToken.symbol
        )} is now permanently tradeable!`;
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType:
            InteractionType.VERSUS_SET_WINNING_TOKEN_TRADEABLE_AND_TRANSFER_LIQUIDITY,
          title,
          description: "",
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
