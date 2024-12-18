import { ApolloError } from "@apollo/client";
import { ChannelStaticQuery } from "../../../generated/graphql";
import { useEffect, useMemo } from "react";
import { useChat } from "../../../hooks/chat/useChat";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { useLivepeerStreamData } from "../../../hooks/internal/useLivepeerStreamData";
import { useVipBadgeUi } from "../../../hooks/internal/useVipBadgeUi";
import {
  Button,
  Flex,
  Stack,
  useToast,
  Text,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useBreakpointValue,
  Image,
  Box,
  Link,
} from "@chakra-ui/react";
import copy from "copy-to-clipboard";
import { formatApolloError } from "../../../utils/errorFormatting";
import trailString from "../../../utils/trailString";
import ChatComponent from "../../chat/ChatComponent";
import { WavyText } from "../../general/WavyText";
import ChannelNextHead from "../../layout/ChannelNextHead";
import Header from "../../navigation/Header";
import { ChannelWideModals } from "../ChannelWideModals";
import { DesktopChannelStreamerPerspectiveSimplified } from "./DesktopChannelStreamerPerspectiveSimplified";
import { DesktopChannelViewerPerspectiveSimplified } from "./DesktopChannelViewerPerspectiveSimplified";
import { useTempTokenContext } from "../../../hooks/context/useTempToken";
import { useTempTokenAblyInterpreter } from "../../../hooks/internal/temp-token/ui/useTempTokenAblyInterpreter";
import { TempTokenInterface } from "../temp/TempTokenInterface";
import { useVersusTempTokenAblyInterpreter } from "../../../hooks/internal/versus-token/ui/useVersusTempTokenAblyInterpreter";
import { useVersusTempTokenContext } from "../../../hooks/context/useVersusTempToken";
import { VersusTempTokensInterface } from "../versus/VersusTempTokensInterface";
import { calculateMaxWinnerTokensToMint } from "../../../utils/calculateMaxWinnerTokensToMint";
import { useIsGameOngoing } from "../../../hooks/internal/temp-token/ui/useIsGameOngoing";
import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";
import { ChannelPageNfcsList } from "../../NFCs/ChannelPageNfcsList";

export const DesktopChannelPageTempToken = ({
  channelSSR,
  channelSSRDataLoading,
  channelSSRDataError,
}: {
  channelSSR: ChannelStaticQuery["getChannelBySlug"];
  channelSSRDataLoading: boolean;
  channelSSRDataError?: ApolloError;
}) => {
  const { channel, chat: c } = useChannelContext();
  const {
    error: channelDataError,
    handleChannelStaticData,
    isOwner,
    channelQueryData,
  } = channel;

  const chat = useChat({ chatBot: c.chatBot });

  const { tempToken } = useTempTokenContext();

  const { gameState, loadingCurrentOnMount, loadingLastOnMount } = tempToken;
  const {
    currentActiveTokenEndTimestamp,
    canPlayToken: canPlayTempToken,
    isFailedGameModalOpen,
    handleIsFailedGameModalOpen,
    handleCreateTokenModalOpen: handleCreateTempTokenModalOpen,
  } = gameState;
  const { gameState: versusGameState, loadingOnMount } =
    useVersusTempTokenContext();
  const {
    isGameFinished: isVersusGameFinished,
    canPlayToken: canPlayVersusToken,
    isGameOngoing: isVersusGameOngoing,
    losingToken: losingVersusToken,
    winningToken: winningVersusToken,
    ownerMustPermamint,
    tokenA,
    tokenB,
    handleOwnerMustPermamint,
    handleCreateTokenModalOpen: handleCreateVersusTokenModalOpen,
  } = versusGameState;

  const toast = useToast();
  const { livepeerData, playbackInfo, checkedForLivepeerPlaybackInfo } =
    useLivepeerStreamData({
      livepeerStreamId: channelQueryData?.livepeerStreamId ?? undefined,
      livepeerPlaybackId: channelQueryData?.livepeerPlaybackId ?? undefined,
    });
  // console.log("livepeerData", livepeerData);
  // console.log("playbackInfo", playbackInfo);
  // console.log("checkedForLivepeerPlaybackInfo", checkedForLivepeerPlaybackInfo);
  useVipBadgeUi(chat);
  useTempTokenAblyInterpreter(chat);
  useVersusTempTokenAblyInterpreter(chat);
  const { isGameOngoing, tokenStateView, setTokenStateView } =
    useIsGameOngoing();

  useEffect(() => {
    if (channelSSR) handleChannelStaticData(channelSSR);
  }, [channelSSR]);

  const canShowInterface = useMemo(() => {
    return !channelDataError && !channelSSRDataError && !channelSSRDataLoading;
  }, [channelDataError, channelSSRDataError, channelSSRDataLoading]);

  useEffect(() => {
    const init = async () => {
      if (
        isOwner &&
        losingVersusToken.transferredLiquidityOnExpiration > BigInt(0)
      ) {
        if (ownerMustPermamint === true) {
          const { maxNumTokens } = await calculateMaxWinnerTokensToMint(
            Number(losingVersusToken.transferredLiquidityOnExpiration),
            Number(winningVersusToken.totalSupply),
            Number(winningVersusToken.minBaseTokenPrice)
          );
          if (maxNumTokens === 0) {
            handleOwnerMustPermamint(false);
          } else {
            handleOwnerMustPermamint(maxNumTokens);
          }
        }
      } else {
        handleOwnerMustPermamint(false);
      }
    };
    init();
  }, [losingVersusToken, ownerMustPermamint, isOwner, winningVersusToken]);

  const handleCopy = () => {
    toast({
      title: "copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const canScrollPage = useBreakpointValue({
    base: true,
    sm: true,
    md: false,
    xl: false,
  });

  return (
    <>
      {channelSSR && <ChannelNextHead channel={channelSSR} />}
      <Flex
        h="100vh"
        bg="rgba(5, 0, 31, 1)"
        position={"relative"}
        overflowY={canScrollPage ? "scroll" : "hidden"}
      >
        {canShowInterface ? (
          <Flex direction="column" width="100%">
            <Header />
            <TransactionModalTemplate
              title="Token didn't make it this time :("
              isOpen={isFailedGameModalOpen}
              handleClose={() => handleIsFailedGameModalOpen(false)}
              bg={"#18162F"}
              hideFooter
            >
              <Text>
                {
                  "This token couldn't reach the price goal. All remaining liquidity will be sent to the streamer. Better luck next time!"
                }
              </Text>
              <Flex justifyContent={"space-evenly"} gap="5px" my="15px" p={4}>
                <Button
                  onClick={() => {
                    handleIsFailedGameModalOpen(false);
                  }}
                >
                  Continue
                </Button>
              </Flex>
            </TransactionModalTemplate>
            <Stack
              height="100%"
              alignItems={["center", "initial"]}
              direction={["column", "column", "row", "row"]}
              gap="0"
              width="100%"
            >
              <Flex direction="column" width={"100%"} height="100%">
                {isOwner ? (
                  <>
                    <ChannelWideModals ablyChannel={chat.channel} />
                    {checkedForLivepeerPlaybackInfo && (
                      <DesktopChannelStreamerPerspectiveSimplified
                        ablyChannel={chat.channel}
                        livepeerData={livepeerData}
                        playbackData={
                          playbackInfo
                            ? {
                                infra: "livepeer",
                                livepeerPlaybackInfo: playbackInfo,
                              }
                            : {
                                infra: "aws",
                              }
                        }
                        mode={
                          currentActiveTokenEndTimestamp
                            ? "single-temp-token"
                            : isVersusGameOngoing
                            ? "versus-mode"
                            : ""
                        }
                      />
                    )}
                  </>
                ) : (
                  <>
                    {checkedForLivepeerPlaybackInfo && (
                      <DesktopChannelViewerPerspectiveSimplified
                        playbackData={
                          playbackInfo
                            ? {
                                infra: "livepeer",
                                livepeerPlaybackInfo: playbackInfo,
                              }
                            : {
                                infra: "aws",
                              }
                        }
                        chat={chat}
                        mode={
                          canPlayTempToken
                            ? "single-temp-token"
                            : canPlayVersusToken
                            ? "versus-mode"
                            : ""
                        }
                      />
                    )}
                  </>
                )}
              </Flex>
              {isOwner && tokenStateView === "owner-choose" ? (
                <Flex
                  direction="column"
                  minW={["100%", "100%", "380px", "380px"]}
                  maxW={["100%", "100%", "380px", "380px"]}
                  gap="1rem"
                  height="100%"
                >
                  {loadingOnMount ||
                  loadingCurrentOnMount ||
                  loadingLastOnMount ? (
                    <Flex justifyContent={"center"}>
                      <Spinner />
                    </Flex>
                  ) : (
                    <Flex
                      height="30%"
                      alignItems={"center"}
                      justifyContent={"center"}
                      position={"relative"}
                      direction={"column"}
                      gap="15px"
                    >
                      <Flex
                        position="absolute"
                        width="100%"
                        height="100%"
                        padding="20px"
                      >
                        <GraphIcon />
                      </Flex>
                      <Menu>
                        <MenuButton
                          as={Button}
                          _hover={{
                            transform: "scale(1.01)",
                          }}
                          _focus={{}}
                          _active={{}}
                          position={"relative"}
                          p="25px"
                          backgroundImage={"/images/button-gradient.png"}
                          backgroundSize="cover"
                          backgroundPosition="center"
                        >
                          <Image
                            src="/images/sparkles.png"
                            position="absolute"
                            zIndex="4"
                            minWidth={"125%"}
                            top={"50%"}
                            left={"50%"}
                            transform={"translate(-50%, -50%)"}
                          />
                          <Text
                            color="black"
                            fontFamily="LoRes15"
                            fontSize="25px"
                          >
                            launch your own token
                          </Text>
                        </MenuButton>
                        <MenuList zIndex={1801} bg={"#131323"} borderRadius="0">
                          <MenuItem
                            bg={"#131323"}
                            _hover={{ bg: "#1f1f3c" }}
                            _focus={{}}
                            _active={{}}
                            onClick={() => {
                              setTokenStateView("single");
                              handleCreateTempTokenModalOpen(true);
                            }}
                          >
                            30 minute token
                          </MenuItem>
                          <MenuItem
                            bg={"#131323"}
                            _hover={{ bg: "#1f1f3c" }}
                            _focus={{}}
                            _active={{}}
                            onClick={() => {
                              setTokenStateView("versus");
                              handleCreateVersusTokenModalOpen(true);
                            }}
                          >
                            versus token
                          </MenuItem>
                        </MenuList>
                      </Menu>
                      <Flex zIndex="5">
                        <Link
                          target="_blank"
                          href="https://super-okra-6ad.notion.site/wtf-is-unlonely-welcome-FAQs-5d17505468a84d63955d53328b8dbb1d"
                        >
                          <Text style={{ textDecoration: "underline" }}>
                            why/how?
                          </Text>
                        </Link>
                      </Flex>
                    </Flex>
                  )}
                  <ChatComponent
                    chat={chat}
                    customHeight={"100%"}
                    tokenForTransfer="tempToken"
                  />
                </Flex>
              ) : tokenStateView === "single" ? (
                <>
                  {canPlayTempToken ? (
                    <Flex
                      direction="column"
                      minW={["100%", "100%", "500px", "500px"]}
                      maxW={["100%", "100%", "500px", "500px"]}
                      gap="1rem"
                      height="100%"
                    >
                      <TempTokenInterface customHeight="100%" />
                    </Flex>
                  ) : (
                    <Flex
                      direction="column"
                      minW={["100%", "100%", "380px", "380px"]}
                      maxW={["100%", "100%", "380px", "380px"]}
                      gap="1rem"
                      height="100%"
                    >
                      <Flex direction="column" h="40%">
                        {isOwner && !isGameOngoing && (
                          <Button
                            w="fit-content"
                            h="20px"
                            onClick={() => {
                              setTokenStateView("versus");
                            }}
                          >
                            versus
                          </Button>
                        )}
                        <TempTokenInterface customHeight="100%" />
                      </Flex>
                      <ChatComponent
                        chat={chat}
                        customHeight={"100%"}
                        tokenForTransfer="tempToken"
                      />
                    </Flex>
                  )}
                </>
              ) : (
                <>
                  {canPlayVersusToken ? (
                    <Flex
                      direction="column"
                      minW={["100%", "100%", "500px", "500px"]}
                      maxW={["100%", "100%", "500px", "500px"]}
                      gap="1rem"
                      height="100%"
                    >
                      <VersusTempTokensInterface
                        ablyChannel={chat.channel}
                        customHeight="100%"
                      />
                    </Flex>
                  ) : (
                    <Flex
                      direction="column"
                      minW={["100%", "100%", "380px", "380px"]}
                      maxW={["100%", "100%", "380px", "380px"]}
                      gap="1rem"
                      height="100%"
                    >
                      {(isOwner || (tokenA.symbol && tokenB.symbol)) && (
                        <Flex
                          direction="column"
                          h={
                            isVersusGameOngoing || isVersusGameFinished
                              ? "40%"
                              : "30%"
                          }
                        >
                          {isOwner && !isGameOngoing && (
                            <Button
                              w="fit-content"
                              h="20px"
                              onClick={() => {
                                setTokenStateView("single");
                              }}
                            >
                              single
                            </Button>
                          )}
                          <VersusTempTokensInterface
                            ablyChannel={chat.channel}
                          />
                        </Flex>
                      )}
                      <ChatComponent
                        chat={chat}
                        customHeight={"100%"}
                        tokenForTransfer="tempToken"
                      />
                    </Flex>
                  )}
                </>
              )}
            </Stack>
            <ChannelPageNfcsList />
          </Flex>
        ) : (
          <Flex
            alignItems={"center"}
            justifyContent={"center"}
            width="100%"
            height="calc(100vh)"
            fontSize="50px"
          >
            {!channelDataError && !channelSSRDataError ? (
              <WavyText text="loading..." />
            ) : channelSSR === null ? (
              <Text fontFamily="LoRes15">channel does not exist</Text>
            ) : (
              <Flex direction="column" gap="10px" justifyContent="center">
                <Text fontFamily="LoRes15" textAlign={"center"}>
                  server error, please try again later
                </Text>
                {channelDataError && (
                  <Flex justifyContent={"center"} direction="column">
                    <Text textAlign={"center"} fontSize="12px">
                      {trailString(formatApolloError(channelDataError), 25)}
                    </Text>
                    <Button
                      _focus={{}}
                      _active={{}}
                      _hover={{
                        transform: "scale(1.1)",
                      }}
                      onClick={() => {
                        copy(formatApolloError(channelDataError));
                        handleCopy();
                      }}
                      color="white"
                      bg="#e2461f"
                      mx="auto"
                    >
                      copy full error
                    </Button>
                  </Flex>
                )}
              </Flex>
            )}
          </Flex>
        )}
      </Flex>
    </>
  );
};

const GraphIcon = () => {
  return (
    <Box position="relative" width="100%" height="100%">
      {/* Vertical Line */}
      <Box
        position="absolute"
        backgroundColor="white"
        width="2px"
        height="100%"
        left="0"
        bottom="0"
      />
      {/* Horizontal Line */}
      <Box
        position="absolute"
        backgroundColor="white"
        height="2px"
        width="100%"
        left="0"
        bottom="0"
      />
      {/* Up Arrow */}
      <Box
        position="absolute"
        width="10px"
        height="10px"
        backgroundColor="transparent"
        borderLeft="2px solid white"
        borderBottom="2px solid white"
        left="-3px"
        bottom="100%"
        transform="rotate(135deg)"
      />
      {/* Right Arrow */}
      <Box
        position="absolute"
        width="10px"
        height="10px"
        backgroundColor="transparent"
        borderLeft="2px solid white"
        borderBottom="2px solid white"
        left="100%"
        bottom="-3px"
        transform="rotate(-135deg)"
      />
    </Box>
  );
};
