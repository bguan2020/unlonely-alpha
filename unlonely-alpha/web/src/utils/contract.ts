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
