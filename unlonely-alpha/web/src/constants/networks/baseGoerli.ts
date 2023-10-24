import { baseGoerli } from "wagmi/chains";

import { Network } from "../types";
import UnlonelySharesV1 from "../abi/UnlonelySharesV1.json";
import UnlonelySharesV2 from "../abi/UnlonelySharesV2.json";

export const BaseGoerli: Network = {
  ...baseGoerli,
  config: {
    name: "Base Goerli",
    chainId: 84531,
    isTestnet: true,
    contracts: {
      unlonelySharesV1: {
        address: "0xe7E02dD97F2fDc3039F5458496B4ea55fb063679",
        abi: UnlonelySharesV1,
      },
      unlonelySharesV2: {
        address: "0x583E70fDA297269426DcC128Bb8051f28c10DB6A",
        abi: UnlonelySharesV2,
      },
    },
  },
};
