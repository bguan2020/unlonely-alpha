import { useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { GET_TEMP_TOKENS_QUERY } from "../../../../constants/queries";
import {
  GetTempTokensQuery,
  TempTokenType,
  TempToken,
  TempTokenWithBalance,
} from "../../../../generated/graphql";
import useUpdateTempTokenHasRemainingFundsForCreator from "../../../server/temp-token/useUpdateTempTokenHasRemainingFundsForCreator";
import { useChannelContext } from "../../../context/useChannel";
import { Contract } from "../../../../constants";
import { getContractFromNetwork } from "../../../../utils/contract";
import { useNetworkContext } from "../../../context/useNetwork";
import TempTokenAbi from "../../../../constants/abi/TempTokenV1.json";
import { UseReadTempTokenGlobalStateType } from "./useReadTempTokenGlobalState";

export const useReadTempTokenOnMount = ({
  globalState,
}: {
  globalState: UseReadTempTokenGlobalStateType;
}) => {
  const { channel } = useChannelContext();
  const { channelQueryData, isOwner } = channel;
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const publicClient = usePublicClient();
  const [loadingCurrentOnMount, setLoadingCurrentOnMount] = useState(true);
  const [loadingLastOnMount, setLoadingLastOnMount] = useState(true);

  const factoryContract = getContractFromNetwork(
    Contract.TEMP_TOKEN_FACTORY_V1,
    localNetwork
  );

  /**
   * read for channel's temp token data on mount
   */
  const [getTempTokensQuery] = useLazyQuery<GetTempTokensQuery>(
    GET_TEMP_TOKENS_QUERY,
    {
      fetchPolicy: "network-only",
    }
  );

  const { updateTempTokenHasRemainingFundsForCreator } =
    useUpdateTempTokenHasRemainingFundsForCreator({});

  useEffect(() => {
    const init = async () => {
      if (!(Number(channelQueryData?.id ?? "0") > 0)) return;
      try {
        const getTempTokenQueryRes = await getTempTokensQuery({
          variables: {
            data: {
              channelId: Number(channelQueryData?.id ?? "0"),
              chainId: localNetwork.config.chainId,
              tokenType: TempTokenType.SingleMode,
              factoryAddress: factoryContract.address as `0x${string}`,
              fulfillAllNotAnyConditions: true,
            },
          },
        });
        const listOfTokens = getTempTokenQueryRes.data?.getTempTokens;
        const nonNullListOfTokens = listOfTokens?.filter(
          (token): token is TempToken => token !== null
        );
        const activeTokens = nonNullListOfTokens?.filter(
          (token) => token.endUnixTimestamp > Math.floor(Date.now() / 1000)
        );
        const latestActiveToken = activeTokens?.[0];
        if (latestActiveToken) {
          globalState.handleCurrentActiveTokenCreationBlockNumber(
            BigInt(latestActiveToken.creationBlockNumber)
          );
          globalState.handleCurrentActiveTokenSymbol(latestActiveToken.symbol);
          const [
            endTimestamp,
            totalSupply,
            preSaleEndTimestamp,
            totalSupplyThreshold,
            isAlwaysTradeable,
            hasHitTotalSupplyThreshold,
          ] = await Promise.all([
            publicClient.readContract({
              address: latestActiveToken.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "endTimestamp",
            }),
            publicClient.readContract({
              address: latestActiveToken.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "totalSupply",
            }),
            publicClient.readContract({
              address: latestActiveToken.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "preSaleEndTimestamp",
            }),
            publicClient.readContract({
              address: latestActiveToken.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "totalSupplyThreshold",
            }),
            publicClient.readContract({
              address: latestActiveToken.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "isAlwaysTradeable",
            }),
            publicClient.readContract({
              address: latestActiveToken.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "hasHitTotalSupplyThreshold",
            }),
          ]);
          globalState.handleCurrentActiveTokenEndTimestamp(
            BigInt(String(endTimestamp))
          );
          globalState.handleCurrentActiveTokenAddress(
            latestActiveToken.tokenAddress
          );
          globalState.handleCurrentActiveTokenTotalSupply(
            BigInt(String(totalSupply))
          );
          globalState.handleCurrentActiveTokenTotalSupplyThreshold(
            BigInt(String(totalSupplyThreshold))
          );
          globalState.handleCurrentActiveTokenIsAlwaysTradable(
            Boolean(isAlwaysTradeable)
          );
          globalState.handleCurrentActiveTokenHasHitTotalSupplyThreshold(
            Boolean(hasHitTotalSupplyThreshold)
          );
          globalState.handleCurrentActiveTokenPreSaleEndTimestamp(
            BigInt(String(preSaleEndTimestamp))
          );
          globalState.handleIsPreSaleOngoing(
            Number(String(preSaleEndTimestamp)) > Math.floor(Date.now() / 1000)
          );
        }
      } catch (e) {
        console.error("getTempTokensQuery", e);
      }
      setLoadingCurrentOnMount(false);
    };
    init();
  }, [channelQueryData?.id, localNetwork.config.chainId]);

  useEffect(() => {
    const init = async () => {
      if (Number(channelQueryData?.id ?? "0") > 0 && isOwner) {
        const res = await updateTempTokenHasRemainingFundsForCreator({
          channelId: Number(channelQueryData?.id ?? "0"),
          chainId: localNetwork.config.chainId,
          tokenType: TempTokenType.SingleMode,
          factoryAddress: factoryContract.address as `0x${string}`,
        });
        const tempTokensWithNonZeroBalances = res?.res;

        const nonNullListOfTokensWithNonZeroBalances =
          tempTokensWithNonZeroBalances?.filter(
            (token): token is TempTokenWithBalance => token !== null
          );
        if (
          nonNullListOfTokensWithNonZeroBalances &&
          nonNullListOfTokensWithNonZeroBalances.length > 0 &&
          isOwner
        ) {
          const lastInactiveTokenWithBalance =
            nonNullListOfTokensWithNonZeroBalances[0];
          const [isAlwaysTradeable] = await Promise.all([
            publicClient.readContract({
              address:
                lastInactiveTokenWithBalance.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "isAlwaysTradeable",
            }),
          ]);
          if (!Boolean(isAlwaysTradeable)) {
            globalState.handleLastInactiveTokenAddress(
              lastInactiveTokenWithBalance.tokenAddress
            );
            globalState.handleLastInactiveTokenSymbol(
              lastInactiveTokenWithBalance.symbol
            );
            globalState.handleLastInactiveTokenBalance(
              BigInt(lastInactiveTokenWithBalance.balance)
            );
          }
        }
        setLoadingLastOnMount(false);
      }
    };
    init();
  }, [channelQueryData?.id, localNetwork.config.chainId, isOwner]);

  return {
    loadingCurrentOnMount,
    loadingLastOnMount,
  };
};
