import { useState, useCallback } from "react";
import { ContractData } from "../../../../constants/types";
import { NULL_ADDRESS, VersusTokenDataType } from "../../../../constants";

export type UseReadVersusTempTokenGlobalStateType = {
  canPlayToken: boolean;
  handleCanPlayToken: (value: boolean) => void;
  focusedTokenToTrade: ContractData | undefined;
  handleFocusedTokenToTrade: (value: ContractData | undefined) => void;
  winningToken: VersusTokenDataType;
  handleWinningToken: (token: VersusTokenDataType) => void;
  losingToken: VersusTokenDataType;
  handleLosingToken: (token: VersusTokenDataType) => void;
  isGameOngoing: boolean;
  handleIsGameOngoing: (value: boolean) => void;
  isGameFinished: boolean;
  handleIsGameFinished: (value: boolean) => void;
  isGameFinishedModalOpen: boolean;
  handleIsGameFinishedModalOpen: (value: boolean) => void;
  ownerMustTransferFunds: boolean;
  handleOwnerMustTransferFunds: (value: boolean) => void;
  ownerMustPermamint: boolean;
  handleOwnerMustPermamint: (value: boolean) => void;
  tokenA: VersusTokenDataType;
  setTokenA: React.Dispatch<React.SetStateAction<VersusTokenDataType>>;
  tokenB: VersusTokenDataType;
  setTokenB: React.Dispatch<React.SetStateAction<VersusTokenDataType>>;
};

const versusTokenDataInitial: VersusTokenDataType = {
  transferredLiquidityOnExpiration: BigInt(0),
  symbol: "",
  address: "",
  totalSupply: BigInt(0),
  isAlwaysTradeable: false,
  highestTotalSupply: BigInt(0),
  contractData: {
    address: NULL_ADDRESS,
    chainId: 0,
    abi: undefined,
  },
  creationBlockNumber: BigInt(0),
  endTimestamp: undefined,
};

export const useReadVersusTempTokenGlobalStateInitial: UseReadVersusTempTokenGlobalStateType =
  {
    canPlayToken: false,
    handleCanPlayToken: () => undefined,
    focusedTokenToTrade: undefined,
    handleFocusedTokenToTrade: () => undefined,
    winningToken: versusTokenDataInitial,
    handleWinningToken: () => undefined,
    losingToken: versusTokenDataInitial,
    handleLosingToken: () => undefined,
    isGameOngoing: false,
    handleIsGameOngoing: () => undefined,
    isGameFinished: false,
    handleIsGameFinished: () => undefined,
    isGameFinishedModalOpen: false,
    handleIsGameFinishedModalOpen: () => undefined,
    ownerMustTransferFunds: false,
    handleOwnerMustTransferFunds: () => undefined,
    ownerMustPermamint: false,
    handleOwnerMustPermamint: () => undefined,
    tokenA: versusTokenDataInitial,
    setTokenA: () => undefined,
    tokenB: versusTokenDataInitial,
    setTokenB: () => undefined,
  };

export const useReadVersusTempTokenGlobalState =
  (): UseReadVersusTempTokenGlobalStateType => {
    const [canPlayToken, setCanPlayToken] = useState(false);
    const [focusedTokenToTrade, setFocusedTokenToTrade] = useState<
      ContractData | undefined
    >(undefined);
    const [winningToken, setWinningToken] = useState<VersusTokenDataType>(
      versusTokenDataInitial
    );
    const [isGameOngoing, setIsGameOngoing] = useState(false); // is game still playable?
    const [isGameFinished, setIsGameFinished] = useState(false); // had the game just finished? use this flag to manage transitions in state
    const [isGameFinishedModalOpen, setIsGameFinishedModalOpen] =
      useState(false);
    const [ownerMustTransferFunds, setOwnerMustTransferFunds] = useState(false);
    const [ownerMustPermamint, setOwnerMustPermamint] = useState(false);
    const [losingToken, setLosingToken] = useState<VersusTokenDataType>(
      versusTokenDataInitial
    );
    const [tokenA, setTokenA] = useState<VersusTokenDataType>(
      versusTokenDataInitial
    );
    const [tokenB, setTokenB] = useState<VersusTokenDataType>(
      versusTokenDataInitial
    );

    const handleCanPlayToken = useCallback((value: boolean) => {
      setCanPlayToken(value);
    }, []);

    const handleFocusedTokenToTrade = useCallback(
      (value: ContractData | undefined) => {
        setFocusedTokenToTrade(value);
      },
      []
    );

    const handleIsGameFinished = useCallback((value: boolean) => {
      setIsGameFinished(value);
    }, []);

    const handleIsGameFinishedModalOpen = useCallback((value: boolean) => {
      setIsGameFinishedModalOpen(value);
    }, []);

    const handleOwnerMustTransferFunds = useCallback((value: boolean) => {
      setOwnerMustTransferFunds(value);
    }, []);

    const handleOwnerMustPermamint = useCallback((value: boolean) => {
      setOwnerMustPermamint(value);
    }, []);

    const handleWinningToken = useCallback((token: VersusTokenDataType) => {
      setWinningToken(token);
    }, []);

    const handleLosingToken = useCallback((token: VersusTokenDataType) => {
      setLosingToken(token);
    }, []);

    const handleIsGameOngoing = useCallback((value: boolean) => {
      setIsGameOngoing(value);
    }, []);

    return {
      isGameOngoing,
      handleIsGameOngoing,
      canPlayToken,
      handleCanPlayToken,
      losingToken,
      handleLosingToken,
      focusedTokenToTrade,
      handleFocusedTokenToTrade,
      winningToken,
      handleWinningToken,
      isGameFinished,
      handleIsGameFinished,
      isGameFinishedModalOpen,
      handleIsGameFinishedModalOpen,
      ownerMustTransferFunds,
      handleOwnerMustTransferFunds,
      ownerMustPermamint,
      handleOwnerMustPermamint,
      tokenA,
      setTokenA,
      tokenB,
      setTokenB,
    };
  };
