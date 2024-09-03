import React, { useEffect, useState } from "react";
import {
  useUnifiedWalletContext,
  useUnifiedWallet,
} from "@jup-ag/wallet-adapter";
import { Button } from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  useWallet,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { SolanaTokenTransfer } from "./SolanaTokenTransfer";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";

export enum SwapMode {
  ExactInOrOut = "ExactInOrOut",
  ExactIn = "ExactIn",
  ExactOut = "ExactOut",
}

export interface FormProps {
  /** Default to `ExactInOrOut`. ExactOut can be used to get an exact output of a token (e.g. for Payments) */
  swapMode?: SwapMode;
  /** Initial amount to swap */
  initialAmount?: string;
  /** When true, user cannot change the amount (e.g. for Payments) */
  fixedAmount?: boolean;
  /** Initial input token to swap */
  initialInputMint?: string;
  /** When true, user cannot change the input token */
  fixedInputMint?: boolean;
  /** Initial output token to swap */
  initialOutputMint?: string;
  /** When true, user cannot change the output token (e.g. to buy your project's token) */
  fixedOutputMint?: boolean;
  /** Initial slippage to swap */
  initialSlippageBps?: number;
}

const ModalTerminal = (props: {
  rpcUrl: string;
  formProps: FormProps;
  simulateWalletPassthrough: boolean;
  strictTokenList: boolean;
  defaultExplorer: "Solana Explorer" | "Solscan" | "Solana Beach" | "SolanaFM";
  useUserSlippage: boolean;
}) => {
  const {
    rpcUrl,
    formProps,
    simulateWalletPassthrough,
    strictTokenList,
    defaultExplorer,
    useUserSlippage,
  } = props;

  const passthroughWalletContextState = useUnifiedWallet();
  const { setShowModal } = useUnifiedWalletContext();
  const { publicKey, connected } = useWallet();

  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (connected && publicKey) {
      fetchTokenBalance();
    }
  }, [connected, publicKey]);

  const fetchTokenBalance = async () => {
    if (!publicKey) {
      console.error("No wallet connected");
      return;
    }

    setLoading(true);

    try {
      const connection = new Connection(rpcUrl, "confirmed");
      const tokenMint = new PublicKey(
        "FuvamNkNTNjDcnQeWyiAReUCHZ91gJhg59xuNemZ4p9f"
      );

      // Get the associated token account address for the user
      const tokenAccountAddress = await getAssociatedTokenAddress(
        tokenMint,
        publicKey
      );

      // Fetch the token account information
      const tokenAccount = await getAccount(connection, tokenAccountAddress);

      const decimals = 9;
      const balance = tokenAccount.amount / BigInt(Math.pow(10, decimals));

      setBalance(Number(balance));
    } catch (error) {
      console.error("Error fetching token balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const launchTerminal = (isBuying: boolean) => {
    (window as any)?.Jupiter?.init({
      endpoint: rpcUrl,
      formProps: isBuying
        ? {
            initialInputMint: WRAPPED_SOL_MINT.toString(),
            initialOutputMint: "FuvamNkNTNjDcnQeWyiAReUCHZ91gJhg59xuNemZ4p9f",
            fixedInputMint: true,
            fixedOutputMint: true,
          }
        : {
            initialInputMint: "FuvamNkNTNjDcnQeWyiAReUCHZ91gJhg59xuNemZ4p9f",
            initialOutputMint: WRAPPED_SOL_MINT.toString(),
            fixedInputMint: true,
            fixedOutputMint: true,
          },
      enableWalletPassthrough: simulateWalletPassthrough,
      passthroughWalletContextState: simulateWalletPassthrough
        ? passthroughWalletContextState
        : undefined,
      onRequestConnectWallet: () => setShowModal(true),
      onSuccess: ({ txid, swapResult }: { txid: any; swapResult: any }) => {
        console.log({ txid, swapResult });
        fetchTokenBalance();
      },
      onSwapError: ({ error }: { error: any }) => {
        console.log("onSwapError", error);
      },
      strictTokenList,
      defaultExplorer,
      useUserSlippage,
    });
  };

  // To make sure passthrough wallet are synced
  useEffect(() => {
    if (!(window as any)?.Jupiter?.syncProps) return;
    (window as any)?.Jupiter?.syncProps({ passthroughWalletContextState });
  }, [passthroughWalletContextState, props]);

  // Set the network to use (e.g., 'mainnet-beta', 'devnet')
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = clusterApiUrl(network);

  // Initialize wallet adapters you want to support
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

  return (
    <>
      {" "}
      <Button onClick={() => launchTerminal(true)} colorScheme="blue">
        Buy
      </Button>
      <Button onClick={() => launchTerminal(false)} colorScheme="blue">
        Sell
      </Button>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <SolanaTokenTransfer
              rpcUrl={rpcUrl}
              balance={balance}
              fetchTokenBalance={fetchTokenBalance}
            />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
      <div
        style={{
          position: "relative" as const,
          width: "100%",
          paddingBottom: "125%",
        }}
        id="dexscreener-embed"
      >
        <iframe
          height="600px"
          width="100%"
          id="geckoterminal-embed"
          title="GeckoTerminal Embed"
          src="https://www.geckoterminal.com/solana/pools/DtxxzR77SEsrVhPzSixCdM1dcuANwQsMiNsM5vSPdYL1?embed=1&info=0&swaps=1"
          allow="clipboard-write"
        ></iframe>
      </div>
    </>
  );
};

export const WRAPPED_SOL_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112"
);

export interface IFormConfigurator {
  simulateWalletPassthrough: boolean;
  strictTokenList: boolean;
  defaultExplorer: "Solana Explorer" | "Solscan" | "Solana Beach" | "SolanaFM";
  formProps: FormProps;
  useUserSlippage: boolean;
}

export const INITIAL_FORM_CONFIG: IFormConfigurator = Object.freeze({
  simulateWalletPassthrough: false,
  strictTokenList: false,
  defaultExplorer: "Solana Explorer",
  formProps: {
    fixedInputMint: true,
    fixedOutputMint: true,
    swapMode: SwapMode.ExactInOrOut,
    fixedAmount: false,
    initialAmount: "",
    initialInputMint: WRAPPED_SOL_MINT.toString(),
    initialOutputMint: "FuvamNkNTNjDcnQeWyiAReUCHZ91gJhg59xuNemZ4p9f",
  },
  useUserSlippage: true,
});

export default ModalTerminal;
