import { usePublicClient } from "wagmi";
import { useState, useCallback } from "react";

import { ContractData, WriteCallbacks } from "../../constants/types";
import { NULL_ADDRESS } from "../../constants";
import { useWrite } from "./useWrite";
import { createCallbackHandler } from "../../utils/contract";

export const useReadPublic = (contract: ContractData) => {
  const publicClient = usePublicClient();

  const [protocolFeeDestination, setProtocolFeeDestination] =
    useState<string>(NULL_ADDRESS);

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setProtocolFeeDestination(NULL_ADDRESS);
      return;
    }
    const [protocolFeeDestination] = await Promise.all([
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "protocolFeeDestination",
        args: [],
      }),
    ]);
    setProtocolFeeDestination(String(protocolFeeDestination));
  }, [contract, publicClient]);

  return {
    refetch: getData,
    protocolFeeDestination,
  };
};

export const useGetMintCostAfterFees = (
  amount: bigint,
  contract: ContractData
) => {
  const publicClient = usePublicClient();

  const [mintCostAfterFees, setMintCostAfterFees] = useState<bigint>(BigInt(0));

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setMintCostAfterFees(BigInt(0));
      return;
    }
    const res = await publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "mintCostAfterFees",
      args: [amount],
    });
    setMintCostAfterFees(BigInt(String(res)));
  }, [contract, publicClient, amount]);

  return {
    refetch: getData,
    mintCostAfterFees,
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

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setBurnProceedsAfterFees(BigInt(0));
      return;
    }
    const res = await publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "burnProceedsAfterFees",
      args: [amount],
    });
    setBurnProceedsAfterFees(BigInt(String(res)));
  }, [contract, publicClient, amount]);

  return {
    refetch: getData,
    burnProceedsAfterFees,
  };
};

export const useGetPrice = (amount: bigint, contract: ContractData) => {
  const publicClient = usePublicClient();

  const [value, setValue] = useState<bigint>(BigInt(0));

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setValue(BigInt(0));
      return;
    }
    const res = await publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "sumOfPriceToNTokens",
      args: [amount],
    });
    setValue(BigInt(String(res)));
  }, [contract, publicClient, amount]);

  return {
    refetch: getData,
    value,
  };
};

export const useMint = (
  args: {
    amount: bigint;
    streamer: string;
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
    [args.amount, args.streamer],
    createCallbackHandler("useMint mint", callbacks),
    {
      value: args.value,
      enabled:
        args.streamer !== NULL_ADDRESS &&
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
    streamer: string;
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
    [args.amount, args.streamer],
    createCallbackHandler("useBurn burn", callbacks),
    {
      enabled:
        args.streamer !== NULL_ADDRESS &&
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
