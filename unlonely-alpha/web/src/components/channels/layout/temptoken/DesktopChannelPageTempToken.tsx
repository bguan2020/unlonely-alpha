import { ApolloError } from "@apollo/client";
import { ChannelStaticQuery } from "../../../../generated/graphql";
import { useChannelContext } from "../../../../hooks/context/useChannel";
import { useChat } from "../../../../hooks/chat/useChat";
import { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "../../../../hooks/context/useUser";
import ChannelNextHead from "../../../layout/ChannelNextHead";
import { Stack, Flex, Text, Button, useToast } from "@chakra-ui/react";
import { WavyText } from "../../../general/WavyText";
import { ChannelWideModals } from "../../ChannelWideModals";
import { DesktopChannelViewerPerspectiveSimplified } from "./DesktopChannelViewerPerspectiveSimplified";
import ChatComponent from "../../../chat/ChatComponent";
import { DesktopChannelStreamerPerspectiveSimplified } from "./DesktopChannelStreamerPerspectiveSimplified";
import { TempTokenInterface } from "../../temp/TempTokenInterface";
import Header from "../../../navigation/Header";
import trailString from "../../../../utils/trailString";
import copy from "copy-to-clipboard";
import { useTempTokenContext } from "../../../../hooks/context/useTempToken";
import { useVipBadgeUi } from "../../../../hooks/internal/useVipBadgeUi";
import { useLivepeerStreamData } from "../../../../hooks/internal/useLivepeerStreamData";
import { CreateTokenInterface } from "./CreateTempTokenInterface";
import { formatApolloError } from "../../../../utils/errorFormatting";
import { CHAT_MESSAGE_EVENT, InteractionType } from "../../../../constants";
import useDebounce from "../../../../hooks/internal/useDebounce";
import { isAddress, isAddressEqual } from "viem";

export const DesktopChannelPageTempToken = ({
  channelSSR,
  channelSSRDataLoading,
  channelSSRDataError,
}: {
  channelSSR: ChannelStaticQuery["getChannelBySlug"];
  channelSSRDataLoading: boolean;
  channelSSRDataError?: ApolloError;
}) => {
  const { walletIsConnected, userAddress } = useUser();
  const { channel } = useChannelContext();
  const { tempToken } = useTempTokenContext();
  const chat = useChat();
  const {
    loading: channelDataLoading,
    error: channelDataError,
    handleChannelStaticData,
    handleRealTimeChannelDetails,
    isOwner,
  } = channel;
  const {
    currentActiveTokenEndTimestamp,
    currentTempTokenContract,
    currentActiveTokenAddress,
    lastInactiveTokenAddress,
    canPlayToken,
    tempTokenTxs,
    handleIsGamePermanent,
    handleIsGameSuccess,
    handleIsGameFailed,
    resetTempTokenTxs,
    handleCurrentActiveTokenEndTimestamp,
    handleCurrentActiveTokenCreationBlockNumber,
    handleCurrentActiveTokenAddress,
    handleCurrentActiveTokenSymbol,
    handleCurrentActiveTokenTotalSupplyThreshold,
    handleCurrentActiveTokenHasHitTotalSupplyThreshold,
    onMintEvent,
    onBurnEvent,
    onReachThresholdEvent,
    getTempTokenEvents,
    refetchUserTempTokenBalance,
    onSendRemainingFundsToWinnerEvent,
  } = tempToken;
  const toast = useToast();
  const { livepeerData, playbackInfo } = useLivepeerStreamData();
  useVipBadgeUi(chat);
  const mountingMessages = useRef(true);
  const fetching = useRef(false);

  useEffect(() => {
    if (channelSSR) handleChannelStaticData(channelSSR);
  }, [channelSSR]);

  const [shouldRenderTempTokenInterface, setShouldRenderTempTokenInterface] =
    useState(false);

  const [blockNumberOfLastInAppTrade, setBlockNumberOfLastInAppTrade] =
    useState<bigint>(BigInt(0));

  /**
   * if there is an existing token, render the temp token interface
   */

  useEffect(() => {
    if (!currentActiveTokenEndTimestamp) {
      setShouldRenderTempTokenInterface(false);
      return;
    }
    const decideRender = () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const shouldRender =
        currentTime <= Number(currentActiveTokenEndTimestamp) &&
        currentActiveTokenEndTimestamp !== BigInt(0);
      setShouldRenderTempTokenInterface(shouldRender);
    };

    // Initial update
    decideRender();

    const interval = setInterval(() => {
      decideRender();
      clearInterval(interval);
    }, 5 * 1000); // Check every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [currentActiveTokenEndTimestamp]);

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

  const handleCopy = () => {
    toast({
      title: "copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  useEffect(() => {
    if (chat.mounted) mountingMessages.current = false;
  }, [chat.mounted]);

  const [tempTokenTransactionBody, setTempTokenTransactionBody] = useState("");
  const debouncedTempTokenTransactionBody = useDebounce(
    tempTokenTransactionBody,
    500
  );

  useEffect(() => {
    const processTempTokenEvents = async (body: string) => {
      console.log("fetching temp token events 1", body);
      if (!body || fetching.current) return;
      fetching.current = true;
      const interactionType = body.split(":")[0];
      const _userAddress = body.split(":")[1];
      const txBlockNumber = BigInt(body.split(":")[3]);
      const incomingTxTokenAddress = body.split(":")[4];
      const totalSupply = BigInt(body.split(":")[5]);
      console.log("fetching temp token events 2");
      if (
        currentTempTokenContract.address &&
        isAddress(incomingTxTokenAddress) &&
        isAddress(currentTempTokenContract.address) &&
        isAddressEqual(
          incomingTxTokenAddress as `0x${string}`,
          currentTempTokenContract.address as `0x${string}`
        )
      ) {
        console.log("fetching temp token events 3");
        await getTempTokenEvents(
          currentTempTokenContract,
          blockNumberOfLastInAppTrade === BigInt(0) && tempTokenTxs.length > 0
            ? BigInt(tempTokenTxs[tempTokenTxs.length - 1].blockNumber)
            : blockNumberOfLastInAppTrade,
          txBlockNumber
        );
        if (
          userAddress &&
          isAddress(userAddress) &&
          isAddress(_userAddress) &&
          isAddressEqual(
            userAddress as `0x${string}`,
            _userAddress as `0x${string}`
          )
        ) {
          refetchUserTempTokenBalance?.();
        }
        setBlockNumberOfLastInAppTrade(txBlockNumber);
        if (interactionType === InteractionType.BUY_TEMP_TOKENS) {
          const highestTotalSupply = body.split(":")[6];
          const hasHitTotalSupplyThreshold = body.split(":")[7] === "true";
          const newEndTimestampForToken = BigInt(body.split(":")[8]);
          if (hasHitTotalSupplyThreshold) {
            onReachThresholdEvent(newEndTimestampForToken);
          }
          onMintEvent(BigInt(totalSupply), BigInt(highestTotalSupply));
        }
        if (interactionType === InteractionType.SELL_TEMP_TOKENS)
          onBurnEvent(BigInt(totalSupply));
      }
      fetching.current = false;
    };
    processTempTokenEvents(debouncedTempTokenTransactionBody);
  }, [debouncedTempTokenTransactionBody]);

  useEffect(() => {
    if (chat.receivedMessages.length === 0) return;
    const latestMessage =
      chat.receivedMessages[chat.receivedMessages.length - 1];
    if (
      latestMessage &&
      latestMessage.data.body &&
      latestMessage.name === CHAT_MESSAGE_EVENT &&
      Date.now() - latestMessage.timestamp < 12000
    ) {
      const body = latestMessage.data.body;
      if (
        body.split(":")[0] === InteractionType.CREATE_TEMP_TOKEN &&
        Date.now() - latestMessage.timestamp < 12000
      ) {
        handleRealTimeChannelDetails({
          isLive: true,
        });

        handleIsGamePermanent(false);
        handleIsGameSuccess(false);
        handleIsGameFailed(false);
        resetTempTokenTxs();

        handleCurrentActiveTokenEndTimestamp(BigInt(body.split(":")[7]));
        handleCurrentActiveTokenCreationBlockNumber(BigInt(body.split(":")[8]));
        handleCurrentActiveTokenAddress(body.split(":")[1]);
        handleCurrentActiveTokenSymbol(body.split(":")[2]);
        handleCurrentActiveTokenTotalSupplyThreshold(
          BigInt(body.split(":")[9])
        );
      }
      if (
        body.split(":")[0] === InteractionType.BUY_TEMP_TOKENS ||
        body.split(":")[0] === InteractionType.SELL_TEMP_TOKENS
      ) {
        setTempTokenTransactionBody(body);
      }
      if (
        body.split(":")[0] ===
        InteractionType.SEND_REMAINING_FUNDS_TO_WINNER_AFTER_TEMP_TOKEN_EXPIRATION
      ) {
        const to = body.split(":")[3];

        if (
          isAddress(to) &&
          isAddress(lastInactiveTokenAddress) &&
          isAddressEqual(to, lastInactiveTokenAddress)
        ) {
          onSendRemainingFundsToWinnerEvent(
            lastInactiveTokenAddress as `0x${string}`,
            false
          );
        }
        if (
          isAddress(to) &&
          isAddress(currentActiveTokenAddress) &&
          isAddressEqual(to, currentActiveTokenAddress)
        ) {
          onSendRemainingFundsToWinnerEvent(
            currentActiveTokenAddress as `0x${string}`,
            true
          );
        }
      }
      if (
        body.split(":")[0] === InteractionType.TEMP_TOKEN_THRESHOLD_INCREASED
      ) {
        const newThreshold = BigInt(body.split(":")[2]);
        handleCurrentActiveTokenTotalSupplyThreshold(newThreshold);
        handleCurrentActiveTokenHasHitTotalSupplyThreshold(false);
      }
    }
  }, [chat.receivedMessages]);

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
                        shouldRenderTempTokenInterface
                          ? "single-temp-token"
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
                    mode={canPlayToken ? "single-temp-token" : ""}
                  />
                )}
              </Flex>
              {canPlayToken && (
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
              )}
              {!canPlayToken && (
                <Flex
                  direction="column"
                  minW={["100%", "100%", "380px", "380px"]}
                  maxW={["100%", "100%", "380px", "380px"]}
                  gap="1rem"
                >
                  {isOwner && walletIsConnected ? (
                    <>
                      {shouldRenderTempTokenInterface ? (
                        <TempTokenInterface
                          ablyChannel={chat.channel}
                          customHeight="30%"
                        />
                      ) : (
                        <Flex
                          gap="5px"
                          justifyContent={"center"}
                          alignItems={"center"}
                          bg="#131323"
                          p="5px"
                          height="20vh"
                        >
                          <CreateTokenInterface />
                        </Flex>
                      )}
                      <ChatComponent
                        chat={chat}
                        customHeight={"100%"}
                        tokenForTransfer="tempToken"
                      />
                    </>
                  ) : (
                    <>
                      {shouldRenderTempTokenInterface && (
                        <TempTokenInterface
                          ablyChannel={chat.channel}
                          customHeight="30%"
                        />
                      )}
                      <ChatComponent
                        chat={chat}
                        customHeight={"100%"}
                        tokenForTransfer="tempToken"
                      />
                    </>
                  )}
                </Flex>
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
