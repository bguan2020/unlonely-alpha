import React, { useState, useEffect } from "react";
import { Flex, Text } from "@chakra-ui/react";
import { getTimeFromMillis } from "../../utils/time";
import { eventStartTime } from "./BooEventWrapper";
import { IntegratedTerminal } from "./IntegratedBooJupiterTerminal";
import { FIXED_SOLANA_MINT } from "../../constants";

export const HomePageBooEventTokenCountdown = () => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = eventStartTime - now;
      setTimeLeft(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [eventStartTime]);

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
        >
          <Text fontFamily={"DigitalDisplay"} fontSize={"4vw"} color="#ff6e25">
            AN UNMISSABLE HALLOWEEN SPECIAL IS ARRIVING IN
          </Text>
          <Text fontFamily={"DigitalDisplay"} fontSize={"6vw"} color="#ffab25">
            {getTimeFromMillis(timeLeft * 1000, true, true, true)}
          </Text>
        </Flex>
        <iframe
          height="100%"
          width="100%"
          id="geckoterminal-embed"
          title="GeckoTerminal Embed"
          src={`https://www.geckoterminal.com/solana/pools/${FIXED_SOLANA_MINT.poolAddress}?embed=1&info=0&swaps=0`}
          allow="clipboard-write"
        ></iframe>
      </div>
      <Flex justifyContent={"center"} position="relative">
        <IntegratedTerminal isBuy={true} height="calc(100vh - 64px)" />
      </Flex>
    </Flex>
  );
};
