import { useRef, useEffect, useState, useCallback } from "react";
import { parseAbiItem } from "viem";
import { NULL_ADDRESS } from "../../../../constants";
import { ContractData, TradeableTokenTx } from "../../../../constants/types";
import {
  blockNumberDaysAgo,
  binarySearchIndex,
  blockNumberHoursAgo,
} from "../../useVibesCheck";
import { useUser } from "../../../context/useUser";
import { useGetUserBalance } from "../../../contracts/useVibesToken";
import React from "react";

export type UseReadTempTokenTxsType = {
  tempTokenTxs: TradeableTokenTx[];
  initialTempTokenLoading: boolean;
  tempTokenChartTimeIndexes: Map<
    string,
    { index: number | undefined; blockNumber: number }
  >;
  currentBlockNumberForTempTokenChart: bigint;
  userTempTokenBalance: bigint;
  refetchUserTempTokenBalance: () => void;
  resetTempTokenTxs: () => void;
  setTempTokenTxs: React.Dispatch<React.SetStateAction<TradeableTokenTx[]>>;
  getTempTokenEvents: (
    tempTokenContract: ContractData,
    fromBlock: bigint,
    toBlock: bigint
  ) => Promise<void>;
};

export const useReadTempTokenTxsInitial = {
  tempTokenTxs: [],
  initialTempTokenLoading: true,
  tempTokenChartTimeIndexes: new Map(),
  currentBlockNumberForTempTokenChart: BigInt(0),
  userTempTokenBalance: BigInt(0),
  refetchUserTempTokenBalance: () => undefined,
  resetTempTokenTxs: () => undefined,
  setTempTokenTxs: () => undefined,
  getTempTokenEvents: async () => undefined,
};

/**
 *
 * This hook is used to track the transactions of a temp token in real time, and update the chart data accordingly.
 */
export const useReadTempTokenTxs = ({
  tokenCreationBlockNumber,
  tokenSymbol,
  baseClient,
  tempTokenContract,
  onMintCallback, // passed in from the parent component to trigger ui changes
  onBurnCallback, // passed in from the parent component to trigger ui changes
}: {
  tokenCreationBlockNumber: bigint;
  tokenSymbol: string;
  baseClient: any;
  tempTokenContract: ContractData;
  onMintCallback: (totalSupply: bigint, highestTotalSupply: bigint) => void;
  onBurnCallback: (totalSupply: bigint) => void;
}): UseReadTempTokenTxsType => {
  const { userAddress } = useUser();
  const fetching = useRef(false);
  const [tempTokenTxs, setTempTokenTxs] = useState<TradeableTokenTx[]>([]);
  const [initialTempTokenLoading, setInitialTempTokenLoading] = useState(true);

  const [tempTokenChartTimeIndexes, setTempTokenChartTimeIndexes] = useState<
    Map<string, { index: number | undefined; blockNumber: number }>
  >(new Map());
  const [
    currentBlockNumberForTempTokenChart,
    setCurrentBlockNumberForTempTokenChart,
  ] = useState<bigint>(BigInt(0));

  /**
   * BALANCES of TempToken and ETH for the user
   */

  const {
    balance: userTempTokenBalance,
    refetch: refetchUserTempTokenBalance,
  } = useGetUserBalance(userAddress as `0x${string}`, tempTokenContract);

  const getTempTokenEvents = useCallback(
    async (
      tempTokenContract: ContractData,
      fromBlock: bigint,
      toBlock: bigint
    ) => {
      const [mintLogs, burnLogs] = await Promise.all([
        baseClient.getLogs({
          address: tempTokenContract.address,
          event: parseAbiItem(
            "event Mint(address indexed account, uint256 amount, address indexed streamerAddress, address indexed tokenAddress, uint256 totalSupply, uint256 protocolFeePercent, uint256 streamerFeePercent, uint256 endTimestamp, bool hasHitTotalSupplyThreshold, uint256 highestTotalSupply)"
          ),
          fromBlock,
          toBlock: toBlock === BigInt(0) ? undefined : toBlock,
        }),
        baseClient.getLogs({
          address: tempTokenContract.address,
          event: parseAbiItem(
            "event Burn(address indexed account, uint256 amount, address indexed streamerAddress, address indexed tokenAddress, uint256 totalSupply, uint256 protocolFeePercent, uint256 streamerFeePercent)"
          ),
          fromBlock,
          toBlock: toBlock === BigInt(0) ? undefined : toBlock,
        }),
      ]);
      console.log(
        `temp token mintLogs length from ${tempTokenContract.address}`,
        mintLogs.length
      );
      console.log(
        `temp token burnLogs length from ${tempTokenContract.address}`,
        burnLogs.length
      );
      const logs = [...mintLogs, ...burnLogs];
      logs.sort((a, b) => {
        if (a.blockNumber === null || b.blockNumber === null) return 0;
        if (a.blockNumber < b.blockNumber) return -1;
        if (a.blockNumber > b.blockNumber) return 1;
        return 0;
      });
      const _tokenTxs: TradeableTokenTx[] = [];
      const previousFetchedTx =
        tempTokenTxs.length > 0
          ? tempTokenTxs[tempTokenTxs.length - 1]
          : undefined;
      for (let i = 0; i < logs.length; i++) {
        const event = logs[i];
        const n = Number(event.args.totalSupply as bigint);
        const n_ = Math.max(n - 1, 0);
        const priceForCurrent = Math.floor((n * (n + 1) * (2 * n + 1)) / 6);
        const priceForPrevious = Math.floor((n_ * (n_ + 1) * (2 * n_ + 1)) / 6);
        const newPrice = priceForCurrent - priceForPrevious;
        const previousTxPrice =
          i === 0
            ? previousFetchedTx?.price ?? 0
            : _tokenTxs.length > 0
            ? _tokenTxs[_tokenTxs.length - 1].price
            : 0;
        const priceChangePercentage =
          previousTxPrice > 0
            ? ((newPrice - previousTxPrice) / previousTxPrice) * 100
            : 0;
        const tx: TradeableTokenTx = {
          eventName: event.eventName,
          user: event.args.account as `0x${string}`,
          amount: event.args.amount as bigint,
          price: newPrice,
          blockNumber: Number(event.blockNumber),
          supply: event.args.totalSupply as bigint,
          priceChangePercentage,
        };
        _tokenTxs.push(tx);
      }
      setTempTokenTxs((prev) => [...prev, ..._tokenTxs]);
    },
    []
  );

  // on mount or newly detected token's creationBlockNumber, fetch for logs to populate historical transactions on the chart
  useEffect(() => {
    const init = async () => {
      if (
        fetching.current ||
        tempTokenTxs.length > 0 ||
        !baseClient ||
        !tempTokenContract.address ||
        tempTokenContract.address === NULL_ADDRESS
      ) {
        fetching.current = false;
        return;
      }
      fetching.current = true;
      const blockNumber = await baseClient.getBlockNumber();
      await getTempTokenEvents(
        tempTokenContract,
        tokenCreationBlockNumber,
        blockNumber
      );
      fetching.current = false;
      setInitialTempTokenLoading(false);
    };
    init();
  }, [tempTokenContract, tokenCreationBlockNumber, baseClient]);

  // For every new transaction, organize chart time indexes for the time filter functionality based on chart txs
  useEffect(() => {
    const init = async () => {
      if (tempTokenTxs.length === 0) return;

      const _currentBlockNumberForTempTokenChart =
        await baseClient.getBlockNumber();

      const daysArr = [1, 7, 14, 21, 28, 30, 60, 90, 180, 365];

      const blockNumbersInDaysAgoArr = daysArr.map((days) =>
        blockNumberDaysAgo(days, _currentBlockNumberForTempTokenChart)
      );

      const dayIndex =
        blockNumbersInDaysAgoArr[0] < tokenCreationBlockNumber
          ? undefined
          : binarySearchIndex(
              tempTokenTxs,
              BigInt(blockNumbersInDaysAgoArr[0])
            );

      const hoursArr = [1, 6, 12, 18];
      const blockNumbersInHoursAgoArr = hoursArr.map((hours) =>
        blockNumberHoursAgo(hours, _currentBlockNumberForTempTokenChart)
      );

      const hourIndex =
        blockNumbersInHoursAgoArr[0] < tokenCreationBlockNumber
          ? undefined
          : binarySearchIndex(
              tempTokenTxs,
              BigInt(blockNumbersInHoursAgoArr[0])
            );
      setCurrentBlockNumberForTempTokenChart(
        _currentBlockNumberForTempTokenChart
      );
      // adding 1day separately to account for day index
      const offset = 1;
      setTempTokenChartTimeIndexes(
        new Map<string, { index: number | undefined; blockNumber: number }>([
          [
            `${hoursArr[0]}h`,
            {
              index: hourIndex,
              blockNumber: Number(blockNumbersInHoursAgoArr[0]),
            },
          ],
          ...blockNumbersInHoursAgoArr
            .slice(offset)
            .map<[string, { index: undefined; blockNumber: number }]>(
              (blockNumber, slicedIndex) => {
                const index = slicedIndex + offset;
                return [
                  `${hoursArr[index]}h`,
                  { index: undefined, blockNumber: Number(blockNumber) },
                ];
              }
            ),
          [
            `${daysArr[0]}d`,
            {
              index: dayIndex,
              blockNumber: Number(blockNumbersInDaysAgoArr[0]),
            },
          ],
          ...blockNumbersInDaysAgoArr
            .slice(offset)
            .map<[string, { index: undefined; blockNumber: number }]>(
              (blockNumber, slicedIndex) => {
                const index = slicedIndex + offset;
                return [
                  `${daysArr[index]}d`,
                  { index: undefined, blockNumber: Number(blockNumber) },
                ];
              }
            ),
        ])
      );
      /**
       * After all of this, we'd get a mapping like this:
       * {
       *  "101": { index: 123, blockNumber: 123456 },
       * "30d": { index: 123, blockNumber: 123456 },
       * "1h": { index: undefined, blockNumber: 123456 },
       * "5h": { index: undefined, blockNumber: 123456 },
       * "15h": { index: undefined, blockNumber: 123456 },
       * "45h": { index: undefined, blockNumber: 123456 },
       * "60h": { index: undefined, blockNumber: 123456 },
       *
       * objects whose index properties are defined will be used to for the time filter
       */
    };
    init();
  }, [tempTokenTxs.length]);

  const resetTempTokenTxs = useCallback(() => {
    setTempTokenTxs([]);
    setTempTokenChartTimeIndexes(new Map());
    setCurrentBlockNumberForTempTokenChart(BigInt(0));
  }, []);

  return {
    tempTokenTxs,
    initialTempTokenLoading,
    tempTokenChartTimeIndexes,
    currentBlockNumberForTempTokenChart,
    userTempTokenBalance,
    refetchUserTempTokenBalance,
    resetTempTokenTxs,
    setTempTokenTxs,
    getTempTokenEvents,
  };
};
