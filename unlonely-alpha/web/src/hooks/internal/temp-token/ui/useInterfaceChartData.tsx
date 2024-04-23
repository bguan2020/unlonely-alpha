import { useState, useMemo, useEffect, useCallback } from "react";
import { ChartTokenTx } from "../../../../components/chat/VibesTokenInterface";

export const useInterfaceChartData = ({
  chartTimeIndexes,
  txs,
}: {
  chartTimeIndexes: Map<string, { index?: number }>;
  txs: ChartTokenTx[];
}) => {
  const [timeFilter, setTimeFilter] = useState<"1h" | "1d" | "all">("all");
  const [isChartPaused, setIsChartPaused] = useState(false);

  const formattedData_1h = useMemo(
    () =>
      chartTimeIndexes.get("1h") !== undefined
        ? txs.slice(chartTimeIndexes.get("1h")?.index as number)
        : txs,
    [txs, chartTimeIndexes]
  );

  const formattedData_1d = useMemo(
    () =>
      chartTimeIndexes.get("1d") !== undefined
        ? txs.slice(chartTimeIndexes.get("1d")?.index as number)
        : txs,
    [txs, chartTimeIndexes]
  );

  const formattedData = useMemo(() => {
    if (timeFilter === "1h") return formattedData_1h;
    if (timeFilter === "1d") return formattedData_1d;
    return txs;
  }, [txs, timeFilter, formattedData_1h, formattedData_1d]);

  const [pausedDataForAllTime, setPausedDataForAllTime] = useState<
    ChartTokenTx[]
  >([]);
  const [pausedData_1h, setPausedData_1h] = useState<ChartTokenTx[]>([]);
  const [pausedData_1d, setPausedData_1d] = useState<ChartTokenTx[]>([]);

  useEffect(() => {
    if (!isChartPaused) {
      setPausedDataForAllTime(txs);
    } else {
      setPausedDataForAllTime((prev) => prependStartMarker(prev));
    }
  }, [isChartPaused, txs]);

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
