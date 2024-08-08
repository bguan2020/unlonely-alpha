import { useChainId, usePublicClient, useWalletClient } from "wagmi";
import { createCollectorClient } from "@zoralabs/protocol-sdk";
import { TransactionReceipt } from "viem";

export const useZoraCollect1155 = () => {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient({
    onSuccess(data) {
      console.log("Success", data);
    },
  });

  const collectorMint = async (
    tokenContract: `0x${string}`,
    tokenId: number,
    quantityToMint: bigint
  ): Promise<TransactionReceipt | undefined> => {
    if (!publicClient || !walletClient?.account.address) {
      console.log("publicClient or walletClient is missing");
      return undefined;
    }
    // set to the chain you want to interact with
    const collectorClient = createCollectorClient({ chainId, publicClient });

    const { parameters } = await collectorClient.mint({
      tokenContract,
      quantityToMint,
      mintType: "1155",
      minterAccount: walletClient.account.address,
      tokenId,
    });

    const { request } = await publicClient.simulateContract(parameters);

    const hash = await walletClient.writeContract(request);
    if (!hash) return undefined;
    const transaction = await publicClient.waitForTransactionReceipt({
      hash,
    });
    console.log("transaction", transaction);
    return transaction;
  };

  return { collectorMint };
};
