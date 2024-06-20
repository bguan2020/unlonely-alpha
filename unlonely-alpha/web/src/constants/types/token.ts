import { ContractData } from ".";
import { NULL_ADDRESS } from "..";

export type VersusTokenDataType = {
    symbol: string;
    address: string;
    totalSupply: bigint;
    isAlwaysTradeable: boolean;
    preSaleEndTimestamp: bigint;
    contractData: ContractData;
    creationBlockNumber: bigint;
    transferredLiquidityOnExpiration: bigint;
    endTimestamp?: bigint;
    factoryAddress: string;
    minBaseTokenPrice: bigint;
  };

export const versusTokenDataInitial: VersusTokenDataType = {
    transferredLiquidityOnExpiration: BigInt(0),
    symbol: "",
    address: "",
    totalSupply: BigInt(0),
    isAlwaysTradeable: false,
    preSaleEndTimestamp: BigInt(0),
    contractData: {
      address: NULL_ADDRESS,
      chainId: 0,
      abi: undefined,
    },
    creationBlockNumber: BigInt(0),
    factoryAddress: NULL_ADDRESS,
    endTimestamp: undefined,
    minBaseTokenPrice: BigInt(0),
  };
  