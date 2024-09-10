import React, { useEffect, useState, useRef } from "react";
import { Box, Flex, IconButton, Text, Image } from "@chakra-ui/react";
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
import { FaExpandArrowsAlt } from "react-icons/fa";
import { BooEventTile } from "./BooEventTile";

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

  const [bloodImageCount, setBloodImageCount] = useState(0);
  const bloodContainerRef = useRef<HTMLDivElement>(null);

  const calculateImageCount = () => {
    console.log("calculateImageCount", bloodContainerRef.current);
    if (bloodContainerRef.current) {
      const containerWidth = bloodContainerRef.current.offsetWidth;
      const imageWidth = containerWidth * 0.2;
      const imagesPerRow = Math.ceil(containerWidth / imageWidth);
      setBloodImageCount(imagesPerRow);
    }
  };

  useEffect(() => {
    if (viewState === "token" && bloodImageCount === 0) calculateImageCount();
  }, [viewState]);

  useEffect(() => {
    window.addEventListener("resize", calculateImageCount);
    return () => window.removeEventListener("resize", calculateImageCount);
  }, []);

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
        <Flex
          position="absolute"
          bottom={viewState === "token" ? 0 : "30px"}
          right={viewState === "token" ? 0 : "30px"}
          width={viewState === "token" ? "100%" : undefined}
          height={viewState === "token" ? "100%" : "350px"}
          transition="all 0.3s"
          zIndex={viewState === "token" ? 0 : 1}
          overflow="auto"
          bg={viewState === "token" ? "#37FF8B" : "#1F2935"}
          borderRadius={viewState === "token" ? "0px" : "10px"}
          border={
            viewState === "token" ? "5px solid #37FF8B" : "2px solid #37FF8B"
          }
        >
          {viewState === "stream" && (
            <Flex justifyContent="space-between" flexDirection="column">
              <IconButton
                bg="transparent"
                color="white"
                _hover={{}}
                aria-label="minimize stream"
                icon={<FaExpandArrowsAlt />}
                onClick={() => {
                  setViewState("token");
                }}
              />
            </Flex>
          )}
          <Flex width="100%" gap="5px">
            <Flex direction="column" width="100%" gap="5px">
              <iframe
                height="350px"
                id="geckoterminal-embed"
                title="GeckoTerminal Embed"
                src="https://www.geckoterminal.com/solana/pools/DtxxzR77SEsrVhPzSixCdM1dcuANwQsMiNsM5vSPdYL1?embed=1&info=0&swaps=0"
                allow="clipboard-write"
                hidden={viewState !== "token"}
              ></iframe>
              {viewState === "token" && (
                <>
                  <BooEventTile color="#796AFF" width="100%" height="90px">
                    <Flex
                      justifyContent={"center"}
                      alignItems={"center"}
                      width={"100%"}
                    >
                      <Text
                        textAlign={"center"}
                        fontFamily="LoRes15"
                        fontSize="20px"
                      >
                        TTS: send a custom text-to-speech message to contestants
                      </Text>
                    </Flex>
                  </BooEventTile>
                  <Flex gap="5px" height="50%">
                    <BooEventTile color="#F57CA1" width="100%" height="100%">
                      <Flex
                        justifyContent="center"
                        width="100%"
                        height="100%"
                        p="5px"
                      >
                        <Flex alignItems="flex-start">
                          <Image src="/images/pixel-heart.png" alt="heart" />
                          <Text
                            textAlign="center"
                            fontFamily="LoRes15"
                            fontSize="20px"
                            mx={2}
                          >
                            CARE PACKAGES
                          </Text>
                          <Image src="/images/pixel-heart.png" alt="heart" />
                        </Flex>
                      </Flex>
                    </BooEventTile>
                    <BooEventTile color="#B52423" width="100%" height="100%">
                      <Flex
                        justifyContent="center"
                        width="100%"
                        height="100%"
                        position="relative"
                        p="5px"
                      >
                        <Flex
                          position="absolute"
                          top="-15px"
                          left="0"
                          right="0"
                          bottom="0"
                          zIndex="1"
                          flexWrap="wrap"
                          overflow="hidden"
                          ref={bloodContainerRef}
                        >
                          {Array(bloodImageCount)
                            .fill(0)
                            .map((_, index) => (
                              <Image
                                key={index}
                                src="/images/pixel-blood.png"
                                alt="blood"
                                width="20%"
                                height="20%"
                                objectFit="cover"
                              />
                            ))}
                        </Flex>
                        <Flex alignItems="flex-start">
                          <Image src="/images/pixel-ghost.png" alt="ghost" />
                          <Text
                            textAlign="center"
                            fontFamily="LoRes15"
                            fontSize="20px"
                            mx={2}
                          >
                            SCARE PACKAGES
                          </Text>
                          <Image src="/images/pixel-ghost.png" alt="ghost" />
                        </Flex>
                      </Flex>
                    </BooEventTile>
                  </Flex>
                </>
              )}
            </Flex>

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
        </Flex>

        {playbackInfo && (
          <Box
            position="absolute"
            bottom={viewState === "stream" ? 0 : "5px"}
            right={viewState === "stream" ? 0 : "5px"}
            width={viewState === "stream" ? "100%" : "330px"}
            height={viewState === "stream" ? "100%" : "200px"}
            transition="all 0.3s"
            zIndex={viewState === "stream" ? 0 : 1}
          >
            {viewState === "token" && (
              <IconButton
                position="absolute"
                top="0px"
                left="0px"
                bg="rgba(0, 0, 0, 0.5)"
                color="white"
                _hover={{ bg: "rgba(0, 0, 0, 0.7)" }}
                aria-label={"expand stream"}
                icon={<FaExpandArrowsAlt />}
                onClick={() => {
                  setViewState("stream");
                }}
                zIndex={2}
              />
            )}
            <LivepeerPlayer
              src={getSrc(playbackInfo)}
              borderRadius={viewState === "stream" ? "0px" : "10px"}
              cannotOpenClipDrawer
            />
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
