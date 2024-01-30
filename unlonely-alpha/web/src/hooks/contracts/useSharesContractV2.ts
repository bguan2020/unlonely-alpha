import { useCallback, useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { isAddress } from "viem";

import {
  EventTypeForContract,
  NULL_ADDRESS,
  NULL_ADDRESS_BYTES32,
} from "../../constants";
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

export const useReadSupplies = (
  key: string,
  eventAddress: `0x${string}`,
  eventId: number,
  contract: ContractData
) => {
  const publicClient = usePublicClient();

  const [yayVotesSupply, setYayVotesSupply] = useState<bigint>(BigInt(0));
  const [nayVotesSupply, setNayVotesSupply] = useState<bigint>(BigInt(0));

  const getData = useCallback(async () => {
    if (
      !contract.address ||
      !contract.abi ||
      !publicClient ||
      !isAddress(eventAddress)
    ) {
      setYayVotesSupply(BigInt(0));
      setNayVotesSupply(BigInt(0));
      return;
    }
    const [yayVotesSupply, nayVotesSupply] = await Promise.all([
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
    ]);
    setYayVotesSupply(BigInt(String(yayVotesSupply)));
    setNayVotesSupply(BigInt(String(nayVotesSupply)));
  }, [contract.address, publicClient, eventAddress, eventId, key]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    yayVotesSupply,
    nayVotesSupply,
    setYayVotesSupply,
    setNayVotesSupply,
  };
};

export const useEventVerifyStatus = (key: string, contract: ContractData) => {
  const publicClient = usePublicClient();
  const [eventVerified, setEventVerified] = useState<boolean>(false);
  const [eventResult, setEventResult] = useState<boolean>(false);

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setEventVerified(false);
      return;
    }
    const [eventVerified, eventResult] = await Promise.all([
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
    ]);
    setEventVerified(Boolean(eventVerified));
    setEventResult(Boolean(eventResult));
  }, [contract.address, publicClient, key]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    eventVerified,
    eventResult,
    setEventResult,
    setEventVerified,
  };
};

export const useEventEndTimestamp = (key: string, contract: ContractData) => {
  const publicClient = usePublicClient();
  const [eventEndTimestamp, setEventEndTimestamp] = useState<bigint>(BigInt(0));

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setEventEndTimestamp(BigInt(0));
      return;
    }
    const eventEndTimestamp = await publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "eventEndTimestamp",
      args: [key],
    });
    setEventEndTimestamp(BigInt(String(eventEndTimestamp)));
  }, [contract.address, publicClient, key]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    eventEndTimestamp,
    setEventEndTimestamp,
  };
};

export const useVotingPooledEth = (key: string, contract: ContractData) => {
  const publicClient = usePublicClient();
  const [votingPooledEth, setVotingPooledEth] = useState<bigint>(BigInt(0));

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setVotingPooledEth(BigInt(0));
      return;
    }
    const pooledEth = await publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "votingPooledEth",
      args: [key],
    });
    setVotingPooledEth(BigInt(String(pooledEth)));
  }, [contract.address, publicClient, key]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    votingPooledEth,
    setVotingPooledEth,
  };
};

export const useUserPayout = (
  eventAddress: `0x${string}`,
  eventId: number,
  contract: ContractData
) => {
  const { userAddress } = useUser();
  const publicClient = usePublicClient();

  const [userPayout, setUserPayout] = useState<bigint>(BigInt(0));

  const getData = useCallback(async () => {
    if (
      !contract.address ||
      !contract.abi ||
      !publicClient ||
      !userAddress ||
      !isAddress(eventAddress)
    ) {
      setUserPayout(BigInt(0));
      return;
    }
    const userPayout = await publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "getVotePayout",
      args: [
        eventAddress,
        eventId,
        EventTypeForContract.YAY_NAY_VOTE,
        userAddress,
      ],
    });
    setUserPayout(BigInt(String(userPayout)));
  }, [contract.address, publicClient, userAddress, eventAddress, eventId]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    userPayout,
  };
};

export const useIsVerifier = (contract: ContractData) => {
  const { userAddress } = useUser();
  const publicClient = usePublicClient();

  const [isVerifier, setIsVerifier] = useState<boolean>(false);

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient || !userAddress) {
      setIsVerifier(false);
      return;
    }
    const isVerifier = await publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "isVerifier",
      args: [userAddress],
    });
    setIsVerifier(Boolean(isVerifier));
  }, [contract.address, publicClient, userAddress]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    isVerifier,
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

export const useSetVerifier = (
  args: { verifier: `0x${string}`; value: boolean },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: setVerifier,
    writeData: setVerifierData,
    txData: setVerifierTxData,
    isTxLoading: setVerifierTxLoading,
  } = useWrite(
    contract,
    "setVerifier",
    [args.verifier, args.value],
    createCallbackHandler("useSetVerifier setVerifier", callbacks)
  );

  return {
    setVerifier,
    setVerifierData,
    setVerifierTxData,
    setVerifierTxLoading,
  };
};

export const useGenerateKey = (
  eventAddress: `0x${string}`,
  eventId: number,
  contract: ContractData
) => {
  const publicClient = usePublicClient();

  const [key, setKey] = useState<string>(NULL_ADDRESS_BYTES32);

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setKey(NULL_ADDRESS_BYTES32);
      return;
    }
    const key = await publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "generateKey",
      args: [eventAddress, eventId, EventTypeForContract.YAY_NAY_VOTE],
    });
    setKey(String(key));
  }, [contract.address, publicClient, eventAddress, eventId]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    key,
  };
};

export const useOpenEvent = (
  args: {
    eventAddress: `0x${string}`;
    eventId: number;
    endTimestamp: bigint;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: openEvent,
    writeData: openEventData,
    txData: openEventTxData,
    isTxLoading: openEventTxLoading,
    refetch,
    isRefetching,
  } = useWrite(
    contract,
    "openEvent",
    [
      args.eventAddress,
      args.eventId,
      EventTypeForContract.YAY_NAY_VOTE,
      args.endTimestamp,
    ],
    createCallbackHandler("useOpenEvent openEvent", callbacks),
    {
      enabled:
        args.eventAddress !== NULL_ADDRESS &&
        args.eventId > 0 &&
        contract.address !== NULL_ADDRESS &&
        contract.abi !== null,
    }
  );

  return {
    openEvent,
    openEventData,
    openEventTxData,
    openEventTxLoading,
    refetch,
    isRefetching,
  };
};

export const useVerifyEvent = (
  args: {
    eventAddress: `0x${string}`;
    eventId: number;
    result: boolean;
    enabled: boolean;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: verifyEvent,
    writeData: verifyEventData,
    txData: verifyEventTxData,
    isTxLoading: verifyEventTxLoading,
    refetch,
    isRefetching,
  } = useWrite(
    contract,
    "verifyEvent",
    [
      args.eventAddress,
      args.eventId,
      EventTypeForContract.YAY_NAY_VOTE,
      args.result,
    ],
    createCallbackHandler("useVerifyEvent verifyEvent", callbacks),
    {
      enabled:
        args.eventAddress !== NULL_ADDRESS &&
        args.eventId > 0 &&
        contract.address !== NULL_ADDRESS &&
        contract.abi !== null &&
        args.enabled,
    }
  );

  return {
    verifyEvent,
    verifyEventData,
    verifyEventTxData,
    verifyEventTxLoading,
    refetch,
    isRefetching,
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

  const getData = useCallback(async () => {
    if (
      !contract.address ||
      !contract.abi ||
      !publicClient ||
      !isAddress(holder) ||
      !isAddress(eventAddress)
    ) {
      setYayVotesBalance("0");
      setNayVotesBalance("0");
      return;
    }
    const [yayVotesBalance, nayVotesBalance] = await Promise.all([
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "getHolderBalance",
        args: [
          eventAddress,
          eventId,
          EventTypeForContract.YAY_NAY_VOTE,
          true,
          holder,
        ],
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "getHolderBalance",
        args: [
          eventAddress,
          eventId,
          EventTypeForContract.YAY_NAY_VOTE,
          false,
          holder,
        ],
      }),
    ]);
    setYayVotesBalance(String(yayVotesBalance));
    setNayVotesBalance(String(nayVotesBalance));
  }, [contract.address, publicClient, eventAddress, eventId, holder]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    yayVotesBalance,
    nayVotesBalance,
    setYayVotesBalance,
    setNayVotesBalance,
  };
};

export const useGetPrice = (
  eventAddress: `0x${string}`,
  eventId: number,
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
    const price =
      amount === BigInt(0)
        ? 0
        : isBuying
        ? await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "getBuyPrice",
            args: [
              eventAddress,
              eventId,
              EventTypeForContract.YAY_NAY_VOTE,
              isYay,
              amount,
            ],
          })
        : await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "getSellPrice",
            args: [
              eventAddress,
              eventId,
              EventTypeForContract.YAY_NAY_VOTE,
              isYay,
              amount,
            ],
          });
    setPrice(BigInt(String(price)));
  }, [
    contract.address,
    publicClient,
    eventAddress,
    eventId,
    amount,
    isBuying,
    isYay,
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
  eventAddress: `0x${string}`,
  eventId: number,
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
            args: [
              eventAddress,
              eventId,
              EventTypeForContract.YAY_NAY_VOTE,
              isYay,
              amount,
            ],
          })
        : await publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: "getSellPriceAfterFee",
            args: [
              eventAddress,
              eventId,
              EventTypeForContract.YAY_NAY_VOTE,
              isYay,
              amount,
            ],
          });
    setPriceAfterFee(BigInt(String(price)));
  }, [contract.address, publicClient, eventAddress, eventId, amount, isYay]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    priceAfterFee,
  };
};

export const useBuyVotes = (
  args: {
    eventAddress: `0x${string}`;
    eventId: number;
    isYay: boolean;
    amountOfVotes: bigint;
    value: bigint;
    canBuy: boolean;
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
    isRefetching: isRefetchingBuyVotes,
  } = useWrite(
    contract,
    "buyVotes",
    [
      args.eventAddress,
      args.eventId,
      EventTypeForContract.YAY_NAY_VOTE,
      args.isYay,
      args.amountOfVotes,
    ],
    createCallbackHandler("useBuyVotes buyVotes", callbacks),
    {
      value: args.value,
      enabled:
        args.eventAddress !== NULL_ADDRESS &&
        args.eventId > 0 &&
        contract.address !== NULL_ADDRESS &&
        contract.abi !== null &&
        args.canBuy,
    }
  );

  return {
    refetch,
    buyVotes,
    buyVotesData,
    buyVotesTxData,
    buyVotesTxLoading,
    isRefetchingBuyVotes,
  };
};

export const useSellVotes = (
  args: {
    eventAddress: `0x${string}`;
    eventId: number;
    isYay: boolean;
    amountOfVotes: bigint;
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
    isRefetching: isRefetchingSellVotes,
  } = useWrite(
    contract,
    "sellVotes",
    [
      args.eventAddress,
      args.eventId,
      EventTypeForContract.YAY_NAY_VOTE,
      args.isYay,
      args.amountOfVotes,
    ],
    createCallbackHandler("useSellVotes sellVotes", callbacks),
    {
      enabled:
        args.eventAddress !== NULL_ADDRESS &&
        args.eventId > 0 &&
        contract.address !== NULL_ADDRESS &&
        contract.abi !== null,
    }
  );

  return {
    refetch,
    sellVotes,
    sellVotesData,
    sellVotesTxData,
    sellVotesTxLoading,
    isRefetchingSellVotes,
  };
};

export const useClaimVotePayout = (
  args: { eventAddress: `0x${string}`; eventId: number; canClaim: boolean },
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
    [args.eventAddress, args.eventId, EventTypeForContract.YAY_NAY_VOTE],
    createCallbackHandler("useClaimVotePayout claimVotePayout", callbacks),
    {
      enabled:
        args.eventAddress !== NULL_ADDRESS &&
        args.eventId > 0 &&
        contract.address !== NULL_ADDRESS &&
        contract.abi !== null &&
        args.canClaim,
    }
  );

  return {
    claimVotePayout,
    claimVotePayoutData,
    claimVotePayoutTxData,
    claimVotePayoutTxLoading,
    refetch,
  };
};
