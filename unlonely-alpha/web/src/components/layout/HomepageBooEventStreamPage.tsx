import React, { useEffect, useState, useRef } from "react";
import { Box, Flex, IconButton, Text, Image, Tooltip } from "@chakra-ui/react";
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
import { RiSwapFill } from "react-icons/ri";
import { BooEventTile } from "./BooEventTile";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Draggable from "./Draggable";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useSolanaTokenBalance } from "../../hooks/internal/solana/useSolanaTokenBalance";
import { Connection } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useJupiterQuoteSwap } from "../../hooks/internal/solana/useJupiterQuoteSwap";

const TOKEN_VIEW_COLUMN_2_PIXEL_WIDTH = 330;
const TOKEN_VIEW_MINI_PLAYER_PIXEL_HEIGHT = 200;
const TOKEN_VIEW_TILE_PIXEL_GAP = 5;
const STREAM_VIEW_JUPITER_TERMINAL_PIXEL_HEIGHT = 340;

const TOKEN_VIEW_GRAPH_PERCENT_HEIGHT = 50;
const STREAM_VIEW_JUPITER_TERMINAL_MIN_X_OFFSET = 30;
const STREAM_VIEW_JUPITER_TERMINAL_MIN_Y_OFFSET = 30;

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
  const containerRef = useRef<HTMLDivElement>(null);

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

  const { balance, fetchTokenBalance } = useSolanaTokenBalance(
    "https://solana-mainnet.g.alchemy.com/v2/-D7ZPwVOE8mWLx2zsHpYC2dpZDNkhzjf"
  );

  const [viewState, setViewState] = useState<"stream" | "token">("stream");

  const { data: channelStatic } = useQuery(CHANNEL_STATIC_QUERY, {
    variables: { slug },
    fetchPolicy: "network-only",
  });

  const { publicKey, connected } = useWallet();
  const { quoteSwap } = useJupiterQuoteSwap();

  useEffect(() => {
    if (channelStatic) handleChannelStaticData(channelStatic?.getChannelBySlug);
  }, [channelStatic]);

  useEffect(() => {
    const init = async () => {
      if (!connected) return;
      quoteSwap(1);
      const details = await getTransactionDetails(
        // "651Wn461brWUCwc34YL4xAHcpdZTJRZPELTqwZyZUCwdPHzwEWdbUMCV2zkp5toLz4gCjuEhacgxANhUYLnZ8UST",
        "DqdkgqkvhjtWJmCJXxrWeTpr5ezbLPSuKkeJNko7KfnJC5fQamqPE4moVmYLCEdkD59wXabh9oQK8UXKo22ppyy",
        new Connection(
          "https://solana-mainnet.g.alchemy.com/v2/-D7ZPwVOE8mWLx2zsHpYC2dpZDNkhzjf"
        )
      );
      if (!details) return;
      const { preTokenBalances, postTokenBalances } = details;

      const preBalance =
        preTokenBalances?.find(
          (balance) => balance.owner === publicKey?.toString()
        )?.uiTokenAmount.uiAmount || 0;
      const postBalance =
        postTokenBalances?.find(
          (balance) => balance.owner === publicKey?.toString()
        )?.uiTokenAmount.uiAmount || 0;

      const balanceDifference = Math.abs(postBalance - preBalance);
      console.log(`Balance difference: ${balanceDifference}`);
    };
    init();
  }, [connected]);

  const getTransactionDetails = async (
    transactionId: string,
    connection: Connection
  ) => {
    try {
      const transaction = await connection.getParsedTransaction(transactionId, {
        maxSupportedTransactionVersion: 0,
      });

      if (!transaction) {
        console.log("Transaction not found");
        return null;
      }

      const { meta } = transaction;
      if (!meta) {
        console.log("Transaction metadata not available");
        return null;
      }

      const { preTokenBalances, postTokenBalances } = meta;

      const swapDetails = {
        fee: meta.fee,
        innerInstructions: meta.innerInstructions,
        preTokenBalances,
        postTokenBalances,
        // Add more relevant fields as needed
      };

      return swapDetails;
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      return null;
    }
  };

  const [bloodImageCount, setBloodImageCount] = useState(0);
  const bloodContainerRef = useRef<HTMLDivElement>(null);

  const calculateImageCount = () => {
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

  const [draggablePosition, setDraggablePosition] = useState({ x: 0, y: 0 });
  const dragOriginRef = useRef({ x: 0, y: 0 });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 20,
      },
    })
  );

  const handleDragStart = () => {
    dragOriginRef.current = { ...draggablePosition };
  };

  const handleDrag = (x: number, y: number) => {
    if (viewState === "stream" && containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const terminalWidth = STREAM_VIEW_JUPITER_TERMINAL_PIXEL_HEIGHT;
      const terminalHeight = STREAM_VIEW_JUPITER_TERMINAL_PIXEL_HEIGHT;

      const maxX = container.width - terminalWidth;
      const maxY = container.height - terminalHeight;

      // Calculate new position based on drag origin and current drag offset
      const newX = dragOriginRef.current.x + x;
      const newY = dragOriginRef.current.y + y;

      // Constrain the new position within the container boundaries
      const constrainedX = Math.max(
        STREAM_VIEW_JUPITER_TERMINAL_MIN_X_OFFSET * 3 - maxX,
        Math.min(newX, 0)
      );
      const constrainedY = Math.max(
        STREAM_VIEW_JUPITER_TERMINAL_MIN_Y_OFFSET * 2 - maxY,
        Math.min(newY, 0)
      );

      setDraggablePosition({ x: constrainedX, y: constrainedY });
    }
  };

  return (
    <Flex
      direction={["column", "column", "row"]}
      height="calc(100vh - 64px)"
      width="100%"
    >
      <Flex
        ref={containerRef}
        direction="column"
        width={["100%", "100%", "80%"]}
        height="100%"
        position="relative"
      >
        <DndContext sensors={sensors} onDragStart={handleDragStart}>
          <Draggable
            id="draggable-terminal"
            onDrag={handleDrag}
            dragHandleClassName="drag-handle"
          >
            <Flex
              position="absolute"
              bottom={
                viewState === "token"
                  ? 0
                  : STREAM_VIEW_JUPITER_TERMINAL_MIN_Y_OFFSET
              }
              right={
                viewState === "token"
                  ? 0
                  : STREAM_VIEW_JUPITER_TERMINAL_MIN_X_OFFSET
              }
              width={viewState === "token" ? "100%" : undefined}
              height={
                viewState === "token"
                  ? "100%"
                  : `${STREAM_VIEW_JUPITER_TERMINAL_PIXEL_HEIGHT}px`
              }
              transition="width 0.3s, height 0.3s, bottom 0.3s, right 0.3s"
              zIndex={viewState === "token" ? 0 : 1}
              overflow="auto"
              bg={viewState === "token" ? "#37FF8B" : "#1F2935"}
              borderRadius={viewState === "token" ? "0px" : "10px"}
              border={
                viewState === "token"
                  ? `${TOKEN_VIEW_TILE_PIXEL_GAP}px solid #37FF8B`
                  : "2px solid #37FF8B"
              }
              transform={
                viewState === "stream"
                  ? `translate(${draggablePosition.x}px, ${draggablePosition.y}px)`
                  : undefined
              }
            >
              <Flex
                width="100%"
                gap={
                  viewState === "token"
                    ? `${TOKEN_VIEW_TILE_PIXEL_GAP}px`
                    : "0px"
                }
              >
                <Flex
                  direction="column"
                  width="100%"
                  gap={`${TOKEN_VIEW_TILE_PIXEL_GAP}px`}
                >
                  <iframe
                    height={`${TOKEN_VIEW_GRAPH_PERCENT_HEIGHT}%`}
                    id="geckoterminal-embed"
                    title="GeckoTerminal Embed"
                    src="https://www.geckoterminal.com/solana/pools/DtxxzR77SEsrVhPzSixCdM1dcuANwQsMiNsM5vSPdYL1?embed=1&info=0&swaps=0"
                    allow="clipboard-write"
                    hidden={viewState !== "token"}
                  ></iframe>
                  {viewState === "token" && (
                    <>
                      <Flex
                        gap={`${TOKEN_VIEW_TILE_PIXEL_GAP}px`}
                        height={`${100 - TOKEN_VIEW_GRAPH_PERCENT_HEIGHT}%`}
                      >
                        <BooEventTile
                          color="#F57CA1"
                          width="100%"
                          height="100%"
                        >
                          <Flex
                            justifyContent="center"
                            alignItems={"flex-start"}
                            width="100%"
                            height="100%"
                            p={`${TOKEN_VIEW_TILE_PIXEL_GAP * 2}px`}
                          >
                            <Flex alignItems="center" gap="10px">
                              <Image
                                src="/images/pixel-heart.png"
                                alt="heart"
                              />
                              <Text
                                textAlign="center"
                                fontFamily="LoRes15"
                                fontSize={["20px", "30px"]}
                                mx={2}
                              >
                                CARE PACKAGES
                              </Text>
                              <Image
                                src="/images/pixel-heart.png"
                                alt="heart"
                              />
                            </Flex>
                          </Flex>
                        </BooEventTile>
                        <BooEventTile
                          color="#B52423"
                          width="100%"
                          height="100%"
                        >
                          <Flex
                            justifyContent="center"
                            width="100%"
                            height="100%"
                            position="relative"
                            p={`${TOKEN_VIEW_TILE_PIXEL_GAP * 2}px`}
                            alignItems={"flex-start"}
                          >
                            <Flex
                              position="absolute"
                              top="-10px"
                              left="0"
                              right="0"
                              bottom="0"
                              zIndex="1"
                              flexWrap="wrap"
                              overflow="hidden"
                              ref={bloodContainerRef}
                              pointerEvents="none"
                            >
                              {Array(bloodImageCount)
                                .fill(0)
                                .map((_, index) => (
                                  <Image
                                    key={index}
                                    src="/images/pixel-blood.png"
                                    alt="blood"
                                    width="20%"
                                    height="10%"
                                    objectFit="cover"
                                  />
                                ))}
                            </Flex>
                            <Flex alignItems="center" gap="10px">
                              <Image
                                src="/images/pixel-ghost.png"
                                alt="ghost"
                              />
                              <Text
                                textAlign="center"
                                fontFamily="LoRes15"
                                fontSize={["20px", "30px"]}
                                mx={2}
                              >
                                SCARE PACKAGES
                              </Text>
                              <Image
                                src="/images/pixel-ghost.png"
                                alt="ghost"
                              />
                            </Flex>
                          </Flex>
                        </BooEventTile>
                      </Flex>
                    </>
                  )}
                </Flex>
                <Flex
                  direction="column"
                  height={"100%"}
                  gap={`${TOKEN_VIEW_TILE_PIXEL_GAP}px`}
                  position={"relative"}
                >
                  <Flex
                    position={"absolute"}
                    width={"100px"}
                    zIndex={51}
                    bg="#1F2935"
                  >
                    {viewState === "stream" && (
                      <Tooltip label="expand" shouldWrapChildren>
                        <IconButton
                          bg="#1F2935"
                          color="#21ec54"
                          _hover={{
                            bg: "#354559",
                          }}
                          aria-label="minimize stream"
                          icon={<FaExpandArrowsAlt />}
                          zIndex={51}
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("clicked");
                            setViewState("token");
                          }}
                        />
                      </Tooltip>
                    )}
                    <Tooltip
                      label={`switch to ${isSell ? "buy" : "sell"}`}
                      shouldWrapChildren
                    >
                      <IconButton
                        bg="#1F2935"
                        color="#21ec54"
                        _hover={{
                          bg: "#354559",
                        }}
                        aria-label="swap token input"
                        icon={<RiSwapFill />}
                        zIndex={51}
                        onClick={() => {
                          setIsSell((prev) => !prev);
                        }}
                      />
                    </Tooltip>
                    {viewState === "token" && (
                      <Tooltip label="pool page" shouldWrapChildren>
                        <IconButton
                          bg="#1F2935"
                          color="#21ec54"
                          _hover={{
                            bg: "#354559",
                          }}
                          aria-label="go to pool"
                          icon={<ExternalLinkIcon />}
                          zIndex={51}
                          onClick={() => {
                            window.open(
                              `https://raydium.io/swap/?inputMint=${FIXED_SOLANA_MINT}&outputMint=sol`,
                              "_blank"
                            );
                          }}
                        />
                      </Tooltip>
                    )}
                  </Flex>
                  <IntegratedTerminal
                    height={
                      viewState === "token"
                        ? `${TOKEN_VIEW_GRAPH_PERCENT_HEIGHT}%`
                        : `${TOKEN_VIEW_COLUMN_2_PIXEL_WIDTH}px`
                    }
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
                  {viewState === "token" && (
                    <BooEventTile
                      color="#796AFF"
                      width="100%"
                      height={`calc(100% - ${TOKEN_VIEW_GRAPH_PERCENT_HEIGHT}% - ${
                        TOKEN_VIEW_TILE_PIXEL_GAP * 2
                      }px - ${TOKEN_VIEW_MINI_PLAYER_PIXEL_HEIGHT}px)`}
                    >
                      <Flex
                        justifyContent={"center"}
                        alignItems={"center"}
                        width={"100%"}
                        gap="16px"
                      >
                        <Image
                          src="/images/megaphone.png"
                          alt="megaphone"
                          width="20px"
                          height="20px"
                        />
                        <Text
                          textAlign={"center"}
                          fontFamily="LoRes15"
                          fontSize="20px"
                        >
                          TTS BROADCAST MESSAGE
                        </Text>
                      </Flex>
                    </BooEventTile>
                  )}
                </Flex>
              </Flex>
            </Flex>
          </Draggable>
        </DndContext>
        {playbackInfo && (
          <Box
            position="absolute"
            bottom={
              viewState === "stream" ? 0 : `${TOKEN_VIEW_TILE_PIXEL_GAP}px`
            }
            right={
              viewState === "stream" ? 0 : `${TOKEN_VIEW_TILE_PIXEL_GAP}px`
            }
            width={
              viewState === "stream"
                ? "100%"
                : `${TOKEN_VIEW_COLUMN_2_PIXEL_WIDTH}px`
            }
            height={
              viewState === "stream"
                ? "100%"
                : `${TOKEN_VIEW_MINI_PLAYER_PIXEL_HEIGHT}px`
            }
            transition="all 0.3s"
            zIndex={viewState === "stream" ? 0 : 1}
          >
            {viewState === "token" && (
              <Box position="absolute" top="0px" left="0px">
                <Tooltip label="expand" shouldWrapChildren>
                  <IconButton
                    bg="rgba(0, 0, 0, 0.5)"
                    color="#21ec54"
                    _hover={{
                      bg: "#354559",
                    }}
                    aria-label={"expand stream"}
                    icon={<FaExpandArrowsAlt />}
                    onClick={() => {
                      setViewState("stream");
                    }}
                    zIndex={2}
                  />
                </Tooltip>
              </Box>
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
