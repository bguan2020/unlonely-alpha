import { useState, useCallback } from "react";
import { ContractData } from "../../../../constants/types";
import { VersusTokenDataType } from "../../../context/useVersusTempToken";
import { NULL_ADDRESS } from "../../../../constants";

export type UseReadVersusTempTokenGlobalStateType = {
  canPlayToken: boolean;
  handleCanPlayToken: (value: boolean) => void;
  focusedTokenToTrade: ContractData | undefined;
  handleFocusedTokenToTrade: (value: ContractData | undefined) => void;
  winningToken: VersusTokenDataType;
  handleWinningToken: (token: VersusTokenDataType) => void;
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
  isPickWinnerModalOpen: boolean;
  handleIsPickWinnerModalOpen: (value: boolean) => void;
};

const versusTokenDataInitial: VersusTokenDataType = {
  balance: BigInt(0),
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
    isGameFinished: true,
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
    isPickWinnerModalOpen: false,
    handleIsPickWinnerModalOpen: () => undefined,
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
    const [isGameFinished, setIsGameFinished] = useState(true);
    const [isGameFinishedModalOpen, setIsGameFinishedModalOpen] =
      useState(false);
    const [isPickWinnerModalOpen, setIsPickWinnerModalOpen] = useState(false);
    const [ownerMustTransferFunds, setOwnerMustTransferFunds] = useState(false);
    const [ownerMustPermamint, setOwnerMustPermamint] = useState(false);
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

    const handleIsPickWinnerModalOpen = useCallback((value: boolean) => {
      setIsPickWinnerModalOpen(value);
    }, []);

    return {
      canPlayToken,
      handleCanPlayToken,
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
      isPickWinnerModalOpen,
      handleIsPickWinnerModalOpen,
    };
  };
