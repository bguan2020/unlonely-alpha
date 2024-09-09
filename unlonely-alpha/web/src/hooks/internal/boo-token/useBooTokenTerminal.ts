import { useEffect, useState } from "react";
import { useUnifiedWalletContext, useUnifiedWallet } from "@jup-ag/wallet-adapter";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import Decimal from "decimal.js";
import { FormProps, FIXED_SOLANA_MINT, WRAPPED_SOL_MINT } from "../../../components/transactions/solana/SolanaJupiterTerminal";

export const useBooTokenTerminal = (props: {
  rpcUrl: string;
  formProps: FormProps;
  simulateWalletPassthrough: boolean;
  strictTokenList: boolean;
  defaultExplorer: "Solana Explorer" | "Solscan" | "Solana Beach" | "SolanaFM";
  useUserSlippage: boolean;
}) => {
  const {
    rpcUrl,
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
      const tokenMint = new PublicKey(FIXED_SOLANA_MINT);

      const tokenAccountAddress = await getAssociatedTokenAddress(
        tokenMint,
        publicKey
      );

      const tokenAccount = await getAccount(connection, tokenAccountAddress);

      const amount = new Decimal(tokenAccount.amount.toString());

      const decimals = 9;
      const balance = amount.div(new Decimal(10).pow(decimals)).toString();

      console.log("Token balance:", balance);
      setBalance(Number(balance));
    } catch (error) {
      console.error("Error fetching token balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const launchTerminal = (isBuying: boolean) => {
    const commonProps = { fixedInputMint: true, fixedOutputMint: true };
    (window as any)?.Jupiter?.init({
      endpoint: rpcUrl,
      formProps: isBuying
        ? {
            initialInputMint: WRAPPED_SOL_MINT.toString(),
            initialOutputMint: FIXED_SOLANA_MINT,
            ...commonProps,
          }
        : {
            initialInputMint: FIXED_SOLANA_MINT,
            initialOutputMint: WRAPPED_SOL_MINT.toString(),
            ...commonProps,
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

  useEffect(() => {
    if (!(window as any)?.Jupiter?.syncProps) return;
    (window as any)?.Jupiter?.syncProps({ passthroughWalletContextState });
  }, [passthroughWalletContextState, props]);

  return {
    balance,
    loading,
    fetchTokenBalance,
    launchTerminal,
  };
};
