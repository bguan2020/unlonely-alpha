import { useEffect } from "react";
import { useUnifiedWalletContext, useUnifiedWallet } from "@jup-ag/wallet-adapter";
// import { FormProps, WRAPPED_SOL_MINT } from "../../../components/transactions/solana/SolanaJupiterTerminal";
export const useBooTokenTerminal = (props: {
  rpcUrl: string;
  simulateWalletPassthrough: boolean;
  strictTokenList: boolean;
  defaultExplorer: "Solana Explorer" | "Solscan" | "Solana Beach" | "SolanaFM";
  useUserSlippage: boolean;
  txCallback?: (txid: string, swapResult: any) => void;
}) => {
  const {
    rpcUrl,
    simulateWalletPassthrough,
    strictTokenList,
    defaultExplorer,
    useUserSlippage,
    txCallback,
  } = props;

  const passthroughWalletContextState = useUnifiedWallet();
  const { setShowModal } = useUnifiedWalletContext();

  useEffect(() => {
    if (!(window as any)?.Jupiter?.syncProps) return;
    (window as any)?.Jupiter?.syncProps({ passthroughWalletContextState });
  }, [passthroughWalletContextState, props]);

  return {
  };
};
