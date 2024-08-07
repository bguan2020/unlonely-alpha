import { useState, useCallback } from "react";
import { ContractData } from "../../../../constants/types";
import {
  VersusTokenDataType,
  versusTokenDataInitial,
} from "../../../../constants/types/token";

export type UseReadVersusTempTokenGlobalStateType = {
  canPlayToken: boolean;
  handleCanPlayToken: (value: boolean) => void;
  isPreSaleOngoing: boolean;
  handleIsPreSaleOngoing: (value: boolean) => void;
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
  ownerMustMakeWinningTokenTradeable: boolean;
  handleOwnerMustMakeWinningTokenTradeable: (value: boolean) => void;
  ownerMustPermamint: boolean | number;
  handleOwnerMustPermamint: (value: boolean | number) => void;
  tokenA: VersusTokenDataType;
  setTokenA: React.Dispatch<React.SetStateAction<VersusTokenDataType>>;
  tokenB: VersusTokenDataType;
  setTokenB: React.Dispatch<React.SetStateAction<VersusTokenDataType>>;
  isCreateTokenModalOpen: boolean;
  handleCreateTokenModalOpen: (value: boolean) => void;
};

export const useReadVersusTempTokenGlobalStateInitial: UseReadVersusTempTokenGlobalStateType =
  {
    canPlayToken: false,
    handleCanPlayToken: () => undefined,
    isPreSaleOngoing: false,
    handleIsPreSaleOngoing: () => undefined,
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
    ownerMustMakeWinningTokenTradeable: false,
    handleOwnerMustMakeWinningTokenTradeable: () => undefined,
    ownerMustPermamint: false,
    handleOwnerMustPermamint: () => undefined,
    tokenA: versusTokenDataInitial,
    setTokenA: () => undefined,
    tokenB: versusTokenDataInitial,
    setTokenB: () => undefined,
    isCreateTokenModalOpen: false,
    handleCreateTokenModalOpen: () => undefined,
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
    const [
      ownerMustMakeWinningTokenTradeable,
      setOwnerMustMakeWinningTokenTradeable,
    ] = useState(false);
    const [isPreSaleOngoing, setIsPreSaleOngoing] = useState(false);
    const [ownerMustPermamint, setOwnerMustPermamint] = useState<
      boolean | number
    >(false);
    const [losingToken, setLosingToken] = useState<VersusTokenDataType>(
      versusTokenDataInitial
    );
    const [tokenA, setTokenA] = useState<VersusTokenDataType>(
      versusTokenDataInitial
    );
    const [tokenB, setTokenB] = useState<VersusTokenDataType>(
      versusTokenDataInitial
    );
    const [createTokensModalOpen, setCreateTokensModalOpen] = useState(false);

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

    const handleOwnerMustMakeWinningTokenTradeable = useCallback(
      (value: boolean) => {
        setOwnerMustMakeWinningTokenTradeable(value);
      },
      []
    );

    const handleOwnerMustPermamint = useCallback((value: boolean | number) => {
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

    const handleIsPreSaleOngoing = useCallback((value: boolean) => {
      setIsPreSaleOngoing(value);
    }, []);

    const handleCreateTokenModalOpen = useCallback((value: boolean) => {
      setCreateTokensModalOpen(value);
    }, []);

    return {
      isPreSaleOngoing,
      handleIsPreSaleOngoing,
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
      ownerMustMakeWinningTokenTradeable,
      handleOwnerMustMakeWinningTokenTradeable,
      ownerMustPermamint,
      handleOwnerMustPermamint,
      tokenA,
      setTokenA,
      tokenB,
      setTokenB,
      isCreateTokenModalOpen: createTokensModalOpen,
      handleCreateTokenModalOpen,
    };
  };
