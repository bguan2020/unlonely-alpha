import { decodeEventLog } from "viem";
import { ContractData, Network, WriteCallbacks } from "../constants/types";

export const getContractFromNetwork = (
  contractName: string,
  network: Network
): ContractData => {
  if (
    !network ||
    !network.config.contracts[contractName] ||
    !network.config.contracts[contractName].address ||
    !network.config.contracts[contractName].abi
  )
    return {
      address: undefined,
      abi: undefined,
      chainId: undefined,
    };
  const contract = {
    address: network.config.contracts[contractName].address as `0x${string}`,
    abi: network.config.contracts[contractName].abi,
    chainId: network.config.chainId,
  };
  return contract;
};

export const createCallbackHandler = (
  actionName: string,
  callbacks?: WriteCallbacks
) => ({
  onPrepareSuccess: (data: any) => {
    // console.log(`${actionName} prepare success`, data);
    callbacks?.onPrepareSuccess?.(data);
  },
  onPrepareError: (error: any) => {
    console.log(`${actionName} prepare error`, error);
    callbacks?.onPrepareError?.(error);
  },
  onWriteSuccess: (data: any) => {
    console.log(`${actionName} write success`, data);
    callbacks?.onWriteSuccess?.(data);
  },
  onWriteError: (error: any) => {
    console.log(`${actionName} write error`, error);
    callbacks?.onWriteError?.(error);
  },
  onTxSuccess: (data: any) => {
    console.log(`${actionName} tx success`, data);
    callbacks?.onTxSuccess?.(data);
  },
  onTxError: (error: any) => {
    console.log(`${actionName} tx error`, error);
    callbacks?.onTxError?.(error);
  },
});

export const returnDecodedTopics = (
  logs: any[],
  contractAbi: any[],
  eventName: string,
  strict?: boolean
) => {
  let topics = null;
  for (let i = logs.length - 1; i >= 0; i--) {
    try {
      const _topics = decodeEventLog({
        abi: contractAbi,
        data: logs[i].data,
        topics: logs[i].topics,
        strict,
      });
      if (_topics && _topics.eventName === eventName) {
        topics = _topics;
        break;
      }
    } catch (e) {
      console.log(`${eventName} decodeEventLog error`, e);
    }
  }
  return topics;
};

export const bondingCurveBigInt = (n: bigint) => {
  return (n * (n + BigInt(1)) * (BigInt(2) * n + BigInt(1))) / BigInt(6);
};
