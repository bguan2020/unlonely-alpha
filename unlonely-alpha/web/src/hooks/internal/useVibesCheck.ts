import { useState, useEffect, useRef } from "react";
import { parseAbiItem } from "viem";
import { useContractEvent, usePublicClient } from "wagmi";
import { useApolloClient } from "@apollo/client";

import VibesTokenV1 from "../../constants/abi/VibesTokenV1.json";
import { VibeTokenTx } from "../../constants/types";
import { GET_USER_QUERY } from "../../constants/queries";
import { getContractFromNetwork } from "../../utils/contract";
import { useNetworkContext } from "../context/useNetwork";

export const useVibesCheck = () => {
  const publicClient = usePublicClient();
  const appending = useRef(false);
  const client = useApolloClient();
  const [tokenTxs, setTokenTxs] = useState<VibeTokenTx[]>([]);
  const [loading, setLoading] = useState(false);
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const contract = getContractFromNetwork("vibesTokenV1", localNetwork);

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
    address: contract.address,
    abi: VibesTokenV1,
    eventName: "Mint",
    listener(log: any) {
      if (appending.current) return;
      appending.current = true;
      const eventTx = {
        eventName: "Mint",
        user: log[0].args.account,
        amount: log[0].args.amount,
        supply: log[0].args.totalSupply,
      };
      setTokenTxs((prev) => [...prev, eventTx]);
      appending.current = false;
    },
  });

  useContractEvent({
    address: contract.address,
    abi: VibesTokenV1,
    eventName: "Burn",
    listener(log: any) {
      if (appending.current) return;
      appending.current = true;
      const eventTx = {
        eventName: "Burn",
        user: log[0].args.account,
        amount: log[0].args.amount,
        supply: log[0].args.totalSupply,
      };
      setTokenTxs((prev) => [...prev, eventTx]);
      appending.current = false;
    },
  });

  useEffect(() => {
    if (!publicClient || !contract.address || loading) return;
    const init = async () => {
      setLoading(true);
      const [mintLogs, burnLogs] = await Promise.all([
        publicClient.getLogs({
          address: contract.address,
          event: parseAbiItem(
            "event Mint(address indexed account, uint256 amount, address indexed streamerAddress, uint256 indexed totalSupply)"
          ),
          fromBlock: BigInt(8972411),
        }),
        publicClient.getLogs({
          address: contract.address,
          event: parseAbiItem(
            "event Burn(address indexed account, uint256 amount, address indexed streamerAddress, uint256 indexed totalSupply)"
          ),
          fromBlock: BigInt(8972411),
        }),
      ]);
      const logs = [...mintLogs, ...burnLogs];
      logs.sort((a, b) => {
        if (a.blockNumber === null || b.blockNumber === null) return 0;
        if (a.blockNumber < b.blockNumber) return -1;
        if (a.blockNumber > b.blockNumber) return 1;
        return 0;
      });
      const _tokenTxs = logs.map((event: any) => {
        return {
          eventName: event.eventName,
          user: event.args.account,
          amount: event.args.amount,
          supply: event.args.totalSupply,
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
  }, [publicClient, contract.address]);

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
