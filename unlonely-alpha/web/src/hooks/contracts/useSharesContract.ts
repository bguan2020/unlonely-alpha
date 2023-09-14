import { useCallback, useEffect, useMemo, useState } from "react";
import { useNetwork, usePublicClient } from "wagmi";

import { NULL_ADDRESS } from "../../constants";
import { NETWORKS } from "../../constants/networks";
import { WriteCallbacks } from "../../constants/types";
import {
  createCallbackHandler,
  getContractFromNetwork,
} from "../../utils/contract";
import { useWrite } from "./useWrite";

export const useReadPublic = () => {
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.config.chainId === network.chain?.id);
  }, [network]);
  const contract = getContractFromNetwork("unlonelySharesV1", localNetwork);
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

export const useReadSharesSubject = (sharesSubject: `0x${string}`) => {
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.config.chainId === network.chain?.id);
  }, [network]);
  const contract = getContractFromNetwork("unlonelySharesV1", localNetwork);
  const publicClient = usePublicClient();

  const [yaySharesSupply, setYaySharesSupply] = useState<bigint>(BigInt(0));
  const [naySharesSupply, setNaySharesSupply] = useState<bigint>(BigInt(0));

  const [eventVerified, setEventVerified] = useState<boolean>(false);
  const [eventResult, setEventResult] = useState<boolean>(false);
  const [isVerifier, setIsVerifier] = useState<boolean>(false);

  const [pooledEth, setPooledEth] = useState<bigint>(BigInt(0));

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setPooledEth(BigInt(0));
      setYaySharesSupply(BigInt(0));
      setNaySharesSupply(BigInt(0));
      setEventVerified(false);
      setEventResult(false);
      setIsVerifier(false);
      return;
    }
    const [
      yaySharesSupply,
      naySharesSupply,
      eventVerified,
      eventResult,
      isVerifier,
      pooledEth,
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
        args: [sharesSubject],
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "pooledEth",
        args: [sharesSubject],
      }),
    ]);
    setPooledEth(BigInt(String(pooledEth)));
    setYaySharesSupply(BigInt(String(yaySharesSupply)));
    setNaySharesSupply(BigInt(String(naySharesSupply)));
    setEventVerified(Boolean(eventVerified));
    setEventResult(Boolean(eventResult));
    setIsVerifier(Boolean(isVerifier));
  }, [contract, publicClient]);

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
  };
};

export const useAddVerifier = (
  args: { verifier: `0x${string}` },
  callbacks?: WriteCallbacks
) => {
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.config.chainId === network.chain?.id);
  }, [network]);
  const contract = getContractFromNetwork("unlonelySharesV1", localNetwork);
  const callbackHandlers = createCallbackHandler(
    "useAddVerifier addVerifier",
    callbacks
  );
  const {
    writeAsync: addVerifier,
    writeData: addVerifierData,
    txData: addVerifierTxData,
    isTxLoading: addVerifierTxLoading,
  } = useWrite(contract, "addVerifier", [args.verifier], callbackHandlers);

  return {
    addVerifier,
    addVerifierData,
    addVerifierTxData,
    addVerifierTxLoading,
  };
};

export const useRemoveVerifier = (
  args: { verifier: `0x${string}` },
  callbacks?: WriteCallbacks
) => {
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.config.chainId === network.chain?.id);
  }, [network]);
  const contract = getContractFromNetwork("unlonelySharesV1", localNetwork);
  const callbackHandlers = createCallbackHandler(
    "useRemoveVerifier removeVerifier",
    callbacks
  );
  const {
    writeAsync: removeVerifier,
    writeData: removeVerifierData,
    txData: removeVerifierTxData,
    isTxLoading: removeVerifierTxLoading,
  } = useWrite(contract, "removeVerifier", [args.verifier], callbackHandlers);

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
  callbacks?: WriteCallbacks
) => {
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.config.chainId === network.chain?.id);
  }, [network]);
  const contract = getContractFromNetwork("unlonelySharesV1", localNetwork);
  const callbackHandlers = createCallbackHandler(
    "useVerifyEvent verifyEvent",
    callbacks
  );
  const {
    writeAsync: verifyEvent,
    writeData: verifyEventData,
    txData: verifyEventTxData,
    isTxLoading: verifyEventTxLoading,
  } = useWrite(
    contract,
    "verifyEvent",
    [args.sharesSubject, args.result],
    callbackHandlers
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
  callbacks?: WriteCallbacks
) => {
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.config.chainId === network.chain?.id);
  }, [network]);
  const contract = getContractFromNetwork("unlonelySharesV1", localNetwork);
  const callbackHandlers = createCallbackHandler(
    "useSetFeeDestination setFeeDestination",
    callbacks
  );
  const {
    writeAsync: setFeeDestination,
    writeData: setFeeDestinationData,
    txData: setFeeDestinationTxData,
    isTxLoading: setFeeDestinationTxLoading,
  } = useWrite(
    contract,
    "setFeeDestination",
    [args.feeDestination],
    callbackHandlers
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
  callbacks?: WriteCallbacks
) => {
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.config.chainId === network.chain?.id);
  }, [network]);
  const contract = getContractFromNetwork("unlonelySharesV1", localNetwork);
  const callbackHandlers = createCallbackHandler(
    "useSetProtocolFeePercent setProtocolFeePercent",
    callbacks
  );
  const {
    writeAsync: setProtocolFeePercent,
    writeData: setProtocolFeePercentData,
    txData: setProtocolFeePercentTxData,
    isTxLoading: setProtocolFeePercentTxLoading,
  } = useWrite(
    contract,
    "setProtocolFeePercent",
    [args.feePercent],
    callbackHandlers
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
  callbacks?: WriteCallbacks
) => {
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.config.chainId === network.chain?.id);
  }, [network]);
  const contract = getContractFromNetwork("unlonelySharesV1", localNetwork);
  const callbackHandlers = createCallbackHandler(
    "useSetSubjectFeePercent setSubjectFeePercent",
    callbacks
  );
  const {
    writeAsync: setSubjectFeePercent,
    writeData: setSubjectFeePercentData,
    txData: setSubjectFeePercentTxData,
    isTxLoading: setSubjectFeePercentTxLoading,
  } = useWrite(
    contract,
    "setSubjectFeePercent",
    [args.feePercent],
    callbackHandlers
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
    amount: bigint;
    isYay: boolean;
  },
  callbacks?: WriteCallbacks
) => {
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.config.chainId === network.chain?.id);
  }, [network]);
  const contract = getContractFromNetwork("unlonelySharesV1", localNetwork);
  const callbackHandlers = createCallbackHandler(
    "useBuyShares buyShares",
    callbacks
  );

  const {
    writeAsync: buyShares,
    writeData: buySharesData,
    txData: buySharesTxData,
    isTxLoading: buySharesTxLoading,
  } = useWrite(
    contract,
    "buyShares",
    [args.sharesSubject, args.amount, args.isYay],
    callbackHandlers
  );

  return {
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
  callbacks?: WriteCallbacks
) => {
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.config.chainId === network.chain?.id);
  }, [network]);
  const contract = getContractFromNetwork("unlonelySharesV1", localNetwork);

  const callbackHandlers = createCallbackHandler(
    "useSellShares sellShares",
    callbacks
  );

  const {
    writeAsync: sellShares,
    writeData: sellSharesData,
    txData: sellSharesTxData,
    isTxLoading: sellSharesTxLoading,
  } = useWrite(
    contract,
    "sellShares",
    [args.sharesSubject, args.amount, args.isYay],
    callbackHandlers
  );

  return {
    sellShares,
    sellSharesData,
    sellSharesTxData,
    sellSharesTxLoading,
  };
};

export const useClaimPayout = (
  args: { sharesSubject: `0x${string}` },
  callbacks?: WriteCallbacks
) => {
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.config.chainId === network.chain?.id);
  }, [network]);
  const contract = getContractFromNetwork("unlonelySharesV1", localNetwork);

  const callbackHandlers = createCallbackHandler(
    "useClaimPayout claimPayout",
    callbacks
  );

  const {
    writeAsync: claimPayout,
    writeData: claimPayoutData,
    txData: claimPayoutTxData,
    isTxLoading: claimPayoutTxLoading,
  } = useWrite(contract, "claimPayout", [args.sharesSubject], callbackHandlers);

  return {
    claimPayout,
    claimPayoutData,
    claimPayoutTxData,
    claimPayoutTxLoading,
  };
};
