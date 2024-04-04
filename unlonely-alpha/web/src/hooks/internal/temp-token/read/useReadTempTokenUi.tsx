import { useCallback, useEffect, useState } from "react";
import { getTimeFromMillis } from "../../../../utils/time";

export type UseReadTempTokenUiType = {
  timeLeftForTempToken: string | undefined;
  isPermanentGameModalOpen: boolean;
  isSuccessGameModalOpen: boolean;
  isFailedGameModalOpen: boolean;
  onMintEvent: (totalSupply: bigint, highestTotalSupply: bigint) => void;
  onBurnEvent: (totalSupply: bigint) => void;
  onReachThresholdEvent: (newEndTimestamp: bigint) => void;
  onDurationIncreaseEvent: (newEndTimestamp: bigint) => void;
  onAlwaysTradeableEvent: () => void;
  onThresholdUpdateEvent: (newThreshold: bigint) => void;
  handleIsPermanentGameModalOpen: (value: boolean) => void;
  handleIsSuccessGameModalOpen: (value: boolean) => void;
  handleIsFailedGameModalOpen: (value: boolean) => void;
};

export const useReadTempTokenUiInitial: UseReadTempTokenUiType = {
  timeLeftForTempToken: "00:00",
  isPermanentGameModalOpen: false,
  isSuccessGameModalOpen: false,
  isFailedGameModalOpen: false,
  onMintEvent: () => undefined,
  onBurnEvent: () => undefined,
  onReachThresholdEvent: () => undefined,
  onDurationIncreaseEvent: () => undefined,
  onAlwaysTradeableEvent: () => undefined,
  onThresholdUpdateEvent: () => undefined,
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
}: {
  currentActiveTokenEndTimestamp?: bigint;
  onMintCallback: (totalSupply: bigint, highestTotalSupply: bigint) => void;
  onBurnCallback: (totalSupply: bigint) => void;
  onReachThresholdCallback: (newEndTimestamp: bigint) => void;
  onDurationIncreaseCallback: (newEndTimestamp: bigint) => void;
  onAlwaysTradeableCallback: () => void;
  onThresholdUpdateCallback: (newThreshold: bigint) => void;
}): UseReadTempTokenUiType => {
  const [timeLeftForTempToken, setTimeLeftForTempToken] = useState<
    string | undefined
  >("00:00"); // we will use undefined as the flag to initiate the expiration flow, 00:00 is the default value for when there is no token

  const [isPermanentGameModalOpen, setIsPermanentGameModalOpen] =
    useState<boolean>(false); // when the token becomes always tradeable
  const [isSuccessGameModalOpen, setIsSuccessGameModalOpen] =
    useState<boolean>(false); // when the token hits the total supply threshold
  const [isFailedGameModalOpen, setIsFailedGameModalOpen] =
    useState<boolean>(false); // when the token expires via countdown

  /**
   * token countdown
   */
  useEffect(() => {
    if (!currentActiveTokenEndTimestamp) {
      setTimeLeftForTempToken("00:00");
      return;
    }
    // Function to update the countdown
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const duration = Number(currentActiveTokenEndTimestamp) - now;

      if (duration < 0) {
        // If the duration is negative, the countdown is over
        setTimeLeftForTempToken(undefined);
        return;
      }

      // Convert duration to a readable format, e.g., HH:MM:SS
      const str = getTimeFromMillis(duration * 1000, true, true);

      setTimeLeftForTempToken(str);
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
    setIsSuccessGameModalOpen(true);
  }, []);

  const onDurationIncreaseEvent = useCallback(
    async (newEndTimestamp: bigint) => {
      onDurationIncreaseCallback(newEndTimestamp);
    },
    []
  );

  const onAlwaysTradeableEvent = useCallback(async () => {
    onAlwaysTradeableCallback();
  }, []);

  const onThresholdUpdateEvent = useCallback(async (newThreshold: bigint) => {
    onThresholdUpdateCallback(newThreshold);
  }, []);

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
    timeLeftForTempToken,
    isPermanentGameModalOpen,
    isSuccessGameModalOpen,
    isFailedGameModalOpen,
    onMintEvent,
    onBurnEvent,
    onReachThresholdEvent,
    onDurationIncreaseEvent,
    onAlwaysTradeableEvent,
    onThresholdUpdateEvent,
    handleIsPermanentGameModalOpen,
    handleIsSuccessGameModalOpen,
    handleIsFailedGameModalOpen,
  };
};
