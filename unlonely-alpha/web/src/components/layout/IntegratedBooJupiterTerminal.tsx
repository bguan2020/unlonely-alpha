import React, { useCallback, useEffect, useState, memo } from "react";
import { useUnifiedWalletContext, useWallet } from "@jup-ag/wallet-adapter";

import {
  FIXED_SOLANA_MINT,
  INITIAL_FORM_CONFIG,
  SOLANA_RPC_URL,
  SwapMode,
  WRAPPED_SOL_MINT,
} from "../../constants";

interface IntegratedTerminalProps {
  isBuy: boolean;
  height?: string;
  width?: string;
  txCallback?: (txid: string, swapResult: any) => void;
  interfaceStyle?: {
    isGlowing: boolean;
  };
}

export const IntegratedTerminal = memo((props: IntegratedTerminalProps) => {
  const { height, width, isBuy, txCallback, interfaceStyle } = props;
  const [isLoaded, setIsLoaded] = useState(false);

  const passthroughWalletContextState = useWallet();
  const { setShowModal } = useUnifiedWalletContext();

  const memoizedLaunchTerminal = useCallback(() => {
    if ((window as any)?.Jupiter.init) {
      (window as any)?.Jupiter.init({
        displayMode: "integrated",
        integratedTargetId: "integrated-terminal",
        endpoint: SOLANA_RPC_URL,
        formProps: {
          fixedInputMint: true,
          fixedOutputMint: true,
          swapMode: SwapMode.ExactInOrOut,
          fixedAmount: false,
          initialAmount: "",
          initialInputMint: isBuy
            ? WRAPPED_SOL_MINT.toString()
            : FIXED_SOLANA_MINT.mintAddress,
          initialOutputMint: isBuy
            ? FIXED_SOLANA_MINT.mintAddress
            : WRAPPED_SOL_MINT.toString(),
        },
        enableWalletPassthrough: INITIAL_FORM_CONFIG.simulateWalletPassthrough,
        passthroughWalletContextState: undefined,
        onRequestConnectWallet: () => setShowModal?.(true),
        strictTokenList: INITIAL_FORM_CONFIG.strictTokenList,
        defaultExplorer: INITIAL_FORM_CONFIG.defaultExplorer,
        useUserSlippage: INITIAL_FORM_CONFIG.useUserSlippage,
        onSuccess: ({ txid, swapResult }: { txid: any; swapResult: any }) => {
          console.log({ txid, swapResult });
          txCallback?.(txid, swapResult);
        },
      });
    }
  }, [isBuy]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined;
    if (!isLoaded || !(window as any)?.Jupiter.init) {
      intervalId = setInterval(() => {
        setIsLoaded(Boolean((window as any)?.Jupiter.init));
      }, 500);
    }

    if (intervalId) {
      return () => clearInterval(intervalId);
    }
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(memoizedLaunchTerminal, 200);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, memoizedLaunchTerminal]);

  // To make sure passthrough wallet are synced
  useEffect(() => {
    if (!(window as any)?.Jupiter.syncProps) return;
    (window as any)?.Jupiter.syncProps({ passthroughWalletContextState });
  }, [passthroughWalletContextState.connected, props]);

  return (
    <div
      id="integrated-terminal"
      className={interfaceStyle?.isGlowing ? "glowing-background" : ""}
      style={{
        height: height ? height : "330px",
        width: width ? width : "330px",
        backgroundColor: "#1F2935",
        overflowY: "auto",
      }}
    />
  );
});
