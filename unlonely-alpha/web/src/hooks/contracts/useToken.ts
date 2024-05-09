
import {
    usePublicClient,
  } from "wagmi";
  import { useState, useCallback, useEffect } from "react";
  
  import { ContractData, WriteCallbacks } from "../../constants/types";
  import { NULL_ADDRESS } from "../../constants";
  import { useWrite } from "./useWrite";
  import { createCallbackHandler } from "../../utils/contract";

export const useGetUserBalance = (
    userAddress: string,
    contract: ContractData
  ) => {
    const publicClient = usePublicClient();
  
    const [balance, setBalance] = useState<bigint>(BigInt(0));
  
    const getData = useCallback(async () => {
      if (!contract.address || !contract.abi || !publicClient) {
        setBalance(BigInt(0));
        return;
      }
      const res = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "balanceOf",
        args: [userAddress],
      });
      setBalance(BigInt(String(res)));
    }, [contract, publicClient, userAddress]);
  
    useEffect(() => {
      getData();
    }, [getData]);
  
    return {
      refetch: getData,
      balance,
    };
  };

  
export const useTransfer = (
    args: {
      to: string;
      amount: bigint;
    },
    contract: ContractData,
    callbacks?: WriteCallbacks
  ) => {
    const {
      writeAsync: transfer,
      writeData: transferData,
      txData: transferTxData,
      isTxLoading: transferTxLoading,
      refetch,
      isRefetching: isRefetchingTransfer,
    } = useWrite(
      contract,
      "transfer",
      [args.to, args.amount],
      createCallbackHandler("useTransfer transfer", callbacks),
      {
        enabled:
          args.to !== NULL_ADDRESS &&
          contract.address !== NULL_ADDRESS &&
          contract.abi !== null,
      }
    );
  
    return {
      refetch,
      transfer,
      transferData,
      transferTxData,
      transferTxLoading,
      isRefetchingTransfer,
    };
  };