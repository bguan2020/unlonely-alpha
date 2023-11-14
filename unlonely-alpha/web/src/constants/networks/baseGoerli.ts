import { baseGoerli } from "wagmi/chains";

import { Network } from "../types";
import UnlonelySharesV1 from "../abi/UnlonelySharesV1.json";
import UnlonelySharesV2 from "../abi/UnlonelySharesV2.json";
import UnlonelyTournament from "../abi/UnlonelyTournament.json";

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
        address: "0x0E32d6BA3E1E1FFdce3f4F9E85fCC552C969F5D4",
        abi: UnlonelySharesV2,
      },
      unlonelyTournament: {
        address: "0x3199c0270662d59D37cd57fBa51AD26Af124f8F5",
        abi: UnlonelyTournament,
      },
    },
  },
};
