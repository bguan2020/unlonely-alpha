import { useCallback, useState } from "react";
import { usePublicClient } from "wagmi";

import { NULL_ADDRESS } from "../../constants";
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

  return {
    refetch: getData,
    protocolFeeDestination,
    protocolFeePercent,
    subjectFeePercent,
  };
};

export const useGetPrice = (
  sharesSubject: `0x${string}`,
  amount: bigint,
  isYay: boolean,
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
          args: [sharesSubject, amount, isYay],
        })
      : await publicClient.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: "getSellPrice",
          args: [sharesSubject, amount, isYay],
        });
    setPrice(BigInt(String(price)));
  }, [contract, publicClient]);

  return {
    refetch: getData,
    price,
  };
};

export const useGetPriceAfterFee = (
  sharesSubject: `0x${string}`,
  amount: bigint,
  isYay: boolean,
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
            args: [sharesSubject, amount, isYay],
          })
        : await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "getSellPriceAfterFee",
            args: [sharesSubject, amount, isYay],
          });
    setPriceAfterFee(BigInt(String(price)));
  }, [contract, publicClient]);

  return {
    refetch: getData,
    priceAfterFee,
  };
};

export const useGetHolderSharesBalances = (
  sharesSubject: `0x${string}`,
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
        args: [sharesSubject, holder, true],
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "getHolderSharesBalance",
        args: [sharesSubject, holder, false],
      }),
    ]);
    setYaySharesBalance(String(yaySharesBalance));
    setNaySharesBalance(String(naySharesBalance));
  }, [contract, publicClient]);

  return {
    refetch: getData,
    yaySharesBalance,
    naySharesBalance,
  };
};

export const useReadSharesSubject = (
  sharesSubject: `0x${string}`,
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
        args: [sharesSubject],
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "naySharesSupply",
        args: [sharesSubject],
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "eventVerified",
        args: [sharesSubject],
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "eventResult",
        args: [sharesSubject],
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
        args: [sharesSubject],
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "getPayout",
        args: [sharesSubject, userAddress],
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
    sharesSubject: `0x${string}`;
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
    [args.sharesSubject, args.result],
    createCallbackHandler("useVerifyEvent verifyEvent", callbacks)
  );

  return {
    verifyEvent,
    verifyEventData,
    verifyEventTxData,
    verifyEventTxLoading,
  };
};

export const useSetFeeDestination = (
  args: {
    feeDestination: `0x${string}`;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: setFeeDestination,
    writeData: setFeeDestinationData,
    txData: setFeeDestinationTxData,
    isTxLoading: setFeeDestinationTxLoading,
  } = useWrite(
    contract,
    "setFeeDestination",
    [args.feeDestination],
    createCallbackHandler("useSetFeeDestination setFeeDestination", callbacks)
  );

  return {
    setFeeDestination,
    setFeeDestinationData,
    setFeeDestinationTxData,
    setFeeDestinationTxLoading,
  };
};

export const useSetProtocolFeePercent = (
  args: {
    feePercent: bigint;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: setProtocolFeePercent,
    writeData: setProtocolFeePercentData,
    txData: setProtocolFeePercentTxData,
    isTxLoading: setProtocolFeePercentTxLoading,
  } = useWrite(
    contract,
    "setProtocolFeePercent",
    [args.feePercent],
    createCallbackHandler(
      "useSetProtocolFeePercent setProtocolFeePercent",
      callbacks
    )
  );

  return {
    setProtocolFeePercent,
    setProtocolFeePercentData,
    setProtocolFeePercentTxData,
    setProtocolFeePercentTxLoading,
  };
};

export const useSetSubjectFeePercent = (
  args: {
    feePercent: bigint;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: setSubjectFeePercent,
    writeData: setSubjectFeePercentData,
    txData: setSubjectFeePercentTxData,
    isTxLoading: setSubjectFeePercentTxLoading,
  } = useWrite(
    contract,
    "setSubjectFeePercent",
    [args.feePercent],
    createCallbackHandler(
      "useSetSubjectFeePercent setSubjectFeePercent",
      callbacks
    )
  );

  return {
    setSubjectFeePercent,
    setSubjectFeePercentData,
    setSubjectFeePercentTxData,
    setSubjectFeePercentTxLoading,
  };
};

export const useBuyShares = (
  args: {
    sharesSubject: `0x${string}`;
    amountOfShares: bigint;
    value: bigint;
    isYay: boolean;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: buyShares,
    writeData: buySharesData,
    txData: buySharesTxData,
    isTxLoading: buySharesTxLoading,
    refetch,
  } = useWrite(
    contract,
    "buyShares",
    [args.sharesSubject, args.amountOfShares, args.isYay],
    createCallbackHandler("useBuyShares buyShares", callbacks),
    { value: args.value }
  );

  return {
    refetch,
    buyShares,
    buySharesData,
    buySharesTxData,
    buySharesTxLoading,
  };
};

export const useSellShares = (
  args: {
    sharesSubject: `0x${string}`;
    amount: bigint;
    isYay: boolean;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: sellShares,
    writeData: sellSharesData,
    txData: sellSharesTxData,
    isTxLoading: sellSharesTxLoading,
    refetch,
  } = useWrite(
    contract,
    "sellShares",
    [args.sharesSubject, args.amount, args.isYay],
    createCallbackHandler("useSellShares sellShares", callbacks)
  );

  return {
    refetch,
    sellShares,
    sellSharesData,
    sellSharesTxData,
    sellSharesTxLoading,
  };
};

export const useClaimPayout = (
  args: { sharesSubject: `0x${string}` },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: claimPayout,
    writeData: claimPayoutData,
    txData: claimPayoutTxData,
    isTxLoading: claimPayoutTxLoading,
    refetch,
  } = useWrite(
    contract,
    "claimPayout",
    [args.sharesSubject],
    createCallbackHandler("useClaimPayout claimPayout", callbacks)
  );

  return {
    claimPayout,
    claimPayoutData,
    claimPayoutTxData,
    claimPayoutTxLoading,
    refetch,
  };
};
