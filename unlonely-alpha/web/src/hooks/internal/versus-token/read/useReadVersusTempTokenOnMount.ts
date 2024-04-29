import { useLazyQuery } from "@apollo/client";
import { useEffect } from "react";
import { GET_TEMP_TOKENS_QUERY } from "../../../../constants/queries";
import { GetTempTokensQuery, TempToken } from "../../../../generated/graphql";
import { useChannelContext } from "../../../context/useChannel";
import { useNetworkContext } from "../../../context/useNetwork";
import { usePublicClient } from "wagmi";
import TempTokenAbi from "../../../../constants/abi/TempTokenV1.json";
import { VersusTokenDataType } from "../../../context/useVersusTempToken";

export const useReadVersusTempTokenOnMount = ({
    setTokenA,
    setTokenB,
    handleWinningToken,
    handleIsGameFinished,
}: {
    setTokenA: React.Dispatch<React.SetStateAction<VersusTokenDataType>>;
    setTokenB: React.Dispatch<React.SetStateAction<VersusTokenDataType>>;
    handleWinningToken: (token: VersusTokenDataType) => void;
    handleIsGameFinished: (value: boolean) => void;
}) => {

    const { channel } = useChannelContext();
    const { channelQueryData } = channel;
    const { network } = useNetworkContext();
    const { localNetwork } = network;

    const publicClient = usePublicClient();

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
            balanceA,
            endTimestampA,
            totalSupplyA,
            highestTotalSupplyA,
            isAlwaysTradeableA,
            balanceB,
            endTimeStampB,
            totalSupplyB,
            highestTotalSupplyB,
            isAlwaysTradeableB,
          ] = await Promise.all([
            publicClient.readContract({
              address: _tokenA.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "getBalance",
            }),
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
              functionName: "highestTotalSupply",
            }),
            publicClient.readContract({
              address: _tokenA.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "isAlwaysTradeable",
            }),
            publicClient.readContract({
              address: _tokenB.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "getBalance",
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
              functionName: "highestTotalSupply",
            }),
            publicClient.readContract({
              address: _tokenB.tokenAddress as `0x${string}`,
              abi: TempTokenAbi,
              functionName: "isAlwaysTradeable",
            }),
          ]);
          const _newTokenA = {
            balance: BigInt(String(balanceA)),
            symbol: _tokenA.symbol,
            address: _tokenA.tokenAddress as `0x${string}`,
            totalSupply: BigInt(String(totalSupplyA)),
            isAlwaysTradeable: Boolean(isAlwaysTradeableA),
            highestTotalSupply: BigInt(String(highestTotalSupplyA)),
            contractData: {
              address: _tokenA.tokenAddress as `0x${string}`,
              chainId: localNetwork.config.chainId,
              abi: TempTokenAbi,
            },
            creationBlockNumber: BigInt(_tokenA.creationBlockNumber),
            endTimestamp: BigInt(String(endTimestampA)),
          };
          const _newTokenB = {
            balance: BigInt(String(balanceB)),
            symbol: _tokenB.symbol,
            address: _tokenB.tokenAddress as `0x${string}`,
            totalSupply: BigInt(String(totalSupplyB)),
            isAlwaysTradeable: Boolean(isAlwaysTradeableB),
            highestTotalSupply: BigInt(String(highestTotalSupplyB)),
            contractData: {
              address: _tokenB.tokenAddress as `0x${string}`,
              chainId: localNetwork.config.chainId,
              abi: TempTokenAbi,
            },
            creationBlockNumber: BigInt(_tokenB.creationBlockNumber),
            endTimestamp: BigInt(String(endTimeStampB)),
          };
          setTokenA(_newTokenA);
          setTokenB(_newTokenB);
          if (
            BigInt(String(endTimestampA)) >
              BigInt(Math.floor(Date.now() / 1000)) &&
            BigInt(String(endTimeStampB)) >
              BigInt(Math.floor(Date.now() / 1000))
          ) {
            handleIsGameFinished(false);
          } else {
            if (Boolean(isAlwaysTradeableA)) {
              handleWinningToken(_newTokenA);
            }
            if (Boolean(isAlwaysTradeableB)) {
              handleWinningToken(_newTokenB);
            }
          }
        }
      } catch (e) {
        console.error("getTempTokensQuery", e);
      }
    };
    fetchVersusTempTokens();
  }, [channelQueryData?.id, localNetwork.config.chainId]);
}