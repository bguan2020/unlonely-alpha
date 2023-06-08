import { parseUnits } from "ethers/lib/utils.js";
import { useMemo } from "react";
import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useUser } from "./useUser";

export const useApproval = (
  tokenAddress: `0x${string}`,
  abi: any,
  spender: string,
  amount: string,
  chainId: number,
  callbacks: {
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
  const { user } = useUser();

  const {
    data: allowance,
    error: allowanceError,
    isLoading: allowanceLoading,
    refetch: refetchAllowance,
  } = useContractRead({
    address: tokenAddress,
    abi,
    functionName: "allowance",
    args: [user?.address ?? "", spender],
    chainId,
    onSuccess: (data) => callbacks.onReadSuccess?.(data),
    onError: (error) => callbacks.onReadError?.(error),
  });

  const { config } = usePrepareContractWrite({
    address: tokenAddress,
    abi,
    functionName: "approve",
    args: [spender, amount],
    chainId,
    onSuccess: (data) => callbacks.onPrepareWriteSuccess?.(data),
    onError: (error) => callbacks.onPrepareWriteError?.(error),
  });

  const {
    data: approvalData,
    error: approvalError,
    writeAsync: writeApproval,
  } = useContractWrite({
    ...config,
    onSuccess: (data) => callbacks.onWriteSuccess?.(data),
    onError: (error) => callbacks.onWriteError?.(error),
  });

  const requiresApproval = useMemo(() => {
    return allowance &&
      parseUnits(allowance as unknown as string, 18).gt(parseUnits(amount, 18))
      ? true
      : false;
  }, [allowance, amount]);

  const {
    isLoading,
    isSuccess,
    error: approvalRejectError,
  } = useWaitForTransaction({
    hash: approvalData?.hash,
    onSuccess: async (data) => {
      callbacks.onTxSuccess?.(data);
      await refetchAllowance();
    },
    onError: (error) => callbacks.onTxError?.(error),
  });

  return {
    isTxLoading: isLoading,
    isTxSuccess: isSuccess,
    isTxError: approvalRejectError,
    isAllowanceLoading: allowanceLoading,
    writeApprovalError: approvalError,
    readAllowanceError: allowanceError,
    writeApproval,
    requiresApproval,
  };
};
