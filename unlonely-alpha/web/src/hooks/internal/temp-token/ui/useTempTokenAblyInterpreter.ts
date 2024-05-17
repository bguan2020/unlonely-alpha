import { useRef, useEffect, useState } from "react";
import { isAddress, isAddressEqual } from "viem";
import { InteractionType, CHAT_MESSAGE_EVENT } from "../../../../constants";
import { useTempTokenContext } from "../../../context/useTempToken";
import useDebounce from "../../useDebounce";
import { useUser } from "../../../context/useUser";
import { ChatReturnType } from "../../../chat/useChat";
import { useChannelContext } from "../../../context/useChannel";

export const useTempTokenAblyInterpreter = (chat: ChatReturnType) => {
  const { userAddress } = useUser();

  const { channel } = useChannelContext();
  const { handleRealTimeChannelDetails } = channel;

  const { tempToken } = useTempTokenContext();
  const {
    gameState,
    tempTokenTxs,
    currentTempTokenContract,
    resetTempTokenTxs,
    onMintEvent,
    onBurnEvent,
    onReachThresholdEvent,
    getTempTokenEvents,
    refetchUserTempTokenBalance,
    onSendRemainingFundsToWinnerEvent,
  } = tempToken;
  const {
    currentActiveTokenAddress,
    lastInactiveTokenAddress,
    handleIsGamePermanent,
    handleIsGameSuccess,
    handleIsGameFailed,
    handleCurrentActiveTokenEndTimestamp,
    handleCurrentActiveTokenCreationBlockNumber,
    handleCurrentActiveTokenAddress,
    handleCurrentActiveTokenSymbol,
    handleCurrentActiveTokenTotalSupplyThreshold,
    handleCurrentActiveTokenHasHitTotalSupplyThreshold,
    handleCurrentActiveTokenPreSaleEndTimestamp,
    handleIsPreSaleOngoing,
  } = gameState;

  const mountingMessages = useRef(true);
  const fetching = useRef(false);

  useEffect(() => {
    if (chat.mounted) mountingMessages.current = false;
  }, [chat.mounted]);

  const [tempTokenTransactionBody, setTempTokenTransactionBody] = useState("");
  const debouncedTempTokenTransactionBody = useDebounce(
    tempTokenTransactionBody,
    500
  );
  const [blockNumberOfLastInAppTrade, setBlockNumberOfLastInAppTrade] =
    useState<bigint>(BigInt(0));

  useEffect(() => {
    const processTempTokenEvents = async (body: string) => {
      if (!body || fetching.current) return;
      fetching.current = true;
      const interactionType = body.split(":")[0];
      const _userAddress = body.split(":")[1];
      const txBlockNumber = BigInt(body.split(":")[3]);
      const incomingTxTokenAddress = body.split(":")[4];
      const totalSupply = BigInt(body.split(":")[5]);
      if (
        currentTempTokenContract.address &&
        isAddress(incomingTxTokenAddress) &&
        isAddress(currentTempTokenContract.address) &&
        isAddressEqual(
          incomingTxTokenAddress as `0x${string}`,
          currentTempTokenContract.address as `0x${string}`
        )
      ) {
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
          onMintEvent(BigInt(totalSupply));
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
        handleCurrentActiveTokenPreSaleEndTimestamp(BigInt(body.split(":")[10]));
        handleIsPreSaleOngoing(Number(BigInt(body.split(":")[10])) > Math.floor(Date.now() / 1000));
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
};
