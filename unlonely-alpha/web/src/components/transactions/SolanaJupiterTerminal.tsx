import React, { useEffect } from "react";
import {
  useUnifiedWalletContext,
  useUnifiedWallet,
} from "@jup-ag/wallet-adapter";
import { Button } from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";

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

  return (
    <>
      {" "}
      <Button onClick={() => launchTerminal(true)} colorScheme="blue">
        Buy
      </Button>
      <Button onClick={() => launchTerminal(false)} colorScheme="blue">
        Sell
      </Button>
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
