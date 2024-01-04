import { useBoxAction } from "@decent.xyz/box-hooks";
import { ChainId } from "@decent.xyz/box-common";
import { useCallback, useMemo, useState } from "react";
import { usePublicClient, useWaitForTransaction } from "wagmi";
import { EstimateGasParameters, TransactionReceipt } from "viem";
import { sendTransaction } from "@wagmi/core";

import { WriteCallbacks } from "../../constants/types";
import { useUser } from "../context/useUser";
import { NULL_ADDRESS } from "../../constants";

type EvmTransaction = {
  to: `0x${string}`;
  data?: `0x${string}`;
  value?: bigint;
  gasPrice?: bigint;
  gasLimit?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
};

enum ActionType {
  NftMint = "nft-mint",
  NftPreferMint = "nft-prefer-mint",
  NftFillAsk = "nft-fill-ask",
  ArbitraryEvmAction = "arbitrary-evm-action",
  SwapAction = "swap-action",
}

function getChainId(chainId: number): ChainId {
  const chainNames = Object.keys(ChainId) as Array<keyof typeof ChainId>;
  for (const chainName of chainNames) {
    if (ChainId[chainName] === chainId) {
      return ChainId[chainName];
    }
  }
  return ChainId.BASE;
}

export const useWriteV2 = (
  contract: {
    address?: `0x${string}`;
    abi?: any;
    chainId?: number;
  },
  functionSignature: string,
  args: any[],
  callbacks?: WriteCallbacks,
  overrides?: { value?: bigint; gas?: bigint }
) => {
  const { userAddress, activeWallet } = useUser();
  const publicClient = usePublicClient();
  const [hash, setHash] = useState<string>();

  const actionArgs = useMemo(() => {
    return {
      actionType: ActionType.NftMint,
      actionConfig: {
        chainId: getChainId(Number(contract.chainId ?? "1")),
        contractAddress: contract.address as string,
        cost: {
          amount: overrides?.value ?? BigInt(0),
          isNative: true as const,
        },
        signature: functionSignature,
        args,
      },
      srcChainId: getChainId(
        Number(activeWallet?.chainId?.split(":")[1] ?? "1")
      ),
      sender: userAddress as string,
      slippage: 0,
      srcToken: NULL_ADDRESS,
      dstToken: NULL_ADDRESS,
      dstChainId: ChainId.BASE,
    };
  }, [
    contract.address,
    functionSignature,
    args,
    userAddress,
    activeWallet,
    overrides,
  ]);

  const { actionResponse, isLoading, error } = useBoxAction(actionArgs);

  const write = useCallback(async () => {
    if (!actionResponse || !userAddress || !publicClient) return;
    const tx = actionResponse.tx as EvmTransaction;
    const gas = await publicClient.estimateGas({
      account: userAddress as string,
      ...tx,
    } as unknown as EstimateGasParameters);
    const { hash } = await sendTransaction({
      ...tx,
      gas,
    });
    setHash(hash);
  }, [actionResponse, publicClient, userAddress]);

  const {
    data: txData,
    error: txError,
    isLoading: isTxLoading,
    isSuccess: isTxSuccess,
  } = useWaitForTransaction({
    hash: hash as `0x${string}`,
    onSuccess(data: TransactionReceipt) {
      if (callbacks?.onTxSuccess) callbacks?.onTxSuccess(data);
    },
    onError(error: Error) {
      if (callbacks?.onTxError) callbacks?.onTxError(error);
    },
  });

  return {
    write,
    isWriteLoading: isLoading,
    writeError: error,
    txData,
    isTxLoading,
    isTxSuccess,
    txError,
  };
};
