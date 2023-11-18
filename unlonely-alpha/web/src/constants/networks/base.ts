import { Chain } from "wagmi";

import { Network } from "../types";
import unlonelyArcadeAbi from "../abi/UnlonelyArcadeContract.json";
import UnlonelySharesV1 from "../abi/UnlonelySharesV1.json";
import UnlonelySharesV2 from "../abi/UnlonelySharesV2.json";
import UnlonelyTournament from "../abi/UnlonelyTournament.json";

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
      unlonelySharesV2: {
        address: "0x1914DaD7Bf9dA8Cf40CD6bD8f6434F52eAD78980",
        abi: UnlonelySharesV2,
      },
      unlonelyTournament: {
        address: "0x9A0db8993D942058e3F00A2E5e1F3b80Ea09bf9d",
        abi: UnlonelyTournament,
      },
    },
  },
};
