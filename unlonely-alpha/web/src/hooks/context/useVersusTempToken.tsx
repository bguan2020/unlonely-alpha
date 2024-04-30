import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useRouter } from "next/router";
import { usePublicClient } from "wagmi";

import {
  UseReadTempTokenTxsType,
  useReadTempTokenTxsInitial,
} from "../internal/temp-token/read/useReadTempTokenTxs";
import { InteractionType, VersusTokenDataType } from "../../constants";
import { useChannelContext } from "./useChannel";
import { useUser } from "./useUser";
import { useVersusFactoryExternalListeners } from "../internal/versus-token/useVersusFactoryExternalListeners";
import { useReadTempTokenListenerState } from "../internal/temp-token/read/useReadTempTokenListenerState";
import {
  useReadVersusTempTokenGlobalStateInitial,
  UseReadVersusTempTokenGlobalStateType,
  useReadVersusTempTokenGlobalState,
} from "../internal/versus-token/read/useReadVersusTempTokenGlobalState";
import { useReadVersusTempTokenOnMount } from "../internal/versus-token/read/useReadVersusTempTokenOnMount";

export const useVersusTempTokenContext = () => {
  return useContext(VersusTempTokenContext);
};

/**
 * streamer perspective on versus mode has 4 states: create, play, pick, and permamint
 * create = isGameFinished && !ownerMustTransferFunds && !ownerMustPermamint
 * play = !isGameFinished && !ownerMustTransferFunds && !ownerMustPermamint
 * pick = isGameFinished && ownerMustTransferFunds && !ownerMustPermamint
 * permamint = isGameFinished && !ownerMustTransferFunds && ownerMustPermamint
 * while viewer only has buy, and play
 */

const VersusTempTokenContext = createContext<{
  gameState: UseReadVersusTempTokenGlobalStateType;
  tokenATxs: UseReadTempTokenTxsType;
  tokenBTxs: UseReadTempTokenTxsType;
}>({
  gameState: useReadVersusTempTokenGlobalStateInitial,
  tokenATxs: { ...useReadTempTokenTxsInitial },
  tokenBTxs: { ...useReadTempTokenTxsInitial },
});

export const VersusTempTokenProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { userAddress, user } = useUser();
  const router = useRouter();
  const { channel, chat } = useChannelContext();
  const { isOwner } = channel;
  const { addToChatbot: addToChatbotForTempToken } = chat;

  const globalState = useReadVersusTempTokenGlobalState();
  const publicClient = usePublicClient();

  const { readTempTokenTxs: readTempTokenTxs_a } =
    useReadTempTokenListenerState({
      tempTokenData: globalState.tokenA,
      onMintEvent: (totalSupply: bigint, highestTotalSupply: bigint) =>
        onMintEvent(totalSupply, highestTotalSupply, "a"),
      onBurnEvent: (totalSupply: bigint) => onBurnEvent(totalSupply, "a"),
      onDurationIncreaseEvent: (newEndTimestamp: bigint) =>
        onDurationIncreaseEvent(newEndTimestamp, "a"),
      onAlwaysTradeableEvent: () => onAlwaysTradeableEvent("a"),
    });

  const { readTempTokenTxs: readTempTokenTxs_b } =
    useReadTempTokenListenerState({
      tempTokenData: globalState.tokenB,
      onMintEvent: (totalSupply: bigint, highestTotalSupply: bigint) =>
        onMintEvent(totalSupply, highestTotalSupply, "b"),
      onBurnEvent: (totalSupply: bigint) => onBurnEvent(totalSupply, "b"),
      onDurationIncreaseEvent: (newEndTimestamp: bigint) =>
        onDurationIncreaseEvent(newEndTimestamp, "b"),
      onAlwaysTradeableEvent: () => onAlwaysTradeableEvent("b"),
    });

  /**
   * functions to run when specific events are detected, not exposed outside of this hook,
   */
  const onMintEvent = useCallback(
    async (
      totalSupply: bigint,
      highestTotalSupply: bigint,
      tokenIdentifier: "a" | "b"
    ) => {
      if (tokenIdentifier === "a") {
        globalState.setTokenA((prevTokenA) => {
          if (prevTokenA) {
            return {
              ...prevTokenA,
              totalSupply,
              highestTotalSupply,
            };
          } else {
            return prevTokenA;
          }
        });
      } else if (tokenIdentifier === "b") {
        globalState.setTokenB((prevTokenB) => {
          if (prevTokenB) {
            return {
              ...prevTokenB,
              totalSupply,
              highestTotalSupply,
            };
          } else {
            return prevTokenB;
          }
        });
      }
    },
    []
  );

  const onBurnEvent = useCallback(
    async (totalSupply: bigint, tokenIdentifier: "a" | "b") => {
      if (tokenIdentifier === "a") {
        globalState.setTokenA((prevTokenA) => {
          if (prevTokenA) {
            return {
              ...prevTokenA,
              totalSupply,
            };
          } else {
            return prevTokenA;
          }
        });
      } else if (tokenIdentifier === "b") {
        globalState.setTokenB((prevTokenB) => {
          if (prevTokenB) {
            return {
              ...prevTokenB,
              totalSupply,
            };
          } else {
            return prevTokenB;
          }
        });
      }
    },
    []
  );

  const onDurationIncreaseEvent = useCallback(
    async (newEndTimestamp: bigint, tokenType: "a" | "b") => {
      if (isOwner && router.pathname.startsWith("/channels")) {
        const title = `The $${
          tokenType === "a"
            ? globalState.tokenA.symbol
            : globalState.tokenB.symbol
        } token's time has been extended!`;
        addToChatbotForTempToken({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.TEMP_TOKEN_DURATION_INCREASED,
          title,
          description: "",
        });
      }
      if (tokenType === "a") {
        globalState.setTokenA((prevTokenA) => {
          if (prevTokenA) {
            return {
              ...prevTokenA,
              endTimestamp: newEndTimestamp,
            };
          } else {
            return prevTokenA;
          }
        });
      } else if (tokenType === "b") {
        globalState.setTokenB((prevTokenB) => {
          if (prevTokenB) {
            return {
              ...prevTokenB,
              endTimestamp: newEndTimestamp,
            };
          } else {
            return prevTokenB;
          }
        });
      }
    },
    [
      isOwner,
      userAddress,
      user,
      globalState.tokenA,
      globalState.tokenB,
      addToChatbotForTempToken,
      router.pathname,
    ]
  );

  const onAlwaysTradeableEvent = useCallback(
    async (tokenType: "a" | "b") => {
      if (isOwner && router.pathname.startsWith("/channels")) {
        const title = `The $${
          tokenType === "a"
            ? globalState.tokenA.symbol
            : globalState.tokenB.symbol
        } token is now permanently tradeable!`;
        addToChatbotForTempToken({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.TEMP_TOKEN_BECOMES_ALWAYS_TRADEABLE,
          title,
          description: "",
        });
      }
      if (tokenType === "a") {
        globalState.setTokenA((prevTokenA) => {
          if (prevTokenA) {
            return {
              ...prevTokenA,
              isAlwaysTradeable: true,
            };
          } else {
            return prevTokenA;
          }
        });
      } else if (tokenType === "b") {
        globalState.setTokenB((prevTokenB) => {
          if (prevTokenB) {
            return {
              ...prevTokenB,
              isAlwaysTradeable: true,
            };
          } else {
            return prevTokenB;
          }
        });
      }
    },
    [
      isOwner,
      userAddress,
      user,
      globalState.tokenA,
      globalState.tokenB,
      addToChatbotForTempToken,
      router.pathname,
    ]
  );

  useReadVersusTempTokenOnMount({
    setTokenA: globalState.setTokenA,
    setTokenB: globalState.setTokenB,
    handleWinningToken: globalState.handleWinningToken,
    handleOwnerMustTransferFunds: globalState.handleOwnerMustTransferFunds,
    handleIsGameOngoing: globalState.handleIsGameOngoing,
    handleLosingToken: globalState.handleLosingToken,
    handleOwnerMustPermamint: globalState.handleOwnerMustPermamint,
  });

  useVersusFactoryExternalListeners({
    tokenA: globalState.tokenA,
    tokenB: globalState.tokenB,
    handleTokenA: (token: VersusTokenDataType) => globalState.setTokenA(token),
    handleTokenB: (token: VersusTokenDataType) => globalState.setTokenB(token),
    handleIsGameFinished: globalState.handleIsGameFinished,
    handleIsGameFinishedModalOpen: globalState.handleIsGameFinishedModalOpen,
    handleOwnerMustTransferFunds: globalState.handleOwnerMustTransferFunds,
    handleOwnerMustPermamint: globalState.handleOwnerMustPermamint,
    handleLosingToken: globalState.handleLosingToken,
    resetTempTokenTxs: () => {
      readTempTokenTxs_a.resetTempTokenTxs();
      readTempTokenTxs_b.resetTempTokenTxs();
    },
  });

  /**
   * on game finish, whether it is set on mount or through the timer state,
   * determine the status of the relationship between the two tokens, and set the winning token, set
   * ownerMustTransferFunds and ownerMustPermamint accordingly
   */
  useEffect(() => {
    const onGameFinish = async () => {
      if (!globalState.isGameFinished) return;
      if (
        Boolean(globalState.tokenA.isAlwaysTradeable) ||
        BigInt(String(globalState.tokenA.totalSupply)) >
          BigInt(String(globalState.tokenB.totalSupply))
      ) {
        globalState.handleWinningToken(globalState.tokenA);
        globalState.handleLosingToken(globalState.tokenB);
      }
      if (
        Boolean(globalState.tokenB.isAlwaysTradeable) ||
        BigInt(String(globalState.tokenB.totalSupply)) >
          BigInt(String(globalState.tokenA.totalSupply))
      ) {
        globalState.handleWinningToken(globalState.tokenB);
        globalState.handleLosingToken(globalState.tokenA);
      }

      globalState.handleIsGameOngoing(false);
      globalState.handleOwnerMustTransferFunds(true);
    };
    onGameFinish();
  }, [globalState.isGameFinished, globalState.tokenA, globalState.tokenB]);

  const value = useMemo(
    () => ({
      gameState: globalState,
      tokenATxs: readTempTokenTxs_a,
      tokenBTxs: readTempTokenTxs_b,
    }),
    [readTempTokenTxs_a, readTempTokenTxs_b, globalState]
  );

  return (
    <VersusTempTokenContext.Provider value={value}>
      {children}
    </VersusTempTokenContext.Provider>
  );
};
