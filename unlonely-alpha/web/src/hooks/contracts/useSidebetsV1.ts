import { useCallback, useEffect, useState } from "react";
import { usePublicClient } from "wagmi";

import { EventType, NULL_ADDRESS } from "../../constants";
import { ContractData, WriteCallbacks } from "../../constants/types";
import { createCallbackHandler } from "../../utils/contract";
import { useUser } from "../context/useUser";
import { useWrite } from "./useWrite";

type SideBetData = {
  initiator: string;
  opponent: string;
  wagerAmount: bigint;
  expirationTime: bigint;
  isWinnerPicked: boolean;
  winner: string;
};

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

export const useReadMappings = (key: string, contract: ContractData) => {
  const { userAddress } = useUser();
  const publicClient = usePublicClient();

  const [sideBet, setSideBet] = useState<SideBetData>({
    initiator: NULL_ADDRESS,
    opponent: NULL_ADDRESS,
    wagerAmount: BigInt(0),
    expirationTime: BigInt(0),
    isWinnerPicked: false,
    winner: NULL_ADDRESS,
  });
  const [isVerifier, setIsVerifier] = useState<boolean>(false);

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setSideBet({
        initiator: NULL_ADDRESS,
        opponent: NULL_ADDRESS,
        wagerAmount: BigInt(0),
        expirationTime: BigInt(0),
        isWinnerPicked: false,
        winner: NULL_ADDRESS,
      });
      setIsVerifier(false);
      return;
    }
    const [sideBet, isVerifier] = await Promise.all([
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "sideBets",
        args: [key],
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "isVerifier",
        args: [userAddress],
      }),
    ]);
    setSideBet({
      initiator: String(sideBet[0]),
      opponent: String(sideBet[1]),
      wagerAmount: BigInt(String(sideBet[2])),
      expirationTime: BigInt(String(sideBet[3])),
      isWinnerPicked: Boolean(sideBet[4]),
      winner: String(sideBet[5]),
    });
    setIsVerifier(Boolean(isVerifier));
  }, [contract, publicClient, userAddress, key]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    isVerifier,
    sideBet,
  };
};

export const useGenerateKey = (
  eventAddress: `0x${string}`,
  eventId: number,
  contract: ContractData
) => {
  const publicClient = usePublicClient();

  const [key, setKey] = useState<string>(
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  );

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setKey(
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );
      return;
    }
    const key = await publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "generateKey",
      args: [eventAddress, eventId, EventType.SIDE_BET],
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

export const useGetOpeningAfterFee = (
  amount: bigint,
  contract: ContractData
) => {
  const publicClient = usePublicClient();

  const [openingWagerAfterFee, setOpeningWagerAfterFee] = useState<bigint>(
    BigInt(0)
  );

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setOpeningWagerAfterFee(BigInt(0));
      return;
    }
    const wager = await publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "getOpeningWagerAfterFee",
      args: [amount],
    });
    setOpeningWagerAfterFee(BigInt(String(wager)));
  }, [contract, publicClient, amount]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    openingWagerAfterFee,
  };
};

export const useGetExistingWager = (
  eventAddress: `0x${string}`,
  eventId: number,
  contract: ContractData,
  includeFees: boolean
) => {
  const publicClient = usePublicClient();

  const [existingWager, setExistingWager] = useState<bigint>(BigInt(0));

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setExistingWager(BigInt(0));
      return;
    }
    const wager = includeFees
      ? await publicClient.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: "getExistingWagerAfterFee",
          args: [eventAddress, eventId, EventType.SIDE_BET],
        })
      : await publicClient.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: "getExistingWager",
          args: [eventAddress, eventId, EventType.SIDE_BET],
        });
    setExistingWager(BigInt(String(wager)));
  }, [contract, publicClient, eventAddress, eventId]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    existingWager,
  };
};

export const useIsSideBetAvailable = (
  eventAddress: `0x${string}`,
  eventId: number,
  contract: ContractData
) => {
  const publicClient = usePublicClient();

  const [isAvailable, setIsAvailable] = useState<boolean>(false);

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setIsAvailable(false);
      return;
    }
    const isAvailable = await publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "isSideBetAvailable",
      args: [eventAddress, eventId, EventType.SIDE_BET],
    });
    setIsAvailable(Boolean(isAvailable));
  }, [contract, publicClient, eventAddress, eventId]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    isAvailable,
  };
};

export const useOpenSideBet = (
  args: {
    eventAddress: `0x${string}`;
    eventId: number;
    wagerAmount: bigint;
    expirationTime: bigint;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: openSideBet,
    writeData: openSideBetData,
    txData: openSideBetTxData,
    isTxLoading: openSideBetTxLoading,
  } = useWrite(
    contract,
    "openSideBet",
    [
      args.eventAddress,
      args.eventId,
      EventType.SIDE_BET,
      args.wagerAmount,
      args.expirationTime,
    ],
    createCallbackHandler("useOpenSideBet openSideBet", callbacks),
    { value: args.wagerAmount }
  );

  return {
    openSideBet,
    openSideBetData,
    openSideBetTxData,
    openSideBetTxLoading,
  };
};

export const useAcceptSideBet = (
  args: {
    eventAddress: `0x${string}`;
    eventId: number;
    wagerAmount: bigint;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: acceptSideBet,
    writeData: acceptSideBetData,
    txData: acceptSideBetTxData,
    isTxLoading: acceptSideBetTxLoading,
  } = useWrite(
    contract,
    "acceptSideBet",
    [args.eventAddress, args.eventId, EventType.SIDE_BET],
    createCallbackHandler("useAcceptSideBet acceptSideBet", callbacks),
    { value: args.wagerAmount }
  );

  return {
    acceptSideBet,
    acceptSideBetData,
    acceptSideBetTxData,
    acceptSideBetTxLoading,
  };
};

export const usePickWinner = (
  args: {
    eventAddress: `0x${string}`;
    eventId: number;
    winner: string;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: pickWinner,
    writeData: pickWinnerData,
    txData: pickWinnerTxData,
    isTxLoading: pickWinnerTxLoading,
  } = useWrite(
    contract,
    "pickWinner",
    [args.eventAddress, args.eventId, EventType.SIDE_BET, args.winner],
    createCallbackHandler("usePickWinner pickWinner", callbacks)
  );

  return {
    pickWinner,
    pickWinnerData,
    pickWinnerTxData,
    pickWinnerTxLoading,
  };
};

export const useCloseSideBet = (
  args: {
    eventAddress: `0x${string}`;
    eventId: number;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: closeSideBet,
    writeData: closeSideBetData,
    txData: closeSideBetTxData,
    isTxLoading: closeSideBetTxLoading,
  } = useWrite(
    contract,
    "closeSideBet",
    [args.eventAddress, args.eventId, EventType.SIDE_BET],
    createCallbackHandler("useCloseSideBet closeSideBet", callbacks)
  );

  return {
    closeSideBet,
    closeSideBetData,
    closeSideBetTxData,
    closeSideBetTxLoading,
  };
};
