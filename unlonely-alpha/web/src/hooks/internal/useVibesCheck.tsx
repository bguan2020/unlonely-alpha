import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPublicClient, parseAbiItem, http } from "viem";
import { base } from "viem/chains";

import { ContractData, TradeableTokenTx } from "../../constants/types";
import { getContractFromNetwork } from "../../utils/contract";
import useUserAgent from "./useUserAgent";
import { NETWORKS } from "../../constants/networks";
import {
  AVERAGE_BLOCK_TIME_SECS,
  CREATION_BLOCK,
  Contract,
  SECONDS_PER_HOUR,
} from "../../constants";
import { useUser } from "../context/useUser";
import { useRouter } from "next/router";
import { useGetUserBalance } from "../contracts/useVibesToken";

export type UseVibesCheckType = {
  vibesTokenTxs: TradeableTokenTx[];
  vibesTokenLoading: boolean;
  userVibesBalance: bigint;
  chartTimeIndexes: Map<
    string,
    { index: number | undefined; blockNumber: number }
  >;
  currentBlockNumberForVibes: bigint;
  lastChainInteractionTimestamp: number;
  refetchVibesBalance: () => void;
};

export const useVibesCheckInitial: UseVibesCheckType = {
  vibesTokenTxs: [],
  vibesTokenLoading: true,
  userVibesBalance: BigInt(0),
  chartTimeIndexes: new Map(),
  currentBlockNumberForVibes: BigInt(0),
  lastChainInteractionTimestamp: 0,
  refetchVibesBalance: () => undefined,
};

export const useVibesCheck = () => {
  const { userAddress } = useUser();
  const { isStandalone } = useUserAgent();
  const [tokenTxs, setTokenTxs] = useState<TradeableTokenTx[]>([]);
  const [loading, setLoading] = useState(true);
  const contract = getContractFromNetwork(Contract.VIBES_TOKEN_V1, NETWORKS[0]);
  const [chartTimeIndexes, setChartTimeIndexes] = useState<
    Map<string, { index: number | undefined; blockNumber: number }>
  >(new Map());
  const fetching = useRef(false);
  const router = useRouter();

  const { balance: vibesBalance, refetch: refetchVibesBalance } =
    useGetUserBalance(userAddress as `0x${string}`, contract);

  const [lastChainInteractionTimestamp, setLastChainInteractionTimestamp] =
    useState<number>(0);

  const [currentBlockNumberForVibes, setCurrentBlockNumberForVibes] =
    useState<bigint>(BigInt(0));

  const baseClient = useMemo(
    () =>
      createPublicClient({
        chain: base,
        transport: http(
          "https://base-mainnet.g.alchemy.com/v2/aR93M6MdEC4lgh4VjPXLaMnfBveve1fC"
        ),
      }),
    []
  );

  const getVibesEvents = useCallback(
    async (_contract: ContractData, fromBlock: bigint) => {
      const [mintLogs, burnLogs] = await Promise.all([
        baseClient.getLogs({
          address: _contract.address,
          event: parseAbiItem(
            "event Mint(address indexed account, uint256 amount, address indexed streamerAddress, uint256 indexed totalSupply)"
          ),
          fromBlock: fromBlock === BigInt(0) ? CREATION_BLOCK : fromBlock,
        }),
        baseClient.getLogs({
          address: _contract.address,
          event: parseAbiItem(
            "event Burn(address indexed account, uint256 amount, address indexed streamerAddress, uint256 indexed totalSupply)"
          ),
          fromBlock: fromBlock === BigInt(0) ? CREATION_BLOCK : fromBlock,
        }),
      ]);
      const logs = [...mintLogs, ...burnLogs];
      logs.sort((a, b) => {
        if (a.blockNumber === null || b.blockNumber === null) return 0;
        if (a.blockNumber < b.blockNumber) return -1;
        if (a.blockNumber > b.blockNumber) return 1;
        return 0;
      });
      const _tokenTxs: TradeableTokenTx[] = [];
      const previousFetchedTx =
        tokenTxs.length > 0 ? tokenTxs[tokenTxs.length - 1] : undefined;
      for (let i = 0; i < logs.length; i++) {
        const event = logs[i];
        const n = Number(event.args.totalSupply as bigint);
        const n_ = Math.max(n - 1, 0);
        const priceForCurrent = Math.floor((n * (n + 1) * (2 * n + 1)) / 6);
        const priceForPrevious = Math.floor((n_ * (n_ + 1) * (2 * n_ + 1)) / 6);
        const newPrice = priceForCurrent - priceForPrevious;
        const previousTxPrice =
          i === 0
            ? previousFetchedTx?.price ?? 0
            : _tokenTxs.length > 0
            ? _tokenTxs[_tokenTxs.length - 1].price
            : 0;
        const priceChangePercentage =
          previousTxPrice > 0
            ? ((newPrice - previousTxPrice) / previousTxPrice) * 100
            : 0;
        const tx: TradeableTokenTx = {
          eventName: event.eventName,
          user: event.args.account as `0x${string}`,
          amount: event.args.amount as bigint,
          price: newPrice,
          blockNumber: Number(event.blockNumber),
          supply: event.args.totalSupply as bigint,
          priceChangePercentage,
        };
        _tokenTxs.push(tx);
      }
      setTokenTxs((prev) => [...prev, ..._tokenTxs]);
    },
    [baseClient, tokenTxs]
  );

  useEffect(() => {
    const init = async () => {
      const pathnameAccepted =
        router.pathname.startsWith("/channels") ||
        router.pathname.startsWith("/mobile") ||
        router.pathname.startsWith("/vibes") ||
        router.pathname === "/";
      if (
        !baseClient ||
        !contract.address ||
        fetching.current ||
        !pathnameAccepted ||
        tokenTxs.length > 0 ||
        isStandalone
      ) {
        fetching.current = false;
        return;
      }
      fetching.current = true;
      await getVibesEvents(contract, BigInt(0));
      fetching.current = false;
      setLoading(false);
    };
    init();
  }, [baseClient, contract.address, router]);

  useEffect(() => {
    if (tokenTxs.length === 0) return;
    // Fetching logs from the last known block number to 'latest' or current block
    const fetchVibesEvents = async () => {
      await getVibesEvents(
        contract,
        tokenTxs.length > 0
          ? BigInt(tokenTxs[tokenTxs.length - 1].blockNumber + 1)
          : BigInt(0)
      );
    };

    // Initialize interval
    const intervalId = setInterval(fetchVibesEvents, 6000);

    // Cleanup function to clear the interval when component unmounts or conditions change
    return () => clearInterval(intervalId);
  }, [tokenTxs, contract]);

  useEffect(() => {
    const init = async () => {
      if (tokenTxs.length === 0) return;

      const daysArr = [1, 7, 14, 21, 28, 30, 60, 90, 180, 365];
      const currentBlockNumberForVibes = await baseClient.getBlockNumber();

      const blockNumbersInDaysAgoArr = daysArr.map((days) =>
        blockNumberDaysAgo(days, currentBlockNumberForVibes)
      );

      const dayIndex =
        blockNumbersInDaysAgoArr[0] < CREATION_BLOCK
          ? undefined
          : binarySearchIndex(tokenTxs, BigInt(blockNumbersInDaysAgoArr[0]));

      const hoursArr = [1, 6, 12, 18];
      const blockNumbersInHoursAgoArr = hoursArr.map((hours) =>
        blockNumberHoursAgo(hours, currentBlockNumberForVibes)
      );

      const hourIndex =
        blockNumbersInHoursAgoArr[0] < CREATION_BLOCK
          ? undefined
          : binarySearchIndex(tokenTxs, BigInt(blockNumbersInHoursAgoArr[0]));
      setCurrentBlockNumberForVibes(currentBlockNumberForVibes);
      // adding 1day separately to account for day index
      const offset = 1;
      setChartTimeIndexes(
        new Map<string, { index: number | undefined; blockNumber: number }>([
          [
            `${hoursArr[0]}h`,
            {
              index: hourIndex,
              blockNumber: Number(blockNumbersInHoursAgoArr[0]),
            },
          ],
          ...blockNumbersInHoursAgoArr
            .slice(offset)
            .map<[string, { index: undefined; blockNumber: number }]>(
              (blockNumber, slicedIndex) => {
                const index = slicedIndex + offset;
                return [
                  `${hoursArr[index]}h`,
                  { index: undefined, blockNumber: Number(blockNumber) },
                ];
              }
            ),
          [
            `${daysArr[0]}d`,
            {
              index: dayIndex,
              blockNumber: Number(blockNumbersInDaysAgoArr[0]),
            },
          ],
          ...blockNumbersInDaysAgoArr
            .slice(offset)
            .map<[string, { index: undefined; blockNumber: number }]>(
              (blockNumber, slicedIndex) => {
                const index = slicedIndex + offset;
                return [
                  `${daysArr[index]}d`,
                  { index: undefined, blockNumber: Number(blockNumber) },
                ];
              }
            ),
        ])
      );
    };
    init();
  }, [tokenTxs.length]);

  return {
    vibesTokenTxs: tokenTxs,
    vibesTokenLoading: loading,
    userVibesBalance: vibesBalance,
    chartTimeIndexes,
    currentBlockNumberForVibes,
    lastChainInteractionTimestamp,
    refetchVibesBalance,
  };
};

export function binarySearchIndex(
  arr: TradeableTokenTx[],
  target: bigint
): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);

    if (arr[mid].blockNumber === Number(target)) {
      // Target found, return its index
      return mid;
    } else if (arr[mid].blockNumber < Number(target)) {
      // Search in the right half
      left = mid + 1;
    } else {
      // Search in the left half
      right = mid - 1;
    }
  }

  // Target not found, return the insertion position
  return left;
}

export function blockNumberHoursAgo(hours: number, currentBlockNumber: bigint) {
  return (
    currentBlockNumber -
    BigInt((hours * SECONDS_PER_HOUR) / AVERAGE_BLOCK_TIME_SECS)
  );
}

export function blockNumberDaysAgo(days: number, currentBlockNumber: bigint) {
  const hours = days * 24;
  return blockNumberHoursAgo(hours, currentBlockNumber);
}
