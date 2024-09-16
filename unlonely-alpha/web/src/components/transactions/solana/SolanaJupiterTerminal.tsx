import React from "react";
import { Button } from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import { SolanaTokenTransfer } from "./SolanaTokenTransfer";
import { useBooTokenTerminal } from "../../../hooks/internal/solana/useBooTokenTerminal";
import { useForm } from "react-hook-form";
import { useSolanaTokenBalance } from "../../../hooks/internal/solana/useSolanaTokenBalance";
import { FIXED_SOLANA_MINT } from "../../../constants";

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

const ModalTerminal = (props: { rpcUrl: string }) => {
  const { rpcUrl } = props;

  const { watch } = useForm<IFormConfigurator>({
    defaultValues: INITIAL_FORM_CONFIG,
  });

  const watchAllFields = watch();

  const { launchTerminal } = useBooTokenTerminal({
    ...props,
    ...watchAllFields,
  });

  const { balance, fetchTokenBalance } = useSolanaTokenBalance(rpcUrl);

  return (
    <>
      <Button onClick={() => launchTerminal(true)} colorScheme="blue">
        Buy
      </Button>
      <Button onClick={() => launchTerminal(false)} colorScheme="blue">
        Sell
      </Button>
      <SolanaTokenTransfer
        rpcUrl={rpcUrl}
        balance={balance}
        fetchTokenBalance={fetchTokenBalance}
      />
      <div
        style={{
          position: "relative" as const,
          width: "100%",
          paddingBottom: "125%",
        }}
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
  strictTokenList: true,
  defaultExplorer: "Solana Explorer",
  formProps: {
    fixedInputMint: true,
    fixedOutputMint: true,
    swapMode: SwapMode.ExactInOrOut,
    fixedAmount: false,
    initialAmount: "",
    initialInputMint: WRAPPED_SOL_MINT.toString(),
    initialOutputMint: FIXED_SOLANA_MINT,
  },
  useUserSlippage: true,
});

export default ModalTerminal;
