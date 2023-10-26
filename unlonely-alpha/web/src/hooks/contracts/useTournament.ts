import { useCallback, useEffect, useState } from "react";
import { usePublicClient } from "wagmi";

import { EventType, NULL_ADDRESS } from "../../constants";
import { ContractData, WriteCallbacks } from "../../constants/types";
import { createCallbackHandler } from "../../utils/contract";
import { useUser } from "../context/useUser";
import { useWrite } from "./useWrite";

type ActiveTournament = {
  isActive: boolean;
  isWinnerSelected: boolean;
  winningBadge: string;
  vipPooledEth: bigint;
  endTimestamp: bigint;
};

export const useReadPublic = (contract: ContractData) => {
  const publicClient = usePublicClient();

  const [activeTournament, setActiveTournament] = useState<
    ActiveTournament | undefined
  >(undefined);
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
      setActiveTournament(undefined);
      setProtocolFeeDestination(NULL_ADDRESS);
      setProtocolFeePercent(BigInt(0));
      setSubjectFeePercent(BigInt(0));
      setTournamentFeePercent(BigInt(0));
      return;
    }
    const [
      activeTournament,
      protocolFeeDestination,
      protocolFeePercent,
      subjectFeePercent,
      tournamentFeePercent,
    ] = await Promise.all([
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "activeTournament",
        args: [],
      }),
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
    setActiveTournament(activeTournament as unknown as ActiveTournament);
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
    activeTournament,
    protocolFeeDestination,
    protocolFeePercent,
    subjectFeePercent,
    tournamentFeePercent,
  };
};

export const useReadMappings = (key: string, contract: ContractData) => {
  const { userAddress } = useUser();
  const publicClient = usePublicClient();

  const [vipBadgeSupply, setVipBadgeSupply] = useState<bigint>(BigInt(0));
  const [isTournamentCreator, setIsTournamentCreator] =
    useState<boolean>(false);

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setVipBadgeSupply(BigInt(0));
      setIsTournamentCreator(false);
      return;
    }
    const [vipBadgeSupply, isTournamentCreator] = await Promise.all([
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "vipBadgeSupply",
        args: [key],
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "isTournamentCreator",
        args: [userAddress],
      }),
    ]);
    setVipBadgeSupply(BigInt(String(vipBadgeSupply)));
    setIsTournamentCreator(Boolean(isTournamentCreator));
  }, [contract, publicClient, userAddress, key]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    vipBadgeSupply,
    isTournamentCreator,
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

export const useSetTournamentFeePercent = (
  args: {
    feePercent: bigint;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: setTournamentFeePercent,
    writeData: setTournamentFeePercentData,
    txData: setTournamentFeePercentTxData,
    isTxLoading: setTournamentFeePercentTxLoading,
  } = useWrite(
    contract,
    "setTournamentFeePercent",
    [args.feePercent],
    createCallbackHandler(
      "useSetTournamentFeePercent setTournamentFeePercent",
      callbacks
    )
  );

  return {
    setTournamentFeePercent,
    setTournamentFeePercentData,
    setTournamentFeePercentTxData,
    setTournamentFeePercentTxLoading,
  };
};

export const useGenerateKey = (
  eventAddress: `0x${string}`,
  eventId: number,
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
      args: [eventAddress, eventId, EventType.VIP_BADGE],
    });
    setKey(String(key));
  }, [contract, publicClient, eventAddress, eventId]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    key,
  };
};

export const useCreateTournament = (
  args: {
    endTimestamp: bigint;
  },
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
    [args.endTimestamp],
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
    [args.eventAddress, args.eventId, EventType.VIP_BADGE],
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
    [],
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

export const useGetHolderBalance = (
  eventAddress: `0x${string}`,
  eventId: number,
  holder: `0x${string}`,
  contract: ContractData
) => {
  const publicClient = usePublicClient();

  const [vipBadgeBalance, setVipBadgeBalance] = useState<string>("0");

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setVipBadgeBalance("0");
      return;
    }
    const [vipBadgeBalance] = await Promise.all([
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "getHolderBalance",
        args: [eventAddress, eventId, EventType.VIP_BADGE, holder],
      }),
    ]);
    setVipBadgeBalance(String(vipBadgeBalance));
  }, [contract, publicClient, eventAddress, eventId, holder]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    vipBadgeBalance,
  };
};

export const useGetPrice = (
  eventAddress: `0x${string}`,
  eventId: number,
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
            args: [eventAddress, eventId, EventType.VIP_BADGE, amount],
          })
        : await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "getSellPrice",
            args: [eventAddress, eventId, EventType.VIP_BADGE, amount],
          });
    setPrice(BigInt(String(price)));
  }, [contract, publicClient, eventAddress, eventId, amount, isBuying]);

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
            args: [eventAddress, eventId, EventType.VIP_BADGE, amount],
          })
        : await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "getSellPriceAfterFee",
            args: [eventAddress, eventId, EventType.VIP_BADGE, amount],
          });
    setPriceAfterFee(BigInt(String(price)));
  }, [contract, publicClient, eventAddress, eventId, amount, isBuying]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    priceAfterFee,
  };
};

export const useBuyVipBadge = (
  args: {
    eventAddress: `0x${string}`;
    eventId: number;
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
    [args.eventAddress, args.eventId, EventType.VIP_BADGE, args.amount],
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
    [args.eventAddress, args.eventId, EventType.VIP_BADGE, args.amount],
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
