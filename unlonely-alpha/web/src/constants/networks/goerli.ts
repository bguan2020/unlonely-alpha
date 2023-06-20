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
        address: "0x40b25d3378e122914e82c852e77aa7602e09335c",
        abi: unlonelyArcadeAbi,
      },
    },
  },
};
