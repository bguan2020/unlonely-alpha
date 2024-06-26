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

export const useVersusTempTokenAblyInterpreter = (chat: ChatReturnType) => {
  const { userAddress } = useUser();
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

  const blockNumberOfLastInAppTrade = useRef(BigInt(0));

  useEffect(() => {
    if (chat.mounted) mountingMessages.current = false;
  }, [chat.mounted]);

  const [tempTokenTransactionBody, setTempTokenTransactionBody] = useState("");

  const eventQueueRef = useRef<string[]>([]);

  useEffect(() => {
    if (!tempTokenTransactionBody) return;
    eventQueueRef.current.push(tempTokenTransactionBody);
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
    const interactionType = body.split(":")[0];
    const _userAddress = body.split(":")[1];
    const txBlockNumber = BigInt(body.split(":")[3]);
    await Promise.all([
      getTempTokenEventsA(
        tokenA.contractData,
        tokenA.minBaseTokenPrice,
        blockNumberOfLastInAppTrade.current === BigInt(0) &&
          tempTokenTxsA.length > 0
          ? BigInt(tempTokenTxsA[tempTokenTxsA.length - 1].blockNumber)
          : blockNumberOfLastInAppTrade.current,
        txBlockNumber
      ),
      getTempTokenEventsB(
        tokenB.contractData,
        tokenB.minBaseTokenPrice,
        blockNumberOfLastInAppTrade.current === BigInt(0) &&
          tempTokenTxsB.length > 0
          ? BigInt(tempTokenTxsB[tempTokenTxsB.length - 1].blockNumber)
          : blockNumberOfLastInAppTrade.current,
        txBlockNumber
      ),
    ]);
    if (body.split(":")[0] === InteractionType.VERSUS_WINNER_TOKENS_MINTED) {
      const tokenType = String(body.split(":")[4]);
      if (tokenType === "a") {
        await refetchUserTempTokenBalanceA?.();
      } else {
        await refetchUserTempTokenBalanceB?.();
      }
      handleOwnerMustPermamint(false);
      blockNumberOfLastInAppTrade.current = txBlockNumber;
    } else {
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
          await refetchUserTempTokenBalanceA?.();
        } else {
          await refetchUserTempTokenBalanceB?.();
        }
      }
      const totalSupply = BigInt(body.split(":")[5]);
      const highestTotalSupply = body.split(":")[6];
      blockNumberOfLastInAppTrade.current = txBlockNumber;
      if (interactionType === InteractionType.BUY_TEMP_TOKENS) {
        onMintEvent(BigInt(totalSupply), BigInt(highestTotalSupply), tokenType);
        emojiBlast(<Text fontSize={"30px"}>{"📈"}</Text>);
      }
      if (interactionType === InteractionType.SELL_TEMP_TOKENS) {
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
      if (body.split(":")[0] === InteractionType.CREATE_MULTIPLE_TEMP_TOKENS) {
        const newEndTimestamp = BigInt(body.split(":")[1]);
        const newTokenAddresses = JSON.parse(body.split(":")[2]);
        const newTokenSymbols = JSON.parse(body.split(":")[3]);
        const chainId = Number(body.split(":")[4]);
        const newTokenCreationBlockNumber = BigInt(body.split(":")[5]);
        const preSaleEndTimestamp = BigInt(body.split(":")[6]);
        const factoryAddress = body.split(":")[7];
        const minBaseTokenPrice = BigInt(body.split(":")[8]);
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
          preSaleEndTimestamp: preSaleEndTimestamp,
          contractData: {
            address: newTokenAddresses[0],
            chainId,
            abi: TempTokenAbi,
          },
          creationBlockNumber: newTokenCreationBlockNumber,
          endTimestamp: newEndTimestamp,
          factoryAddress,
          minBaseTokenPrice,
        });
        setTokenB({
          transferredLiquidityOnExpiration: BigInt(0),
          symbol: newTokenSymbols[1],
          address: newTokenAddresses[1],
          totalSupply: BigInt(0),
          isAlwaysTradeable: false,
          preSaleEndTimestamp: preSaleEndTimestamp,
          contractData: {
            address: newTokenAddresses[1],
            chainId,
            abi: TempTokenAbi,
          },
          creationBlockNumber: newTokenCreationBlockNumber,
          endTimestamp: newEndTimestamp,
          factoryAddress,
          minBaseTokenPrice,
        });
        handleIsPreSaleOngoing(
          Number(preSaleEndTimestamp) > Math.floor(Date.now() / 1000)
        );
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
        console.log(
          "detected VERSUS_SET_WINNING_TOKEN_TRADEABLE_AND_TRANSFER_LIQUIDITY",
          body
        );
        const transferredLiquidityInWei = BigInt(body.split(":")[4]);
        const winnerTokenType = body.split(":")[5];
        const maxNumTokens = Number(body.split(":")[6]);
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
  }, [chat.receivedMessages]);
};
