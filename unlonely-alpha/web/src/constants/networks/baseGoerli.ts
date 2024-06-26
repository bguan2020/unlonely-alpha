import { baseGoerli } from "wagmi/chains";

import { Network } from "../types";
import UnlonelySharesV1 from "../abi/UnlonelySharesV1.json";
import UnlonelySharesV2 from "../abi/UnlonelySharesV2.json";
import UnlonelyTournament from "../abi/UnlonelyTournament.json";
import UnlonelySideBetsV1 from "../abi/UnlonelySideBetsV1.json";
import VibesTokenV1 from "../abi/VibesTokenV1.json";
import { Contract } from "..";

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
      [Contract.SHARES_V2]: {
        address: "0x61449F6B354a57113D91C7E9Db1B164225b8ad38",
        abi: UnlonelySharesV2,
      },
      [Contract.TOURNAMENT]: {
        address: "0x3199c0270662d59D37cd57fBa51AD26Af124f8F5",
        abi: UnlonelyTournament,
      },
      unlonelySideBetsV1: {
        address: "0xf2DA37B5C8c5742834bDcF320757d2CC3F655691",
        abi: UnlonelySideBetsV1,
      },
      [Contract.VIBES_TOKEN_V1]: {
        address: "0x7D892A8eE506D185BB7dc09424D90653c035BeC7",
        abi: VibesTokenV1,
      },
    },
  },
};
