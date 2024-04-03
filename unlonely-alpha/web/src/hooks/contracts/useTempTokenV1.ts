import { usePublicClient } from "wagmi";
import { ContractData, WriteCallbacks } from "../../constants/types";
import { useState, useCallback, useEffect } from "react";
import { NULL_ADDRESS } from "../../constants";
import { createCallbackHandler } from "../../utils/contract";
import { useWrite } from "./useWrite";

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
          functionName: "protocolFeeDestination",
          args: [],
        }),
        publicClient.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: "protocolFeePercent",
          args: [],
        }),
        publicClient.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: "streamerFeePercent",
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

export const useGetEndtimestamp = (contract: ContractData) => {
    const publicClient = usePublicClient();
    const [endTimestamp, setEndTimestamp] = useState<bigint>(BigInt(0));
    
    const getData = useCallback(async () => {
        if (!contract.address || !contract.abi || !publicClient) {
        setEndTimestamp(BigInt(0));
        return;
        }
        const endTimestamp = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "endTimestamp",
        args: [],
        });
        setEndTimestamp(BigInt(String(endTimestamp)));
    }, [contract.address, publicClient]);
    
    useEffect(() => {
        getData();
    }, [getData]);
    
    return {
        refetch: getData,
        endTimestamp,
    };
}

export const useGetTotalSupplyThreshold = (contract: ContractData) => {
    const publicClient = usePublicClient();
    const [totalSupplyThreshold, setTotalSupplyThreshold] = useState<bigint>(BigInt(0));
    
    const getData = useCallback(async () => {
        if (!contract.address || !contract.abi || !publicClient) {
        setTotalSupplyThreshold(BigInt(0));
        return;
        }
        const totalSupplyThreshold = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "totalSupplyThreshold",
        args: [],
        });
        setTotalSupplyThreshold(BigInt(String(totalSupplyThreshold)));
    }, [contract.address, publicClient]);
    
    useEffect(() => {
        getData();
    }, [getData]);
    
    return {
        refetch: getData,
        totalSupplyThreshold,
    };
}

export const useGetHighestTotalSupply = (contract: ContractData) => {
    const publicClient = usePublicClient();
    const [highestTotalSupply, setHighestTotalSupply] = useState<bigint>(BigInt(0));
    
    const getData = useCallback(async () => {
        if (!contract.address || !contract.abi || !publicClient) {
        setHighestTotalSupply(BigInt(0));
        return;
        }
        const highestTotalSupply = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "highestTotalSupply",
        args: [],
        });
        setHighestTotalSupply(BigInt(String(highestTotalSupply)));
    }, [contract.address, publicClient]);
    
    useEffect(() => {
        getData();
    }, [getData]);
    
    return {
        refetch: getData,
        highestTotalSupply,
    };
}

export const useGetCreationBlockNumber = (contract: ContractData) => {
    const publicClient = usePublicClient();
    const [creationBlockNumber, setCreationBlockNumber] = useState<bigint>(BigInt(0));
    
    const getData = useCallback(async () => {
        if (!contract.address || !contract.abi || !publicClient) {
        setCreationBlockNumber(BigInt(0));
        return;
        }
        const creationBlockNumber = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "creationBlockNumber",
        args: [],
        });
        setCreationBlockNumber(BigInt(String(creationBlockNumber)));
    }, [contract.address, publicClient]);
    
    useEffect(() => {
        getData();
    }, [getData]);
    
    return {
        refetch: getData,
        creationBlockNumber,
    };
}

export const useGetHasHitTotalSupplyThreshold = (contract: ContractData) => {
    const publicClient = usePublicClient();
    const [hasHitTotalSupplyThreshold, setHasHitTotalSupplyThreshold] = useState<boolean>(false);
    
    const getData = useCallback(async () => {
        if (!contract.address || !contract.abi || !publicClient) {
        setHasHitTotalSupplyThreshold(false);
        return;
        }
        const hasHitTotalSupplyThreshold = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "hasHitTotalSupplyThreshold",
        args: [],
        });
        setHasHitTotalSupplyThreshold(Boolean(hasHitTotalSupplyThreshold));
    }, [contract.address, publicClient]);
    
    useEffect(() => {
        getData();
    }, [getData]);
    
    return {
        refetch: getData,
        hasHitTotalSupplyThreshold,
    };
}

export const useGetIsAlwaysTradeable = (contract: ContractData) => {
    const publicClient = usePublicClient();
    const [isAlwaysTradeable, setIsAlwaysTradeable] = useState<boolean>(false);
    
    const getData = useCallback(async () => {
        if (!contract.address || !contract.abi || !publicClient) {
        setIsAlwaysTradeable(false);
        return;
        }
        const isAlwaysTradeable = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "isAlwaysTradeable",
        args: [],
        });
        setIsAlwaysTradeable(Boolean(isAlwaysTradeable));
    }, [contract.address, publicClient]);
    
    useEffect(() => {
        getData();
    }, [getData]);
    
    return {
        refetch: getData,
        isAlwaysTradeable,
    };
}

export const useGetIsActive = (contract: ContractData) => {
    const publicClient = usePublicClient();
    const [isActive, setIsActive] = useState<boolean>(false);
    
    const getData = useCallback(async () => {
        if (!contract.address || !contract.abi || !publicClient) {
        setIsActive(false);
        return;
        }
        const isActive = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "getIsActive",
        args: [],
        });
        setIsActive(Boolean(isActive));
    }, [contract.address, publicClient]);
    
    useEffect(() => {
        getData();
    }, [getData]);
    
    return {
        refetch: getData,
        isActive,
    };
}

export const useGetBalance = (contract: ContractData) => {
    const publicClient = usePublicClient();
    const [balance, setBalance] = useState<bigint>(BigInt(0));
    
    const getData = useCallback(async () => {
        if (!contract.address || !contract.abi || !publicClient) {
        setBalance(BigInt(0));
        return;
        }
        const balance = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "getBalance",
        args: [],
        });
        setBalance(BigInt(String(balance)));
    }, [contract.address, publicClient]);
    
    useEffect(() => {
        getData();
    }, [getData]);
    
    return {
        refetch: getData,
        balance,
    };
}

export const useGetMintCostAfterFees = (
    amount: bigint,
    contract: ContractData
  ) => {
    const publicClient = usePublicClient();
  
    const [mintCostAfterFees, setMintCostAfterFees] = useState<bigint>(BigInt(0));
    const [loading, setLoading] = useState<boolean>(false);
  
    const getData = useCallback(async () => {
      if (!contract.address || !contract.abi || !publicClient) {
        setMintCostAfterFees(BigInt(0));
        return;
      }
      setLoading(true);
      const res = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "mintCostAfterFees",
        args: [amount],
      });
      setMintCostAfterFees(BigInt(String(res)));
      setLoading(false);
    }, [contract.address, publicClient, amount]);
  
    useEffect(() => {
      getData();
    }, [getData]);
  
    return {
      refetch: getData,
      mintCostAfterFees,
      loading,
    };
  };
  
export const useGetBurnProceedsAfterFees = (
    amount: bigint,
    contract: ContractData
  ) => {
    const publicClient = usePublicClient();
  
    const [burnProceedsAfterFees, setBurnProceedsAfterFees] = useState<bigint>(
      BigInt(0)
    );
    const [loading, setLoading] = useState<boolean>(false);
  
    const getData = useCallback(async () => {
      if (!contract.address || !contract.abi || !publicClient) {
        setBurnProceedsAfterFees(BigInt(0));
        return;
      }
      setLoading(true);
  
      const res = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "burnProceedsAfterFees",
        args: [amount],
      });
      setBurnProceedsAfterFees(BigInt(String(res)));
      setLoading(false);
    }, [contract.address, publicClient, amount]);
  
    useEffect(() => {
      getData();
    }, [getData]);
  
    return {
      refetch: getData,
      burnProceedsAfterFees,
      loading,
    };
};

export const useMint = (
    args: {
      amount: bigint;
      value: bigint;
    },
    contract: ContractData,
    callbacks?: WriteCallbacks
  ) => {
    const {
      writeAsync: mint,
      writeData: mintData,
      txData: mintTxData,
      isTxLoading: mintTxLoading,
      refetch,
      isRefetching: isRefetchingMint,
    } = useWrite(
      contract,
      "mint",
      [args.amount],
      createCallbackHandler("useTempTokenV1 useMint", callbacks),
      {
        value: args.value,
        enabled:
          contract.address !== NULL_ADDRESS &&
          contract.abi !== null,
      }
    );
  
    return {
      refetch,
      mint,
      mintData,
      mintTxData,
      mintTxLoading,
      isRefetchingMint,
    };
};

export const useBurn = (
    args: {
      amount: bigint;
    },
    contract: ContractData,
    callbacks?: WriteCallbacks
  ) => {
    const {
      writeAsync: burn,
      writeData: burnData,
      txData: burnTxData,
      isTxLoading: burnTxLoading,
      refetch,
      isRefetching: isRefetchingBurn,
    } = useWrite(
      contract,
      "burn",
      [args.amount],
      createCallbackHandler("useTempTokenV1 useBurn", callbacks),
      {
        enabled:
          contract.address !== NULL_ADDRESS &&
          contract.abi !== null,
      }
    );
  
    return {
      refetch,
      burn,
      burnData,
      burnTxData,
      burnTxLoading,
      isRefetchingBurn,
    };
};

export const useSendRemainingFundsToWinnerAfterTokenExpiration = (
    contract: ContractData,
    callbacks?: WriteCallbacks
  ) => {
    const {
      writeAsync: sendRemainingFundsToWinnerAfterTokenExpiration,
      writeData: sendRemainingFundsToWinnerAfterTokenExpirationData,
      txData: sendRemainingFundsToWinnerAfterTokenExpirationTxData,
      isTxLoading: sendRemainingFundsToWinnerAfterTokenExpirationTxLoading,
      refetch,
      isRefetching: isRefetchingsendRemainingFundsToWinnerAfterTokenExpiration,
    } = useWrite(
      contract,
      "sendRemainingFundsToWinnerAfterTokenExpiration",
      [],
      createCallbackHandler("useTempTokenV1 sendRemainingFundsToWinnerAfterTokenExpiration", callbacks),
      {
        enabled:
          contract.address !== NULL_ADDRESS &&
          contract.abi !== null,
      }
    );
  
    return {
      refetch,
      sendRemainingFundsToWinnerAfterTokenExpiration,
      sendRemainingFundsToWinnerAfterTokenExpirationData,
      sendRemainingFundsToWinnerAfterTokenExpirationTxData,
      sendRemainingFundsToWinnerAfterTokenExpirationTxLoading,
      isRefetchingsendRemainingFundsToWinnerAfterTokenExpiration,
    };
};