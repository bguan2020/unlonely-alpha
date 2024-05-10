import { Flex } from "@chakra-ui/react";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import {
  ChannelProvider,
  useChannelContext,
} from "../../hooks/context/useChannel";
import { useChat } from "../../hooks/chat/useChat";
import AppLayout from "../../components/layout/AppLayout";
import { ChannelStaticQuery } from "../../generated/graphql";
import { CHANNEL_STATIC_QUERY } from "../../constants/queries";
import { TempTokenInterface } from "../../components/channels/temp/TempTokenInterface";
import {
  TempTokenProvider,
  useTempTokenContext,
} from "../../hooks/context/useTempToken";
import {
  VersusTempTokenProvider,
  useVersusTempTokenContext,
} from "../../hooks/context/useVersusTempToken";
import { VersusTempTokensInterface } from "../../components/channels/layout/versus/VersusTempTokensInterface";
import {
  CAN_USE_VERSUS_MODE_SLUGS,
  CHAT_MESSAGE_EVENT,
  InteractionType,
  VersusTokenDataType,
  versusTokenDataInitial,
} from "../../constants";
import { isAddress, isAddressEqual } from "viem";
import useDebounce from "../../hooks/internal/useDebounce";

import TempTokenAbi from "../../constants/abi/TempTokenV1.json";
import { useUser } from "../../hooks/context/useUser";
import { calculateMaxWinnerTokensToMint } from "../../utils/calculateMaxWinnerTokensToMint";

const FullTempTokenChartPage = () => {
  return (
    <AppLayout isCustomHeader={false} noHeader>
      <ChannelProvider>
        <ChannelLayer />
      </ChannelProvider>
    </AppLayout>
  );
};

const ChannelLayer = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { channel } = useChannelContext();
  const { channelQueryData, handleChannelStaticData } = channel;
  const {
    data: channelStatic,
    error: channelStaticError,
    loading: channelStaticLoading,
  } = useQuery<ChannelStaticQuery>(CHANNEL_STATIC_QUERY, {
    variables: { slug },
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (channelStatic)
      handleChannelStaticData(
        (channelStatic["getChannelBySlug"] as any) ?? null
      );
  }, [channelStatic]);

  return (
    <>
      {CAN_USE_VERSUS_MODE_SLUGS.includes(channelQueryData?.slug ?? "") ? (
        <VersusTempTokenProvider>
          <FullVersusTokenChart
            channelStaticError={channelStaticError}
            channelStaticLoading={channelStaticLoading}
          />
        </VersusTempTokenProvider>
      ) : (
        <TempTokenProvider>
          <FullTempTokenChart
            channelStaticError={channelStaticError}
            channelStaticLoading={channelStaticLoading}
          />
        </TempTokenProvider>
      )}
    </>
  );
};

const FullTempTokenChart = ({
  channelStaticError,
  channelStaticLoading,
}: {
  channelStaticError?: any;
  channelStaticLoading?: boolean;
}) => {
  const { userAddress } = useUser();
  const { channel } = useChannelContext();
  const { tempToken } = useTempTokenContext();
  const chat = useChat();
  const { handleRealTimeChannelDetails } = channel;
  const {
    currentTempTokenContract,
    currentActiveTokenAddress,
    lastInactiveTokenAddress,
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
  const mountingMessages = useRef(true);
  const fetching = useRef(false);
  const [blockNumberOfLastInAppTrade, setBlockNumberOfLastInAppTrade] =
    useState<bigint>(BigInt(0));

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
    <Flex h="100vh" justifyContent={"space-between"} bg="#131323" p="0.5rem">
      <TempTokenInterface
        isFullChart
        ablyChannel={chat.channel}
        customLoading={channelStaticLoading}
        noChannelData={channelStaticError !== undefined}
      />
    </Flex>
  );
};

const FullVersusTokenChart = ({
  channelStaticError,
  channelStaticLoading,
}: {
  channelStaticError?: any;
  channelStaticLoading?: boolean;
}) => {
  const { userAddress } = useUser();
  const { channel } = useChannelContext();
  const chat = useChat();
  const { handleRealTimeChannelDetails } = channel;
  const mountingMessages = useRef(true);
  const fetching = useRef(false);

  const { gameState, tokenATxs, tokenBTxs, callbacks } =
    useVersusTempTokenContext();
  const {
    handleIsGameFinished,
    handleIsGameOngoing,
    handleOwnerMustPermamint,
    handleOwnerMustMakeWinningTokenTradeable,
    handleIsGameFinishedModalOpen,
    handleWinningToken,
    handleLosingToken,
    setTokenA,
    setTokenB,
    tokenA,
    tokenB,
    ownerMustPermamint,
    losingToken,
  } = gameState;
  const {
    resetTempTokenTxs: resetTempTokenTxsA,
    getTempTokenEvents: getTempTokenEventsA,
    refetchUserTempTokenBalance: refetchUserTempTokenBalanceA,
    tempTokenTxs: tempTokenTxsA,
  } = tokenATxs;
  const {
    resetTempTokenTxs: resetTempTokenTxsB,
    getTempTokenEvents: getTempTokenEventsB,
    refetchUserTempTokenBalance: refetchUserTempTokenBalanceB,
    tempTokenTxs: tempTokenTxsB,
  } = tokenBTxs;
  const { onMintEvent, onBurnEvent } = callbacks;

  const [blockNumberOfLastInAppTrade, setBlockNumberOfLastInAppTrade] =
    useState<bigint>(BigInt(0));

  useEffect(() => {
    if (chat.mounted) mountingMessages.current = false;
  }, [chat.mounted]);

  const [tempTokenTransactionBody, setTempTokenTransactionBody] = useState("");
  const debouncedTempTokenTransactionBody = useDebounce(
    tempTokenTransactionBody,
    500
  );

  useEffect(() => {
    const processVersusTokenEvents = async (body: string) => {
      if (!body || fetching.current) return;
      fetching.current = true;
      const interactionType = body.split(":")[0];
      const _userAddress = body.split(":")[1];
      const txBlockNumber = BigInt(body.split(":")[3]);
      await Promise.all([
        getTempTokenEventsA(
          tokenA.contractData,
          blockNumberOfLastInAppTrade === BigInt(0) && tempTokenTxsA.length > 0
            ? BigInt(tempTokenTxsA[tempTokenTxsA.length - 1].blockNumber)
            : blockNumberOfLastInAppTrade,
          txBlockNumber
        ),
        getTempTokenEventsB(
          tokenB.contractData,
          blockNumberOfLastInAppTrade === BigInt(0) && tempTokenTxsB.length > 0
            ? BigInt(tempTokenTxsB[tempTokenTxsB.length - 1].blockNumber)
            : blockNumberOfLastInAppTrade,
          txBlockNumber
        ),
      ]);
      if (body.split(":")[0] === InteractionType.VERSUS_WINNER_TOKENS_MINTED) {
        const tokenType = String(body.split(":")[4]);
        if (tokenType === "a") {
          refetchUserTempTokenBalanceA?.();
        } else {
          refetchUserTempTokenBalanceB?.();
        }
        handleOwnerMustPermamint(false);
        setBlockNumberOfLastInAppTrade(txBlockNumber);
        fetching.current = false;
        return;
      }
      const incomingTxTokenAddress = body.split(":")[4];
      const tokenType =
        isAddress(tokenB.address) &&
        isAddress(incomingTxTokenAddress) &&
        isAddressEqual(tokenB.address, incomingTxTokenAddress)
          ? "b"
          : "a";
      if (
        userAddress &&
        isAddress(userAddress) &&
        isAddress(_userAddress) &&
        isAddressEqual(
          userAddress as `0x${string}`,
          _userAddress as `0x${string}`
        )
      ) {
        if (tokenType === "a") {
          refetchUserTempTokenBalanceA?.();
        } else {
          refetchUserTempTokenBalanceB?.();
        }
      }
      const totalSupply = BigInt(body.split(":")[5]);
      const highestTotalSupply = body.split(":")[6];
      setBlockNumberOfLastInAppTrade(txBlockNumber);
      if (interactionType === InteractionType.BUY_TEMP_TOKENS)
        onMintEvent(BigInt(totalSupply), BigInt(highestTotalSupply), tokenType);
      if (interactionType === InteractionType.SELL_TEMP_TOKENS)
        onBurnEvent(BigInt(totalSupply), tokenType);
      if (ownerMustPermamint && losingToken.transferredLiquidityOnExpiration) {
        const { maxNumTokens: newMaxWinnerTokens } =
          await calculateMaxWinnerTokensToMint(
            Number(losingToken.transferredLiquidityOnExpiration),
            Number(totalSupply)
          );
        handleOwnerMustPermamint(newMaxWinnerTokens);
      }
      fetching.current = false;
    };
    processVersusTokenEvents(debouncedTempTokenTransactionBody);
  }, [debouncedTempTokenTransactionBody]);

  useEffect(() => {
    const checkAbly = async () => {
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
          body.split(":")[0] === InteractionType.CREATE_MULTIPLE_TEMP_TOKENS
        ) {
          const newEndTimestamp = BigInt(body.split(":")[1]);
          const newTokenAddresses = JSON.parse(body.split(":")[2]);
          const newTokenSymbols = JSON.parse(body.split(":")[3]);
          const chainId = Number(body.split(":")[4]);
          const newTokenCreationBlockNumber = BigInt(body.split(":")[5]);
          handleRealTimeChannelDetails({
            isLive: true,
          });

          handleIsGameFinished(false);
          handleIsGameOngoing(true);
          handleOwnerMustPermamint(false);
          handleOwnerMustMakeWinningTokenTradeable(false);
          handleIsGameFinishedModalOpen(false);
          handleWinningToken(versusTokenDataInitial);
          handleLosingToken(versusTokenDataInitial);
          resetTempTokenTxsA();
          resetTempTokenTxsB();
          setTokenA({
            transferredLiquidityOnExpiration: BigInt(0),
            symbol: newTokenSymbols[0],
            address: newTokenAddresses[0],
            totalSupply: BigInt(0),
            isAlwaysTradeable: false,
            highestTotalSupply: BigInt(0),
            contractData: {
              address: newTokenAddresses[0],
              chainId,
              abi: TempTokenAbi,
            },
            creationBlockNumber: newTokenCreationBlockNumber,
            endTimestamp: newEndTimestamp,
          });
          setTokenB({
            transferredLiquidityOnExpiration: BigInt(0),
            symbol: newTokenSymbols[1],
            address: newTokenAddresses[1],
            totalSupply: BigInt(0),
            isAlwaysTradeable: false,
            highestTotalSupply: BigInt(0),
            contractData: {
              address: newTokenAddresses[1],
              chainId,
              abi: TempTokenAbi,
            },
            creationBlockNumber: newTokenCreationBlockNumber,
            endTimestamp: newEndTimestamp,
          });
        }
        if (
          body.split(":")[0] === InteractionType.BUY_TEMP_TOKENS ||
          body.split(":")[0] === InteractionType.SELL_TEMP_TOKENS ||
          body.split(":")[0] === InteractionType.VERSUS_WINNER_TOKENS_MINTED
        ) {
          setTempTokenTransactionBody(body);
        }
        if (
          body.split(":")[0] ===
          InteractionType.VERSUS_SET_WINNING_TOKEN_TRADEABLE_AND_TRANSFER_LIQUIDITY
        ) {
          const transferredLiquidityInWei = BigInt(body.split(":")[4]);
          const winnerTokenType = body.split(":")[5];
          const maxNumTokens = Number(body.split(":")[6]);
          const _losingToken = {
            ...((winnerTokenType === "a"
              ? tokenB
              : tokenA) as VersusTokenDataType),
            transferredLiquidityOnExpiration: transferredLiquidityInWei,
          };
          if (winnerTokenType === "a") {
            handleLosingToken(_losingToken);
            setTokenB(_losingToken);
          } else {
            handleLosingToken(_losingToken);
            setTokenA(_losingToken);
          }
          handleOwnerMustMakeWinningTokenTradeable(false);
          handleOwnerMustPermamint(maxNumTokens);
        }
      }
    };
    checkAbly();
  }, [chat.receivedMessages]);
  return (
    <Flex h="100vh" justifyContent={"space-between"} bg="#131323" p="0.5rem">
      <VersusTempTokensInterface
        isFullChart
        ablyChannel={chat.channel}
        customLoading={channelStaticLoading}
        noChannelData={channelStaticError !== undefined}
      />
    </Flex>
  );
};

export default FullTempTokenChartPage;
