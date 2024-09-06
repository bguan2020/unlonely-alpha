import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";

export const useRead = <T>(
  contract: { address: `0x${string}`; abi: any; chainId: number },
  functionName: string,
  args?: any[],
  callbacks?: {
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
  }
) => {
  const [returnedData, setReturnedData] = useState<T | undefined>(undefined);

  const { data, error, isLoading, refetch } = useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName,
    args,
    chainId: contract.chainId,
  });

  useEffect(() => {
    if (data) {
      setReturnedData(data as T);
      callbacks?.onSuccess?.(data);
    }
  }, [data, callbacks]);

  useEffect(() => {
    if (error) {
      callbacks?.onError?.(error);
    }
  }, [error, callbacks]);

  return { data: returnedData, error, isLoading, refetch };
};
