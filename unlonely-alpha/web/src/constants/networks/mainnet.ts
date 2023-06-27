import { mainnet } from "wagmi/chains";
import { Network } from "../types";

import unlonelyArcadeAbi from "../abi/UnlonelyArcadeContract.json";

export const Mainnet: Network = {
  ...mainnet,
  config: {
    name: "Ethereum Mainnet",
    chainId: 1,
    isTestnet: false,
    contracts: {
      unlonelyArcade: {
        address: "0xab79C816da5CFC71127da3aDe3e9604112348196",
        abi: unlonelyArcadeAbi,
      },
    },
  },
};
