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
  const [tournamentFeePercent, setTournamentFeePercent] = useState<bigint>(
    BigInt(0)
  );

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setProtocolFeeDestination(NULL_ADDRESS);
      setProtocolFeePercent(BigInt(0));
      setSubjectFeePercent(BigInt(0));
      setTournamentFeePercent(BigInt(0));
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
        publicClient.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: "tournamentFeePercent",
          args: [],
        }),
      ]);
    setProtocolFeeDestination(String(protocolFeeDestination));
    setProtocolFeePercent(BigInt(String(protocolFeePercent)));
    setSubjectFeePercent(BigInt(String(subjectFeePercent)));
    setTournamentFeePercent(BigInt(String(tournamentFeePercent)));
  }, [contract, publicClient]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    protocolFeeDestination,
    protocolFeePercent,
    subjectFeePercent,
    tournamentFeePercent,
  };
};

export const useGenerateKey = (
  eventAddress: `0x${string}`,
  eventId: number,
  eventType: EventType,
  contract: ContractData
) => {
  const publicClient = usePublicClient();

  const [key, setKey] = useState<string>("");

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setKey("");
      return;
    }
    const key = await publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "generateKey",
      args: [eventAddress, eventId, eventType],
    });
    setKey(String(key));
  }, [contract, publicClient]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    key,
  };
};

export const useGetHolderBalances = (
  eventAddress: `0x${string}`,
  eventId: number,
  holder: `0x${string}`,
  contract: ContractData
) => {
  const publicClient = usePublicClient();

  const [yayVotesBalance, setYayVotesBalance] = useState<string>("0");
  const [nayVotesBalance, setNayVotesBalance] = useState<string>("0");
  const [vipBadgeBalance, setVipBadgeBalance] = useState<string>("0");

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setYayVotesBalance("0");
      setNayVotesBalance("0");
      setVipBadgeBalance("0");
      return;
    }
    const [yayVotesBalance, nayVotesBalance, vipBadgeBalance] =
      await Promise.all([
        publicClient.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: "getHolderBalance",
          args: [eventAddress, eventId, EventType.YAY_VOTE, holder],
        }),
        publicClient.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: "getHolderBalance",
          args: [eventAddress, eventId, EventType.NAY_VOTE, holder],
        }),
        publicClient.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: "getHolderBalance",
          args: [eventAddress, eventId, EventType.VIP_BADGE, holder],
        }),
      ]);
    setYayVotesBalance(String(yayVotesBalance));
    setNayVotesBalance(String(nayVotesBalance));
    setVipBadgeBalance(String(vipBadgeBalance));
  }, [contract, publicClient]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    yayVotesBalance,
    nayVotesBalance,
    vipBadgeBalance,
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
    const price =
      amount === BigInt(0)
        ? 0
        : isBuying
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
  key: string,
  eventAddress: `0x${string}`,
  eventId: number,
  eventType: EventType,
  contract: ContractData
) => {
  const { userAddress } = useUser();
  const publicClient = usePublicClient();

  const [yayVotesSupply, setYayVotesSupply] = useState<bigint>(BigInt(0));
  const [nayVotesSupply, setNayVotesSupply] = useState<bigint>(BigInt(0));
  const [vipBadgeSupply, setVipBadgeSupply] = useState<bigint>(BigInt(0));

  const [eventVerified, setEventVerified] = useState<boolean>(false);
  const [eventResult, setEventResult] = useState<boolean>(false);
  const [isVerifier, setIsVerifier] = useState<boolean>(false);
  const [isTournamentCreator, setIsTournamentCreator] =
    useState<boolean>(false);

  const [votingPooledEth, setVotingPooledEth] = useState<bigint>(BigInt(0));
  const [userPayout, setUserPayout] = useState<bigint>(BigInt(0));

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setVotingPooledEth(BigInt(0));
      setYayVotesSupply(BigInt(0));
      setNayVotesSupply(BigInt(0));
      setVipBadgeSupply(BigInt(0));
      setEventVerified(false);
      setEventResult(false);
      setIsVerifier(false);
      setIsTournamentCreator(false);
      setUserPayout(BigInt(0));
      return;
    }
    const [
      yayVotesSupply,
      nayVotesSupply,
      vipBadgeSupply,
      eventVerified,
      eventResult,
      isVerifier,
      isTournamentCreator,
      pooledEth,
      userPayout,
    ] = await Promise.all([
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "yayVotesSupply",
        args: [key],
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "nayVotesSupply",
        args: [key],
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "vipBadgeSupply",
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
        functionName: "isTournamentCreator",
        args: [userAddress],
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "votingPooledEth",
        args: [key],
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "getVotePayout",
        args: [eventAddress, eventId, eventType, userAddress],
      }),
    ]);
    setVotingPooledEth(BigInt(String(pooledEth)));
    setYayVotesSupply(BigInt(String(yayVotesSupply)));
    setNayVotesSupply(BigInt(String(nayVotesSupply)));
    setVipBadgeSupply(BigInt(String(vipBadgeSupply)));
    setEventVerified(Boolean(eventVerified));
    setEventResult(Boolean(eventResult));
    setIsVerifier(Boolean(isVerifier));
    setIsTournamentCreator(Boolean(isTournamentCreator));
    setUserPayout(BigInt(String(userPayout)));
  }, [contract, publicClient, userAddress]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    yayVotesSupply,
    nayVotesSupply,
    vipBadgeSupply,
    eventVerified,
    eventResult,
    isVerifier,
    isTournamentCreator,
    votingPooledEth,
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

export const useBuyVotes = (
  args: {
    eventAddress: `0x${string}`;
    eventId: number;
    eventType: EventType;
    amountOfVotes: bigint;
    value: bigint;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: buyVotes,
    writeData: buyVotesData,
    txData: buyVotesTxData,
    isTxLoading: buyVotesTxLoading,
    refetch,
  } = useWrite(
    contract,
    "buyVotes",
    [args.eventAddress, args.eventId, args.eventType, args.amountOfVotes],
    createCallbackHandler("useBuyVotes buyVotes", callbacks),
    { value: args.value }
  );

  return {
    refetch,
    buyVotes,
    buyVotesData,
    buyVotesTxData,
    buyVotesTxLoading,
  };
};

export const useSellVotes = (
  args: {
    eventAddress: `0x${string}`;
    eventId: number;
    eventType: EventType;
    amountOfVotes: bigint;
    value: bigint;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: sellVotes,
    writeData: sellVotesData,
    txData: sellVotesTxData,
    isTxLoading: sellVotesTxLoading,
    refetch,
  } = useWrite(
    contract,
    "sellVotes",
    [args.eventAddress, args.eventId, args.eventType, args.amountOfVotes],
    createCallbackHandler("useSellVotes sellVotes", callbacks)
  );

  return {
    refetch,
    sellVotes,
    sellVotesData,
    sellVotesTxData,
    sellVotesTxLoading,
  };
};

export const useBuyVipBadge = (
  args: {
    eventAddress: `0x${string}`;
    eventId: number;
    eventType: EventType;
    amount: bigint;
    value: bigint;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: buyVipBadge,
    writeData: buyVipBadgeData,
    txData: buyVipBadgeTxData,
    isTxLoading: buyVipBadgeTxLoading,
    refetch,
  } = useWrite(
    contract,
    "buyVIPBadge",
    [args.eventAddress, args.eventId, args.eventType, args.amount],
    createCallbackHandler("useBuyVipBadge buyVipBadge", callbacks),
    { value: args.value }
  );

  return {
    refetch,
    buyVipBadge,
    buyVipBadgeData,
    buyVipBadgeTxData,
    buyVipBadgeTxLoading,
  };
};

export const useSellVipBadge = (
  args: {
    eventAddress: `0x${string}`;
    eventId: number;
    eventType: EventType;
    amount: bigint;
    value: bigint;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: sellVipBadge,
    writeData: sellVipBadgeData,
    txData: sellVipBadgeTxData,
    isTxLoading: sellVipBadgeTxLoading,
    refetch,
  } = useWrite(
    contract,
    "sellVIPBadge",
    [args.eventAddress, args.eventId, args.eventType, args.amount],
    createCallbackHandler("useSellVipBadge sellVipBadge", callbacks)
  );

  return {
    refetch,
    sellVipBadge,
    sellVipBadgeData,
    sellVipBadgeTxData,
    sellVipBadgeTxLoading,
  };
};

export const useClaimVotePayout = (
  args: { eventAddress: `0x${string}`; eventId: number; eventType: EventType },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: claimVotePayout,
    writeData: claimVotePayoutData,
    txData: claimVotePayoutTxData,
    isTxLoading: claimVotePayoutTxLoading,
    refetch,
  } = useWrite(
    contract,
    "claimVotePayout",
    [args.eventAddress, args.eventId, args.eventType],
    createCallbackHandler("useClaimVotePayout claimVotePayout", callbacks)
  );

  return {
    claimVotePayout,
    claimVotePayoutData,
    claimVotePayoutTxData,
    claimVotePayoutTxLoading,
    refetch,
  };
};

export const useCreateTournament = (
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: createTournament,
    writeData: createTournamentData,
    txData: createTournamentTxData,
    isTxLoading: createTournamentTxLoading,
    refetch: refetchCreateTournament,
  } = useWrite(
    contract,
    "createTournament",
    [],
    createCallbackHandler("useCreateTournament createTournament", callbacks)
  );

  return {
    createTournament,
    createTournamentData,
    createTournamentTxData,
    createTournamentTxLoading,
    refetchCreateTournament,
  };
};

export const useSelectTournamentWinner = (
  args: {
    eventAddress: `0x${string}`;
    eventId: number;
    eventType: EventType;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: selectTournamentWinner,
    writeData: selectTournamentWinnerData,
    txData: selectTournamentWinnerTxData,
    isTxLoading: selectTournamentWinnerTxLoading,
    refetch: refetchCreateTournament,
  } = useWrite(
    contract,
    "selectTournamentWinner",
    [args.eventAddress, args.eventId, args.eventType],
    createCallbackHandler(
      "useSelectTournamentWinner selectTournamentWinner",
      callbacks
    )
  );

  return {
    selectTournamentWinner,
    selectTournamentWinnerData,
    selectTournamentWinnerTxData,
    selectTournamentWinnerTxLoading,
    refetchCreateTournament,
  };
};

export const useClaimTournamentPayout = (
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: claimTournamentPayout,
    writeData: claimTournamentPayoutData,
    txData: claimTournamentPayoutTxData,
    isTxLoading: claimTournamentPayoutTxLoading,
    refetch: refetchClaimTournamentPayout,
  } = useWrite(
    contract,
    "claimTournamentPayout",
    [],
    createCallbackHandler(
      "useClaimTournamentPayout claimTournamentPayout",
      callbacks
    )
  );

  return {
    claimTournamentPayout,
    claimTournamentPayoutData,
    claimTournamentPayoutTxData,
    claimTournamentPayoutTxLoading,
    refetchClaimTournamentPayout,
  };
};

export const useEndTournament = (
  args: {
    key: string;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: endTournament,
    writeData: endTournamentData,
    txData: endTournamentTxData,
    isTxLoading: endTournamentTxLoading,
    refetch: refetchEndTournament,
  } = useWrite(
    contract,
    "endTournament",
    [args.key],
    createCallbackHandler("useEndTournament endTournament", callbacks)
  );

  return {
    endTournament,
    endTournamentData,
    endTournamentTxData,
    endTournamentTxLoading,
    refetchEndTournament,
  };
};
