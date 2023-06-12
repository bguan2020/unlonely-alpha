import { goerli } from "wagmi/chains";
import { Network } from "../types";

import unlonelyArcadeAbi from "../abi/UnlonelyArcadeContract.json";

export const Goerli: Network = {
  ...goerli,
  config: {
    name: "Goerli",
    chainId: 5,
    isTestnet: true,
    contracts: {
      unlonelyArcade: {
        address: "0xef33df40714df4de9f5f8e6e4b8d749030152bca",
        abi: unlonelyArcadeAbi,
      },
    },
  },
};
