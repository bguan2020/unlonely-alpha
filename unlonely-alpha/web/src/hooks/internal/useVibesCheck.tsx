import { useState, useEffect, useRef, useMemo } from "react";
import { Log, createPublicClient, parseAbiItem, http, isAddress } from "viem";
import { useBalance, useContractEvent } from "wagmi";
import { base } from "viem/chains";

import { VibesTokenTx } from "../../constants/types";
import { getContractFromNetwork } from "../../utils/contract";
import useUserAgent from "./useUserAgent";
import { NETWORKS } from "../../constants/networks";
import {
  AVERAGE_BLOCK_TIME_SECS,
  CREATION_BLOCK,
  NULL_ADDRESS,
  SECONDS_PER_HOUR,
} from "../../constants";
import { Flex, Box, Text, useToast } from "@chakra-ui/react";
import { useUser } from "../context/useUser";
import { useRouter } from "next/router";

export const useVibesCheck = () => {
  const { userAddress } = useUser();
  const { isStandalone } = useUserAgent();
  const [tokenTxs, setTokenTxs] = useState<VibesTokenTx[]>([]);
  const [loading, setLoading] = useState(true);
  const contract = getContractFromNetwork("vibesTokenV1", NETWORKS[0]);
  const [chartTimeIndexes, setChartTimeIndexes] = useState<
    Map<string, { index: number | undefined; blockNumber: number }>
  >(new Map());
  const fetching = useRef(false);
  const toast = useToast();
  const router = useRouter();

  const { data: vibesBalance, refetch: refetchVibesBalance } = useBalance({
    address: userAddress,
    token: contract.address,
    enabled:
      isAddress(userAddress as `0x${string}`) &&
      isAddress(contract.address ?? NULL_ADDRESS),
  });

  const [lastChainInteractionTimestamp, setLastChainInteractionTimestamp] =
    useState<number>(0);

  const [currentBlockNumberForVibes, setCurrentBlockNumberForVibes] =
    useState<bigint>(BigInt(0));

  const eventQueueRef = useRef<Log[]>([]);

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

  /**
   * These two useContractEvent calls are used to listen for mint and burn events
   * Every call is inportant and every piece of information returned should be in
   * the order they were initiated. Therefore, we will use a queue system to ensure
   * that the events are in the correct order, regardless of the individual status
   * per asynchronous call.
   */
  useContractEvent({
    address: contract.address,
    abi: contract.abi,
    eventName: loading ? undefined : "Mint",
    listener(logs) {
      console.log("Mint event detected", logs);
      const sortedLogs = logs.sort(
        (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
      );
      setLastChainInteractionTimestamp(Date.now());
      sortedLogs.forEach((log) => {
        eventQueueRef.current.push(log);
        if (eventQueueRef.current.length === 1) {
          processQueue();
        }
      });
    },
  });

  useContractEvent({
    address: contract.address,
    abi: contract.abi,
    eventName: loading ? undefined : "Burn",
    listener(logs) {
      console.log("Burn event detected", logs);
      const sortedLogs = logs.sort(
        (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
      );
      setLastChainInteractionTimestamp(Date.now());
      sortedLogs.forEach((log) => {
        eventQueueRef.current.push(log);
        if (eventQueueRef.current.length === 1) {
          processQueue();
        }
      });
    },
  });

  const processQueue = async () => {
    while (eventQueueRef.current.length > 0) {
      const log = eventQueueRef.current[0];
      await handleEvent(log);
      eventQueueRef.current.shift();
    }
  };

  const handleEvent = async (log: any) => {
    const eventName = log?.eventName;
    const n = Number(log?.args.totalSupply as bigint);
    const n_ = Math.max(n - 1, 0);
    const priceForCurrent = Math.floor((n * (n + 1) * (2 * n + 1)) / 6);
    const priceForPrevious = Math.floor((n_ * (n_ + 1) * (2 * n_ + 1)) / 6);
    const newPrice = priceForCurrent - priceForPrevious;
    const previousTxPrice =
      tokenTxs.length > 0 ? tokenTxs[tokenTxs.length - 1].price : 0;
    const eventTx: VibesTokenTx = {
      eventName: eventName,
      user: log?.args.account as `0x${string}`,
      amount: log?.args.amount as bigint,
      price: newPrice,
      blockNumber: Number(log?.blockNumber as bigint),
      supply: log?.args.totalSupply as bigint,
      priceChangePercentage:
        tokenTxs.length === 0
          ? 0
          : ((newPrice - previousTxPrice) / previousTxPrice) * 100,
    };
    console.log("detected", eventName, eventTx);
    setTokenTxs((prev) => {
      const newTokenTxs = insertElementSorted(prev, eventTx);
      console.log("newTokenTxs", newTokenTxs);
      return newTokenTxs;
    });
  };

  useEffect(() => {
    const getVibesEvents = async () => {
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
      const [mintLogs, burnLogs] = await Promise.all([
        baseClient.getLogs({
          address: contract.address,
          event: parseAbiItem(
            "event Mint(address indexed account, uint256 amount, address indexed streamerAddress, uint256 indexed totalSupply)"
          ),
          fromBlock: CREATION_BLOCK,
        }),
        baseClient.getLogs({
          address: contract.address,
          event: parseAbiItem(
            "event Burn(address indexed account, uint256 amount, address indexed streamerAddress, uint256 indexed totalSupply)"
          ),
          fromBlock: CREATION_BLOCK,
        }),
      ]);
      console.log("mintLogs length", mintLogs.length);
      console.log("burnLogs length", burnLogs.length);
      const logs = [...mintLogs, ...burnLogs];
      logs.sort((a, b) => {
        if (a.blockNumber === null || b.blockNumber === null) return 0;
        if (a.blockNumber < b.blockNumber) return -1;
        if (a.blockNumber > b.blockNumber) return 1;
        return 0;
      });
      const _tokenTxs: VibesTokenTx[] = [];
      for (let i = 0; i < logs.length; i++) {
        const event = logs[i];
        const n = Number(event.args.totalSupply as bigint);
        const n_ = Math.max(n - 1, 0);
        const priceForCurrent = Math.floor((n * (n + 1) * (2 * n + 1)) / 6);
        const priceForPrevious = Math.floor((n_ * (n_ + 1) * (2 * n_ + 1)) / 6);
        const newPrice = priceForCurrent - priceForPrevious;
        const previousTxPrice =
          _tokenTxs.length > 0 ? _tokenTxs[_tokenTxs.length - 1].price : 0;
        const tx: VibesTokenTx = {
          eventName: event.eventName,
          user: event.args.account as `0x${string}`,
          amount: event.args.amount as bigint,
          price: newPrice,
          blockNumber: Number(event.blockNumber),
          supply: event.args.totalSupply as bigint,
          priceChangePercentage:
            i > 0 && _tokenTxs.length > 0
              ? ((newPrice - previousTxPrice) / previousTxPrice) * 100
              : 0,
        };
        _tokenTxs.push(tx);
      }
      fetching.current = false;
      console.log("setting token txs,", _tokenTxs.length, "count");
      setTokenTxs(_tokenTxs);
      setLoading(false);
    };
    getVibesEvents();
  }, [baseClient, contract.address, router]);

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

  const [transferLogs, setTransferLogs] = useState<Log[]>([]);

  useContractEvent({
    address: contract.address,
    abi: contract.abi,
    eventName: "Transfer",
    listener(logs) {
      setTransferLogs(logs);
    },
  });

  useEffect(() => {
    if (transferLogs.length > 0) {
      const includesUser = transferLogs.some(
        (log: any) =>
          (log?.args?.from as `0x${string}`) === userAddress ||
          (log?.args?.to as `0x${string}`) === userAddress
      );
      if (includesUser) {
        console.log("Detected vibes transfer event", transferLogs);
        refetchVibesBalance();
        const incomingReceives = transferLogs.filter(
          (log: any) =>
            (log?.args?.from as `0x${string}`) !== NULL_ADDRESS &&
            (log?.args?.to as `0x${string}`) === userAddress
        );
        if (incomingReceives.length > 0) {
          toast({
            duration: 5000,
            isClosable: true,
            render: () => (
              <Box borderRadius="md" bg="#8e64dd" px={4} h={8}>
                <Flex justifyContent="center" alignItems="center">
                  <Text fontSize="16px" color="white">
                    Some people sent you vibes! 🎉
                  </Text>
                  <Text>
                    Got{" "}
                    {incomingReceives.reduce((acc, cv: any) => {
                      return acc + Number(cv?.args?.value as bigint);
                    }, 0)}
                  </Text>
                </Flex>
              </Box>
            ),
          });
        }
      }
    }
  }, [transferLogs]);

  return {
    vibesBalance,
    tokenTxs,
    chartTimeIndexes,
    loading,
    currentBlockNumberForVibes,
    lastChainInteractionTimestamp,
  };
};

function binarySearchIndex(arr: VibesTokenTx[], target: bigint): number {
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

function insertElementSorted(arr: VibesTokenTx[], newElement: VibesTokenTx) {
  // Find the insertion index
  let insertIndex = arr.length;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i].blockNumber <= newElement.blockNumber) {
      // Found the position to insert
      insertIndex = i + 1;
      break;
    }
  }

  return [...arr.slice(0, insertIndex), newElement, ...arr.slice(insertIndex)];
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
