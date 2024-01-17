import { Hex, TransactionReceipt } from "viem";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useEffect } from "react";

import { WriteCallbacks } from "../../constants/types";
import { useCacheContext } from "../context/useCache";

export const useWrite = (
  contract: { address?: `0x${string}`; abi?: any; chainId?: number },
  functionName: string,
  args: any[],
  callbacks?: WriteCallbacks,
  overrides?: { value?: bigint; gas?: bigint; enabled?: boolean }
) => {
  const { addAppError, popAppError } = useCacheContext();

  const prepObj = usePrepareContractWrite({
    address: contract.address,
    abi: contract.abi,
    functionName,
    args,
    chainId: contract.chainId,
    value: overrides?.value,
    gas: overrides?.gas,
    cacheTime: 0,
    enabled: overrides?.enabled === undefined ? true : overrides?.enabled,
    onSuccess(data) {
      if (callbacks?.onPrepareSuccess) callbacks?.onPrepareSuccess(data);
      popAppError("ConnectorNotFoundError", "name");
      popAppError(functionName, "functionName");
    },
    onError(error: Error) {
      if (callbacks?.onPrepareError) callbacks?.onPrepareError(error);
      if (error.message && error.name) {
        if (error.name === "ConnectorNotFoundError") {
          popAppError("ConnectorNotFoundError", "name");
        }
        addAppError(error, functionName);
      }
    },
  });

  const {
    data: writeData,
    error: writeError,
    writeAsync,
  } = useContractWrite({
    ...prepObj.config,
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

  useEffect(() => {
    prepObj.refetch();
  }, [contract.address]);

  return {
    writeAsync,
    writeData,
    txData,
    isTxLoading,
    isTxSuccess,
    writeError,
    txError,
    refetch: prepObj.refetch,
    isRefetching: prepObj.isRefetching,
    prepareError: prepObj.error,
  };
};
