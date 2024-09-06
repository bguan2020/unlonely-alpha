import { formatUnits } from "viem";
import { ConsolidatedTradeData } from "../components/channels/versus/VersusTempTokenChart";
import { ChartTokenTx } from "../components/channels/vibes/VibesTokenInterface";

export const consolidateChartData = (
  arr_a: ChartTokenTx[],
  arr_b: ChartTokenTx[],
  minBaseTokenPrice: bigint,
  ethPriceInUsd: string
): ConsolidatedTradeData[] => {
  const basePriceInWei = Number(minBaseTokenPrice);
  const basePriceInUsd =
    Number(ethPriceInUsd) * Number(formatUnits(minBaseTokenPrice, 18));

  const consolidatedData: ConsolidatedTradeData[] = [];
  const arr1Length = arr_a.length;
  const arr2Length = arr_b.length;
  let i = 0;
  let j = 0;
  while (i < arr1Length && j < arr2Length) {
    if (arr_a[i].blockNumber < arr_b[j].blockNumber) {
      consolidatedData.push({
        tokenATrader: arr_a[i].user,
        tokenAEvent: arr_a[i].event,
        tokenAAmount: arr_a[i].amount,
        tokenAPrice: arr_a[i].price,
        tokenAPriceInUsd: arr_a[i].priceInUsd,
        tokenAPriceChangePercentage: arr_a[i].priceChangePercentage,
        tokenBTrader: "",
        tokenBEvent: "",
        tokenBAmount: 0,
        tokenBPrice: j > 0 ? arr_b[j - 1].price : basePriceInWei,
        tokenBPriceInUsd: j > 0 ? arr_b[j - 1].priceInUsd : basePriceInUsd,
        tokenBPriceChangePercentage:
          j > 0 ? arr_b[j - 1].priceChangePercentage : 0,
        blockNumber: arr_a[i].blockNumber,
      });
      i++;
    } else if (arr_a[i].blockNumber > arr_b[j].blockNumber) {
      consolidatedData.push({
        tokenATrader: "",
        tokenAEvent: "",
        tokenAAmount: 0,
        tokenAPrice: i > 0 ? arr_a[i - 1].price : basePriceInWei,
        tokenAPriceInUsd: i > 0 ? arr_a[i - 1].priceInUsd : basePriceInUsd,
        tokenAPriceChangePercentage:
          i > 0 ? arr_a[i - 1].priceChangePercentage : 0,
        tokenBTrader: arr_b[j].user,
        tokenBEvent: arr_b[j].event,
        tokenBAmount: arr_b[j].amount,
        tokenBPrice: arr_b[j].price,
        tokenBPriceInUsd: arr_b[j].priceInUsd,
        tokenBPriceChangePercentage: arr_b[j].priceChangePercentage,
        blockNumber: arr_b[j].blockNumber,
      });
      j++;
    } else {
      consolidatedData.push({
        tokenATrader: arr_a[i].user,
        tokenAEvent: arr_a[i].event,
        tokenAAmount: arr_a[i].amount,
        tokenAPrice: arr_a[i].price,
        tokenAPriceInUsd: arr_a[i].priceInUsd,
        tokenAPriceChangePercentage: arr_a[i].priceChangePercentage,
        tokenBTrader: arr_b[j].user,
        tokenBEvent: arr_b[j].event,
        tokenBAmount: arr_b[j].amount,
        tokenBPrice: arr_b[j].price,
        tokenBPriceInUsd: arr_b[j].priceInUsd,
        tokenBPriceChangePercentage: arr_b[j].priceChangePercentage,
        blockNumber: arr_a[i].blockNumber,
      });
      i++;
      j++;
    }
  }
  while (i < arr1Length) {
    consolidatedData.push({
      tokenATrader: arr_a[i].user,
      tokenAEvent: arr_a[i].event,
      tokenAAmount: arr_a[i].amount,
      tokenAPrice: arr_a[i].price,
      tokenAPriceInUsd: arr_a[i].priceInUsd,
      tokenAPriceChangePercentage: arr_a[i].priceChangePercentage,
      tokenBTrader: "",
      tokenBEvent: "",
      tokenBAmount: 0,
      tokenBPrice: j > 0 ? arr_b[j - 1].price : basePriceInWei,
      tokenBPriceInUsd: j > 0 ? arr_b[j - 1].priceInUsd : basePriceInUsd,
      tokenBPriceChangePercentage:
        j > 0 ? arr_b[j - 1].priceChangePercentage : 0,
      blockNumber: arr_a[i].blockNumber,
    });
    i++;
  }
  while (j < arr2Length) {
    consolidatedData.push({
      tokenATrader: "",
      tokenAEvent: "",
      tokenAAmount: 0,
      tokenAPrice: i > 0 ? arr_a[i - 1].price : basePriceInWei,
      tokenAPriceInUsd: i > 0 ? arr_a[i - 1].priceInUsd : basePriceInUsd,
      tokenAPriceChangePercentage:
        i > 0 ? arr_a[i - 1].priceChangePercentage : 0,
      tokenBTrader: arr_b[j].user,
      tokenBEvent: arr_b[j].event,
      tokenBAmount: arr_b[j].amount,
      tokenBPrice: arr_b[j].price,
      tokenBPriceInUsd: arr_b[j].priceInUsd,
      tokenBPriceChangePercentage: arr_b[j].priceChangePercentage,
      blockNumber: arr_b[j].blockNumber,
    });
    j++;
  }
  return consolidatedData;
};
