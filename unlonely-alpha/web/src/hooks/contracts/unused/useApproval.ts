import { useEffect, useMemo } from "react";
import {
  useReadContract,
  useWriteContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
} from "wagmi";

// function uses variables amount and amountToApprove to differentiate the value used for comparison and the value used for the actual approval
export const useApproval = (
  tokenAddress: `0x${string}`,
  abi: any,
  owner: string,
  spender: string,
  chainId: number,
  amount: bigint,
  amountToApprove?: bigint,
  callbacks?: {
    onReadSuccess?: (data: any) => void;
    onReadError?: (error: any) => void;
    onPrepareWriteSuccess?: (data: any) => void;
    onPrepareWriteError?: (error: any) => void;
    onWriteSuccess?: (data: any) => void;
    onWriteError?: (error: any) => void;
    onTxSuccess?: (data: any) => void;
    onTxError?: (error: any) => void;
  }
) => {
  const {
    data: allowance,
    error: allowanceError,
    isLoading: allowanceLoading,
    refetch: refetchAllowance,
  } = useReadContract({
    address: tokenAddress,
    abi,
    functionName: "allowance",
    args: [owner, spender],
    chainId,
  });

  useEffect(() => {
    if (allowance) {
      console.log("useApproval allowance read success", allowance);
      callbacks?.onReadSuccess?.(allowance);
    }
  }, [allowance]);

  useEffect(() => {
    if (allowanceError) {
      console.log("useApproval allowance read error", allowanceError);
      callbacks?.onReadError?.(allowanceError);
    }
  }, [allowanceError]);

  const { data: simulateData } = useSimulateContract({
    address: tokenAddress,
    abi,
    functionName: "approve",
    args: [spender, amountToApprove ?? amount],
    chainId,
  });

  useEffect(() => {
    if (simulateData) {
      console.log("useApproval approve simulation success", simulateData);
      callbacks?.onPrepareWriteSuccess?.(simulateData);
    }
  }, [simulateData]);

  const { data: hash, writeContract } = useWriteContract();

  const {
    data: approvalData,
    error: approvalError,
  } = useWriteContract();

  const requiresApproval = useMemo(() => {
    return (allowance as unknown as bigint) < amount;
  }, [allowance, amount]);

  const {
    isLoading,
    isSuccess,
    data: txData,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (txData) {
      if (callbacks?.onTxSuccess) callbacks?.onTxSuccess(txData);
    }
  }, [txData])

  useEffect(() => {
    if (txError) {
      if (callbacks?.onTxError) callbacks?.onTxError(txError);
    }
  }, [txError])    

  return {
    isTxLoading: isLoading,
    isTxSuccess: isSuccess,
    isTxError: txError,
    allowance: (allowance as unknown as bigint) ?? BigInt(0),
    isAllowanceLoading: allowanceLoading,
    writeApprovalError: approvalError,
    readAllowanceError: allowanceError,
    writeApproval: () => writeContract({
      address: tokenAddress,
      abi,
      functionName: "approve",
      args: [spender, amountToApprove ?? amount],
      chainId,
    }),
    requiresApproval,
    refetchAllowance,
  };
};
