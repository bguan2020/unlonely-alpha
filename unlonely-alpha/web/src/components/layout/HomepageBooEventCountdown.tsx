import React, { useState, useEffect } from "react";
import { Flex, Text } from "@chakra-ui/react";
import {
  IFormConfigurator,
  INITIAL_FORM_CONFIG,
} from "../transactions/solana/SolanaJupiterTerminal";
import { getTimeFromMillis } from "../../utils/time";
import { useForm } from "react-hook-form";
import { eventStartTime } from "./BooEventWrapper";
import { IntegratedTerminal } from "./IntegratedBooJupiterTerminal";
import { SOLANA_RPC_URL } from "../../constants";
import { useUser } from "../../hooks/context/useUser";

export const HomePageBooEventTokenCountdown = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { solanaAddress } = useUser();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = eventStartTime - now;
      setTimeLeft(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [eventStartTime]);

  const { watch } = useForm<IFormConfigurator>({
    defaultValues: INITIAL_FORM_CONFIG,
  });

  const watchAllFields = watch();

  return (
    <Flex mt={4} direction={"row"} width="100%" height="calc(100vh - 64px)">
      <div
        style={{
          position: "relative" as const,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Flex
          position="absolute"
          direction="column"
          gap={4}
          alignItems="center"
          textAlign="center"
          width="100%"
          pointerEvents="none"
          opacity={0.5}
        >
          <Text
            fontFamily={"DigitalDisplay"}
            fontSize={["20px", "30px", "50px", "50px"]}
          >
            AN UNMISSABLE HALLOWEEN SPECIAL IS ARRIVING IN
          </Text>
          <Text
            fontFamily={"DigitalDisplay"}
            fontSize={["25px", "35px", "60px", "60px"]}
          >
            {getTimeFromMillis(timeLeft * 1000, true, true, true)}
          </Text>
        </Flex>
        <iframe
          height="100%"
          width="100%"
          id="geckoterminal-embed"
          title="GeckoTerminal Embed"
          src="https://www.geckoterminal.com/solana/pools/DtxxzR77SEsrVhPzSixCdM1dcuANwQsMiNsM5vSPdYL1?embed=1&info=0&swaps=0"
          allow="clipboard-write"
        ></iframe>
      </div>
      <Flex justifyContent={"center"} position="relative">
        {!solanaAddress && (
          <Flex
            position="absolute"
            width="100%"
            height="100%"
            justifyContent="center"
            alignItems="center"
            bg="rgba(0, 0, 0, 0.9)"
            zIndex={100}
            p="20px"
          >
            <Text textAlign="center">
              You must log into Unlonely with a Solana-compatible wallet to use
              this feature.
            </Text>
          </Flex>
        )}
        <IntegratedTerminal
          rpcUrl={SOLANA_RPC_URL}
          formProps={watchAllFields.formProps}
          simulateWalletPassthrough={watchAllFields.simulateWalletPassthrough}
          strictTokenList={watchAllFields.strictTokenList}
          defaultExplorer={watchAllFields.defaultExplorer}
          useUserSlippage={false}
          height="calc(100vh - 64px)"
        />
      </Flex>
    </Flex>
  );
};
