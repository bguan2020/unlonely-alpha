import { useEffect, useState } from "react";
import { useContractRead } from "wagmi";

export const useRead = <T>(
  contract: { address: `0x${string}`; abi: any; chainId: number },
  functionName: string,
  args?: any[],
  callbacks?: {
    onSuccess?: (data: any) => any;
    onError?: (error: Error) => any;
  }
) => {
  const [returnedData, setReturnedData] = useState<T | undefined>(undefined);

  const { data, error, isLoading, refetch } = useContractRead({
    address: contract.address,
    abi: contract.abi,
    functionName,
    args,
    chainId: contract.chainId,
    onSuccess(data) {
      if (callbacks?.onSuccess) callbacks?.onSuccess(data);
    },
    onError(error) {
      if (callbacks?.onError) callbacks?.onError(error);
    },
  });

  useEffect(() => {
    if (data) setReturnedData(data as unknown as T);
  }, [data]);

  return { data: returnedData, error, isLoading, refetch };
};
