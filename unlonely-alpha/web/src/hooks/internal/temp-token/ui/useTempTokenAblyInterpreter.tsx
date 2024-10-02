import { useRef, useEffect, useState } from "react";
import { isAddress, isAddressEqual } from "viem";
import { InteractionType, CHAT_MESSAGE_EVENT } from "../../../../constants";
import { useTempTokenContext } from "../../../context/useTempToken";
import useDebounce from "../../useDebounce";
import { useUser } from "../../../context/useUser";
import { ChatReturnType } from "../../../chat/useChat";
import { useChannelContext } from "../../../context/useChannel";
import { useScreenAnimationsContext } from "../../../context/useScreenAnimations";
import { Text } from "@chakra-ui/react";
import { jp } from "../../../../utils/validation/jsonParse";
import { ChatBotMessageBody } from "../../../../constants/types/chat";

export const useTempTokenAblyInterpreter = (chat: ChatReturnType) => {
  const { user } = useUser();

  const { channel } = useChannelContext();
  const { handleRealTimeChannelDetails } = channel;
  const { emojiBlast } = useScreenAnimationsContext();

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
    currentActiveTokenMinBaseTokenPrice,
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
    handleCurrentActiveTokenFactoryAddress,
    handleCurrentActiveTokenMinBaseTokenPrice,
  } = gameState;

  const mountingMessages = useRef(true);
  const fetching = useRef(false);

  const { receivedMessages, mounted } = chat;

  useEffect(() => {
    if (mounted) mountingMessages.current = false;
  }, [mounted]);

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
      const jpBody = jp(body) as ChatBotMessageBody;
      fetching.current = true;
      const _userAddress = jpBody.address;
      const txBlockNumber = jpBody.blockNumber;
      const incomingTxTokenAddress = jpBody.tokenAddress;
      const totalSupply = jpBody.totalSupply;
      console.log(
        "processTempTokenEvents jpBody",
        jpBody,
        currentTempTokenContract
      );
      if (
        currentTempTokenContract.address &&
        isAddress(incomingTxTokenAddress) &&
        isAddress(currentTempTokenContract.address) &&
        isAddressEqual(
          incomingTxTokenAddress as `0x${string}`,
          currentTempTokenContract.address as `0x${string}`
        )
      ) {
        console.log(
          "fetching temp token events",
          jpBody,
          currentTempTokenContract
        );
        await getTempTokenEvents(
          currentTempTokenContract,
          currentActiveTokenMinBaseTokenPrice,
          blockNumberOfLastInAppTrade === BigInt(0) && tempTokenTxs.length > 0
            ? BigInt(tempTokenTxs[tempTokenTxs.length - 1].blockNumber)
            : blockNumberOfLastInAppTrade,
          BigInt(txBlockNumber)
        );
        if (
          user?.address &&
          isAddress(user?.address) &&
          isAddress(_userAddress) &&
          isAddressEqual(
            user?.address as `0x${string}`,
            _userAddress as `0x${string}`
          )
        ) {
          refetchUserTempTokenBalance?.();
        }
        setBlockNumberOfLastInAppTrade(BigInt(txBlockNumber));
        if (jpBody.interactionType === InteractionType.BUY_TEMP_TOKENS) {
          const hasHitTotalSupplyThreshold =
            jpBody.hasTotalSupplyThresholdReached === "true";
          const newEndTimestampForToken = jpBody.endTimestamp;
          if (hasHitTotalSupplyThreshold) {
            onReachThresholdEvent(newEndTimestampForToken);
          }
          onMintEvent(BigInt(totalSupply));
          emojiBlast(<Text fontSize={"30px"}>{"📈"}</Text>);
        }
        if (jpBody.interactionType === InteractionType.SELL_TEMP_TOKENS) {
          onBurnEvent(BigInt(totalSupply));
          emojiBlast(<Text fontSize={"30px"}>{"📉"}</Text>);
        }
      }
      fetching.current = false;
    };
    processTempTokenEvents(debouncedTempTokenTransactionBody);
  }, [debouncedTempTokenTransactionBody]);

  useEffect(() => {
    if (receivedMessages.length === 0) return;
    const latestMessage = receivedMessages[receivedMessages.length - 1];
    console.log("useTempTokenAblyInterpreter latestMessage", latestMessage);
    if (
      latestMessage &&
      latestMessage.data.body &&
      latestMessage.name === CHAT_MESSAGE_EVENT &&
      Date.now() - latestMessage.timestamp < 12000
    ) {
      console.log("useTempTokenAblyInterpreter latestMessage", latestMessage);
      const body = latestMessage.data.body;
      const jpBody = jp(body) as ChatBotMessageBody;
      if (
        jpBody.interactionType === InteractionType.CREATE_TEMP_TOKEN &&
        Date.now() - latestMessage.timestamp < 12000
      ) {
        handleRealTimeChannelDetails({
          isLive: true,
        });

        handleIsGamePermanent(false);
        handleIsGameSuccess(false);
        handleIsGameFailed(false);
        resetTempTokenTxs();

        handleCurrentActiveTokenAddress(jpBody.tokenAddress);
        handleCurrentActiveTokenSymbol(jpBody.symbol);
        handleCurrentActiveTokenEndTimestamp(BigInt(jpBody.endTimestamp));
        handleCurrentActiveTokenCreationBlockNumber(
          BigInt(jpBody.creationBlockNumber)
        );
        handleCurrentActiveTokenTotalSupplyThreshold(
          BigInt(jpBody.totalSupplyThreshold)
        );
        handleCurrentActiveTokenPreSaleEndTimestamp(
          BigInt(jpBody.preSaleEndTimestamp)
        );
        handleCurrentActiveTokenFactoryAddress(jpBody.factoryAddress);
        handleIsPreSaleOngoing(
          Number(jpBody.preSaleEndTimestamp) > Math.floor(Date.now() / 1000)
        );
        handleCurrentActiveTokenMinBaseTokenPrice(
          BigInt(jpBody.minBaseTokenPrice)
        );
      }
      if (
        jpBody.interactionType === InteractionType.BUY_TEMP_TOKENS ||
        jpBody.interactionType === InteractionType.SELL_TEMP_TOKENS
      ) {
        // todo: some buys and sells are not being processed, thus chart is not updating
        // has been happening since switch to jpBody data object use
        console.log("useTempTokenAblyInterpreter setTxBody jpBody", jpBody);
        setTempTokenTransactionBody(body);
      }
      if (
        jpBody.interactionType ===
        InteractionType.SEND_REMAINING_FUNDS_TO_WINNER_AFTER_TEMP_TOKEN_EXPIRATION
      ) {
        const to = jpBody.tokenContractAddress;

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
        jpBody.interactionType ===
        InteractionType.TEMP_TOKEN_THRESHOLD_INCREASED
      ) {
        const newThreshold = BigInt(jpBody.newThreshold);
        handleCurrentActiveTokenTotalSupplyThreshold(newThreshold);
        handleCurrentActiveTokenHasHitTotalSupplyThreshold(false);
      }
    }
  }, [receivedMessages]);
};
