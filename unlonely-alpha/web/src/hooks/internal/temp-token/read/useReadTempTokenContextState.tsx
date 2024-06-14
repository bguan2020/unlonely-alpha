import { useCallback, useMemo } from "react";
import { NULL_ADDRESS } from "../../../../constants";
import { useNetworkContext } from "../../../context/useNetwork";
import { isAddressEqual } from "viem";
import { usePublicClient } from "wagmi";
import TempTokenAbi from "../../../../constants/abi/TempTokenV1.json";
import { ContractData } from "../../../../constants/types";
import {
  UseReadTempTokenTxsType,
  useReadTempTokenTxs,
  useReadTempTokenTxsInitial,
} from "./useReadTempTokenTxs";
import {
  UseReadTempTokenGlobalStateType,
  useReadTempTokenGlobalState,
  useReadTempTokenGlobalStateInitial,
} from "./useReadTempTokenGlobalState";
import { useReadTempTokenOnMount } from "./useReadTempTokenOnMount";

export type UseReadTempTokenContextStateType = {
  gameState: UseReadTempTokenGlobalStateType;
  currentTempTokenContract: ContractData;
  lastInactiveTempTokenContract: ContractData;
  onMintEvent: (totalSupply: bigint) => void;
  onBurnEvent: (totalSupply: bigint) => void;
  onReachThresholdEvent: (newEndTimestamp: bigint) => void;
  onSendRemainingFundsToWinnerEvent: (
    tokenAddress: string,
    tokenIsCurrentlyActive: boolean
  ) => void;
  loadingCurrentOnMount: boolean;
  loadingLastOnMount: boolean;
} & UseReadTempTokenTxsType;

export const useReadTempTokenInitialState: UseReadTempTokenContextStateType = {
  gameState: useReadTempTokenGlobalStateInitial,
  currentTempTokenContract: {
    address: NULL_ADDRESS,
    abi: undefined,
    chainId: 0,
  },
  lastInactiveTempTokenContract: {
    address: NULL_ADDRESS,
    abi: undefined,
    chainId: 0,
  },
  onMintEvent: () => undefined,
  onBurnEvent: () => undefined,
  onReachThresholdEvent: () => undefined,
  onSendRemainingFundsToWinnerEvent: () => undefined,
  loadingCurrentOnMount: true,
  loadingLastOnMount: true,
  ...useReadTempTokenTxsInitial,
};

export const useReadTempTokenContextState = () => {
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const publicClient = usePublicClient();
  const globalState = useReadTempTokenGlobalState();
  const { loadingCurrentOnMount, loadingLastOnMount } = useReadTempTokenOnMount(
    { globalState }
  );

  const tempTokenContract: ContractData = useMemo(() => {
    if (globalState.currentActiveTokenAddress === NULL_ADDRESS) {
      return {
        address: NULL_ADDRESS,
        abi: undefined,
        chainId: localNetwork.config.chainId,
      };
    }
    return {
      address: globalState.currentActiveTokenAddress as `0x${string}`,
      abi: TempTokenAbi,
      chainId: localNetwork.config.chainId,
    };
  }, [globalState.currentActiveTokenAddress, localNetwork.config.chainId]);

  const lastInactiveTempTokenContract: ContractData = useMemo(() => {
    if (globalState.lastInactiveTokenAddress === NULL_ADDRESS) {
      return {
        address: NULL_ADDRESS,
        abi: undefined,
        chainId: localNetwork.config.chainId,
      };
    }
    return {
      address: globalState.lastInactiveTokenAddress as `0x${string}`,
      abi: TempTokenAbi,
      chainId: localNetwork.config.chainId,
    };
  }, [globalState.lastInactiveTokenAddress, localNetwork.config.chainId]);

  /**
   * functions to run when specific events are detected, not exposed outside of this hook,
   */
  const onMintEvent = useCallback(async (totalSupply: bigint) => {
    globalState.handleCurrentActiveTokenTotalSupply(totalSupply);
  }, []);

  const onBurnEvent = useCallback(async (totalSupply: bigint) => {
    globalState.handleCurrentActiveTokenTotalSupply(totalSupply);
  }, []);

  const onReachThresholdEvent = useCallback(async (newEndTimestamp: bigint) => {
    globalState.handleCurrentActiveTokenHasHitTotalSupplyThreshold(true);
    globalState.handleCurrentActiveTokenEndTimestamp(newEndTimestamp);
    globalState.handleIsGameSuccess(true);
    globalState.handleIsSuccessGameModalOpen(true);
  }, []);

  /**
   * function to run when sending remaining funds to winner
   * ideally to be called on an inactive token to reset the state and allow for normal token creation flow
   * but if a current token had just turned inactive and the funds have or have not been sent, what does the ui look like?
   */
  const onSendRemainingFundsToWinnerEvent = useCallback(
    async (tokenAddress: string, tokenIsCurrentlyActive: boolean) => {
      if (
        tokenIsCurrentlyActive &&
        isAddressEqual(
          tokenAddress as `0x${string}`,
          globalState.currentActiveTokenAddress as `0x${string}`
        )
      ) {
        globalState.handleCurrentActiveTokenSymbol("");
        globalState.handleCurrentActiveTokenAddress(NULL_ADDRESS);
        globalState.handleCurrentActiveTokenEndTimestamp(undefined);
        globalState.handleCurrentActiveTokenTotalSupply(BigInt(0));
        globalState.handleCurrentActiveTokenHasHitTotalSupplyThreshold(false);
        globalState.handleCurrentActiveTokenTotalSupplyThreshold(BigInt(0));
        globalState.handleCurrentActiveTokenIsAlwaysTradable(false);
        globalState.handleCurrentActiveTokenCreationBlockNumber(BigInt(0));
        globalState.handleCurrentActiveTokenFactoryAddress(NULL_ADDRESS);
      }
      if (
        !tokenIsCurrentlyActive &&
        isAddressEqual(
          tokenAddress as `0x${string}`,
          globalState.lastInactiveTokenAddress as `0x${string}`
        )
      ) {
        globalState.handleLastInactiveTokenAddress(NULL_ADDRESS);
        globalState.handleLastInactiveTokenBalance(BigInt(0));
        globalState.handleLastInactiveTokenSymbol("");
      }
    },
    [
      globalState.currentActiveTokenAddress,
      globalState.lastInactiveTokenAddress,
    ]
  );

  const readTempTokenTxs = useReadTempTokenTxs({
    tokenCreationBlockNumber: globalState.currentActiveTokenCreationBlockNumber,
    baseClient: publicClient,
    tempTokenContract,
  });

  return {
    gameState: globalState,
    currentTempTokenContract: tempTokenContract,
    lastInactiveTempTokenContract: lastInactiveTempTokenContract,
    onMintEvent,
    onBurnEvent,
    onReachThresholdEvent,
    onSendRemainingFundsToWinnerEvent,
    loadingCurrentOnMount,
    loadingLastOnMount,
    ...readTempTokenTxs,
  };
};
