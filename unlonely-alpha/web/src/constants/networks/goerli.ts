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
        address: "0x20aabe81a5deefa5a81985403a2088fe2e98d99c",
        abi: unlonelyArcadeAbi,
      },
    },
  },
};
