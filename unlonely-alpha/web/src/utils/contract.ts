import { Network } from "../constants/types";

export const getContractFromNetwork = (
  contractName: string,
  network?: Network
) => {
  if (
    !network ||
    !network.config.contracts[contractName] ||
    !network.config.contracts[contractName].address ||
    !network.config.contracts[contractName].abi
  )
    return undefined;
  const contract = {
    address: network.config.contracts[contractName].address as `0x${string}`,
    abi: network.config.contracts[contractName].abi,
    chainId: network.config.chainId,
  };
  return contract;
};
