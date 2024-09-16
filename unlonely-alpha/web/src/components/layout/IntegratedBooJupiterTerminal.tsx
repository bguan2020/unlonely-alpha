import React, { useCallback, useEffect, useState, memo } from "react";
import { useUnifiedWalletContext, useWallet } from "@jup-ag/wallet-adapter";
import { FormProps } from "../transactions/solana/SolanaJupiterTerminal";

interface IntegratedTerminalProps {
  rpcUrl: string;
  formProps: FormProps;
  simulateWalletPassthrough: boolean;
  strictTokenList: boolean;
  defaultExplorer: "Solana Explorer" | "Solscan" | "Solana Beach" | "SolanaFM";
  useUserSlippage: boolean;
  height?: string;
  width?: string;
  txCallback?: (txid: string, swapResult: any) => void;
}

export const IntegratedTerminal = memo((props: IntegratedTerminalProps) => {
  const {
    height,
    width,
    rpcUrl,
    formProps,
    simulateWalletPassthrough,
    strictTokenList,
    defaultExplorer,
    useUserSlippage,
    txCallback,
  } = props;
  const [isLoaded, setIsLoaded] = useState(false);

  const passthroughWalletContextState = useWallet();
  const { setShowModal } = useUnifiedWalletContext();

  const memoizedLaunchTerminal = useCallback(() => {
    if ((window as any)?.Jupiter.init) {
      (window as any)?.Jupiter.init({
        displayMode: "integrated",
        integratedTargetId: "integrated-terminal",
        endpoint: rpcUrl,
        formProps,
        enableWalletPassthrough: simulateWalletPassthrough,
        passthroughWalletContextState: simulateWalletPassthrough
          ? passthroughWalletContextState
          : undefined,
        onRequestConnectWallet: () => setShowModal(true),
        strictTokenList,
        defaultExplorer,
        useUserSlippage,
        onSuccess: ({ txid, swapResult }: { txid: any; swapResult: any }) => {
          console.log({ txid, swapResult });
          txCallback?.(txid, swapResult);
        },
      });
    }
  }, [
    defaultExplorer,
    formProps,
    passthroughWalletContextState,
    rpcUrl,
    setShowModal,
    simulateWalletPassthrough,
    strictTokenList,
    useUserSlippage,
  ]);

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
      style={{
        height: height ? height : "330px",
        width: width ? width : "330px",
        backgroundColor: "#1F2935",
        overflowY: "auto",
      }}
    />
  );
});
