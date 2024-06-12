import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";

import {
  UseReadTempTokenTxsType,
  useReadTempTokenTxs,
  useReadTempTokenTxsInitial,
} from "../internal/temp-token/read/useReadTempTokenTxs";
import {
  useReadVersusTempTokenGlobalStateInitial,
  UseReadVersusTempTokenGlobalStateType,
  useReadVersusTempTokenGlobalState,
} from "../internal/versus-token/read/useReadVersusTempTokenGlobalState";
import { useReadVersusTempTokenOnMount } from "../internal/versus-token/read/useReadVersusTempTokenOnMount";
import { useVersusGameStateTransitioner } from "../internal/versus-token/ui/useVersusGameStateTransitioner";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { useChannelContext } from "./useChannel";
import { useUser } from "./useUser";
import { useRouter } from "next/router";
import { InteractionType } from "../../constants";

export const useVersusTempTokenContext = () => {
  return useContext(VersusTempTokenContext);
};

/**
 * streamer perspective on versus mode has 4 states: create, play, pick, and permamint
 * create = isGameFinished && !ownerMustMakeWinningTokenTradeable && !ownerMustPermamint
 * play = !isGameFinished && !ownerMustMakeWinningTokenTradeable && !ownerMustPermamint
 * pick = isGameFinished && ownerMustMakeWinningTokenTradeable && !ownerMustPermamint
 * permamint = isGameFinished && !ownerMustMakeWinningTokenTradeable && ownerMustPermamint
 * while viewer only has buy, and play
 */

const VersusTempTokenContext = createContext<{
  gameState: UseReadVersusTempTokenGlobalStateType;
  tokenATxs: UseReadTempTokenTxsType;
  tokenBTxs: UseReadTempTokenTxsType;
  callbacks: {
    onMintEvent: (
      totalSupply: bigint,
      highestTotalSupply: bigint,
      tokenIdentifier: "a" | "b"
    ) => void;
    onBurnEvent: (totalSupply: bigint, tokenIdentifier: "a" | "b") => void;
  };
  loadingOnMount: boolean;
}>({
  gameState: useReadVersusTempTokenGlobalStateInitial,
  tokenATxs: { ...useReadTempTokenTxsInitial },
  tokenBTxs: { ...useReadTempTokenTxsInitial },
  callbacks: {
    onMintEvent: () => undefined,
    onBurnEvent: () => undefined,
  },
  loadingOnMount: true,
});

export const VersusTempTokenProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { channel, chat } = useChannelContext();
  const { isOwner } = channel;
  const { addToChatbot: addToChatbotForTempToken } = chat;
  const { user, userAddress } = useUser();
  const globalState = useReadVersusTempTokenGlobalState();
  const transitionGameState = useVersusGameStateTransitioner();
  const { loadingOnMount } = useReadVersusTempTokenOnMount({
    globalState,
  });
  const router = useRouter();

  const baseClient = useMemo(
    () =>
      createPublicClient({
        chain: base,
        transport: http(
          `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_BASE_API_KEY}`
        ),
      }),
    []
  );

  const readTempTokenTxs_a = useReadTempTokenTxs({
    tokenCreationBlockNumber:
      globalState.tokenA?.creationBlockNumber ?? BigInt(0),
    baseClient,
    tempTokenContract: globalState.tokenA.contractData,
  });

  const readTempTokenTxs_b = useReadTempTokenTxs({
    tokenCreationBlockNumber:
      globalState.tokenB?.creationBlockNumber ?? BigInt(0),
    baseClient,
    tempTokenContract: globalState.tokenB.contractData,
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

  /**
   * on game finish, whether it is set on mount or through the timer state,
   * determine the status of the relationship between the two tokens, and set the winning token, set
   * ownerMustMakeWinningTokenTradeable and ownerMustPermamint accordingly
   */
  useEffect(() => {
    const onGameFinish = async () => {
      if (!globalState.isGameFinished || !baseClient) return;
      console.log("game finished");
      globalState.handleIsGameOngoing(false);
      if (
        globalState.tokenA.totalSupply > BigInt(0) ||
        globalState.tokenB.totalSupply > BigInt(0)
      ) {
        globalState.handleIsGameFinishedModalOpen(true);
      }

      if (isOwner && router.pathname.startsWith("/channels")) {
        addToChatbotForTempToken({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.TEMP_TOKEN_EXPIRED,
          title: "Game finished! Both tokens are now expired!",
          description: "",
        });
      }

      transitionGameState({
        tokenA: globalState.tokenA,
        tokenB: globalState.tokenB,
        handleWinningToken: globalState.handleWinningToken,
        handleLosingToken: globalState.handleLosingToken,
        handleOwnerMustMakeWinningTokenTradeable:
          globalState.handleOwnerMustMakeWinningTokenTradeable,
        handleOwnerMustPermamint: globalState.handleOwnerMustPermamint,
      });
      globalState.handleIsGameFinished(false);
    };
    onGameFinish();
  }, [
    globalState.isGameFinished,
    globalState.tokenA,
    globalState.tokenB,
    baseClient,
    router,
    isOwner,
  ]);

  const value = useMemo(
    () => ({
      gameState: globalState,
      tokenATxs: readTempTokenTxs_a,
      tokenBTxs: readTempTokenTxs_b,
      callbacks: {
        onMintEvent,
        onBurnEvent,
      },
      loadingOnMount,
    }),
    [readTempTokenTxs_a, readTempTokenTxs_b, globalState]
  );

  return (
    <VersusTempTokenContext.Provider value={value}>
      {children}
    </VersusTempTokenContext.Provider>
  );
};
