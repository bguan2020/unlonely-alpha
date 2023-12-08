import { useCallback, useEffect, useState } from "react";
import { isAddress } from "viem";
import { usePublicClient } from "wagmi";

import { EventTypeForContract, NULL_ADDRESS } from "../../constants";
import { ContractData, WriteCallbacks } from "../../constants/types";
import { createCallbackHandler } from "../../utils/contract";
import { useUser } from "../context/useUser";
import { useWrite } from "./useWrite";

type Tournament = {
  isActive: boolean;
  isPayoutClaimable: boolean;
  winningBadge: string;
  vipPooledEth: bigint;
};

export const useReadPublic = (contract: ContractData) => {
  const publicClient = usePublicClient();

  const [tournament, setTournament] = useState<Tournament>({
    isActive: false,
    isPayoutClaimable: false,
    winningBadge: NULL_ADDRESS,
    vipPooledEth: BigInt(0),
  });
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
      setTournament({
        isActive: false,
        isPayoutClaimable: false,
        winningBadge: NULL_ADDRESS,
        vipPooledEth: BigInt(0),
      });
      setProtocolFeeDestination(NULL_ADDRESS);
      setProtocolFeePercent(BigInt(0));
      setSubjectFeePercent(BigInt(0));
      setTournamentFeePercent(BigInt(0));
      return;
    }
    // try {
    const [
      tournament,
      protocolFeeDestination,
      protocolFeePercent,
      subjectFeePercent,
      tournamentFeePercent,
    ] = await Promise.all([
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "tournament",
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
    setTournament({
      isActive: Boolean(tournament[0]),
      isPayoutClaimable: Boolean(tournament[1]),
      winningBadge: String(tournament[2]),
      vipPooledEth: BigInt(String(tournament[3])),
    });
    setProtocolFeeDestination(String(protocolFeeDestination));
    setProtocolFeePercent(BigInt(String(protocolFeePercent)));
    setSubjectFeePercent(BigInt(String(subjectFeePercent)));
    setTournamentFeePercent(BigInt(String(tournamentFeePercent)));
    // } catch (e) {
    //   setTournament({
    //     isActive: false,
    //     isPayoutClaimable: false,
    //     winningBadge: NULL_ADDRESS,
    //     vipPooledEth: BigInt(0),
    //     endTimestamp: BigInt(0),
    //   });
    //   setProtocolFeeDestination(NULL_ADDRESS);
    //   setProtocolFeePercent(BigInt(0));
    //   setSubjectFeePercent(BigInt(0));
    //   setTournamentFeePercent(BigInt(0));
    // }
  }, [contract.address, publicClient]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    tournament,
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
  }, [contract.address, publicClient, userAddress, key]);

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

export const useSetTournamentCreator = (
  args: {
    creator: string;
    value: boolean;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: setTournamentCreator,
    writeData: setTournamentCreatorData,
    txData: setTournamentCreatorTxData,
    isTxLoading: setTournamentCreatorTxLoading,
  } = useWrite(
    contract,
    "setTournamentCreator",
    [args.creator, args.value],
    createCallbackHandler(
      "useSetTournamentCreator setTournamentCreator",
      callbacks
    )
  );
  return {
    setTournamentCreator,
    setTournamentCreatorData,
    setTournamentCreatorTxData,
    setTournamentCreatorTxLoading,
  };
};

export const useGenerateKey = (
  streamerAddress: string,
  eventId: number,
  contract: ContractData
) => {
  const publicClient = usePublicClient();

  const [key, setKey] = useState<string>(
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  );

  const getData = useCallback(async () => {
    if (
      !contract.address ||
      !contract.abi ||
      !publicClient ||
      !streamerAddress ||
      !isAddress(streamerAddress)
    ) {
      setKey(
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );
      return;
    }
    const key = await publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "generateKey",
      args: [
        streamerAddress as `0x${string}`,
        eventId,
        EventTypeForContract.VIP_BADGE,
      ],
    });
    setKey(String(key));
  }, [contract.address, publicClient, streamerAddress, eventId]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    key,
  };
};

export const useStartTournament = (
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: startTournament,
    writeData: startTournamentData,
    txData: startTournamentTxData,
    isTxLoading: startTournamentTxLoading,
    refetch: refetchStartTournament,
  } = useWrite(
    contract,
    "startTournament",
    [],
    createCallbackHandler("useStartTournament startTournament", callbacks)
  );

  return {
    startTournament,
    startTournamentData,
    startTournamentTxData,
    startTournamentTxLoading,
    refetchStartTournament,
  };
};

export const useSelectTournamentWinner = (
  args: {
    streamerAddress: `0x${string}`;
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
    refetch: refetchSelectTournamentWinner,
  } = useWrite(
    contract,
    "selectTournamentWinner",
    [args.streamerAddress, args.eventId, EventTypeForContract.VIP_BADGE],
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
    refetchSelectTournamentWinner,
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

export const useGetTournamentPayout = (
  address: `0x${string}`,
  contract: ContractData
) => {
  const publicClient = usePublicClient();
  const [userPayout, setUserPayout] = useState<bigint>(BigInt(0));

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setUserPayout(BigInt(0));
      return;
    }
    const userPayout = await publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "getTournamentPayout",
      args: [address],
    });
    setUserPayout(BigInt(String(userPayout)));
  }, [contract.address, publicClient]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    userPayout,
  };
};

export const useGetHolderBalance = (
  streamerAddress: `0x${string}`,
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
        args: [
          streamerAddress,
          eventId,
          EventTypeForContract.VIP_BADGE,
          holder,
        ],
      }),
    ]);
    setVipBadgeBalance(String(vipBadgeBalance));
  }, [contract.address, publicClient, streamerAddress, eventId, holder]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    vipBadgeBalance,
  };
};

export const getSupply = (
  streamerAddress: `0x${string}`,
  eventId: number,
  contract: ContractData
) => {
  const publicClient = usePublicClient();

  const [vipBadgeSupply, setVipBadgeSupply] = useState<string>("0");

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setVipBadgeSupply("0");
      return;
    }
    const [vipBadgeSupply] = await Promise.all([
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "getSupply",
        args: [streamerAddress, eventId, EventTypeForContract.VIP_BADGE],
      }),
    ]);
    setVipBadgeSupply(String(vipBadgeSupply));
  }, [contract.address, publicClient, streamerAddress, eventId]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    vipBadgeSupply,
  };
};

export const useGetPrice = (
  streamerAddress: `0x${string}`,
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
            args: [
              streamerAddress,
              eventId,
              EventTypeForContract.VIP_BADGE,
              amount,
            ],
          })
        : await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "getSellPrice",
            args: [
              streamerAddress,
              eventId,
              EventTypeForContract.VIP_BADGE,
              amount,
            ],
          });
    setPrice(BigInt(String(price)));
  }, [
    contract.address,
    publicClient,
    streamerAddress,
    eventId,
    amount,
    isBuying,
  ]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    price,
  };
};

export const useGetPriceAfterFee = (
  streamerAddress: `0x${string}`,
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
            args: [
              streamerAddress,
              eventId,
              EventTypeForContract.VIP_BADGE,
              amount,
            ],
          })
        : await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "getSellPriceAfterFee",
            args: [
              streamerAddress,
              eventId,
              EventTypeForContract.VIP_BADGE,
              amount,
            ],
          });
    setPriceAfterFee(BigInt(String(price)));
  }, [
    contract.address,
    publicClient,
    streamerAddress,
    eventId,
    amount,
    isBuying,
  ]);

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
    streamerAddress: `0x${string}`;
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
    [
      args.streamerAddress,
      args.eventId,
      EventTypeForContract.VIP_BADGE,
      args.amount,
    ],
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
    streamerAddress: `0x${string}`;
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
    [
      args.streamerAddress,
      args.eventId,
      EventTypeForContract.VIP_BADGE,
      args.amount,
    ],
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
