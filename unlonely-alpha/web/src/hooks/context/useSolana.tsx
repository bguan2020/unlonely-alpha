import { createContext, useContext, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

type SolanaContextType = {
  network: WalletAdapterNetwork;
  endpoint: string;
  wallets: any[];
};

const SolanaContext = createContext<SolanaContextType>({
  network: WalletAdapterNetwork.Mainnet,
  endpoint: "",
  wallets: [],
});

export const useSolana = () => {
  return useContext(SolanaContext);
};

export const SolanaProvider = ({ children }: { children: React.ReactNode }) => {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new SolflareWalletAdapter()], []);

  const value = useMemo(
    () => ({
      network,
      endpoint,
      wallets,
    }),
    [network, endpoint, wallets]
  );

  return (
    <SolanaContext.Provider value={value}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </SolanaContext.Provider>
  );
};
