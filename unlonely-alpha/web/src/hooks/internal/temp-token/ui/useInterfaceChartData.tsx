import { useState, useMemo, useEffect, useCallback } from "react";
import { ChartTokenTx } from "../../../../components/channels/vibes/VibesTokenInterface";
import { TradeableTokenTx } from "../../../../constants/types";
import { useCacheContext } from "../../../context/useCache";
import { formatUnits } from "viem";

export interface UseInterfaceChartDataType {
  isChartPaused: boolean;
  formattedData: ChartTokenTx[];
  pausedDataForAllTime: ChartTokenTx[];
  pausedData_1h: ChartTokenTx[];
  pausedData_1d: ChartTokenTx[];
  timeFilter: "1h" | "1d" | "all";
  chartTxs: ChartTokenTx[];
  handleTimeFilter: (time: "1h" | "1d" | "all") => void;
  handleIsChartPaused: (paused: boolean) => void;
}

export const useInterfaceChartData = ({
  chartTimeIndexes,
  txs,
}: {
  chartTimeIndexes: Map<string, { index?: number }>;
  txs: TradeableTokenTx[];
}): UseInterfaceChartDataType => {
  const { ethPriceInUsd } = useCacheContext();
  const [timeFilter, setTimeFilter] = useState<"1h" | "1d" | "all">("all");
  const [isChartPaused, setIsChartPaused] = useState(false);

  /**
   * CHART TRANSACTIONS, formatted to fit chart component
   */

  const chartTxs: ChartTokenTx[] = useMemo(() => {
    return txs.map((tx) => {
      return {
        user: tx.user,
        event: tx.eventName,
        amount: Number(tx.amount),
        price: tx.price,
        priceInUsd:
          ethPriceInUsd !== undefined
            ? Number(
                String(
                  Number(ethPriceInUsd) *
                    Number(formatUnits(BigInt(tx.price), 18))
                )
              )
            : 0,
        blockNumber: tx.blockNumber,
        priceChangePercentage: tx.priceChangePercentage,
      };
    });
  }, [txs, ethPriceInUsd]);

  const formattedData_1h = useMemo(
    () =>
      chartTimeIndexes.get("1h") !== undefined
        ? chartTxs.slice(chartTimeIndexes.get("1h")?.index as number)
        : chartTxs,
    [chartTxs, chartTimeIndexes]
  );

  const formattedData_1d = useMemo(
    () =>
      chartTimeIndexes.get("1d") !== undefined
        ? chartTxs.slice(chartTimeIndexes.get("1d")?.index as number)
        : chartTxs,
    [chartTxs, chartTimeIndexes]
  );

  const formattedData = useMemo(() => {
    if (timeFilter === "1h") return formattedData_1h;
    if (timeFilter === "1d") return formattedData_1d;
    return chartTxs;
  }, [chartTxs, timeFilter, formattedData_1h, formattedData_1d]);

  const [pausedDataForAllTime, setPausedDataForAllTime] = useState<
    ChartTokenTx[]
  >([]);
  const [pausedData_1h, setPausedData_1h] = useState<ChartTokenTx[]>([]);
  const [pausedData_1d, setPausedData_1d] = useState<ChartTokenTx[]>([]);

  useEffect(() => {
    if (!isChartPaused) {
      setPausedDataForAllTime(chartTxs);
    } else {
      setPausedDataForAllTime((prev) => prependStartMarker(prev));
    }
  }, [isChartPaused, chartTxs]);

  useEffect(() => {
    if (!isChartPaused) {
      setPausedData_1h(formattedData_1h);
    } else {
      setPausedData_1h((prev) => prependStartMarker(prev));
    }
  }, [isChartPaused, formattedData_1h]);

  useEffect(() => {
    if (!isChartPaused) {
      setPausedData_1d(formattedData_1d);
    } else {
      setPausedData_1d((prev) => prependStartMarker(prev));
    }
  }, [isChartPaused, formattedData_1d]);

  const handleTimeFilter = useCallback((time: "1h" | "1d" | "all") => {
    setTimeFilter(time);
  }, []);

  const handleIsChartPaused = useCallback((paused: boolean) => {
    setIsChartPaused(paused);
  }, []);

  return {
    isChartPaused,
    formattedData,
    pausedDataForAllTime,
    pausedData_1h,
    pausedData_1d,
    timeFilter,
    chartTxs,
    handleTimeFilter,
    handleIsChartPaused,
  };
};

function prependStartMarker(data: ChartTokenTx[]): ChartTokenTx[] {
  const eventNameForStartMarker = "Start"; // cannot be "Mint" or "Burn"
  if (data.length === 0 || data[0].event === eventNameForStartMarker)
    return data;
  const firstBlockNumber = data.length > 0 ? data[0].blockNumber : 0;
  const firstElement: ChartTokenTx = {
    user: eventNameForStartMarker,
    event: eventNameForStartMarker,
    amount: 0,
    price: data[0].price,
    priceInUsd: data[0].priceInUsd,
    priceChangePercentage: 0,
    blockNumber: firstBlockNumber,
  };
  return [firstElement, ...data];
}
