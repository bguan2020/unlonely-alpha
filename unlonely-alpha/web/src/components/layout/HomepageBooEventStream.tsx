import React, { useEffect, useState, useRef, useCallback } from "react";
import { Box, Flex, IconButton, Text, Image, Tooltip } from "@chakra-ui/react";
import { useLivepeerStreamData } from "../../hooks/internal/useLivepeerStreamData";
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
import {
  FIXED_SOLANA_MINT,
  PACKAGE_PRICE_CHANGE_EVENT,
  RESET_COOLDOWNS_NAME,
  ROOM_CHANGE_EVENT,
  TEXT_TO_SPEECH_PACKAGE_NAME,
} from "../../constants";
import { useUser } from "../../hooks/context/useUser";
import { BooCarePackages } from "./BooCarePackages";
import { useDragRefs } from "../../hooks/internal/useDragRef";
import { BooEventTtsComponent } from "./BooEventTtsComponent";
import { useLazyQuery } from "@apollo/client";
import {
  GET_PACKAGES_QUERY,
  GET_ROOMS_QUERY,
  GET_USER_PACKAGE_COOLDOWN_MAPPING_QUERY,
} from "../../constants/queries";
import { GetUserPackageCooldownMappingQuery } from "../../generated/graphql";
import { jp } from "../../utils/safeFunctions";
import { BooScarePackages } from "./BooScarePackages";
import {
  INTERACTIONS_CHANNEL,
  PackageInfo,
  RoomInfo,
} from "../../pages/modcenter";
import { useAblyChannel } from "../../hooks/chat/useChatChannel";
import { UseInteractionModal } from "../channels/UseInteractionModal";
// import { areAddressesEqual } from "../../utils/validation/wallet";
import { BooPackageCooldownResetComponent } from "./BooPackageCooldownResetComponent";
import { isValidAddress } from "../../utils/validation/wallet";

export const TOKEN_VIEW_COLUMN_2_PIXEL_WIDTH = 330;
export const TOKEN_VIEW_MINI_PLAYER_PIXEL_HEIGHT = 200;
export const TOKEN_VIEW_TILE_PIXEL_GAP = 5;
export const STREAM_VIEW_JUPITER_TERMINAL_PIXEL_HEIGHT = 340;

export const TOKEN_VIEW_GRAPH_PERCENT_HEIGHT = 50;
export const STREAM_VIEW_JUPITER_TERMINAL_MIN_X_OFFSET = 30;
export const STREAM_VIEW_JUPITER_TERMINAL_MIN_Y_OFFSET = 30;

export const HomepageBooEventStream = ({
  dateNow,
  isModalGlowing,
  balanceData,
  triggerGlowingEffect,
}: {
  dateNow: number;
  isModalGlowing: boolean;
  balanceData: {
    balance: number | null;
    fetchTokenBalance: () => Promise<number | undefined>;
    manualAddToBalance: (amount: number) => void;
  };
  triggerGlowingEffect: () => void;
}) => {
  const { channel } = useChannelContext();
  const { channelQueryData } = channel;
  const [viewState, setViewState] = useState<"stream" | "token">("token");
  const [booPackageMap, setBooPackageMap] = useState<
    Record<string, PackageInfo>
  >({});
  const [isSell, setIsSell] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
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

  const { playbackInfo } = useLivepeerStreamData({
    livepeerPlaybackId: channelQueryData?.livepeerPlaybackId ?? undefined,
    livepeerStreamId: channelQueryData?.livepeerStreamId ?? undefined,
  });

  const [bloodImageCount, setBloodImageCount] = useState(0);
  const bloodContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

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
      if (message && message.data.body && message.name === ROOM_CHANGE_EVENT) {
        const body = message.data.body;
        const jpBody = jp(body);
        setCurrentRoom(jpBody);
      }
    }
  );

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

  const { sensors, draggablePosition, handleDragStart, handleDrag } =
    useDragRefs({ containerRef, viewState });

  const [_fetchBooPackages] = useLazyQuery(GET_PACKAGES_QUERY, {
    fetchPolicy: "network-only",
  });

  const [getRooms] = useLazyQuery(GET_ROOMS_QUERY, {
    fetchPolicy: "network-only",
  });

  const [currentRoom, setCurrentRoom] = useState<RoomInfo | undefined>(
    undefined
  );

  const fetchBooPackages = useCallback(async () => {
    const { data } = await _fetchBooPackages();
    const packages = data?.getPackages;
    if (packages) {
      const packageMap = packages?.reduce((map: any, item: any) => {
        map[item.packageName] = {
          tokenHoldingPrice: item.tokenHoldingPrice as string,
          cooldownInSeconds: item.cooldownInSeconds as number,
          id: item.id as string,
        };
        return map;
      }, {} as Record<string, { price: number; cooldown: number }>);
      if (packageMap) setBooPackageMap(packageMap);
    }
  }, []);

  const fetchRoom = useCallback(async () => {
    const { data } = await getRooms();
    const rooms = data?.getRooms;
    if (rooms) {
      // find the room whose inUse is true
      const roomInUse = rooms.find((room: any) => room.inUse);
      console.log("roomInUse", roomInUse);
      setCurrentRoom(roomInUse);
    }
  }, []);

  useEffect(() => {
    fetchBooPackages();
    fetchRoom();
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
    if (user) {
      fetchUserBooPackageCooldownMapping(user?.address);
    } else {
      setUserBooPackageCooldowns(undefined);
    }
  }, [user]);

  return (
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
        balanceData={balanceData}
        interactionData={interactionState.interactionData}
        triggerGlowingEffect={triggerGlowingEffect}
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
              isModalGlowing && viewState === "stream" ? "glowing-border" : ""
            }
            cursor={viewState === "token" ? "default" : "move"}
          >
            <Flex
              width="100%"
              gap={
                viewState === "token" ? `${TOKEN_VIEW_TILE_PIXEL_GAP}px` : "0px"
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
                      position="relative"
                    >
                      {isValidAddress(user?.address) !== "solana" && (
                        <Flex
                          justifyContent="center"
                          alignItems="center"
                          position="absolute"
                          zIndex="3"
                          bg="rgba(24, 22, 45, 0.54)"
                          width="100%"
                          height="100%"
                        >
                          <Text
                            textAlign={"center"}
                            fontSize="calc(1vw + 1vh)"
                            bg="#7EFB97"
                            color="black"
                          >
                            please log in with solana wallet to access
                          </Text>
                        </Flex>
                      )}
                      <BooEventTile color="#F57CA1" width="100%" height="100%">
                        <Flex
                          justifyContent="center"
                          alignItems={"flex-start"}
                          p={`${TOKEN_VIEW_TILE_PIXEL_GAP * 2}px`}
                        >
                          <Flex alignItems="center" gap="10px">
                            <Image src="/images/pixel-heart.png" alt="heart" />
                            <Text
                              textAlign="center"
                              fontFamily="LoRes15"
                              fontSize={["10px", "10px", "15px", "25px"]}
                              mx={2}
                              // noOfLines={1}
                            >
                              CARE PACKAGES
                            </Text>
                            <Image src="/images/pixel-heart.png" alt="heart" />
                          </Flex>
                        </Flex>
                        <BooCarePackages
                          currentRoom={currentRoom}
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
                                  booPackageMap[packageName].tokenHoldingPrice,
                                handleInteraction: callback,
                              },
                            });
                          }}
                        />
                      </BooEventTile>
                      <BooEventTile color="#B52423" width="100%" height="100%">
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
                              src="/images/skull.png"
                              alt="ghost"
                              h="34px"
                            />
                            <Text
                              textAlign="center"
                              fontFamily="LoRes15"
                              fontSize={["10px", "10px", "15px", "25px"]}
                              mx={2}
                              // noOfLines={1}
                            >
                              SCARE PACKAGES
                            </Text>
                            <Image
                              src="/images/skull.png"
                              alt="ghost"
                              h="34px"
                            />
                          </Flex>
                        </Flex>
                        <BooScarePackages
                          currentRoom={currentRoom}
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
                                  booPackageMap[packageName].tokenHoldingPrice,
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
                  className={isModalGlowing ? "glowing-background" : ""}
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
                        className={isModalGlowing ? "glowing-background" : ""}
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
                      className={isModalGlowing ? "glowing-background" : ""}
                    />
                  </Tooltip>
                  {viewState === "token" && (
                    <Tooltip label="dexscreener" shouldWrapChildren>
                      <IconButton
                        bg="#1F2935"
                        color="#21ec54"
                        _hover={{
                          bg: "#354559",
                        }}
                        aria-label="go to dexscreener"
                        icon={<ExternalLinkIcon />}
                        zIndex={51}
                        onClick={() => {
                          window.open(
                            `https://dexscreener.com/solana/${FIXED_SOLANA_MINT.poolAddress}`,
                            "_blank"
                          );
                        }}
                        className={isModalGlowing ? "glowing-background" : ""}
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
                    console.log("swapResult", swapResult);
                    balanceData.manualAddToBalance(
                      ((isSell
                        ? swapResult.inputAmount
                        : swapResult.outputAmount) /
                        10 ** FIXED_SOLANA_MINT.decimals) *
                        (isSell ? -1 : 1)
                    );
                  }}
                  interfaceStyle={{
                    isGlowing: isModalGlowing,
                  }}
                />
                {viewState === "token" && (
                  <Flex
                    gap={`${TOKEN_VIEW_TILE_PIXEL_GAP}px`}
                    height={`calc(100% - ${TOKEN_VIEW_GRAPH_PERCENT_HEIGHT}% - ${
                      TOKEN_VIEW_TILE_PIXEL_GAP * 2
                    }px - ${TOKEN_VIEW_MINI_PLAYER_PIXEL_HEIGHT}px)`}
                  >
                    <BooEventTile color="#FF9800" width="100%" padding="5px">
                      <BooPackageCooldownResetComponent
                        currentRoom={currentRoom}
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
                              name: RESET_COOLDOWNS_NAME,
                              price:
                                booPackageMap[RESET_COOLDOWNS_NAME]
                                  .tokenHoldingPrice,
                              handleInteraction: callback,
                            },
                          });
                        }}
                      />
                    </BooEventTile>
                    <BooEventTile color="#00A0C8" width="100%" padding="5px">
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
                              name: TEXT_TO_SPEECH_PACKAGE_NAME,
                              price:
                                booPackageMap[TEXT_TO_SPEECH_PACKAGE_NAME]
                                  .tokenHoldingPrice,
                              handleInteraction: callback,
                            },
                          });
                        }}
                      />
                    </BooEventTile>
                  </Flex>
                )}
              </Flex>
            </Flex>
          </Flex>
        </Draggable>
      </DndContext>
      {playbackInfo && (
        <Box
          position="absolute"
          bottom={viewState === "stream" ? 0 : `${TOKEN_VIEW_TILE_PIXEL_GAP}px`}
          right={viewState === "stream" ? 0 : `${TOKEN_VIEW_TILE_PIXEL_GAP}px`}
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
                  borderRadius="10px"
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
