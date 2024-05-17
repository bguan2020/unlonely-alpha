import { ApolloError } from "@apollo/client";
import { ChannelStaticQuery } from "../../../../generated/graphql";
import { useEffect, useMemo, useState } from "react";
import { useChat } from "../../../../hooks/chat/useChat";
import { useChannelContext } from "../../../../hooks/context/useChannel";
import { useUser } from "../../../../hooks/context/useUser";
import { useLivepeerStreamData } from "../../../../hooks/internal/useLivepeerStreamData";
import { useVipBadgeUi } from "../../../../hooks/internal/useVipBadgeUi";
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
} from "@chakra-ui/react";
import copy from "copy-to-clipboard";
import { formatApolloError } from "../../../../utils/errorFormatting";
import trailString from "../../../../utils/trailString";
import ChatComponent from "../../../chat/ChatComponent";
import { WavyText } from "../../../general/WavyText";
import ChannelNextHead from "../../../layout/ChannelNextHead";
import Header from "../../../navigation/Header";
import { ChannelWideModals } from "../../ChannelWideModals";
import { DesktopChannelStreamerPerspectiveSimplified } from "../temptoken/DesktopChannelStreamerPerspectiveSimplified";
import { DesktopChannelViewerPerspectiveSimplified } from "../temptoken/DesktopChannelViewerPerspectiveSimplified";
import { useTempTokenContext } from "../../../../hooks/context/useTempToken";
import { useTempTokenAblyInterpreter } from "../../../../hooks/internal/temp-token/ui/useTempTokenAblyInterpreter";
import { TempTokenInterface } from "../../temp/TempTokenInterface";
import { useVersusTempTokenAblyInterpreter } from "../../../../hooks/internal/versus-token/ui/useVersusTempTokenAblyInterpreter";
import { useVersusTempTokenContext } from "../../../../hooks/context/useVersusTempToken";
import { NULL_ADDRESS } from "../../../../constants";
import { VersusTempTokensInterface } from "../versus/VersusTempTokensInterface";
import { calculateMaxWinnerTokensToMint } from "../../../../utils/calculateMaxWinnerTokensToMint";

export const DesktopChannelPageTempToken = ({
  channelSSR,
  channelSSRDataLoading,
  channelSSRDataError,
}: {
  channelSSR: ChannelStaticQuery["getChannelBySlug"];
  channelSSRDataLoading: boolean;
  channelSSRDataError?: ApolloError;
}) => {
  const { walletIsConnected } = useUser();
  const { channel } = useChannelContext();
  const {
    loading: channelDataLoading,
    error: channelDataError,
    handleChannelStaticData,
    isOwner,
  } = channel;
  const chat = useChat();

  const { tempToken } = useTempTokenContext();

  const { gameState, loadingCurrentOnMount, loadingLastOnMount } = tempToken;
  const {
    currentActiveTokenEndTimestamp,
    canPlayToken: canPlayTempToken,
    currentActiveTokenAddress,
    lastInactiveTokenAddress,
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
    ownerMustMakeWinningTokenTradeable,
    handleOwnerMustPermamint,
  } = versusGameState;

  const toast = useToast();
  const { livepeerData, playbackInfo } = useLivepeerStreamData();
  useVipBadgeUi(chat);
  useTempTokenAblyInterpreter(chat);
  useVersusTempTokenAblyInterpreter(chat);

  const [ownerTokenStateView, setOwnerTokenStateView] = useState<
    "choose" | "single" | "versus"
  >("choose");

  const isVersusOnGoing = useMemo(() => {
    return (
      (isVersusGameOngoing ||
        (typeof ownerMustPermamint === "number" && ownerMustPermamint > 0) ||
        ownerMustMakeWinningTokenTradeable) &&
      !loadingOnMount
    );
  }, [
    isVersusGameOngoing,
    ownerMustPermamint,
    ownerMustMakeWinningTokenTradeable,
    loadingOnMount,
  ]);

  const isSingleOnGoing = useMemo(() => {
    return (
      !loadingCurrentOnMount &&
      (!loadingLastOnMount || !isOwner) &&
      (currentActiveTokenAddress !== NULL_ADDRESS ||
        lastInactiveTokenAddress !== NULL_ADDRESS)
    );
  }, [
    loadingCurrentOnMount,
    loadingLastOnMount,
    currentActiveTokenAddress,
    lastInactiveTokenAddress,
    isOwner,
  ]);

  const isGameOngoing = useMemo(() => {
    return isVersusOnGoing || isSingleOnGoing;
  }, [isVersusOnGoing, isSingleOnGoing]);

  useEffect(() => {
    if (channelSSR) handleChannelStaticData(channelSSR);
  }, [channelSSR]);

  useEffect(() => {
    if (isVersusOnGoing) {
      setOwnerTokenStateView("versus");
    }
  }, [isVersusOnGoing]);

  useEffect(() => {
    if (isSingleOnGoing) {
      setOwnerTokenStateView("single");
    }
  }, [isSingleOnGoing]);

  useEffect(() => {
    if (!isGameOngoing) {
      setOwnerTokenStateView("choose");
    }
  }, [isGameOngoing]);

  const canShowInterface = useMemo(() => {
    return (
      !channelDataLoading &&
      !channelDataError &&
      !channelSSRDataError &&
      !channelSSRDataLoading
    );
  }, [
    channelDataLoading,
    channelDataError,
    channelSSRDataError,
    channelSSRDataLoading,
  ]);

  useEffect(() => {
    const init = async () => {
      if (
        isOwner &&
        losingVersusToken?.transferredLiquidityOnExpiration &&
        winningVersusToken?.totalSupply
      ) {
        if (ownerMustPermamint === true) {
          const { maxNumTokens } = await calculateMaxWinnerTokensToMint(
            Number(losingVersusToken?.transferredLiquidityOnExpiration),
            Number(winningVersusToken?.totalSupply)
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

  return (
    <>
      {channelSSR && <ChannelNextHead channel={channelSSR} />}
      <Flex
        h="100vh"
        bg="rgba(5, 0, 31, 1)"
        position={"relative"}
        overflowY={"hidden"}
      >
        {canShowInterface ? (
          <Flex direction="column" width="100%">
            <Header />
            <Stack
              height="100%"
              alignItems={["center", "initial"]}
              direction={["column", "column", "row", "row"]}
              gap="0"
              width="100%"
            >
              <Flex direction="column" width={"100%"} height="100%">
                {isOwner && walletIsConnected ? (
                  <>
                    <ChannelWideModals ablyChannel={chat.channel} />
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
                  </>
                ) : (
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
              </Flex>
              {isOwner && ownerTokenStateView === "choose" ? (
                <Flex
                  direction="column"
                  minW={["100%", "100%", "380px", "380px"]}
                  maxW={["100%", "100%", "380px", "380px"]}
                  gap="1rem"
                >
                  {loadingOnMount ||
                  loadingCurrentOnMount ||
                  loadingLastOnMount ? (
                    <Flex justifyContent={"center"}>
                      <Spinner />
                    </Flex>
                  ) : !isGameOngoing ? (
                    <Menu>
                      <MenuButton
                        as={Button}
                        _hover={{}}
                        _focus={{}}
                        _active={{}}
                      >
                        <Text fontFamily="LoRes15" fontSize="15px">
                          launch token
                        </Text>
                      </MenuButton>
                      <MenuList zIndex={1801} bg={"#131323"} borderRadius="0">
                        <MenuItem
                          bg={"#131323"}
                          _hover={{ bg: "#1f1f3c" }}
                          _focus={{}}
                          _active={{}}
                          onClick={() => setOwnerTokenStateView("single")}
                        >
                          30 minute token
                        </MenuItem>
                        <MenuItem
                          bg={"#131323"}
                          _hover={{ bg: "#1f1f3c" }}
                          _focus={{}}
                          _active={{}}
                          onClick={() => setOwnerTokenStateView("versus")}
                        >
                          versus token
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  ) : null}
                  <ChatComponent
                    chat={chat}
                    customHeight={"100%"}
                    tokenForTransfer="tempToken"
                  />
                </Flex>
              ) : ownerTokenStateView === "single" ? (
                <>
                  {canPlayTempToken ? (
                    <Flex
                      direction="column"
                      minW={["100%", "100%", "500px", "500px"]}
                      maxW={["100%", "100%", "500px", "500px"]}
                      gap="1rem"
                    >
                      <TempTokenInterface
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
                    >
                      <Flex direction="column" h="40%">
                        {isOwner && !isGameOngoing && (
                          <Button
                            w="fit-content"
                            h="20px"
                            onClick={() => {
                              setOwnerTokenStateView("versus");
                            }}
                          >
                            versus
                          </Button>
                        )}
                        <TempTokenInterface
                          ablyChannel={chat.channel}
                          customHeight="100%"
                        />
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
                    >
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
                              setOwnerTokenStateView("single");
                            }}
                          >
                            single
                          </Button>
                        )}
                        <VersusTempTokensInterface ablyChannel={chat.channel} />
                      </Flex>
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
