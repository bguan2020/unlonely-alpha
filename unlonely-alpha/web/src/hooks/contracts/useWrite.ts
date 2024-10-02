import {
  useWriteContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useEffect, useCallback, useState } from "react";

import { WriteCallbacks } from "../../constants/types";

// Add this type guard function at the top of the file
function isConnectorNotFoundError(error: unknown): error is Error {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "ConnectorNotFoundError"
  );
}

function isErrorWithName(error: unknown): error is { name: string; message: string } {
  return typeof error === "object" && error !== null && "name" in error && "message" in error;
}

function convertBigIntsToStrings(obj: any): any {
  if (typeof obj === "bigint") {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntsToStrings);
  }
  if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, convertBigIntsToStrings(value)])
    );
  }
  return obj;
}

export const useWrite = (
  contract: { address?: `0x${string}`; abi?: any; chainId?: number },
  functionName: string,
  args: any[],
  callbacks?: WriteCallbacks,
  overrides?: { value?: bigint; gas?: bigint; enabled?: boolean }
) => {
  const [isRefetching, setIsRefetching] = useState(false);

  const { data: simulateData, error: simulateError, refetch: simulateRefetch } = useSimulateContract(
    convertBigIntsToStrings({
      address: contract.address,
      abi: contract.abi,
      functionName,
      args,
      chainId: contract.chainId,
      value: overrides?.value,
      gas: overrides?.gas,
    })
  );

  useEffect(() => {
    if (simulateData) {
      if (callbacks?.onPrepareSuccess) callbacks.onPrepareSuccess(simulateData);

    }
  }, [simulateData, functionName]);

  useEffect(() => {
    if (simulateError) {
      const errorMessage = isErrorWithName(simulateError) ? simulateError.message : String(simulateError);
      
      if (callbacks?.onPrepareError) callbacks.onPrepareError(simulateError);
      
      if (isConnectorNotFoundError(simulateError)) {
        console.log("ConnectorNotFoundError:", errorMessage);
      } else if (isErrorWithName(simulateError)) {
        const namedError = simulateError as { name: string; message: string };
        if (namedError.name === "ContractFunctionExecutionError") {
          console.log("Contract execution error:", errorMessage);
        } else {
          console.log("Other known error:", namedError.name, errorMessage);
        }
      } else {
        console.log("Unknown error:", errorMessage);
      }
      
      if (!isConnectorNotFoundError(simulateError)) {
      }
    }
  }, [simulateError, functionName]);

  const { data: writeData, error: writeError, writeContract } = useWriteContract();

  useEffect(() => {
    if (writeData) {
      console.log("writeData", writeData);
      if (callbacks?.onWriteSuccess) callbacks.onWriteSuccess(writeData);
    }
  }, [writeData]);

  useEffect(() => {
    if (writeError) {
      console.log("writeError", writeError);
      if (callbacks?.onWriteError) callbacks.onWriteError(writeError);
    }
  }, [writeError]);

  const {
    data: txData,
    error: txError,
    isLoading: isTxLoading,
    isSuccess: isTxSuccess,
  } = useWaitForTransactionReceipt({
    hash: writeData,
    query: {
      select: (data) => convertBigIntsToStrings(data),
    },
  });

  useEffect(() => {
    if (txData) {
      console.log("txData", txData);
      if (callbacks?.onTxSuccess) callbacks.onTxSuccess(txData);
    }
  }, [txData]);

  useEffect(() => {
    if (txError) {
      console.log("txError", txError);
      if (callbacks?.onTxError) callbacks.onTxError(txError);
    }
  }, [txError]);

  const writeAsync = useCallback(() => {
    if (contract.address && contract.abi) {
      writeContract?.({
        address: contract.address,
        abi: contract.abi,
        functionName,
        args,
        chainId: contract.chainId,
        value: overrides?.value,
        gas: overrides?.gas,
      });
    }
  }, [contract, functionName, args, overrides]);

  const refetch = useCallback(async () => {
    setIsRefetching(true);
    await simulateRefetch?.();
    setIsRefetching(false);
  }, [simulateRefetch]);

  return {
    writeAsync,
    writeData,
    txData,
    isTxLoading,
    isTxSuccess,
    writeError,
    txError,
    simulateData,
    simulateError,
    refetch,
    isRefetching,
  };
};
