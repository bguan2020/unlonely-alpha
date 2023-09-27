import { mainnet } from "wagmi/chains";

import { Network } from "../types";
import unlonelyArcadeAbi from "../abi/UnlonelyArcadeContract.json";
import UnlonelyNFCsV2 from "../abi/UnlonelyNFCsV2.json";

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
      unlonelyNfcV2: {
        address: "0xC7E230CE8d67B2ad116208c69d616dD6bFC96a8d",
        abi: UnlonelyNFCsV2,
      },
    },
  },
};
