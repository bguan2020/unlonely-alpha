import { useRef, useState, useEffect } from "react";
import { isAddress, isAddressEqual } from "viem";
import { InteractionType, CHAT_MESSAGE_EVENT } from "../../../../constants";
import { calculateMaxWinnerTokensToMint } from "../../../../utils/calculateMaxWinnerTokensToMint";
import { ChatReturnType } from "../../../chat/useChat";
import { useChannelContext } from "../../../context/useChannel";
import { useUser } from "../../../context/useUser";
import { useVersusTempTokenContext } from "../../../context/useVersusTempToken";
import TempTokenAbi from "../../../../constants/abi/TempTokenV1.json";
import { useScreenAnimationsContext } from "../../../context/useScreenAnimations";
import { Text } from "@chakra-ui/react";
import {
  versusTokenDataInitial,
  VersusTokenDataType,
} from "../../../../constants/types/token";
import { ChatBotMessageBody } from "../../../../constants/types/chat";
import { jp } from "../../../../utils/validation/jsonParse";

export const useVersusTempTokenAblyInterpreter = (chat: ChatReturnType) => {
  const { wagmiAddress } = useUser();
  const { channel } = useChannelContext();
  const { handleRealTimeChannelDetails } = channel;
  const mountingMessages = useRef(true);
  const { emojiBlast } = useScreenAnimationsContext();

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
    handleIsPreSaleOngoing,
    setTokenA,
    setTokenB,
    handleFocusedTokenToTrade,
    tokenA,
    tokenB,
    ownerMustPermamint,
    winningToken,
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
  const { receivedMessages, mounted } = chat;

  const blockNumberOfLastInAppTrade = useRef(BigInt(0));

  useEffect(() => {
    if (mounted) mountingMessages.current = false;
  }, [mounted]);

  const [tempTokenTransactionBody, setTempTokenTransactionBody] = useState("");

  const eventQueueRef = useRef<string[]>([]);

  useEffect(() => {
    if (!tempTokenTransactionBody) return;
    eventQueueRef.current.push(tempTokenTransactionBody);
    console.log("eventQueueRef.current", eventQueueRef.current);
    if (eventQueueRef.current.length === 1) {
      processQueue();
    }
  }, [tempTokenTransactionBody]);

  const processQueue = async () => {
    while (eventQueueRef.current.length > 0) {
      const log = eventQueueRef.current[0];
      await handleEvent(log);
      eventQueueRef.current.shift();
    }
  };

  const handleEvent = async (body: string) => {
    const jpBody = jp(body) as ChatBotMessageBody;
    const _userAddress = jpBody.address;
    const txBlockNumber = jpBody.blockNumber;
    console.log("fetching versus temp token events", jpBody);
    await Promise.all([
      getTempTokenEventsA(
        tokenA.contractData,
        tokenA.minBaseTokenPrice,
        blockNumberOfLastInAppTrade.current === BigInt(0) &&
          tempTokenTxsA.length > 0
          ? BigInt(tempTokenTxsA[tempTokenTxsA.length - 1].blockNumber)
          : blockNumberOfLastInAppTrade.current,
        BigInt(txBlockNumber)
      ),
      getTempTokenEventsB(
        tokenB.contractData,
        tokenB.minBaseTokenPrice,
        blockNumberOfLastInAppTrade.current === BigInt(0) &&
          tempTokenTxsB.length > 0
          ? BigInt(tempTokenTxsB[tempTokenTxsB.length - 1].blockNumber)
          : blockNumberOfLastInAppTrade.current,
        BigInt(txBlockNumber)
      ),
    ]);
    if (
      jpBody.interactionType === InteractionType.VERSUS_WINNER_TOKENS_MINTED
    ) {
      const tokenType = String(jpBody.tokenType);
      if (tokenType === "a") {
        await refetchUserTempTokenBalanceA?.();
      } else {
        await refetchUserTempTokenBalanceB?.();
      }
      handleOwnerMustPermamint(false);
      blockNumberOfLastInAppTrade.current = BigInt(txBlockNumber);
    } else {
      const incomingTxTokenAddress = jpBody.tokenAddress;
      const tokenType =
        isAddress(tokenB.address) &&
        isAddress(incomingTxTokenAddress) &&
        isAddressEqual(tokenB.address, incomingTxTokenAddress)
          ? "b"
          : "a";
      if (
        wagmiAddress &&
        isAddress(wagmiAddress) &&
        isAddress(_userAddress) &&
        isAddressEqual(
          wagmiAddress as `0x${string}`,
          _userAddress as `0x${string}`
        )
      ) {
        if (tokenType === "a") {
          await refetchUserTempTokenBalanceA?.();
        } else {
          await refetchUserTempTokenBalanceB?.();
        }
      }
      const totalSupply = jpBody.totalSupply;
      blockNumberOfLastInAppTrade.current = BigInt(txBlockNumber);
      if (jpBody.interactionType === InteractionType.BUY_TEMP_TOKENS) {
        onMintEvent(
          BigInt(totalSupply),
          BigInt(jpBody.highestTotalSupply),
          tokenType
        );
        emojiBlast(<Text fontSize={"30px"}>{"📈"}</Text>);
      }
      if (jpBody.interactionType === InteractionType.SELL_TEMP_TOKENS) {
        onBurnEvent(BigInt(totalSupply), tokenType);
        emojiBlast(<Text fontSize={"30px"}>{"📉"}</Text>);
      }
      if (ownerMustPermamint && losingToken.transferredLiquidityOnExpiration) {
        const { maxNumTokens: newMaxWinnerTokens } =
          await calculateMaxWinnerTokensToMint(
            Number(losingToken.transferredLiquidityOnExpiration),
            Number(totalSupply),
            Number(winningToken.minBaseTokenPrice)
          );
        handleOwnerMustPermamint(newMaxWinnerTokens);
      }
    }
  };

  useEffect(() => {
    if (receivedMessages.length === 0) return;
    const latestMessage = receivedMessages[receivedMessages.length - 1];
    console.log(
      "useVersusTempTokenAblyInterpreter latestMessage",
      latestMessage
    );
    if (
      latestMessage &&
      latestMessage.data.body &&
      latestMessage.name === CHAT_MESSAGE_EVENT &&
      Date.now() - latestMessage.timestamp < 12000
    ) {
      const body = latestMessage.data.body;
      const jpBody = jp(body) as ChatBotMessageBody;

      if (
        jpBody.interactionType === InteractionType.CREATE_MULTIPLE_TEMP_TOKENS
      ) {
        const newEndTimestamp = jpBody.endTimestamp as string;
        const newTokenAddresses = jpBody.tokenAddresses as string[];
        const newTokenSymbols = jpBody.tokenSymbols as string[];
        const chainId = jpBody.chainId as string;
        const newTokenCreationBlockNumber =
          jpBody.creationBlockNumber as string;
        const preSaleEndTimestamp = jpBody.preSaleEndTimestamp as string;
        const factoryAddress = jpBody.factoryAddress as string;
        const minBaseTokenPrice = jpBody.minBaseTokenPrice as string;
        handleRealTimeChannelDetails({
          isLive: true,
        });

        handleFocusedTokenToTrade(undefined);
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
          preSaleEndTimestamp: BigInt(preSaleEndTimestamp),
          contractData: {
            address: newTokenAddresses[0] as `0x${string}`,
            chainId: Number(chainId),
            abi: TempTokenAbi,
          },
          creationBlockNumber: BigInt(newTokenCreationBlockNumber),
          endTimestamp: BigInt(newEndTimestamp),
          factoryAddress,
          minBaseTokenPrice: BigInt(minBaseTokenPrice),
        });
        setTokenB({
          transferredLiquidityOnExpiration: BigInt(0),
          symbol: newTokenSymbols[1],
          address: newTokenAddresses[1],
          totalSupply: BigInt(0),
          isAlwaysTradeable: false,
          preSaleEndTimestamp: BigInt(preSaleEndTimestamp),
          contractData: {
            address: newTokenAddresses[1] as `0x${string}`,
            chainId: Number(chainId),
            abi: TempTokenAbi,
          },
          creationBlockNumber: BigInt(newTokenCreationBlockNumber),
          endTimestamp: BigInt(newEndTimestamp),
          factoryAddress,
          minBaseTokenPrice: BigInt(minBaseTokenPrice),
        });
        handleIsPreSaleOngoing(
          Number(preSaleEndTimestamp) > Math.floor(Date.now() / 1000)
        );
      }
      if (
        jpBody.interactionType === InteractionType.BUY_TEMP_TOKENS ||
        jpBody.interactionType === InteractionType.SELL_TEMP_TOKENS ||
        jpBody.interactionType === InteractionType.VERSUS_WINNER_TOKENS_MINTED
      ) {
        // todo: some buys and sells are not being processed, thus chart is not updating
        // has been happening since switch to jpBody data object use
        console.log(
          "useVersusTempTokenAblyInterpreter setTxBody jpBody",
          jpBody
        );
        setTempTokenTransactionBody(body);
      }
      if (
        jpBody.interactionType ===
        InteractionType.VERSUS_SET_WINNING_TOKEN_TRADEABLE_AND_TRANSFER_LIQUIDITY
      ) {
        const transferredLiquidityInWei = BigInt(
          jpBody.transferredLiquidityInWei
        );
        const winnerTokenType = jpBody.tokenType;
        const maxNumTokens = Number(jpBody.maxNumTokens);
        const _winningToken = winnerTokenType === "a" ? tokenA : tokenB;
        const _losingToken = {
          ...((winnerTokenType === "a"
            ? tokenB
            : tokenA) as VersusTokenDataType),
          transferredLiquidityOnExpiration: transferredLiquidityInWei,
        };
        if (winnerTokenType === "a") {
          setTokenB(_losingToken);
        } else {
          setTokenA(_losingToken);
        }
        handleWinningToken(_winningToken);
        handleLosingToken(_losingToken);
        handleOwnerMustMakeWinningTokenTradeable(false);
        handleOwnerMustPermamint(maxNumTokens);
      }
    }
  }, [receivedMessages]);
};
