import React, { useState, useEffect } from "react";
import { Flex, Text, Button } from "@chakra-ui/react";
import {
  IFormConfigurator,
  INITIAL_FORM_CONFIG,
} from "../transactions/SolanaJupiterTerminal";
import { getTimeFromMillis } from "../../utils/time";
import { useBooTokenTerminal } from "../../hooks/internal/boo-token/useBooTokenTerminal";
import { useForm } from "react-hook-form";
import { eventStartTime } from "./BooEventWrapper";

export const HomePageBooEventTokenCountdown = ({
  rpcUrl,
}: {
  rpcUrl: string;
}) => {
  const [timeLeft, setTimeLeft] = useState(0);

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

  const { balance, fetchTokenBalance, launchTerminal } = useBooTokenTerminal({
    rpcUrl,
    ...watchAllFields,
  });

  return (
    <Flex direction="column" alignItems="center">
      <Text
        fontSize={"40px"}
        color={timeLeft > 0 ? "#ec3f3f" : "green"}
        className={timeLeft > 0 ? "flashing-text" : ""}
        fontWeight="bold"
      >
        {timeLeft > 0 && getTimeFromMillis(timeLeft * 1000, true, true)}
      </Text>
      <Flex mt={4} direction={"column"} gap={4}>
        <div
          style={{
            position: "relative" as const,
            width: "100%",
          }}
          id="dexscreener-embed"
        >
          <iframe
            height="600px"
            width="500px"
            id="geckoterminal-embed"
            title="GeckoTerminal Embed"
            src="https://www.geckoterminal.com/solana/pools/DtxxzR77SEsrVhPzSixCdM1dcuANwQsMiNsM5vSPdYL1?embed=1&info=0&swaps=1"
            allow="clipboard-write"
          ></iframe>
        </div>
        <Button onClick={() => launchTerminal(true)} colorScheme="blue">
          Buy
        </Button>
        <Button onClick={() => launchTerminal(false)} colorScheme="blue">
          Sell
        </Button>
      </Flex>
    </Flex>
  );
};
