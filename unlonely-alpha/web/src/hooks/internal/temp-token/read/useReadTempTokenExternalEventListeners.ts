import { useState, useEffect } from "react";
import { Log, isAddressEqual } from "viem";
import { useContractEvent } from "wagmi";
import { ContractData } from "../../../../constants/types";

export const useReadTempTokenExternalEventListeners = ({
    tempTokenContract,
    lastInactiveTempTokenContract,
    onReachThresholdCallback,
    onDurationIncreaseCallback,
    onAlwaysTradeableCallback,
    onThresholdUpdateCallback,
    onSendRemainingFundsToWinnerCallback
  }: {
    tempTokenContract: ContractData;
    lastInactiveTempTokenContract: ContractData;
    onReachThresholdCallback: (newEndTimestamp: bigint) => void;
    onDurationIncreaseCallback: (newEndTimestamp: bigint) => void;
    onAlwaysTradeableCallback: () => void;
    onThresholdUpdateCallback: (newThreshold: bigint) => void;
    onSendRemainingFundsToWinnerCallback: (tokenAddress: string, tokenIsCurrent: boolean) => void;
  }) => {
    
  /**
   * listen for reach threshold event
   */

  const [
    incomingTempTokenTotalSupplyThresholdReachedLogs,
    setIncomingTempTokenTotalSupplyThresholdReachedLogs,
  ] = useState<Log[]>([]);

  useContractEvent({
    address: tempTokenContract.address,
    abi: tempTokenContract.abi,
    eventName: "TotalSupplyThresholdReached",
    listener(logs) {
      console.log("detected TotalSupplyThresholdReached event", logs);
      const init = async () => {
        setIncomingTempTokenTotalSupplyThresholdReachedLogs(logs);
      };
      init();
    },
  });

  useEffect(() => {
    if (incomingTempTokenTotalSupplyThresholdReachedLogs)
      handleTempTokenTotalSupplyThresholdReachedUpdate(
        incomingTempTokenTotalSupplyThresholdReachedLogs
      );
  }, [incomingTempTokenTotalSupplyThresholdReachedLogs]);

  const handleTempTokenTotalSupplyThresholdReachedUpdate = async (
    logs: Log[]
  ) => {
    if (logs.length === 0) return;
    const filteredLogsByTokenAddress = logs.filter((log: any) =>
      isAddressEqual(
        log.address as `0x${string}`,
        tempTokenContract.address as `0x${string}`
      )
    );
    console.log("handleTempTokenTotalSupplyThresholdReachedUpdate", logs, filteredLogsByTokenAddress)
    const sortedLogs = filteredLogsByTokenAddress.sort(
      (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
    );
    if (sortedLogs.length === 0) return;
    const latestLog: any = sortedLogs[sortedLogs.length - 1];
    const newEndTimestamp = latestLog?.args.endTimestamp as bigint;
    onReachThresholdCallback(newEndTimestamp);
  };

  /**
   * listen for duration increase event
   */

  const [
    incomingTempTokenDurationExtendedLogs,
    setIncomingTempTokenDurationExtendedLogs,
  ] = useState<Log[]>([]);

  useContractEvent({
    address: tempTokenContract.address,
    abi: tempTokenContract.abi,
    eventName: "TokenDurationExtended",
    listener(logs) {
      console.log("detected TokenDurationExtended event", logs);
      const init = async () => {
        setIncomingTempTokenDurationExtendedLogs(logs);
      };
      init();
    },
  });

  useEffect(() => {
    if (incomingTempTokenDurationExtendedLogs)
      handleTempTokenDurationExtendedUpdate(
        incomingTempTokenDurationExtendedLogs
      );
  }, [incomingTempTokenDurationExtendedLogs]);

  const handleTempTokenDurationExtendedUpdate = async (logs: Log[]) => {
    if (logs.length === 0) return;
    const filteredLogsByTokenAddress = logs.filter((log: any) =>
      isAddressEqual(
        log.address as `0x${string}`,
        tempTokenContract.address as `0x${string}`
      )
    );
    const sortedLogs = filteredLogsByTokenAddress.sort(
      (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
    );
    if (sortedLogs.length === 0) return;
    const latestLog: any = sortedLogs[sortedLogs.length - 1];
    const newEndTimestamp = latestLog?.args.endTimestamp as bigint;
    onDurationIncreaseCallback(newEndTimestamp);
  };

  /**
   * listen for always tradeable event
   */

  const [
    incomingTempTokenAlwaysTradeableSetLogs,
    setIncomingTempTokenAlwaysTradeableSetLogs,
  ] = useState<Log[]>([]);

  useContractEvent({
    address: tempTokenContract.address,
    abi: tempTokenContract.abi,
    eventName: "TokenAlwaysTradeableSet",
    listener(logs) {
      console.log("detected TokenAlwaysTradeableSet event", logs);
      const init = async () => {
        setIncomingTempTokenAlwaysTradeableSetLogs(logs);
      };
      init();
    },
  });

  useEffect(() => {
    if (incomingTempTokenAlwaysTradeableSetLogs)
      handleTempTokenAlwaysTradeableSetUpdate(
        incomingTempTokenAlwaysTradeableSetLogs
      );
  }, [incomingTempTokenAlwaysTradeableSetLogs]);

  const handleTempTokenAlwaysTradeableSetUpdate = async (logs: Log[]) => {
    if (logs.length === 0) return;
    const filteredLogsByTokenAddress = logs.filter((log: any) =>
      isAddressEqual(
        log.address as `0x${string}`,
        tempTokenContract.address as `0x${string}`
      )
    );
    const sortedLogs = filteredLogsByTokenAddress.sort(
      (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
    );
    if (sortedLogs.length === 0) return;
    onAlwaysTradeableCallback();
  };

  /**
   * listen for threshold update event
   */

  const [
    incomingTempTokenTotalSupplyThresholdUpdatedLogs,
    setIncomingTempTokenTotalSupplyThresholdUpdatedLogs,
  ] = useState<Log[]>([]);

  useContractEvent({
    address: tempTokenContract.address,
    abi: tempTokenContract.abi,
    eventName: "TotalSupplyThresholdUpdated",
    listener(logs) {
      console.log("detected TotalSupplyThresholdUpdated event", logs);
      const init = async () => {
        setIncomingTempTokenTotalSupplyThresholdUpdatedLogs(logs);
      };
      init();
    },
  });

  useEffect(() => {
    if (incomingTempTokenTotalSupplyThresholdUpdatedLogs)
      handleTempTokenTotalSupplyThresholdUpdatedUpdate(
        incomingTempTokenTotalSupplyThresholdUpdatedLogs
      );
  }, [incomingTempTokenTotalSupplyThresholdUpdatedLogs]);

  const handleTempTokenTotalSupplyThresholdUpdatedUpdate = async (
    logs: Log[]
  ) => {
    if (logs.length === 0) return;
    const filteredLogsByTokenAddress = logs.filter((log: any) =>
      isAddressEqual(
        log.address as `0x${string}`,
        tempTokenContract.address as `0x${string}`
      )
    );
    const sortedLogs = filteredLogsByTokenAddress.sort(
      (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
    );
    if (sortedLogs.length === 0) return;
    const latestLog: any = sortedLogs[sortedLogs.length - 1];
    const newThreshold = latestLog?.args.totalSupplyThreshold as bigint;
    onThresholdUpdateCallback(newThreshold);
  };

  /**
   * listen to send remaining funds to winner after token expiration events, for both current and last inactive tokens
   */

  const [
    incomingSendRemainingFundsToWinnerAfterTokenExpirationLogs,
    setIncomingSendRemainingFundsToWinnerAfterTokenExpirationLogs,
  ] = useState<Log[]>([]);

  useContractEvent({
    address: tempTokenContract.address,
    abi: tempTokenContract.abi,
    eventName: "SendRemainingFundsToWinnerAfterTokenExpiration",
    listener(logs) {
      console.log("detected SendRemainingFundsToWinnerAfterTokenExpiration event", logs);
      const init = async () => {
        setIncomingSendRemainingFundsToWinnerAfterTokenExpirationLogs(logs);
      };
      init();
    },
  });

  useContractEvent({
    address: lastInactiveTempTokenContract.address,
    abi: lastInactiveTempTokenContract.abi,
    eventName: "SendRemainingFundsToWinnerAfterTokenExpiration",
    listener(logs) {
      console.log("detected SendRemainingFundsToWinnerAfterTokenExpiration event", logs);
      const init = async () => {
        setIncomingSendRemainingFundsToWinnerAfterTokenExpirationLogs(logs);
      };
      init();
    },
  });

  useEffect(() => {
    if (incomingSendRemainingFundsToWinnerAfterTokenExpirationLogs)
      handleRemainingFundsToWinnerAfterTokenExpirationUpdate(
        incomingSendRemainingFundsToWinnerAfterTokenExpirationLogs
      );
  }, [incomingSendRemainingFundsToWinnerAfterTokenExpirationLogs]);

  const handleRemainingFundsToWinnerAfterTokenExpirationUpdate = async (logs: Log[]) => {
    if (logs.length === 0) return;
    console.log("RemainingFundsToWinnerAfterTokenExpiration listener", logs, tempTokenContract.address,  lastInactiveTempTokenContract.address)
    const filteredLogsByCurrentTokenAddress = logs.filter((log: any) =>
      isAddressEqual(
        log.address as `0x${string}`,
        tempTokenContract.address as `0x${string}`
      )
    );
    const filteredLogsByLastInactiveTokenAddress = logs.filter((log: any) =>
      isAddressEqual(
        log.address as `0x${string}`,
        lastInactiveTempTokenContract.address as `0x${string}`
      )
    );
    console.log("RemainingFundsToWinnerAfterTokenExpiration listener", filteredLogsByCurrentTokenAddress, filteredLogsByLastInactiveTokenAddress)

    if (filteredLogsByCurrentTokenAddress.length > 0) onSendRemainingFundsToWinnerCallback(tempTokenContract.address as `0x${string}`, true);
    if (filteredLogsByLastInactiveTokenAddress.length > 0) onSendRemainingFundsToWinnerCallback(lastInactiveTempTokenContract.address as `0x${string}`, false);
  }
}