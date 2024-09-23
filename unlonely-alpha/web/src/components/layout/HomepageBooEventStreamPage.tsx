import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Box, Flex, IconButton, Text, Image, Tooltip } from "@chakra-ui/react";
import { useChat } from "../../hooks/chat/useChat";
import { useLivepeerStreamData } from "../../hooks/internal/useLivepeerStreamData";
import ChatComponent from "../chat/ChatComponent";
import { useForm } from "react-hook-form";
import {
  IFormConfigurator,
  INITIAL_FORM_CONFIG,
  WRAPPED_SOL_MINT,
} from "../transactions/solana/SolanaJupiterTerminal";
import LivepeerPlayer from "../stream/LivepeerPlayer";
import { getSrc } from "@livepeer/react/external";
import { IntegratedTerminal } from "./IntegratedBooJupiterTerminal";
import { useChannelContext } from "../../hooks/context/useChannel";
import {
  GET_PACKAGES_QUERY,
  GET_USER_PACKAGE_COOLDOWN_MAPPING_QUERY,
} from "../../constants/queries";
import { useLazyQuery } from "@apollo/client";
import { FaExpandArrowsAlt } from "react-icons/fa";
import { RiSwapFill } from "react-icons/ri";
import { BooEventTile } from "./BooEventTile";
import { DndContext } from "@dnd-kit/core";
import Draggable from "./Draggable";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useSolanaTokenBalance } from "../../hooks/internal/solana/useSolanaTokenBalance";
import { Connection } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
// import { useJupiterQuoteSwap } from "../../hooks/internal/solana/useJupiterQuoteSwap";
// import { useBooTokenTerminal } from "../../hooks/internal/solana/useBooTokenTerminal";
import { SOLANA_RPC_URL, FIXED_SOLANA_MINT } from "../../constants";
import { useUser } from "../../hooks/context/useUser";
import useUpdateUserPackageCooldownMapping from "../../hooks/server/channel/useUpdateUserPackageCooldownMapping";
import { GetUserPackageCooldownMappingQuery } from "../../generated/graphql";
import { BooCarePackages } from "./BooCarePackages";
import { useDragRefs } from "../../hooks/internal/useDragRef";
import { useUpdatePackage } from "../../hooks/server/useUpdatePackage";
import { BooEventTtsComponent } from "./BooEventTtsComponent";

export const TOKEN_VIEW_COLUMN_2_PIXEL_WIDTH = 330;
export const TOKEN_VIEW_MINI_PLAYER_PIXEL_HEIGHT = 200;
export const TOKEN_VIEW_TILE_PIXEL_GAP = 5;
export const STREAM_VIEW_JUPITER_TERMINAL_PIXEL_HEIGHT = 340;

export const TOKEN_VIEW_GRAPH_PERCENT_HEIGHT = 50;
export const STREAM_VIEW_JUPITER_TERMINAL_MIN_X_OFFSET = 30;
export const STREAM_VIEW_JUPITER_TERMINAL_MIN_Y_OFFSET = 30;

export const HomePageBooEventStreamPage = ({ slug }: { slug: string }) => {
  const { chat: c, channel } = useChannelContext();
  const { channelQueryData } = channel;
  const { chatBot } = c;
  const chat = useChat({ chatBot });
  const { playbackInfo } = useLivepeerStreamData({
    livepeerPlaybackId: channelQueryData?.livepeerPlaybackId ?? undefined,
    livepeerStreamId: channelQueryData?.livepeerStreamId ?? undefined,
  });
  const { user, solanaAddress, authenticated, ready, handleIsManagingWallets } =
    useUser();
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
        initialInputMint: FIXED_SOLANA_MINT.address,
        initialOutputMint: WRAPPED_SOL_MINT.toString(),
      },
    },
  });

  const loggedInWithPrivy = authenticated && ready;

  const userIsChannelOwner = useMemo(
    () => user?.address === channelQueryData?.owner?.address,
    [user, channelQueryData]
  );

  const watchAllFieldsBuy = watchBuy();
  const watchAllFieldsSell = watchSell();

  const [userBooPackageCooldowns, setUserBooPackageCooldowns] =
    useState<any>(undefined);
  const [booPackages, setBooPackages] = useState<any>(undefined);

  const [_fetchUserBooPackageCooldownMapping] =
    useLazyQuery<GetUserPackageCooldownMappingQuery>(
      GET_USER_PACKAGE_COOLDOWN_MAPPING_QUERY,
      {
        fetchPolicy: "network-only",
      }
    );

  const [_fetchBooPackages] = useLazyQuery(GET_PACKAGES_QUERY, {
    fetchPolicy: "network-only",
  });

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

  useEffect(() => {
    if (user) fetchUserBooPackageCooldownMapping(user?.address);
  }, [user]);

  const fetchBooPackages = useCallback(async () => {
    const { data } = await _fetchBooPackages();
    const packages = data?.getPackages;
    if (packages) {
      setBooPackages(packages);
    }
  }, []);

  useEffect(() => {
    fetchBooPackages();
  }, []);

  const [dateNow, setDateNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setDateNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { balance, fetchTokenBalance } = useSolanaTokenBalance(SOLANA_RPC_URL);

  const [viewState, setViewState] = useState<"stream" | "token">("stream");
  const [isGlowing, setIsGlowing] = useState(false);

  const { publicKey, connected } = useWallet();
  const {
    updateUserPackageCooldownMapping: updateUserBooPackageCooldownMapping,
  } = useUpdateUserPackageCooldownMapping({});

  const { updatePackage: updateBooPackage } = useUpdatePackage({});

  // const { quoteSwap } = useJupiterQuoteSwap();

  const getTransactionData = async (transactionId: string) => {
    const details = await getTransactionDetails(
      transactionId,
      new Connection(SOLANA_RPC_URL)
    );
    if (!details) return;
    const { preTokenBalances, postTokenBalances } = details;
    console.log("preTokenBalances", preTokenBalances);
    console.log("postTokenBalances", postTokenBalances);

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

  useEffect(() => {
    const init = async () => {
      if (!connected) return;
      // quoteSwap(1);
      // await getTransactionData(
      //   "DqdkgqkvhjtWJmCJXxrWeTpr5ezbLPSuKkeJNko7KfnJC5fQamqPE4moVmYLCEdkD59wXabh9oQK8UXKo22ppyy"
      // );
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

  const triggerGlowingEffect = () => {
    setIsGlowing(true);
    setTimeout(() => setIsGlowing(false), 3000); // Stop glowing after 3 seconds
  };

  const { sensors, draggablePosition, handleDragStart, handleDrag } =
    useDragRefs({ containerRef, viewState });

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
              className={
                isGlowing && viewState === "stream" ? "glowing-border" : ""
              }
              cursor={viewState === "token" ? "default" : "move"}
            >
              {(!loggedInWithPrivy ||
                (loggedInWithPrivy &&
                  !solanaAddress &&
                  !userIsChannelOwner)) && (
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
                    You must log into Unlonely with a Solana-compatible wallet
                    to use this feature.
                  </Text>
                </Flex>
              )}
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
                            booPackages={booPackages}
                            userBooPackageCooldowns={userBooPackageCooldowns}
                            updateUserBooPackageCooldownMapping={
                              updateUserBooPackageCooldownMapping
                            }
                            updateBooPackage={updateBooPackage}
                            fetchUserBooPackageCooldownMapping={
                              fetchUserBooPackageCooldownMapping
                            }
                            dateNow={dateNow}
                          />
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
                            console.log("clicked");
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
                        icon={<RiSwapFill />}
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
                              `https://raydium.io/swap/?inputMint=${FIXED_SOLANA_MINT.address}&outputMint=sol`,
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
                    rpcUrl={SOLANA_RPC_URL}
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
                    txCallback={(txid, swapResult) => {
                      getTransactionData(txid);
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
                      <BooEventTtsComponent />
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
        />
      </Flex>
    </Flex>
  );
};
