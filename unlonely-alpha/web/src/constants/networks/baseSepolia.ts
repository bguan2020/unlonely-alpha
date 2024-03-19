import { baseSepolia } from "wagmi/chains";
import { Network } from "../types";
import TempTokenFactoryV1 from "../abi/TempTokenFactoryV1.json";
import { Contract } from "..";

export const BaseSepolia: Network = {
  ...baseSepolia,
  config: {
    name: "Base Sepolia",
    chainId: 84532,
    isTestnet: true,
    contracts: {
      [Contract.TEMP_TOKEN_FACTORY_V1]: {
        address: "0x65462068E325BD1180428Ea43ca10fFC82311D97",
        abi: TempTokenFactoryV1,
      },
    },
  },
};
