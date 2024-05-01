import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useRouter } from "next/router";

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
import { usePublicClient } from "wagmi";

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
  const publicClient = usePublicClient();

  const globalState = useReadVersusTempTokenGlobalState();

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
    handleIsGameOngoing: globalState.handleIsGameOngoing,
    handleIsGameFinished: globalState.handleIsGameFinished,
    handleIsGameFinishedModalOpen: globalState.handleIsGameFinishedModalOpen,
    handleOwnerMustTransferFunds: globalState.handleOwnerMustTransferFunds,
    handleOwnerMustPermamint: globalState.handleOwnerMustPermamint,
    handleWinningToken: globalState.handleWinningToken,
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
      console.log(
        "calling onGameFinish",
        globalState.isGameFinished,
        globalState.tokenA,
        globalState.tokenB
      );
      if (!globalState.isGameFinished) return;
      globalState.handleIsGameOngoing(false);
      globalState.handleIsGameFinishedModalOpen(true);

      /**
       * The two if statements below determine which token is the winning token and which is the losing token. The only situation when these if statements do not run are when
       * both tokens have the same total supply and neither token is always tradeable.
       *
       * In this case, addition work is done to determine the next course of action in the code block further down.
       */
      if (
        globalState.tokenA.isAlwaysTradeable ||
        globalState.tokenA.totalSupply > globalState.tokenB.totalSupply
      ) {
        globalState.handleWinningToken(globalState.tokenA);
        globalState.handleLosingToken(globalState.tokenB);
      }
      if (
        globalState.tokenB.isAlwaysTradeable ||
        globalState.tokenB.totalSupply > globalState.tokenA.totalSupply
      ) {
        globalState.handleWinningToken(globalState.tokenB);
        globalState.handleLosingToken(globalState.tokenA);
      }

      const [balanceA, balanceB] = await Promise.all([
        publicClient.readContract({
          address: globalState.tokenA.contractData.address as `0x${string}`,
          abi: globalState.tokenA.contractData.abi,
          functionName: "getBalance",
          args: [],
        }),
        publicClient.readContract({
          address: globalState.tokenB.contractData.address as `0x${string}`,
          abi: globalState.tokenB.contractData.abi,
          functionName: "getBalance",
          args: [],
        }),
      ]);

      /**
       * if neither tokens are always tradeable at this point, the owner must transfer funds, else the owner must permamint
       */
      if (
        !globalState.tokenA.isAlwaysTradeable &&
        !globalState.tokenB.isAlwaysTradeable
      ) {
        /**
         * if both tokens have zero supply, there is no need to transfer funds or permamint
         */
        if (
          globalState.tokenA.totalSupply === globalState.tokenB.totalSupply &&
          globalState.tokenA.totalSupply === BigInt(0)
        ) {
          globalState.handleOwnerMustTransferFunds(false);
          globalState.handleOwnerMustPermamint(false);
        } else if (
          globalState.tokenA.totalSupply === globalState.tokenB.totalSupply &&
          globalState.tokenA.totalSupply > BigInt(0)
        ) {
          /**
           * if both tokens have the same non-zero total supply and neither token is always tradeable, tokenA is the default winner and the owner must permamint
           */
          globalState.handleWinningToken(globalState.tokenA);
          globalState.handleLosingToken(globalState.tokenB);
          globalState.handleOwnerMustTransferFunds(true);
          globalState.handleOwnerMustPermamint(false);
        } else if (
          globalState.tokenA.totalSupply > BigInt(0) &&
          BigInt(String(balanceA)) > BigInt(0) &&
          globalState.tokenB.totalSupply > BigInt(0) &&
          BigInt(String(balanceA)) > BigInt(0)
        ) {
          globalState.handleOwnerMustTransferFunds(true);
          globalState.handleOwnerMustPermamint(false);
        }
      } else {
        /**
         * if one of the tokens is always tradeable and the other untradeable token has zero balance, meaning the owner
         * had already transferred liquidity at that point, skip transfer phase and go straight to permamint phase
         */
        if (
          (globalState.tokenA.isAlwaysTradeable &&
            BigInt(String(balanceB)) === BigInt(0)) ||
          (globalState.tokenB.isAlwaysTradeable &&
            BigInt(String(balanceA)) === BigInt(0))
        ) {
          globalState.handleOwnerMustTransferFunds(false);
          globalState.handleOwnerMustPermamint(true);
        }
      }
    };
    onGameFinish();
  }, [
    globalState.isGameFinished,
    globalState.tokenA,
    globalState.tokenB,
    publicClient,
  ]);

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
