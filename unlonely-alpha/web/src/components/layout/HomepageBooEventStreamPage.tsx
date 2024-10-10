import React, { useEffect, useState, useRef, useCallback } from "react";
import { Box, Flex, IconButton, Text, Image, Tooltip } from "@chakra-ui/react";
import { useChat } from "../../hooks/chat/useChat";
import { useLivepeerStreamData } from "../../hooks/internal/useLivepeerStreamData";
import ChatComponent from "../chat/ChatComponent";
import LivepeerPlayer from "../stream/LivepeerPlayer";
import { getSrc } from "@livepeer/react/external";
import { IntegratedTerminal } from "./IntegratedBooJupiterTerminal";
import { useChannelContext } from "../../hooks/context/useChannel";
import { FaExpandArrowsAlt } from "react-icons/fa";
import { RiSwapFill } from "react-icons/ri";
import { BooEventTile } from "./BooEventTile";
import { DndContext } from "@dnd-kit/core";
import Draggable from "./Draggable";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useSolanaTokenBalance } from "../../hooks/internal/solana/useSolanaTokenBalance";
import { FIXED_SOLANA_MINT, PACKAGE_PRICE_CHANGE_EVENT } from "../../constants";
import { useUser } from "../../hooks/context/useUser";
import { BooCarePackages } from "./BooCarePackages";
import { useDragRefs } from "../../hooks/internal/useDragRef";
import { BooEventTtsComponent } from "./BooEventTtsComponent";
import { useLazyQuery } from "@apollo/client";
import {
  GET_PACKAGES_QUERY,
  GET_USER_PACKAGE_COOLDOWN_MAPPING_QUERY,
} from "../../constants/queries";
import { GetUserPackageCooldownMappingQuery } from "../../generated/graphql";
import { jp } from "../../utils/validation/jsonParse";
import { BooScarePackages } from "./BooScarePackages";
import { INTERACTIONS_CHANNEL, PackageInfo } from "../../pages/modcenter";
import { useAblyChannel } from "../../hooks/chat/useChatChannel";
import { UseInteractionModal } from "../channels/UseInteractionModal";
import { areAddressesEqual } from "../../utils/validation/wallet";
import { BooPackageCooldownResetComponent } from "./BooPackageCooldownResetComponent";

export const TOKEN_VIEW_COLUMN_2_PIXEL_WIDTH = 330;
export const TOKEN_VIEW_MINI_PLAYER_PIXEL_HEIGHT = 200;
export const TOKEN_VIEW_TILE_PIXEL_GAP = 5;
export const STREAM_VIEW_JUPITER_TERMINAL_PIXEL_HEIGHT = 340;

export const TOKEN_VIEW_GRAPH_PERCENT_HEIGHT = 50;
export const STREAM_VIEW_JUPITER_TERMINAL_MIN_X_OFFSET = 30;
export const STREAM_VIEW_JUPITER_TERMINAL_MIN_Y_OFFSET = 30;

export const HomePageBooEventStreamPage = () => {
  const { chat: c, channel } = useChannelContext();
  const { channelQueryData } = channel;
  const { chatBot } = c;
  const chat = useChat({ chatBot });

  const { playbackInfo } = useLivepeerStreamData({
    livepeerPlaybackId: channelQueryData?.livepeerPlaybackId ?? undefined,
    livepeerStreamId: channelQueryData?.livepeerStreamId ?? undefined,
  });
  const { user, solanaAddress, handleIsManagingWallets } = useUser();
  const [isSell, setIsSell] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { balance, fetchTokenBalance } = useSolanaTokenBalance();
  const [interactionState, setInteractionState] = useState<{
    isOpen: boolean;
    interactionData: {
      name: string;
      price: string;
      handleInteraction: (...args: any[]) => Promise<void>;
    };
  }>({
    isOpen: false,
    interactionData: {
      name: "",
      price: "",
      handleInteraction: async (...args: any[]) => {
        return Promise.resolve();
      },
    },
  });

  const [dateNow, setDateNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setDateNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const [viewState, setViewState] = useState<"stream" | "token">("token");
  const [isGlowing, setIsGlowing] = useState(false);

  // const { publicKey, connected } = useWallet();

  const [booPackageMap, setBooPackageMap] = useState<
    Record<string, PackageInfo>
  >({});

  const [interactionsChannel] = useAblyChannel(
    INTERACTIONS_CHANNEL,
    async (message) => {
      if (
        message &&
        message.data.body &&
        message.name === PACKAGE_PRICE_CHANGE_EVENT
      ) {
        const body = message.data.body;
        const jpBody = jp(body);
        const newPackageMap = {
          ...booPackageMap,
          [jpBody.packageName]: {
            tokenHoldingPrice: jpBody.tokenHoldingPrice,
            cooldownInSeconds: jpBody.cooldownInSeconds,
            id: jpBody.id,
          },
        };
        setBooPackageMap(newPackageMap);
      }
    }
  );

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

  const triggerGlowingEffect = () => {
    setIsGlowing(true);
    setTimeout(() => setIsGlowing(false), 3000); // Stop glowing after 3 seconds
  };

  const { sensors, draggablePosition, handleDragStart, handleDrag } =
    useDragRefs({ containerRef, viewState });

  const [_fetchBooPackages] = useLazyQuery(GET_PACKAGES_QUERY, {
    fetchPolicy: "network-only",
  });

  const fetchBooPackages = useCallback(async () => {
    const { data } = await _fetchBooPackages();
    const packages = data?.getPackages;
    if (packages) {
      const packageMap = packages.reduce((map: any, item: any) => {
        map[item.packageName] = {
          tokenHoldingPrice: item.tokenHoldingPrice as string,
          cooldownInSeconds: item.cooldownInSeconds as number,
          id: item.id as string,
        };
        return map;
      }, {} as Record<string, { price: number; cooldown: number }>);
      setBooPackageMap(packageMap);
    }
  }, []);

  useEffect(() => {
    fetchBooPackages();
  }, []);

  const [_fetchUserBooPackageCooldownMapping] =
    useLazyQuery<GetUserPackageCooldownMappingQuery>(
      GET_USER_PACKAGE_COOLDOWN_MAPPING_QUERY,
      {
        fetchPolicy: "network-only",
      }
    );

  const [userBooPackageCooldowns, setUserBooPackageCooldowns] =
    useState<any>(undefined);

  const fetchUserBooPackageCooldownMapping = useCallback(
    async (userAddress: string) => {
      const { data } = await _fetchUserBooPackageCooldownMapping({
        variables: {
          data: { address: userAddress },
        },
      });
      const cooldownMapping = data?.getUserPackageCooldownMapping;
      if (cooldownMapping) {
        setUserBooPackageCooldowns(cooldownMapping);
      }
    },
    []
  );

  const handleUserBooPackageCooldowns = useCallback((mapping: any) => {
    setUserBooPackageCooldowns(mapping);
  }, []);

  useEffect(() => {
    if (user) fetchUserBooPackageCooldownMapping(user?.address);
  }, [user]);

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
        <UseInteractionModal
          isOpen={interactionState.isOpen}
          handleClose={() => {
            setInteractionState((prev) => ({ ...prev, isOpen: false }));
          }}
          balanceData={{
            balance,
            fetchTokenBalance,
          }}
          interactionData={interactionState.interactionData}
        />
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
              className={
                isGlowing && viewState === "stream" ? "glowing-border" : ""
              }
              cursor={viewState === "token" ? "default" : "move"}
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
                    src={`https://www.geckoterminal.com/solana/pools/${FIXED_SOLANA_MINT.poolAddress}?embed=1&info=0&swaps=0`}
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
                          <BooCarePackages
                            interactionsAblyChannel={interactionsChannel}
                            dateNow={dateNow}
                            booPackageMap={booPackageMap}
                            userBooPackageCooldowns={userBooPackageCooldowns}
                            fetchUserBooPackageCooldownMapping={
                              fetchUserBooPackageCooldownMapping
                            }
                            onPackageClick={(
                              packageName: string,
                              callback: (...args: any[]) => Promise<void>
                            ) => {
                              setInteractionState({
                                isOpen: true,
                                interactionData: {
                                  name: packageName,
                                  price:
                                    booPackageMap[packageName]
                                      .tokenHoldingPrice,
                                  handleInteraction: callback,
                                },
                              });
                            }}
                          />
                        </BooEventTile>
                        <BooEventTile
                          color="#B52423"
                          width="100%"
                          height="100%"
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
                          <Flex
                            justifyContent="center"
                            p={`${TOKEN_VIEW_TILE_PIXEL_GAP * 2}px`}
                            alignItems={"flex-start"}
                          >
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
                          <BooScarePackages
                            interactionsAblyChannel={interactionsChannel}
                            dateNow={dateNow}
                            booPackageMap={booPackageMap}
                            userBooPackageCooldowns={userBooPackageCooldowns}
                            fetchUserBooPackageCooldownMapping={
                              fetchUserBooPackageCooldownMapping
                            }
                            onPackageClick={(
                              packageName: string,
                              callback: (...args: any[]) => Promise<void>
                            ) => {
                              setInteractionState({
                                isOpen: true,
                                interactionData: {
                                  name: packageName,
                                  price:
                                    booPackageMap[packageName]
                                      .tokenHoldingPrice,
                                  handleInteraction: callback,
                                },
                              });
                            }}
                          />
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
                    className={isGlowing ? "glowing-background" : ""}
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
                            setViewState("token");
                          }}
                          className={isGlowing ? "glowing-background" : ""}
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
                        icon={<RiSwapFill size={20} />}
                        zIndex={51}
                        onClick={() => {
                          setIsSell((prev) => !prev);
                        }}
                        className={isGlowing ? "glowing-background" : ""}
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
                              `https://app.meteora.ag/pools/${FIXED_SOLANA_MINT.poolAddress}`,
                              "_blank"
                            );
                          }}
                          className={isGlowing ? "glowing-background" : ""}
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
                    isBuy={!isSell}
                    txCallback={async (txid, swapResult) => {
                      const tokenAccountA = base58Encode(
                        convertWordsToBigInt(swapResult.inputAddress._bn.words)
                      );
                      const tokenAccountB = base58Encode(
                        convertWordsToBigInt(swapResult.outputAddress._bn.words)
                      );
                      if (
                        areAddressesEqual(
                          tokenAccountA,
                          FIXED_SOLANA_MINT.tokenAccount
                        )
                      ) {
                        // this is a sell
                        console.log(
                          "sold",
                          swapResult.inputAmount /
                            10 ** FIXED_SOLANA_MINT.decimals
                        );
                      }
                      if (
                        areAddressesEqual(
                          tokenAccountB,
                          FIXED_SOLANA_MINT.tokenAccount
                        )
                      ) {
                        // this is a buy
                        console.log(
                          "bought",
                          swapResult.outputAmount /
                            10 ** FIXED_SOLANA_MINT.decimals
                        );
                      }
                      // getTransactionData(txid);
                      fetchTokenBalance();
                    }}
                    interfaceStyle={{
                      isGlowing,
                    }}
                  />
                  {viewState === "token" && (
                    <BooEventTile
                      color="#796AFF"
                      width="100%"
                      height={`calc(100% - ${TOKEN_VIEW_GRAPH_PERCENT_HEIGHT}% - ${
                        TOKEN_VIEW_TILE_PIXEL_GAP * 2
                      }px - ${TOKEN_VIEW_MINI_PLAYER_PIXEL_HEIGHT}px)`}
                    >
                      <BooEventTtsComponent
                        fetchUserBooPackageCooldownMapping={
                          fetchUserBooPackageCooldownMapping
                        }
                        interactionsAblyChannel={interactionsChannel}
                        booPackageMap={booPackageMap}
                        dateNow={dateNow}
                        userBooPackageCooldowns={userBooPackageCooldowns}
                        onTtsClick={(
                          callback: (...args: any[]) => Promise<void>
                        ) => {
                          setInteractionState({
                            isOpen: true,
                            interactionData: {
                              name: "text-to-speech",
                              price:
                                booPackageMap["text-to-speech"]
                                  .tokenHoldingPrice,
                              handleInteraction: callback,
                            },
                          });
                        }}
                      />
                      <BooPackageCooldownResetComponent
                        dateNow={dateNow}
                        booPackageMap={booPackageMap}
                        userBooPackageCooldowns={userBooPackageCooldowns}
                        handleUserBooPackageCooldowns={
                          handleUserBooPackageCooldowns
                        }
                        onClick={(
                          callback: (...args: any[]) => Promise<void>
                        ) => {
                          setInteractionState({
                            isOpen: true,
                            interactionData: {
                              name: "reset-cooldowns",
                              price:
                                booPackageMap["reset-cooldowns"]
                                  .tokenHoldingPrice,
                              handleInteraction: callback,
                            },
                          });
                        }}
                      />
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
          tokenGating={
            balance && balance > 0 && solanaAddress
              ? undefined
              : solanaAddress
              ? {
                  ctaBuyTokens: triggerGlowingEffect,
                  gateMessage: "BUY $BOO TO JOIN CHAT",
                }
              : {
                  ctaBuyTokens: () => handleIsManagingWallets(true),
                  gateMessage: "SWITCH TO SOLANA",
                }
          }
          noClipping
        />
      </Flex>
    </Flex>
  );
};

// Helper function to convert the words array to BigInt
function convertWordsToBigInt(words: any[]) {
  let bigIntValue = BigInt(0);
  for (let i = 0; i < words.length; i++) {
    bigIntValue += BigInt(words[i]) << BigInt(26 * i); // Each word represents 26 bits
  }
  return bigIntValue;
}

// Base58 encoding function without using a third-party library
const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function base58Encode(bigIntValue: bigint) {
  let encoded = "";
  while (bigIntValue > BigInt(0)) {
    const remainder = Number(bigIntValue % BigInt(58));
    bigIntValue = bigIntValue / BigInt(58);
    encoded = ALPHABET[remainder] + encoded;
  }
  return encoded;
}
