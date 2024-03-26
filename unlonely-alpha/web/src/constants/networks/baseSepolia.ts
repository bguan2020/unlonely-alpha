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
        address: "0xe0D437E10D133E753d214f811046808b8067B51F",
        abi: TempTokenFactoryV1,
      },
    },
  },
};
