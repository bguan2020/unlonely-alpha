import React from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { HomePageBooEventTokenCountdown } from "./HomepageBooEventCountdown";
import { HomePageBooEventStreamPage } from "./HomepageBooEventStreamPage";
import { ChannelProvider } from "../../hooks/context/useChannel";

export const eventStartTime = 133548029;
const slug = "danny";

const BooEventWrapper = () => {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = clusterApiUrl(network);
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {Date.now() / 1000 > eventStartTime ? (
            <ChannelProvider providedSlug={slug}>
              <HomePageBooEventStreamPage slug={slug} />
            </ChannelProvider>
          ) : (
            <HomePageBooEventTokenCountdown
              rpcUrl={
                "https://solana-mainnet.g.alchemy.com/v2/-D7ZPwVOE8mWLx2zsHpYC2dpZDNkhzjf"
              }
            />
          )}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default BooEventWrapper;
