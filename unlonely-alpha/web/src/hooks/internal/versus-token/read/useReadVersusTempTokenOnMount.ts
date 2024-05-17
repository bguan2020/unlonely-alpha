import { useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { GET_TEMP_TOKENS_QUERY } from "../../../../constants/queries";
import {
  GetTempTokensQuery,
  TempToken,
  TempTokenType,
} from "../../../../generated/graphql";
import { useChannelContext } from "../../../context/useChannel";
import { useNetworkContext } from "../../../context/useNetwork";
import { usePublicClient } from "wagmi";
import TempTokenAbi from "../../../../constants/abi/TempTokenV1.json";
import { Contract, VersusTokenDataType } from "../../../../constants";
import { getContractFromNetwork } from "../../../../utils/contract";
import { useVersusGameStateTransitioner } from "../ui/useVersusGameStateTransitioner";
import { UseReadVersusTempTokenGlobalStateType } from "./useReadVersusTempTokenGlobalState";

export const useReadVersusTempTokenOnMount = ({
  globalState,
}: {
  globalState: UseReadVersusTempTokenGlobalStateType;
}) => {
  const { channel } = useChannelContext();
  const { channelQueryData } = channel;
  const { network } = useNetworkContext();
  const { localNetwork } = network;

  const [loadingOnMount, setLoadingOnMount] = useState(true);

  const factoryContract = getContractFromNetwork(
    Contract.TEMP_TOKEN_FACTORY_V1,
    localNetwork
  );

  const publicClient = usePublicClient();
  const transitionGameState = useVersusGameStateTransitioner();

  /**
   * read for channel's temp token data on mount
   */
  const [getTempTokensQuery] = useLazyQuery<GetTempTokensQuery>(
    GET_TEMP_TOKENS_QUERY,
    {
      fetchPolicy: "network-only",
    }
  );

  useEffect(() => {
    const fetchVersusTempTokens = async () => {
      if (!(Number(channelQueryData?.id ?? "0") > 0)) return;
      try {
        const getTempTokenQueryRes = await getTempTokensQuery({
          variables: {
            data: {
              channelId: Number(channelQueryData?.id ?? "0"),
              chainId: localNetwork.config.chainId,
              tokenType: TempTokenType.VersusMode,
              factoryAddress: factoryContract.address as `0x${string}`,
              fulfillAllNotAnyConditions: true,
            },
          },
        });
        const listOfTokens = getTempTokenQueryRes.data?.getTempTokens;
        const nonNullListOfTokens = listOfTokens?.filter(
          (token): token is TempToken => token !== null
        );
        const _tokenB = nonNullListOfTokens?.[0];
        const _tokenA = nonNullListOfTokens?.[1];
        if (_tokenA !== undefined && _tokenB !== undefined) {
          const [
            endTimestampA,
            totalSupplyA,
            preSaleEndTimestampA,
            isAlwaysTradeableA,
            endTimeStampB,
            totalSupplyB,
            preSaleEndTimestampB,
            isAlwaysTradeableB,
          ] = await Promise.all([
            publicClient.readContract({
              address: _tokenA.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "endTimestamp",
            }),
            publicClient.readContract({
              address: _tokenA.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "totalSupply",
            }),
            publicClient.readContract({
              address: _tokenA.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "preSaleEndTimestamp",
            }),
            publicClient.readContract({
              address: _tokenA.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "isAlwaysTradeable",
            }),
            publicClient.readContract({
              address: _tokenB.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "endTimestamp",
            }),
            publicClient.readContract({
              address: _tokenB.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "totalSupply",
            }),
            publicClient.readContract({
              address: _tokenB.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "preSaleEndTimestamp",
            }),
            publicClient.readContract({
              address: _tokenB.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "isAlwaysTradeable",
            }),
          ]);
          const _newTokenA: VersusTokenDataType = {
            transferredLiquidityOnExpiration:
              _tokenA.transferredLiquidityOnExpiration !== null
                ? BigInt(_tokenA.transferredLiquidityOnExpiration)
                : BigInt(0),
            symbol: _tokenA.symbol,
            address: _tokenA.tokenAddress as `0x${string}`,
            totalSupply: BigInt(String(totalSupplyA)),
            isAlwaysTradeable: Boolean(isAlwaysTradeableA),
            preSaleEndTimestamp: BigInt(String(preSaleEndTimestampA)),
            contractData: {
              address: _tokenA.tokenAddress as `0x${string}`,
              chainId: localNetwork.config.chainId,
              abi: TempTokenAbi,
            },
            creationBlockNumber: BigInt(_tokenA.creationBlockNumber),
            endTimestamp: BigInt(String(endTimestampA)),
          };
          const _newTokenB: VersusTokenDataType = {
            transferredLiquidityOnExpiration:
              _tokenB.transferredLiquidityOnExpiration !== null
                ? BigInt(_tokenB.transferredLiquidityOnExpiration)
                : BigInt(0),
            symbol: _tokenB.symbol,
            address: _tokenB.tokenAddress as `0x${string}`,
            totalSupply: BigInt(String(totalSupplyB)),
            isAlwaysTradeable: Boolean(isAlwaysTradeableB),
            preSaleEndTimestamp: BigInt(String(preSaleEndTimestampB)),
            contractData: {
              address: _tokenB.tokenAddress as `0x${string}`,
              chainId: localNetwork.config.chainId,
              abi: TempTokenAbi,
            },
            creationBlockNumber: BigInt(_tokenB.creationBlockNumber),
            endTimestamp: BigInt(String(endTimeStampB)),
          };
          globalState.setTokenA(_newTokenA);
          globalState.setTokenB(_newTokenB);

          /**
           * check if the game is finished through using endTimestamps
           */

          const nowInSeconds = BigInt(Math.floor(Date.now() / 1000));
          if (
            BigInt(String(endTimestampA)) < nowInSeconds &&
            BigInt(String(endTimeStampB)) < nowInSeconds
          ) {
            globalState.handleIsGameOngoing(false);

            transitionGameState({
              tokenA: _newTokenA,
              tokenB: _newTokenB,
              handleWinningToken: globalState.handleWinningToken,
              handleLosingToken: globalState.handleLosingToken,
              handleOwnerMustMakeWinningTokenTradeable:
                globalState.handleOwnerMustMakeWinningTokenTradeable,
              handleOwnerMustPermamint: globalState.handleOwnerMustPermamint,
            });
          } else {
            globalState.handleIsGameOngoing(true);
          }
        }
      } catch (e) {
        console.error("getTempTokensQuery", e);
      }
      setLoadingOnMount(false);
    };
    fetchVersusTempTokens();
  }, [channelQueryData?.id, localNetwork.config.chainId]);

  return { loadingOnMount };
};
