import { useCallback, useState } from "react";
import { NULL_ADDRESS } from "../../../../constants";

export type UseReadTempTokenGlobalStateType = {
  currentActiveTokenSymbol: string;
  currentActiveTokenAddress: string;
  currentActiveTokenEndTimestamp?: bigint;
  currentActiveTokenTotalSupply: bigint;
  currentActiveTokenHasHitTotalSupplyThreshold: boolean;
  currentActiveTokenTotalSupplyThreshold: bigint;
  currentActiveTokenIsAlwaysTradable: boolean;
  currentActiveTokenCreationBlockNumber: bigint;
  currentActiveTokenPreSaleEndTimestamp: bigint;
  currentActiveTokenFactoryAddress: string;
  lastInactiveTokenAddress: string;
  lastInactiveTokenBalance: bigint;
  lastInactiveTokenSymbol: string;
  isPermanentGameModalOpen: boolean;
  isSuccessGameModalOpen: boolean;
  isFailedGameModalOpen: boolean;
  isPermanentGameState: boolean;
  isSuccessGameState: boolean;
  isFailedGameState: boolean;
  canPlayToken: boolean;
  isPreSaleOngoing: boolean;
  handleIsPreSaleOngoing: (value: boolean) => void;
  handleIsGamePermanent: (value: boolean) => void;
  handleIsGameSuccess: (value: boolean) => void;
  handleIsGameFailed: (value: boolean) => void;
  handleIsPermanentGameModalOpen: (value: boolean) => void;
  handleIsSuccessGameModalOpen: (value: boolean) => void;
  handleIsFailedGameModalOpen: (value: boolean) => void;
  handleCanPlayToken: (value: boolean) => void;
  handleCurrentActiveTokenFactoryAddress: (value: string) => void;
  handleCurrentActiveTokenEndTimestamp: (value: bigint | undefined) => void;
  handleCurrentActiveTokenCreationBlockNumber: (value: bigint) => void;
  handleCurrentActiveTokenAddress: (value: string) => void;
  handleCurrentActiveTokenSymbol: (value: string) => void;
  handleCurrentActiveTokenTotalSupplyThreshold: (value: bigint) => void;
  handleCurrentActiveTokenHasHitTotalSupplyThreshold: (value: boolean) => void;
  handleCurrentActiveTokenTotalSupply: (value: bigint) => void;
  handleCurrentActiveTokenIsAlwaysTradable: (value: boolean) => void;
  handleCurrentActiveTokenPreSaleEndTimestamp: (value: bigint) => void;
  handleLastInactiveTokenAddress: (value: string) => void;
  handleLastInactiveTokenBalance: (value: bigint) => void;
  handleLastInactiveTokenSymbol: (value: string) => void;
};

export const useReadTempTokenGlobalStateInitial: UseReadTempTokenGlobalStateType =
  {
    currentActiveTokenSymbol: "",
    currentActiveTokenAddress: NULL_ADDRESS,
    currentActiveTokenEndTimestamp: undefined,
    currentActiveTokenTotalSupply: BigInt(0),
    currentActiveTokenHasHitTotalSupplyThreshold: false,
    currentActiveTokenTotalSupplyThreshold: BigInt(0),
    currentActiveTokenIsAlwaysTradable: false,
    currentActiveTokenCreationBlockNumber: BigInt(0),
    currentActiveTokenPreSaleEndTimestamp: BigInt(0),
    currentActiveTokenFactoryAddress: NULL_ADDRESS,
    lastInactiveTokenAddress: NULL_ADDRESS,
    lastInactiveTokenBalance: BigInt(0),
    lastInactiveTokenSymbol: "",
    isPermanentGameModalOpen: false,
    isSuccessGameModalOpen: false,
    isFailedGameModalOpen: false,
    isPermanentGameState: false,
    isSuccessGameState: false,
    isFailedGameState: false,
    canPlayToken: false,
    isPreSaleOngoing: false,
    handleIsPreSaleOngoing: () => undefined,
    handleIsGamePermanent: () => undefined,
    handleIsGameSuccess: () => undefined,
    handleIsGameFailed: () => undefined,
    handleIsPermanentGameModalOpen: () => undefined,
    handleIsSuccessGameModalOpen: () => undefined,
    handleIsFailedGameModalOpen: () => undefined,
    handleCanPlayToken: () => undefined,
    handleCurrentActiveTokenEndTimestamp: () => undefined,
    handleCurrentActiveTokenCreationBlockNumber: () => undefined,
    handleCurrentActiveTokenFactoryAddress: () => undefined,
    handleCurrentActiveTokenAddress: () => undefined,
    handleCurrentActiveTokenSymbol: () => undefined,
    handleCurrentActiveTokenTotalSupplyThreshold: () => undefined,
    handleCurrentActiveTokenHasHitTotalSupplyThreshold: () => undefined,
    handleLastInactiveTokenAddress: () => undefined,
    handleLastInactiveTokenBalance: () => undefined,
    handleLastInactiveTokenSymbol: () => undefined,
    handleCurrentActiveTokenTotalSupply: () => undefined,
    handleCurrentActiveTokenIsAlwaysTradable: () => undefined,
    handleCurrentActiveTokenPreSaleEndTimestamp: () => undefined,
  };

export const useReadTempTokenGlobalState =
  (): UseReadTempTokenGlobalStateType => {
    // currentActiveTokenAddress is set on mount or by creation event
    const [currentActiveTokenAddress, setCurrentActiveTokenAddress] =
      useState<string>(NULL_ADDRESS);
    const [currentActiveTokenEndTimestamp, setCurrentActiveTokenEndTimestamp] =
      useState<bigint | undefined>(undefined);
    const [currentActiveTokenSymbol, setCurrentActiveTokenSymbol] =
      useState<string>("");
    const [
      currentActiveTokenCreationBlockNumber,
      setCurrentActiveTokenCreationBlockNumber,
    ] = useState<bigint>(BigInt(0));
    const [currentActiveTokenTotalSupply, setCurrentActiveTokenTotalSupply] =
      useState<bigint>(BigInt(0));
    const [
      currentActiveTokenHasHitTotalSupplyThreshold,
      setCurrentActiveTokenHasHitTotalSupplyThreshold,
    ] = useState<boolean>(false);
    const [
      currentActiveTokenTotalSupplyThreshold,
      setCurrentActiveTokenTotalSupplyThreshold,
    ] = useState<bigint>(BigInt(0));
    const [
      currentActiveTokenIsAlwaysTradable,
      setCurrentActiveTokenIsAlwaysTradable,
    ] = useState<boolean>(false);
    const [
      currentActiveTokenPreSaleEndTimestamp,
      setCurrentActiveTokenPreSaleEndTimestamp,
    ] = useState<bigint>(BigInt(0));
    const [
      currentActiveTokenFactoryAddress,
      setCurrentActiveTokenFactoryAddress,
    ] = useState<string>(NULL_ADDRESS);

    const [lastInactiveTokenAddress, setLastInactiveTokenAddress] =
      useState<string>(NULL_ADDRESS);
    const [lastInactiveTokenBalance, setLastInactiveTokenBalance] =
      useState<bigint>(BigInt(0));
    const [lastInactiveTokenSymbol, setLastInactiveTokenSymbol] =
      useState<string>("");

    const [isPermanentGameModalOpen, setIsPermanentGameModalOpen] =
      useState<boolean>(false); // when the token becomes always tradeable
    const [isSuccessGameModalOpen, setIsSuccessGameModalOpen] =
      useState<boolean>(false); // when the token hits the total supply threshold
    const [isFailedGameModalOpen, setIsFailedGameModalOpen] =
      useState<boolean>(false); // when the token expires via countdown

    const [isPermanentGameState, setIsPermanentGameState] =
      useState<boolean>(false); // when the token becomes always tradeable
    const [isSuccessGameState, setIsGameSuccessState] =
      useState<boolean>(false); // when the token hits the total supply threshold
    const [isFailedGameState, setIsFailedGameState] = useState<boolean>(false); // when the token expires via countdown
    const [canPlayToken, setCanPlayToken] = useState(false);
    const [isPreSaleOngoing, setIsPreSaleOngoing] = useState(false);

    const handleCanPlayToken = useCallback((value: boolean) => {
      setCanPlayToken(value);
    }, []);

    /**
     * functions to handle the state of the game when game is over
     */

    const handleIsGamePermanent = useCallback((value: boolean) => {
      setIsPermanentGameState(value);
    }, []);

    const handleIsGameSuccess = useCallback((value: boolean) => {
      setIsGameSuccessState(value);
    }, []);

    const handleIsGameFailed = useCallback((value: boolean) => {
      setIsFailedGameState(value);
    }, []);

    /**
     * functions to handle the modals for when game is over
     */

    const handleIsPermanentGameModalOpen = useCallback((value: boolean) => {
      setIsPermanentGameModalOpen(value);
    }, []);

    const handleIsSuccessGameModalOpen = useCallback((value: boolean) => {
      setIsSuccessGameModalOpen(value);
    }, []);

    const handleIsFailedGameModalOpen = useCallback((value: boolean) => {
      setIsFailedGameModalOpen(value);
    }, []);

    const handleCurrentActiveTokenEndTimestamp = useCallback(
      (value: bigint | undefined) => {
        setCurrentActiveTokenEndTimestamp(value);
      },
      []
    );

    const handleCurrentActiveTokenCreationBlockNumber = useCallback(
      (value: bigint) => {
        setCurrentActiveTokenCreationBlockNumber(value);
      },
      []
    );

    const handleCurrentActiveTokenAddress = useCallback((value: string) => {
      setCurrentActiveTokenAddress(value);
    }, []);

    const handleCurrentActiveTokenSymbol = useCallback((value: string) => {
      setCurrentActiveTokenSymbol(value);
    }, []);

    const handleCurrentActiveTokenTotalSupplyThreshold = useCallback(
      (value: bigint) => {
        setCurrentActiveTokenTotalSupplyThreshold(value);
      },
      []
    );

    const handleCurrentActiveTokenHasHitTotalSupplyThreshold = useCallback(
      (value: boolean) => {
        setCurrentActiveTokenHasHitTotalSupplyThreshold(value);
      },
      []
    );

    const handleLastInactiveTokenAddress = useCallback((value: string) => {
      setLastInactiveTokenAddress(value);
    }, []);

    const handleLastInactiveTokenBalance = useCallback((value: bigint) => {
      setLastInactiveTokenBalance(value);
    }, []);

    const handleLastInactiveTokenSymbol = useCallback((value: string) => {
      setLastInactiveTokenSymbol(value);
    }, []);

    const handleCurrentActiveTokenTotalSupply = useCallback((value: bigint) => {
      setCurrentActiveTokenTotalSupply(value);
    }, []);

    const handleCurrentActiveTokenIsAlwaysTradable = useCallback(
      (value: boolean) => {
        setCurrentActiveTokenIsAlwaysTradable(value);
      },
      []
    );

    const handleCurrentActiveTokenPreSaleEndTimestamp = useCallback(
      (value: bigint) => {
        setCurrentActiveTokenPreSaleEndTimestamp(value);
      },
      []
    );

    const handleCurrentActiveTokenFactoryAddress = useCallback(
      (value: string) => {
        setCurrentActiveTokenFactoryAddress(value);
      },
      []
    );

    const handleIsPreSaleOngoing = useCallback((value: boolean) => {
      setIsPreSaleOngoing(value);
    }, []);

    return {
      currentActiveTokenSymbol,
      currentActiveTokenAddress,
      currentActiveTokenEndTimestamp,
      currentActiveTokenTotalSupply,
      currentActiveTokenHasHitTotalSupplyThreshold,
      currentActiveTokenTotalSupplyThreshold,
      currentActiveTokenIsAlwaysTradable,
      currentActiveTokenCreationBlockNumber,
      currentActiveTokenPreSaleEndTimestamp,
      currentActiveTokenFactoryAddress,
      lastInactiveTokenAddress,
      lastInactiveTokenBalance,
      lastInactiveTokenSymbol,
      isPermanentGameModalOpen,
      isSuccessGameModalOpen,
      isFailedGameModalOpen,
      isPermanentGameState,
      isSuccessGameState,
      isFailedGameState,
      canPlayToken,
      isPreSaleOngoing,
      handleIsPreSaleOngoing,
      handleIsGamePermanent,
      handleIsGameSuccess,
      handleIsGameFailed,
      handleIsPermanentGameModalOpen,
      handleIsSuccessGameModalOpen,
      handleIsFailedGameModalOpen,
      handleCanPlayToken,
      handleCurrentActiveTokenEndTimestamp,
      handleCurrentActiveTokenCreationBlockNumber,
      handleCurrentActiveTokenFactoryAddress,
      handleCurrentActiveTokenAddress,
      handleCurrentActiveTokenSymbol,
      handleCurrentActiveTokenTotalSupplyThreshold,
      handleCurrentActiveTokenHasHitTotalSupplyThreshold,
      handleLastInactiveTokenAddress,
      handleLastInactiveTokenBalance,
      handleLastInactiveTokenSymbol,
      handleCurrentActiveTokenTotalSupply,
      handleCurrentActiveTokenIsAlwaysTradable,
      handleCurrentActiveTokenPreSaleEndTimestamp,
    };
  };
