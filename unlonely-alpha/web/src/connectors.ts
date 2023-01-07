import { providers } from "ethers";
import { defaultChains, defaultL2Chains } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

import { ETHEREUM_MAINNET_CHAIN_ID } from "./constants";

// API key for Ethereum node
// Two popular services are Infura (infura.io) and Alchemy (alchemy.com)
const RPC_URLS: IRPCMap = {
  1: process.env.NEXT_PUBLIC_ALCHEMY_ETHEREUM_MAINNET_RPC_URL as string,
  // 137: process.env.ALCHEMY_POLYGON_MATIC_RPC_URL as string,
  // 80001: process.env.ALCHEMY_POLYGON_MUMBAI_RPC_URL as string,
};

// Chains for connectors to support
export const chains = [...defaultChains, ...defaultL2Chains];

// Set up connectors
export const connectors = ({ chainId }: { chainId?: number | undefined }) => {
  return [
    new InjectedConnector({
      chains,
      options: { shimDisconnect: true },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        rpc: RPC_URLS,
        qrcode: true,
        chainId,
        qrcodeModalOptions: {
          mobileLinks: ["rainbow", "metamask", "trust"],
        },
      },
    }),
  ];
};

export const AlchemyMainnetProvider = new providers.AlchemyProvider(
  ETHEREUM_MAINNET_CHAIN_ID,
  process.env.ALCHEMY_POLYGON_MATIC_API_KEY // TO DO: fix this
);

export interface IRPCMap {
  [chainId: number]: string;
}

export default connectors;
