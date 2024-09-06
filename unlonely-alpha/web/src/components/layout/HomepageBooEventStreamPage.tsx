import React, { useState } from "react";
import { Button, Flex } from "@chakra-ui/react";
import { useChat } from "../../hooks/chat/useChat";
import { useLivepeerStreamData } from "../../hooks/internal/useLivepeerStreamData";
import ChatComponent from "../chat/ChatComponent";
import { useBooTokenTerminal } from "../../hooks/internal/boo-token/useBooTokenTerminal";
import { useForm } from "react-hook-form";
import {
  IFormConfigurator,
  INITIAL_FORM_CONFIG,
} from "../transactions/SolanaJupiterTerminal";
import LivepeerPlayer from "../stream/LivepeerPlayer";
import { getSrc } from "@livepeer/react/external";

export const HomePageBooEventStreamPage = () => {
  const chat = useChat();
  const { playbackInfo } = useLivepeerStreamData({
    livepeerPlaybackId: "a3c1xtfzwcwqzv51",
    livepeerStreamId: "a3c1780c-2169-4e96-abe8-d02390c5ec5d",
  });

  const { watch } = useForm<IFormConfigurator>({
    defaultValues: INITIAL_FORM_CONFIG,
  });

  const watchAllFields = watch();

  const { balance, fetchTokenBalance, launchTerminal } = useBooTokenTerminal({
    rpcUrl:
      "https://solana-mainnet.g.alchemy.com/v2/-D7ZPwVOE8mWLx2zsHpYC2dpZDNkhzjf",
    ...watchAllFields,
  });

  const [viewState, setViewState] = useState<"stream" | "token">("stream");

  return (
    <Flex
      direction={["column", "column", "row"]}
      height="calc(100vh - 64px)"
      width="100%"
    >
      <Flex
        direction="column"
        width={["100%", "100%", "70%"]}
        height="100%"
        position="relative"
      >
        <Button
          zIndex="1"
          position="absolute"
          onClick={() => {
            if (viewState === "stream") {
              setViewState("token");
            } else {
              setViewState("stream");
            }
          }}
          right="40px"
          bottom="40px"
        >
          change
        </Button>

        {playbackInfo && (
          <LivepeerPlayer
            src={getSrc(playbackInfo)}
            customSizePercentages={
              viewState === "stream"
                ? undefined
                : {
                    width: "50%",
                    height: "30%",
                  }
            }
          />
        )}
      </Flex>
      <Flex direction="column" width={["100%", "100%", "30%"]} height="100%">
        <ChatComponent
          chat={chat}
          customHeight="100%"
          tokenForTransfer="tempToken"
        />
      </Flex>
    </Flex>
  );
};
