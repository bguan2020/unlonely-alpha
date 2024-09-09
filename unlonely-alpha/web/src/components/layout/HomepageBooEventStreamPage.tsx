import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Flex } from "@chakra-ui/react";
import { useChat } from "../../hooks/chat/useChat";
import { useLivepeerStreamData } from "../../hooks/internal/useLivepeerStreamData";
import ChatComponent from "../chat/ChatComponent";
import { useForm } from "react-hook-form";
import {
  FIXED_SOLANA_MINT,
  IFormConfigurator,
  INITIAL_FORM_CONFIG,
  WRAPPED_SOL_MINT,
} from "../transactions/solana/SolanaJupiterTerminal";
import LivepeerPlayer from "../stream/LivepeerPlayer";
import { getSrc } from "@livepeer/react/external";
import { IntegratedTerminal } from "./IntegratedBooJupiterTerminal";
import { useChannelContext } from "../../hooks/context/useChannel";
import { CHANNEL_STATIC_QUERY } from "../../constants/queries";
import { useQuery } from "@apollo/client";

const OpacityWrapper = ({
  alwaysShow,
  children,
}: {
  alwaysShow?: boolean;
  children: React.ReactNode;
}) => {
  const [opacity, setOpacity] = useState(0);
  const timeoutRef = useRef<number | NodeJS.Timeout | null>(null);

  const handleOpacity = () => {
    setOpacity(1);
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setOpacity(0);
      timeoutRef.current = null;
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Box
      opacity={opacity === 1 || alwaysShow ? 1 : 0.5}
      transition="opacity 0.3s"
      onTouchStart={handleOpacity}
      onMouseMove={handleOpacity}
      overflow="auto"
    >
      {children}
    </Box>
  );
};

export const HomePageBooEventStreamPage = ({ slug }: { slug: string }) => {
  const { chat: c, channel } = useChannelContext();
  const { channelQueryData, handleChannelStaticData } = channel;
  const { chatBot } = c;
  const chat = useChat({ chatBot });
  const { playbackInfo } = useLivepeerStreamData({
    livepeerPlaybackId: channelQueryData?.livepeerPlaybackId ?? undefined,
    livepeerStreamId: channelQueryData?.livepeerStreamId ?? undefined,
  });

  const [isSell, setIsSell] = useState(false);

  const { watch: watchBuy } = useForm<IFormConfigurator>({
    defaultValues: INITIAL_FORM_CONFIG,
  });

  const { watch: watchSell } = useForm<IFormConfigurator>({
    defaultValues: {
      ...INITIAL_FORM_CONFIG,
      formProps: {
        ...INITIAL_FORM_CONFIG.formProps,
        initialInputMint: FIXED_SOLANA_MINT,
        initialOutputMint: WRAPPED_SOL_MINT.toString(),
      },
    },
  });

  const watchAllFieldsBuy = watchBuy();
  const watchAllFieldsSell = watchSell();

  const [viewState, setViewState] = useState<"stream" | "token">("stream");

  const { data: channelStatic } = useQuery(CHANNEL_STATIC_QUERY, {
    variables: { slug },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (channelStatic) handleChannelStaticData(channelStatic?.getChannelBySlug);
  }, [channelStatic]);

  return (
    <Flex
      direction={["column", "column", "row"]}
      height="calc(100vh - 64px)"
      width="100%"
    >
      <Flex
        direction="column"
        width={["100%", "100%", "80%"]}
        height="100%"
        position="relative"
      >
        <Box
          position="absolute"
          bottom={viewState === "token" ? 0 : "120px"}
          right={viewState === "token" ? 0 : "40px"}
          width={viewState === "token" ? "100%" : undefined}
          height={viewState === "token" ? "100%" : "50%"}
          transition="all 0.3s"
          zIndex={viewState === "token" ? 0 : 1}
          bg={"rgba(0, 0, 0, 0.8)"}
        >
          <OpacityWrapper alwaysShow={viewState === "token"}>
            <Flex justifyContent="space-between" p={1} gap={1}>
              <Button
                onClick={() => {
                  if (viewState === "stream") {
                    setViewState("token");
                  } else {
                    setViewState("stream");
                  }
                }}
              >
                change
              </Button>
              <Button
                onClick={() => {
                  setIsSell(!isSell);
                }}
              >
                {isSell ? "sell" : "buy"}
              </Button>
            </Flex>
            <Flex>
              <iframe
                height="360px"
                width="100%"
                id="geckoterminal-embed"
                title="GeckoTerminal Embed"
                src="https://www.geckoterminal.com/solana/pools/DtxxzR77SEsrVhPzSixCdM1dcuANwQsMiNsM5vSPdYL1?embed=1&info=0&swaps=1"
                allow="clipboard-write"
                hidden={viewState !== "token"}
              ></iframe>
              <IntegratedTerminal
                rpcUrl="https://solana-mainnet.g.alchemy.com/v2/-D7ZPwVOE8mWLx2zsHpYC2dpZDNkhzjf"
                formProps={
                  isSell
                    ? watchAllFieldsSell.formProps
                    : watchAllFieldsBuy.formProps
                }
                simulateWalletPassthrough={
                  isSell
                    ? watchAllFieldsSell.simulateWalletPassthrough
                    : watchAllFieldsBuy.simulateWalletPassthrough
                }
                strictTokenList={
                  isSell
                    ? watchAllFieldsSell.strictTokenList
                    : watchAllFieldsBuy.strictTokenList
                }
                defaultExplorer={
                  isSell
                    ? watchAllFieldsSell.defaultExplorer
                    : watchAllFieldsBuy.defaultExplorer
                }
                useUserSlippage={false}
              />
            </Flex>
          </OpacityWrapper>
        </Box>

        {playbackInfo && (
          <Box
            position="absolute"
            bottom={viewState === "stream" ? 0 : "40px"}
            right={viewState === "stream" ? 0 : "40px"}
            width={viewState === "stream" ? "100%" : "30%"}
            height={viewState === "stream" ? "100%" : "30%"}
            transition="all 0.3s"
            zIndex={viewState === "stream" ? 0 : 1}
          >
            <LivepeerPlayer src={getSrc(playbackInfo)} />
          </Box>
        )}
      </Flex>
      <Flex direction="column" width={["100%", "100%", "20%"]} height="100%">
        <ChatComponent
          chat={chat}
          customHeight="100%"
          tokenForTransfer="vibes"
          noTabs
        />
      </Flex>
    </Flex>
  );
};
