import { useChainId, usePublicClient, useWalletClient } from "wagmi";
import { 
  // Address, encodeFunctionData, 
  TransactionReceipt } from "viem";
// import { zoraCreator1155Abi } from "../../constants/abi/ZoraCreator1155";
// import { Aggregate3ValueCall, multicall3Address } from "../../pages/clip";
// import { multicall3Abi } from "../../constants/abi/multicall3";
import { useCallback } from "react";

export const useZoraCollect1155 = () => {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const collectorMint = useCallback(
    async (
      tokenContract: `0x${string}`,
      tokenId: number,
      quantityToMint: bigint
    ): Promise<TransactionReceipt | undefined> => {
  //     if (!publicClient || !walletClient?.account.address) {
  //       console.log("publicClient or walletClient is missing");
  //       return undefined;
  //     }

  //     const agregate3Calls: any[] = [];

  //     const collectorClient: any = undefined

  //     const splitAddress = await (publicClient as any).readContract({
  //       address: tokenContract,
  //       abi: zoraCreator1155Abi,
  //       functionName: "getCreatorRewardRecipient",
  //       args: [tokenId],
  //     });

  //     console.log("splitAddress", splitAddress);

  //     const { parameters } = await collectorClient.mint({
  //       tokenContract,
  //       quantityToMint,
  //       mintType: "1155",
  //       minterAccount: walletClient.account.address,
  //       tokenId,
  //     });

  //     const splitsClient = new SplitV1Client({
  //       chainId,
  //       publicClient,
  //       walletClient,
  //       apiConfig: {
  //         apiKey: String(process.env.NEXT_PUBLIC_SPLITS_API_KEY),
  //       },
  //     });

  //     agregate3Calls.push({
  //       allowFailure: false,
  //       value: parameters.value || BigInt(0),
  //       target: parameters.address,
  //       callData: encodeFunctionData({
  //         abi: parameters.abi,
  //         functionName: parameters.functionName,
  //         args: parameters.args,
  //       }),
  //     });

  //     const withdrawProtocolRewardsToSplitsCall = {
  //       data: encodeFunctionData({
  //         abi: protocolRewardsABI,
  //         functionName: "withdrawFor",
  //         args: [splitAddress, BigInt(0)],
  //       }),
  //       address:
  //         protocolRewardsAddress[
  //           chainId as keyof typeof protocolRewardsAddress
  //         ],
  //     };

  //     agregate3Calls.push({
  //       allowFailure: false,
  //       value: BigInt(0),
  //       target: withdrawProtocolRewardsToSplitsCall.address,
  //       callData: withdrawProtocolRewardsToSplitsCall.data,
  //     });

  //     const withdrawSplitsCall =
  //       await splitsClient.callData.batchDistributeAndWithdrawForAll({
  //         splitAddress,
  //         tokens: ["0x0000000000000000000000000000000000000000"],
  //       });

  //     agregate3Calls.push({
  //       allowFailure: false,
  //       value: BigInt(0),
  //       target: withdrawSplitsCall.address as Address,
  //       callData: withdrawSplitsCall.data,
  //     });

  //     // simulate the transaction multicall 3 transaction
  //     const { request } = await publicClient.simulateContract({
  //       abi: multicall3Abi,
  //       functionName: "aggregate3Value",
  //       address: "0x1Ee38d535d541c55C9DA5C4f2e3fDf9aDfCf9f9E",
  //       args: [agregate3Calls],
  //       account: walletClient?.account.address as Address,
  //       value: parameters.value || BigInt(0),
  //     });

  //     // execute the transaction
  //     const hash = await walletClient
  //       ?.writeContract(request)
  //       .then((response) => {
  //         console.log("multicall3 response", response);
  //         return response;
  //       });
  //     if (!hash) return undefined;
  //     const transaction = await publicClient.waitForTransactionReceipt({
  //       hash,
  //     });
  //     console.log("multicall transaction", transaction);
  //     return transaction;

  return undefined
    },
    [chainId, publicClient, walletClient]
  );

  return { collectorMint };
};
