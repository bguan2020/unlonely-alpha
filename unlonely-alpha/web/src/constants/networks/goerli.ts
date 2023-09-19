import { goerli } from "wagmi/chains";

import { Network } from "../types";
import unlonelyArcadeAbi from "../abi/UnlonelyArcadeContract.json";
import UnlonelyNFCsV2 from "../abi/UnlonelyNFCsV2.json";
import UnlonelySharesV1 from "../abi/UnlonelySharesV1.json";

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
      unlonelyNfcV2: {
        address: "0x9F272900eB6B9818b6dcCe6e8BBDC855c844f8a5",
        abi: UnlonelyNFCsV2,
      },
      unlonelySharesV1: {
        address: "0xcf1c4d193c9a03be935bd19252342894bc70ea26",
        abi: UnlonelySharesV1,
      },
    },
  },
};
