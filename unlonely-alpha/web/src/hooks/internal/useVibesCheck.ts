import { useState, useEffect, useRef } from "react";
import { parseAbiItem } from "viem";
import { useBlockNumber, usePublicClient } from "wagmi";
import { useApolloClient } from "@apollo/client";

import { VibesTokenTx } from "../../constants/types";
import { GET_USER_QUERY } from "../../constants/queries";
import { getContractFromNetwork } from "../../utils/contract";
import { useNetworkContext } from "../context/useNetwork";

const CREATION_BLOCK = BigInt(9018023);

export const useVibesCheck = () => {
  const publicClient = usePublicClient();
  const client = useApolloClient();
  const [tokenTxs, setTokenTxs] = useState<VibesTokenTx[]>([]);
  const [loading, setLoading] = useState(true);
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const contract = getContractFromNetwork("vibesTokenV1", localNetwork);
  const [chartTimeIndexes, setChartTimeIndexes] = useState<Map<string, number>>(
    new Map()
  );
  const fetching = useRef(false);

  const blockNumber = useBlockNumber({
    watch: true,
  });

  const _getEnsName = async (address: `0x${string}`) => {
    try {
      const { data } = await client.query({
        query: GET_USER_QUERY,
        variables: { data: { address } },
      });
      return data.getUser.username ?? data.getUser.address;
    } catch (e) {
      return address;
    }
  };

  // useContractEvent({
  //   address: contract.address,
  //   abi: VibesTokenV1,
  //   eventName: "Mint",
  //   listener(log: any) {
  //     const init = async () => {
  //       if (appending.current || loading) return;
  //       appending.current = true;
  //       const n = Number(log[0].args.totalSupply);
  //       const price = Math.floor((n * (n + 1) * (2 * n + 1)) / 6);
  //       const user =
  //         hashMapState.get(log[0].args.account) ??
  //         (await _getEnsName(log[0].args.account));
  //       const eventTx = {
  //         eventName: "Mint",
  //         user,
  //         amount: log[0].args.amount,
  //         price,
  //         blockNumber: log[0].blockNumber,
  //       };
  //       setTokenTxs((prev) => [...prev, eventTx]);
  //       appending.current = false;
  //     };
  //     init();
  //   },
  // });

  // useContractEvent({
  //   address: contract.address,
  //   abi: VibesTokenV1,
  //   eventName: "Burn",
  //   listener(log: any) {
  //     const init = async () => {
  //       if (appending.current || loading) return;
  //       appending.current = true;
  //       const n = Number(log[0].args.totalSupply);
  //       const price = Math.floor((n * (n + 1) * (2 * n + 1)) / 6);
  //       const user =
  //         hashMapState.get(log[0].args.account) ??
  //         (await _getEnsName(log[0].args.account));
  //       const eventTx = {
  //         eventName: "Burn",
  //         user,
  //         amount: log[0].args.amount,
  //         price,
  //         blockNumber: log[0].blockNumber,
  //       };
  //       setTokenTxs((prev) => [...prev, eventTx]);
  //       appending.current = false;
  //     };
  //     init();
  //   },
  // });

  useEffect(() => {
    const getVibesEvents = async () => {
      if (
        !publicClient ||
        !contract.address ||
        fetching.current ||
        !blockNumber.data
      ) {
        fetching.current = false;
        return;
      }
      const startTime = Date.now();
      let endTime = 0;
      fetching.current = true;
      const [mintLogs, burnLogs] = await Promise.all([
        publicClient.getLogs({
          address: contract.address,
          event: parseAbiItem(
            "event Mint(address indexed account, uint256 amount, address indexed streamerAddress, uint256 indexed totalSupply)"
          ),
          fromBlock: CREATION_BLOCK,
        }),
        publicClient.getLogs({
          address: contract.address,
          event: parseAbiItem(
            "event Burn(address indexed account, uint256 amount, address indexed streamerAddress, uint256 indexed totalSupply)"
          ),
          fromBlock: CREATION_BLOCK,
        }),
      ]);
      const logs = [...mintLogs, ...burnLogs];
      logs.sort((a, b) => {
        if (a.blockNumber === null || b.blockNumber === null) return 0;
        if (a.blockNumber < b.blockNumber) return -1;
        if (a.blockNumber > b.blockNumber) return 1;
        return 0;
      });
      const _tokenTxs: VibesTokenTx[] = logs.map((event: any) => {
        const n = Number(event.args.totalSupply);
        const n_ = Math.max(n - 1, 0);
        const priceForCurrent = Math.floor((n * (n + 1) * (2 * n + 1)) / 6);
        const priceForPrevious = Math.floor((n_ * (n_ + 1) * (2 * n_ + 1)) / 6);
        return {
          eventName: event.eventName,
          user: event.args.account,
          amount: event.args.amount,
          price: priceForCurrent - priceForPrevious,
          blockNumber: event.blockNumber,
        };
      });
      const uniqueUsers = new Set();
      _tokenTxs.forEach((tx: any) => {
        uniqueUsers.add(tx.user);
      });
      const promises = Array.from(uniqueUsers).map((u) =>
        _getEnsName(u as `0x${string}`)
      );
      const names = await Promise.all(promises).then((res) => {
        endTime = Date.now();
        return res;
      });
      const nameHashMap = createHashmap(Array.from(uniqueUsers), names);
      const namedTokenTxs = _tokenTxs.map((tx: any) => {
        return {
          ...tx,
          user: nameHashMap.get(tx.user) ?? tx.user,
        };
      });
      const MILLIS = 5000;
      const timeToWait =
        endTime >= startTime + MILLIS ? 0 : MILLIS - (endTime - startTime);
      await new Promise((resolve) => {
        setTimeout(resolve, timeToWait);
      });
      fetching.current = false;
      setTokenTxs(namedTokenTxs);
      setLoading(false);
    };
    getVibesEvents();
  }, [blockNumber.data]);

  useEffect(() => {
    if (!blockNumber.data || tokenTxs.length === 0) return;
    const AVERAGE_BLOCK_TIME_SECS = 2;
    const currentBlockNumber = blockNumber.data;
    const blockNumberOneHourAgo =
      currentBlockNumber - BigInt(AVERAGE_BLOCK_TIME_SECS * 30 * 60);
    const blockNumberOneDayAgo =
      currentBlockNumber - BigInt(AVERAGE_BLOCK_TIME_SECS * 30 * 60 * 24);

    const hourIndex = binarySearchIndex(tokenTxs, blockNumberOneHourAgo);
    const dayIndex = binarySearchIndex(tokenTxs, blockNumberOneDayAgo);
    setChartTimeIndexes(
      new Map([
        ["hour", hourIndex],
        ["day", dayIndex],
      ])
    );
  }, [tokenTxs.length]);

  return { tokenTxs, chartTimeIndexes, loading };
};

function createHashmap<K, V>(keys: K[], values: V[]): Map<K, V> {
  if (keys.length !== values.length) {
    throw new Error("Keys and values arrays must be of the same length");
  }

  const map = new Map<K, V>();
  keys.forEach((key, index) => {
    map.set(key, values[index]);
  });

  return map;
}

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
