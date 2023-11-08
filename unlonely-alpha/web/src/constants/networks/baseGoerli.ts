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
        address: "0xA99A804e840eF2FE5313ba87caef4e7f1E1b9eE5",
        abi: UnlonelySharesV2,
      },
      unlonelyTournament: {
        address: "0x496869c9b3952a34a67478196fe96a6c72b5207b",
        // address: "0xC00c9e4DA73A79308AC7C5978eD9fB59Ed1CeF86",
        abi: UnlonelyTournament,
      },
    },
  },
};
