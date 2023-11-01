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
        address: "0x17f0cc86f803ef6f39581fe5d54cc92db6d39ded",
        abi: UnlonelySharesV2,
      },
      unlonelyTournament: {
        address: "0xB221C0Cf3B6Ccac12Fe6e89b6F2F0C44d820e521",
        abi: UnlonelyTournament,
      },
    },
  },
};
