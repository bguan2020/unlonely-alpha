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
        address: "0x942Acb7EE908aa85Dd25e6D5c75F056bb649cEe5",
        abi: unlonelyArcadeAbi,
      },
    },
  },
};
