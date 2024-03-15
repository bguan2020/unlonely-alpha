import { useCallback, useEffect, useState } from "react";
import { usePublicClient } from "wagmi";

import { NULL_ADDRESS } from "../../constants";
import { ContractData } from "../../constants/types";

export const useReadPublic = (contract: ContractData) => {
    const publicClient = usePublicClient();
  
    const [protocolFeeDestination, setProtocolFeeDestination] =
      useState<string>(NULL_ADDRESS);
    const [protocolFeePercent, setProtocolFeePercent] = useState<bigint>(
      BigInt(0)
    );
    const [subjectFeePercent, setSubjectFeePercent] = useState<bigint>(BigInt(0));
  
    const getData = useCallback(async () => {
      if (!contract.address || !contract.abi || !publicClient) {
        setProtocolFeeDestination(NULL_ADDRESS);
        setProtocolFeePercent(BigInt(0));
        setSubjectFeePercent(BigInt(0));
        return;
      }
      const [protocolFeeDestination, protocolFeePercent, subjectFeePercent] =
        await Promise.all([
          publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "defaultFeeDestination",
            args: [],
          }),
          publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "defaultProtocolFeePercent",
            args: [],
          }),
          publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "defaultStreamerFeePercent",
            args: [],
          }),
        ]);
      setProtocolFeeDestination(String(protocolFeeDestination));
      setProtocolFeePercent(BigInt(String(protocolFeePercent)));
      setSubjectFeePercent(BigInt(String(subjectFeePercent)));
    }, [contract.address, publicClient]);
  
    useEffect(() => {
      getData();
    }, [getData]);
  
    return {
      refetch: getData,
      protocolFeeDestination,
      protocolFeePercent,
      subjectFeePercent,
    };
  };

export const useReadIsPaused = (contract: ContractData) => {
  const publicClient = usePublicClient();

  const [isPaused, setIsPaused] = useState<boolean>(false);

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setIsPaused(false);
      return;
    }
    const isPaused = await publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "isPaused",
      args: [],
    });
    setIsPaused(Boolean(isPaused));
  }, [contract.address, publicClient]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    isPaused,
  };
};

export const useReadDuration = (contract: ContractData) => {
    const publicClient = usePublicClient();
    
    const [duration, setDuration] = useState<bigint>(BigInt(0));
    
    const getData = useCallback(async () => {
        if (!contract.address || !contract.abi || !publicClient) {
        setDuration(BigInt(0));
        return;
        }
        const duration = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "duration",
        args: [],
        });
        setDuration(BigInt(String(duration)));
    }, [contract.address, publicClient]);
    
    useEffect(() => {
        getData();
    }, [getData]);
    
    return {
        refetch: getData,
        duration,
    };
}