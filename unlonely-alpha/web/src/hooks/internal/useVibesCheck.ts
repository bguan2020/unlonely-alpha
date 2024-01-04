import { useState, useEffect, useRef } from "react";
import { decodeEventLog, parseAbiItem } from "viem";
import { useContractEvent, usePublicClient } from "wagmi";
import { useApolloClient } from "@apollo/client";

import ERC1967Proxy from "../../constants/abi/ERC1967Proxy.json";
import { VibeTokenTx } from "../../constants/types";
import { GET_USER_QUERY } from "../../constants/queries";

export const useVibesCheck = () => {
  const publicClient = usePublicClient();
  const appending = useRef(false);
  const client = useApolloClient();

  const [tokenTxs, setTokenTxs] = useState<VibeTokenTx[]>([]);
  const [loading, setLoading] = useState(true);

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

  useContractEvent({
    address: "0x4c4cE2C17593e9EE6DF6B159cfb45865bEf3d82F",
    abi: ERC1967Proxy,
    eventName: "Mint",
    listener(log: any) {
      if (appending.current) return;
      appending.current = true;
      const eventTx = {
        eventName: "Mint",
        user: log[0].args.account,
        amount: log[0].args.amount,
        supply: log[0].args.newTotalSupply,
      };
      setTokenTxs((prev) => [...prev, eventTx]);
      appending.current = false;
    },
  });

  useContractEvent({
    address: "0x4c4cE2C17593e9EE6DF6B159cfb45865bEf3d82F",
    abi: ERC1967Proxy,
    eventName: "Burn",
    listener(log: any) {
      if (appending.current) return;
      appending.current = true;
      const eventTx = {
        eventName: "Burn",
        user: log[0].args.account,
        amount: log[0].args.amount,
        supply: log[0].args.newTotalSupply,
      };
      setTokenTxs((prev) => [...prev, eventTx]);
      appending.current = false;
    },
  });

  useEffect(() => {
    if (!publicClient) return;
    const init = async () => {
      setLoading(true);
      const [mintLogs, burnLogs] = await Promise.all([
        publicClient.getLogs({
          address: "0x4c4cE2C17593e9EE6DF6B159cfb45865bEf3d82F",
          event: parseAbiItem(
            "event Mint(address indexed account, uint256 amount, uint256 newTotalSupply)"
          ),
          fromBlock: BigInt(8116522),
        }),
        publicClient.getLogs({
          address: "0x4c4cE2C17593e9EE6DF6B159cfb45865bEf3d82F",
          event: parseAbiItem(
            "event Burn(address indexed account, uint256 amount, uint256 newTotalSupply)"
          ),
          fromBlock: BigInt(8116522),
        }),
      ]);
      const logs = [...mintLogs, ...burnLogs];
      logs.sort((a, b) => {
        if (a.blockNumber === null || b.blockNumber === null) return 0;
        if (a.blockNumber < b.blockNumber) return -1;
        if (a.blockNumber > b.blockNumber) return 1;
        return 0;
      });
      const decodedEvents = logs.map((event: any) => {
        const decoded = decodeEventLog({
          abi: ERC1967Proxy,
          data: event.data,
          topics: event.topics,
        });
        return decoded;
      });
      const _tokenTxs = decodedEvents.map((event: any) => {
        return {
          eventName: event.eventName,
          user: event.args.account,
          amount: event.args.amount,
          supply: event.args.newTotalSupply,
        };
      });
      const uniqueUsers = new Set();
      _tokenTxs.forEach((tx: any) => {
        uniqueUsers.add(tx.user);
      });
      const promises = Array.from(uniqueUsers).map((u) =>
        _getEnsName(u as `0x${string}`)
      );
      const names = await Promise.all(promises);
      const nameHashMap = createHashmap(Array.from(uniqueUsers), names);
      const namedTokenTx = _tokenTxs.map((tx: any) => {
        return {
          ...tx,
          user: nameHashMap.get(tx.user) ?? tx.user,
        };
      });
      setTokenTxs(namedTokenTx);
      setLoading(false);
    };
    init();
  }, [publicClient]);

  return { tokenTxs, loading };
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
