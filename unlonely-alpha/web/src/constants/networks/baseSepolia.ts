import { baseSepolia } from "wagmi/chains";
import { Network } from "../types";
// import TempTokenFactoryV1 from "../abi/TempTokenFactoryV1.json";
// import { Contract } from "..";

export const BaseSepolia: Network = {
  ...baseSepolia,
  config: {
    name: "Base Sepolia",
    chainId: 84532,
    isTestnet: true,
    contracts: {
      // [Contract.TEMP_TOKEN_FACTORY_V1]: {
      //   address: "0xDE1e7bb7871bB073eb411ecce8c7112CE891585d",
      //   abi: TempTokenFactoryV1,
      // },
    },
  },
};
