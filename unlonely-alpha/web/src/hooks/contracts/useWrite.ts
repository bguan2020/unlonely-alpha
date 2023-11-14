import { Hex, TransactionReceipt } from "viem";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

import { WriteCallbacks } from "../../constants/types";

export const useWrite = (
  contract: { address?: `0x${string}`; abi?: any; chainId?: number },
  functionName: string,
  args: any[],
  callbacks?: WriteCallbacks,
  overrides?: { value?: bigint; gas?: bigint }
) => {
  const { config, refetch, isRefetching } = usePrepareContractWrite({
    address: contract.address,
    abi: contract.abi,
    functionName,
    args,
    chainId: contract.chainId,
    value: overrides?.value,
    gas: overrides?.gas,
    onSuccess(data) {
      if (callbacks?.onPrepareSuccess) callbacks?.onPrepareSuccess(data);
    },
    onError(error: Error) {
      if (callbacks?.onPrepareError) callbacks?.onPrepareError(error);
    },
  });

  const {
    data: writeData,
    error: writeError,
    writeAsync,
  } = useContractWrite({
    ...config,
    onSuccess(data: { hash: Hex }) {
      if (callbacks?.onWriteSuccess) callbacks?.onWriteSuccess(data);
    },
    onError(error: Error) {
      if (callbacks?.onWriteError) callbacks?.onWriteError(error);
    },
  });

  const {
    data: txData,
    error: txError,
    isLoading: isTxLoading,
    isSuccess: isTxSuccess,
  } = useWaitForTransaction({
    hash: writeData?.hash,
    onSuccess(data: TransactionReceipt) {
      if (callbacks?.onTxSuccess) callbacks?.onTxSuccess(data);
    },
    onError(error: Error) {
      if (callbacks?.onTxError) callbacks?.onTxError(error);
    },
  });

  return {
    writeAsync,
    writeData,
    txData,
    isTxLoading,
    isTxSuccess,
    writeError,
    txError,
    refetch,
    isRefetching,
  };
};
