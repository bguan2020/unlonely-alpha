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
        address: "0xbc82454027d2a12700adC2370148Ccb3BD759Cae",
        abi: TempTokenFactoryV1,
      },
    },
  },
};
