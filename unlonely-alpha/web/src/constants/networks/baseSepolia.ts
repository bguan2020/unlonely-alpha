import { baseSepolia } from "wagmi/chains";
import { Network } from "../types";

export const BaseSepolia: Network = {
  ...baseSepolia,
  config: {
    name: "Base Sepolia",
    chainId: 84532,
    isTestnet: true,
    contracts: {},
  },
};
