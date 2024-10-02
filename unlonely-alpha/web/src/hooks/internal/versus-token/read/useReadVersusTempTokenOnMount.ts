import { useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { GET_TEMP_TOKENS_QUERY } from "../../../../constants/queries";
import {
  GetTempTokensQuery,
  TempToken,
} from "../../../../generated/graphql";
import { usePublicClient } from "wagmi";
import TempTokenAbi from "../../../../constants/abi/TempTokenV1.json";
import { useVersusGameStateTransitioner } from "../ui/useVersusGameStateTransitioner";
import { UseReadVersusTempTokenGlobalStateType } from "./useReadVersusTempTokenGlobalState";
import { VersusTokenDataType } from "../../../../constants/types/token";

export const useReadVersusTempTokenOnMount = ({
  globalState,
}: {
  globalState: UseReadVersusTempTokenGlobalStateType;
}) => {

  const [loadingOnMount, setLoadingOnMount] = useState(true);

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
      if (!publicClient) return;
      try {
        const nonNullListOfTokens = [] as TempToken[];
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
              chainId: 4,
              abi: TempTokenAbi,
            },
            creationBlockNumber: BigInt(_tokenA.creationBlockNumber),
            endTimestamp: BigInt(String(endTimestampA)),
            factoryAddress: _tokenA.factoryAddress as `0x${string}`,
            minBaseTokenPrice: BigInt(_tokenA.minBaseTokenPrice),
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
              chainId: 4,
              abi: TempTokenAbi,
            },
            creationBlockNumber: BigInt(_tokenB.creationBlockNumber),
            endTimestamp: BigInt(String(endTimeStampB)),
            factoryAddress: _tokenB.factoryAddress as `0x${string}`,
            minBaseTokenPrice: BigInt(_tokenB.minBaseTokenPrice),
          };
          globalState.handleFocusedTokenToTrade(undefined);
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
            globalState.handleIsPreSaleOngoing(
              _newTokenA.preSaleEndTimestamp > nowInSeconds
            );
          }
        }
      } catch (e) {
        console.error("getTempTokensQuery", e);
      }
      setLoadingOnMount(false);
    };
    fetchVersusTempTokens();
  }, []);

  return { loadingOnMount };
};
