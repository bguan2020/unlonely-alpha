import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { ContractData } from "../../constants/types";
import {
  UseReadTempTokenTxsType,
  useReadTempTokenTxsInitial,
} from "../internal/temp-token/read/useReadTempTokenTxs";
import { Contract, InteractionType } from "../../constants";
import { useChannelContext } from "./useChannel";
import { useRouter } from "next/router";
import { useUser } from "./useUser";
import { useVersusFactoryExternalListeners } from "../internal/versus-token/useVersusFactoryExternalListeners";
import { useReadTempTokenListenerState } from "../internal/temp-token/read/useReadTempTokenListenerState";
import {
  useReadVersusTempTokenGlobalStateInitial,
  UseReadVersusTempTokenGlobalStateType,
  useReadVersusTempTokenGlobalState,
} from "../internal/versus-token/read/useReadVersusTempTokenGlobalState";
import { useReadVersusTempTokenOnMount } from "../internal/versus-token/read/useReadVersusTempTokenOnMount";
import { getContractFromNetwork } from "../../utils/contract";
import { useNetworkContext } from "./useNetwork";
import { usePublicClient } from "wagmi";

export type VersusTokenDataType = {
  balance: bigint;
  symbol: string;
  address: string;
  totalSupply: bigint;
  isAlwaysTradeable: boolean;
  highestTotalSupply: bigint;
  contractData: ContractData;
  creationBlockNumber: bigint;
  endTimestamp?: bigint;
};

export const useVersusTempTokenContext = () => {
  return useContext(VersusTempTokenContext);
};

/**
 * streamer perspective on versus mode has 4 states: create, play, pick, and permamint
 * create = isGameFinished && !ownerMustPickWinner && !ownerMustPermamint
 * play = !isGameFinished && !ownerMustPickWinner && !ownerMustPermamint
 * pick = isGameFinished && ownerMustPickWinner && !ownerMustPermamint
 * permamint = isGameFinished && !ownerMustPickWinner && ownerMustPermamint
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
  const { network } = useNetworkContext();
  const { localNetwork } = network;

  const factoryContract = getContractFromNetwork(
    Contract.TEMP_TOKEN_FACTORY_V1,
    localNetwork
  );

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
    handleOwnerMustPickWinner: globalState.handleOwnerMustPickWinner,
    handleIsGameFinished: globalState.handleIsGameFinished,
  });

  useVersusFactoryExternalListeners({
    tokenA: globalState.tokenA,
    tokenB: globalState.tokenB,
    handleTokenA: (token: VersusTokenDataType) => globalState.setTokenA(token),
    handleTokenB: (token: VersusTokenDataType) => globalState.setTokenB(token),
    handleIsGameFinished: globalState.handleIsGameFinished,
    handleOwnerMustPickWinner: globalState.handleOwnerMustPickWinner,
    handleOwnerMustPermamint: globalState.handleOwnerMustPermamint,
    resetTempTokenTxs: () => {
      readTempTokenTxs_a.resetTempTokenTxs();
      readTempTokenTxs_b.resetTempTokenTxs();
    },
  });

  useEffect(() => {
    if (!globalState.winningToken.address) return;
    const balance = publicClient.readContract({
      address: factoryContract.address as `0x${string}`,
      abi: factoryContract.abi,
      functionName: "getBalance",
      args: [],
    });
    console.log("balance", balance);
    const mintCostOfOneWinningToken = publicClient.readContract({
      address: globalState.winningToken.contractData.address as `0x${string}`,
      abi: globalState.winningToken.contractData.abi,
      functionName: "mintCostAfterFees",
      args: [BigInt(1)],
    });
    // if balance is greater than mintCostOfOneWinningToken, then set handleOwnerMustPermamint to true, and calculate the amount of tokens that can be minted via the lambda function
  }, [globalState.winningToken]);

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
