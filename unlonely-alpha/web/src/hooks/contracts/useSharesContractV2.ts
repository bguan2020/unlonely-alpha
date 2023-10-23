import { useCallback, useEffect, useState } from "react";
import { usePublicClient } from "wagmi";

import { EventType, NULL_ADDRESS } from "../../constants";
import { ContractData, WriteCallbacks } from "../../constants/types";
import { createCallbackHandler } from "../../utils/contract";
import { useUser } from "../context/useUser";
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
          functionName: "subjectFeePercent",
          args: [],
        }),
      ]);
    setProtocolFeeDestination(String(protocolFeeDestination));
    setProtocolFeePercent(BigInt(String(protocolFeePercent)));
    setSubjectFeePercent(BigInt(String(subjectFeePercent)));
  }, [contract, publicClient]);

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

export const getGetHolderBalance = (
  eventAddress: `0x${string}`,
  eventId: number,
  eventType: EventType,
  holder: `0x${string}`,
  contract: ContractData
) => {
  const publicClient = usePublicClient();

  const [yaySharesBalance, setYaySharesBalance] = useState<string>("0");
  const [naySharesBalance, setNaySharesBalance] = useState<string>("0");

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setYaySharesBalance("0");
      setNaySharesBalance("0");
      return;
    }
    const [yaySharesBalance, naySharesBalance] = await Promise.all([
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "getHolderSharesBalance",
        args: [eventAddress, eventId, eventType, holder],
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "getHolderSharesBalance",
        args: [eventAddress, eventId, eventType, holder],
      }),
    ]);
    setYaySharesBalance(String(yaySharesBalance));
    setNaySharesBalance(String(naySharesBalance));
  }, [contract, publicClient]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    yaySharesBalance,
    naySharesBalance,
  };
};

export const useGetPrice = (
  eventAddress: `0x${string}`,
  eventId: number,
  eventType: EventType,
  amount: bigint,
  isBuying: boolean,
  contract: ContractData
) => {
  const publicClient = usePublicClient();

  const [price, setPrice] = useState<bigint>(BigInt(0));

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setPrice(BigInt(0));
      return;
    }
    const price = isBuying
      ? await publicClient.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: "getBuyPrice",
          args: [eventAddress, eventId, eventType, amount],
        })
      : await publicClient.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: "getSellPrice",
          args: [eventAddress, eventId, eventType, amount],
        });
    setPrice(BigInt(String(price)));
  }, [contract, publicClient]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    price,
  };
};

export const useGetPriceAfterFee = (
  eventAddress: `0x${string}`,
  eventId: number,
  eventType: EventType,
  amount: bigint,
  isBuying: boolean,
  contract: ContractData
) => {
  const publicClient = usePublicClient();

  const [priceAfterFee, setPriceAfterFee] = useState<bigint>(BigInt(0));

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setPriceAfterFee(BigInt(0));
      return;
    }
    const price =
      amount === BigInt(0)
        ? 0
        : isBuying
        ? await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "getBuyPriceAfterFee",
            args: [eventAddress, eventId, eventType, amount],
          })
        : await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "getSellPriceAfterFee",
            args: [eventAddress, eventId, eventType, amount],
          });
    setPriceAfterFee(BigInt(String(price)));
  }, [contract, publicClient]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    priceAfterFee,
  };
};

export const useReadMappings = (
  eventAddress: `0x${string}`,
  eventId: number,
  eventType: EventType,
  contract: ContractData
) => {
  const { userAddress } = useUser();
  const publicClient = usePublicClient();

  const [yaySharesSupply, setYaySharesSupply] = useState<bigint>(BigInt(0));
  const [naySharesSupply, setNaySharesSupply] = useState<bigint>(BigInt(0));

  const [eventVerified, setEventVerified] = useState<boolean>(false);
  const [eventResult, setEventResult] = useState<boolean>(false);
  const [isVerifier, setIsVerifier] = useState<boolean>(false);

  const [pooledEth, setPooledEth] = useState<bigint>(BigInt(0));
  const [userPayout, setUserPayout] = useState<bigint>(BigInt(0));

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setPooledEth(BigInt(0));
      setYaySharesSupply(BigInt(0));
      setNaySharesSupply(BigInt(0));
      setEventVerified(false);
      setEventResult(false);
      setIsVerifier(false);
      setUserPayout(BigInt(0));
      return;
    }
    const key = await publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "generateKey",
      args: [eventAddress, eventId, eventType],
    });
    const [
      yaySharesSupply,
      naySharesSupply,
      eventVerified,
      eventResult,
      isVerifier,
      pooledEth,
      userPayout,
    ] = await Promise.all([
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "yaySharesSupply",
        args: [key],
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "naySharesSupply",
        args: [key],
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "eventVerified",
        args: [key],
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "eventResult",
        args: [key],
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "isVerifier",
        args: [userAddress],
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "pooledEth",
        args: [key],
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "getPayout",
        args: [eventAddress, eventId, eventType, userAddress],
      }),
    ]);
    setPooledEth(BigInt(String(pooledEth)));
    setYaySharesSupply(BigInt(String(yaySharesSupply)));
    setNaySharesSupply(BigInt(String(naySharesSupply)));
    setEventVerified(Boolean(eventVerified));
    setEventResult(Boolean(eventResult));
    setIsVerifier(Boolean(isVerifier));
    setUserPayout(BigInt(String(userPayout)));
  }, [contract, publicClient, userAddress]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    yaySharesSupply,
    naySharesSupply,
    eventVerified,
    eventResult,
    isVerifier,
    pooledEth,
    userPayout,
  };
};

export const useAddVerifier = (
  args: { verifier: `0x${string}` },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: addVerifier,
    writeData: addVerifierData,
    txData: addVerifierTxData,
    isTxLoading: addVerifierTxLoading,
  } = useWrite(
    contract,
    "addVerifier",
    [args.verifier],
    createCallbackHandler("useAddVerifier addVerifier", callbacks)
  );

  return {
    addVerifier,
    addVerifierData,
    addVerifierTxData,
    addVerifierTxLoading,
  };
};

export const useRemoveVerifier = (
  args: { verifier: `0x${string}` },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: removeVerifier,
    writeData: removeVerifierData,
    txData: removeVerifierTxData,
    isTxLoading: removeVerifierTxLoading,
  } = useWrite(
    contract,
    "removeVerifier",
    [args.verifier],
    createCallbackHandler("useRemoveVerifier removeVerifier", callbacks)
  );

  return {
    removeVerifier,
    removeVerifierData,
    removeVerifierTxData,
    removeVerifierTxLoading,
  };
};

export const useVerifyEvent = (
  args: {
    eventAddress: `0x${string}`;
    eventId: number;
    eventType: EventType;
    result: boolean;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: verifyEvent,
    writeData: verifyEventData,
    txData: verifyEventTxData,
    isTxLoading: verifyEventTxLoading,
  } = useWrite(
    contract,
    "verifyEvent",
    [args.eventAddress, args.eventId, args.eventType, args.result],
    createCallbackHandler("useVerifyEvent verifyEvent", callbacks)
  );

  return {
    verifyEvent,
    verifyEventData,
    verifyEventTxData,
    verifyEventTxLoading,
  };
};
