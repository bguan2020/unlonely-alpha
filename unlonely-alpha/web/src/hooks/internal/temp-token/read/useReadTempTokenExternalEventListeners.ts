import { ContractData } from "../../../../constants/types";

export const useReadTempTokenExternalEventListeners = ({
  tempTokenContract,
  onReachThresholdCallback,
  onDurationIncreaseCallback,
  onAlwaysTradeableCallback,
  onThresholdUpdateCallback,
  onSendRemainingFundsToWinnerCallback,
}: {
  tempTokenContract: ContractData;
  onReachThresholdCallback: (newEndTimestamp: bigint) => void;
  onDurationIncreaseCallback: (newEndTimestamp: bigint) => void;
  onAlwaysTradeableCallback: () => void;
  onThresholdUpdateCallback: (newThreshold: bigint) => void;
  onSendRemainingFundsToWinnerCallback: (
    tokenAddress: string,
    tokenIsCurrentlyActive: boolean
  ) => void;
}) => {

  // /**
  //  * listen for duration increase event
  //  */

  // const [
  //   incomingTempTokenDurationExtendedLogs,
  //   setIncomingTempTokenDurationExtendedLogs,
  // ] = useState<Log[]>([]);

  // useContractEvent({
  //   address: tempTokenContract.address,
  //   abi: tempTokenContract.abi,
  //   eventName: "TokenDurationExtended",
  //   listener(logs) {
  //     console.log("detected TokenDurationExtended event", logs);
  //     const init = async () => {
  //       setIncomingTempTokenDurationExtendedLogs(logs);
  //     };
  //     init();
  //   },
  // });

  // useEffect(() => {
  //   if (incomingTempTokenDurationExtendedLogs)
  //     handleTempTokenDurationExtendedUpdate(
  //       incomingTempTokenDurationExtendedLogs
  //     );
  // }, [incomingTempTokenDurationExtendedLogs]);

  // const handleTempTokenDurationExtendedUpdate = async (logs: Log[]) => {
  //   if (logs.length === 0) return;
  //   const filteredLogsByTokenAddress = logs.filter((log: any) =>
  //     isAddressEqual(
  //       log.address as `0x${string}`,
  //       tempTokenContract.address as `0x${string}`
  //     )
  //   );
  //   const sortedLogs = filteredLogsByTokenAddress.sort(
  //     (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
  //   );
  //   if (sortedLogs.length === 0) return;
  //   const latestLog: any = sortedLogs[sortedLogs.length - 1];
  //   const newEndTimestamp = latestLog?.args.endTimestamp as bigint;
  //   onDurationIncreaseCallback(newEndTimestamp);
  // };

  // /**
  //  * listen for always tradeable event
  //  */

  // const [
  //   incomingTempTokenAlwaysTradeableSetLogs,
  //   setIncomingTempTokenAlwaysTradeableSetLogs,
  // ] = useState<Log[]>([]);

  // useContractEvent({
  //   address: tempTokenContract.address,
  //   abi: tempTokenContract.abi,
  //   eventName: "TokenAlwaysTradeableSet",
  //   listener(logs) {
  //     console.log("detected TokenAlwaysTradeableSet event", logs);
  //     const init = async () => {
  //       setIncomingTempTokenAlwaysTradeableSetLogs(logs);
  //     };
  //     init();
  //   },
  // });

  // useEffect(() => {
  //   if (incomingTempTokenAlwaysTradeableSetLogs)
  //     handleTempTokenAlwaysTradeableSetUpdate(
  //       incomingTempTokenAlwaysTradeableSetLogs
  //     );
  // }, [incomingTempTokenAlwaysTradeableSetLogs]);

  // const handleTempTokenAlwaysTradeableSetUpdate = async (logs: Log[]) => {
  //   if (logs.length === 0) return;
  //   const filteredLogsByTokenAddress = logs.filter((log: any) =>
  //     isAddressEqual(
  //       log.address as `0x${string}`,
  //       tempTokenContract.address as `0x${string}`
  //     )
  //   );
  //   const sortedLogs = filteredLogsByTokenAddress.sort(
  //     (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
  //   );
  //   if (sortedLogs.length === 0) return;
  //   onAlwaysTradeableCallback();
  // };

  // /**
  //  * listen for threshold update event
  //  */

  // const [
  //   incomingTempTokenTotalSupplyThresholdUpdatedLogs,
  //   setIncomingTempTokenTotalSupplyThresholdUpdatedLogs,
  // ] = useState<Log[]>([]);

  // useContractEvent({
  //   address: tempTokenContract.address,
  //   abi: tempTokenContract.abi,
  //   eventName: "TotalSupplyThresholdUpdated",
  //   listener(logs) {
  //     console.log("detected TotalSupplyThresholdUpdated event", logs);
  //     const init = async () => {
  //       setIncomingTempTokenTotalSupplyThresholdUpdatedLogs(logs);
  //     };
  //     init();
  //   },
  // });

  // useEffect(() => {
  //   if (incomingTempTokenTotalSupplyThresholdUpdatedLogs)
  //     handleTempTokenTotalSupplyThresholdUpdatedUpdate(
  //       incomingTempTokenTotalSupplyThresholdUpdatedLogs
  //     );
  // }, [incomingTempTokenTotalSupplyThresholdUpdatedLogs]);

  // const handleTempTokenTotalSupplyThresholdUpdatedUpdate = async (
  //   logs: Log[]
  // ) => {
  //   if (logs.length === 0) return;
  //   const filteredLogsByTokenAddress = logs.filter((log: any) =>
  //     isAddressEqual(
  //       log.address as `0x${string}`,
  //       tempTokenContract.address as `0x${string}`
  //     )
  //   );
  //   const sortedLogs = filteredLogsByTokenAddress.sort(
  //     (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
  //   );
  //   if (sortedLogs.length === 0) return;
  //   const latestLog: any = sortedLogs[sortedLogs.length - 1];
  //   const newThreshold = latestLog?.args.totalSupplyThreshold as bigint;
  //   onThresholdUpdateCallback(newThreshold);
  // };
};
