import { useCallback, useEffect, useState } from "react";

export type UseReadTempTokenUiType = {
  durationLeftForTempToken: number | undefined;
  isPermanentGameModalOpen: boolean;
  isSuccessGameModalOpen: boolean;
  isFailedGameModalOpen: boolean;
  isPermanentGameState: boolean;
  isSuccessGameState: boolean;
  isFailedGameState: boolean;
  onMintEvent: (totalSupply: bigint, highestTotalSupply: bigint) => void;
  onBurnEvent: (totalSupply: bigint) => void;
  onReachThresholdEvent: (newEndTimestamp: bigint) => void;
  onDurationIncreaseEvent: (newEndTimestamp: bigint) => void;
  onAlwaysTradeableEvent: () => void;
  onThresholdUpdateEvent: (newThreshold: bigint) => void;
  onSendRemainingFundsToWinnerEvent: (
    tokenAddress: string,
    tokenIsCurrent: boolean
  ) => void;
  handleIsGamePermanent: (value: boolean) => void;
  handleIsGameSuccess: (value: boolean) => void;
  handleIsGameFailed: (value: boolean) => void;
  handleIsPermanentGameModalOpen: (value: boolean) => void;
  handleIsSuccessGameModalOpen: (value: boolean) => void;
  handleIsFailedGameModalOpen: (value: boolean) => void;
};

export const useReadTempTokenUiInitial: UseReadTempTokenUiType = {
  durationLeftForTempToken: 0,
  isPermanentGameModalOpen: false,
  isSuccessGameModalOpen: false,
  isFailedGameModalOpen: false,
  isPermanentGameState: false,
  isSuccessGameState: false,
  isFailedGameState: false,
  onMintEvent: () => undefined,
  onBurnEvent: () => undefined,
  onReachThresholdEvent: () => undefined,
  onDurationIncreaseEvent: () => undefined,
  onAlwaysTradeableEvent: () => undefined,
  onThresholdUpdateEvent: () => undefined,
  onSendRemainingFundsToWinnerEvent: () => undefined,
  handleIsGamePermanent: () => undefined,
  handleIsGameSuccess: () => undefined,
  handleIsGameFailed: () => undefined,
  handleIsPermanentGameModalOpen: () => undefined,
  handleIsSuccessGameModalOpen: () => undefined,
  handleIsFailedGameModalOpen: () => undefined,
};

export const useReadTempTokenUi = ({
  currentActiveTokenEndTimestamp,
  onMintCallback,
  onBurnCallback,
  onReachThresholdCallback,
  onDurationIncreaseCallback,
  onAlwaysTradeableCallback,
  onThresholdUpdateCallback,
  onSendRemainingFundsToWinnerCallback,
}: {
  currentActiveTokenEndTimestamp?: bigint;
  onMintCallback: (totalSupply: bigint, highestTotalSupply: bigint) => void;
  onBurnCallback: (totalSupply: bigint) => void;
  onReachThresholdCallback: (newEndTimestamp: bigint) => void;
  onDurationIncreaseCallback: (newEndTimestamp: bigint) => void;
  onAlwaysTradeableCallback: () => void;
  onThresholdUpdateCallback: (newThreshold: bigint) => void;
  onSendRemainingFundsToWinnerCallback: (
    tokenAddress: string,
    tokenIsCurrent: boolean
  ) => void;
}): UseReadTempTokenUiType => {
  const [durationLeftForTempToken, setDurationLeftForTempToken] = useState<
    number | undefined
  >(0); // notes the seconds that the token has remaining, we will use undefined as the flag to initiate the expiration flow, 0 is the default value for when there is no token

  const [isPermanentGameModalOpen, setIsPermanentGameModalOpen] =
    useState<boolean>(false); // when the token becomes always tradeable
  const [isSuccessGameModalOpen, setIsSuccessGameModalOpen] =
    useState<boolean>(false); // when the token hits the total supply threshold
  const [isFailedGameModalOpen, setIsFailedGameModalOpen] =
    useState<boolean>(false); // when the token expires via countdown

  const [isPermanentGameState, setIsPermanentGameState] =
    useState<boolean>(false); // when the token becomes always tradeable
  const [isSuccessGameState, setIsGameSuccessState] = useState<boolean>(false); // when the token hits the total supply threshold
  const [isFailedGameState, setIsFailedGameState] = useState<boolean>(false); // when the token expires via countdown

  /**
   * token countdown
   */
  useEffect(() => {
    // if currentActiveTokenEndTimestamp is undefined or is BigInt(0), then the token is not active, so set duration to 0
    if (!currentActiveTokenEndTimestamp) {
      setDurationLeftForTempToken(0);
      return;
    }
    // if currentActiveTokenEndTimestamp greater than BigInt(0), then the token is not active,
    // so duration will be a number greater than 0 and durationLeft will follow suit,
    // but if duration becomes negative, then durationLeft will become undefined

    // Function to update the countdown
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const _duration = Number(currentActiveTokenEndTimestamp) - now;

      if (_duration < 0) {
        // If the duration is negative, the countdown is over and the game can no longer be played
        setDurationLeftForTempToken(undefined);
        return;
      }

      setDurationLeftForTempToken(_duration);
    };

    // Initial update
    updateCountdown();

    // Set the interval to update the countdown every X seconds
    const interval = setInterval(updateCountdown, 1 * 1000);

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, [currentActiveTokenEndTimestamp]);

  /**
   * functions to run when specific events are detected
   */
  const onMintEvent = useCallback(
    async (totalSupply: bigint, highestTotalSupply: bigint) => {
      onMintCallback(totalSupply, highestTotalSupply);
    },
    []
  );

  const onBurnEvent = useCallback(async (totalSupply: bigint) => {
    onBurnCallback(totalSupply);
  }, []);

  const onReachThresholdEvent = useCallback(async (newEndTimestamp: bigint) => {
    onReachThresholdCallback(newEndTimestamp);
    handleIsGameSuccess(true);
    handleIsSuccessGameModalOpen(true);
  }, []);

  const onDurationIncreaseEvent = useCallback(
    async (newEndTimestamp: bigint) => {
      onDurationIncreaseCallback(newEndTimestamp);
    },
    []
  );

  const onAlwaysTradeableEvent = useCallback(async () => {
    onAlwaysTradeableCallback();
    handleIsGamePermanent(true);
    handleIsPermanentGameModalOpen(true);
  }, []);

  const onThresholdUpdateEvent = useCallback(async (newThreshold: bigint) => {
    onThresholdUpdateCallback(newThreshold);
  }, []);

  const onSendRemainingFundsToWinnerEvent = useCallback(
    async (tokenAddress: string, tokenIsCurrent: boolean) => {
      onSendRemainingFundsToWinnerCallback(tokenAddress, tokenIsCurrent);
    },
    []
  );

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

  return {
    durationLeftForTempToken,
    isPermanentGameModalOpen,
    isSuccessGameModalOpen,
    isFailedGameModalOpen,
    isPermanentGameState,
    isSuccessGameState,
    isFailedGameState,
    onMintEvent,
    onBurnEvent,
    onReachThresholdEvent,
    onDurationIncreaseEvent,
    onAlwaysTradeableEvent,
    onThresholdUpdateEvent,
    onSendRemainingFundsToWinnerEvent,
    handleIsGamePermanent,
    handleIsGameSuccess,
    handleIsGameFailed,
    handleIsPermanentGameModalOpen,
    handleIsSuccessGameModalOpen,
    handleIsFailedGameModalOpen,
  };
};
