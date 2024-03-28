import { Chain } from "wagmi";

import { Network } from "../types";
import unlonelyArcadeAbi from "../abi/UnlonelyArcadeContract.json";
import UnlonelySharesV1 from "../abi/UnlonelySharesV1.json";
import UnlonelySharesV2 from "../abi/UnlonelySharesV2.json";
import UnlonelyTournament from "../abi/UnlonelyTournament.json";
import VibesTokenV1 from "../abi/VibesTokenV1.json";
import TempTokenFactoryV1 from "../abi/TempTokenFactoryV1.json";
import { Contract } from "..";

const base = {
  id: 8453,
  network: "base",
  name: "Base",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    alchemy: {
      http: ["https://base-mainnet.g.alchemy.com/v2"],
      webSocket: ["wss://base-mainnet.g.alchemy.com/v2"],
    },
    default: {
      http: ["https://mainnet.base.org"],
    },
    public: {
      http: ["https://mainnet.base.org"],
    },
  },
  blockExplorers: {
    blockscout: {
      name: "Basescout",
      url: "https://base.blockscout.com",
    },
    default: {
      name: "Basescan",
      url: "https://basescan.org",
    },
    etherscan: {
      name: "Basescan",
      url: "https://basescan.org",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 5022,
    },
  },
} as Chain;

export const Base: Network = {
  ...base,
  config: {
    name: "Base",
    chainId: 8453,
    isTestnet: false,
    contracts: {
      unlonelyArcade: {
        address: "0x91a70926f307C389BBF9e8Bd3506f3Cf1361B6B1",
        abi: unlonelyArcadeAbi,
      },
      unlonelySharesV1: {
        address: "0x8cB4B20EbeF41941d210D1f1c65296027F127EA6",
        abi: UnlonelySharesV1,
      },
      [Contract.SHARES_V2]: {
        address: "0x9bb73ca49b61F2Efe4b193e20df640862c8D3bB6",
        // address: "0x1914DaD7Bf9dA8Cf40CD6bD8f6434F52eAD78980", // past contract
        abi: UnlonelySharesV2,
      },
      [Contract.TOURNAMENT]: {
        address: "0xbDb1Af6F2f3879cAcc5Eb9A2b8c770f7c424a5C9",
        abi: UnlonelyTournament,
      },
      [Contract.VIBES_TOKEN_V1]: {
        address: "0xEAB1fF15f26da850315b15AFebf12F0d42dE5421",
        // address: "0xf93E317cF02217E1cc9b34DF5F969Da6574f44E6", // past test contract
        abi: VibesTokenV1,
      },
      [Contract.TEMP_TOKEN_FACTORY_V1]: {
        address: "0x7A1FC55bcC17240d2FA6419eaDeCfABeDf2dfcd0",
        abi: TempTokenFactoryV1,
      },
    },
  },
};
