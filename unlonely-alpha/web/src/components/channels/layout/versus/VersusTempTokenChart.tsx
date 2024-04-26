import { Flex, Text } from "@chakra-ui/react";
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Line,
  Tooltip,
} from "recharts";
import { useInterfaceChartData } from "../../../../hooks/internal/temp-token/ui/useInterfaceChartData";
import { useNetworkContext } from "../../../../hooks/context/useNetwork";
import { useVersusTempTokenContext } from "../../../../hooks/context/useVersusTempToken";
import { useEffect, useMemo, useState } from "react";
import { ChartTokenTx } from "../../../chat/VibesTokenInterface";
import { useCacheContext } from "../../../../hooks/context/useCache";
import { formatUnits, isAddress } from "viem";
import { truncateValue } from "../../../../utils/tokenDisplayFormatting";
import { GET_USER_QUERY } from "../../../../constants/queries";
import centerEllipses from "../../../../utils/centerEllipses";
import { useApolloClient } from "@apollo/client";

export type ConsolidatedTradeData = {
  tokenATrader: string;
  tokenAEvent: string;
  tokenAAmount: number;
  tokenAPrice: number;
  tokenAPriceInUsd: number;
  tokenAPriceChangePercentage: number;
  tokenBTrader: string;
  tokenBEvent: string;
  tokenBAmount: number;
  tokenBPrice: number;
  tokenBPriceInUsd: number;
  tokenBPriceChangePercentage: number;
  blockNumber: number;
};

const sampleTokenATxs: ChartTokenTx[] = [
  {
    user: "a",
    event: "Mint",
    amount: 1,
    price: 1,
    priceInUsd: 1,
    priceChangePercentage: 1,
    blockNumber: 1,
  },
  {
    user: "b",
    event: "Burn",
    amount: 2,
    price: 2,
    priceInUsd: 2,
    priceChangePercentage: 2,
    blockNumber: 1,
  },
  {
    user: "c",
    event: "Mint",
    amount: 3,
    price: 4,
    priceInUsd: 3,
    priceChangePercentage: 3,
    blockNumber: 3,
  },
  {
    user: "d",
    event: "Mint",
    amount: 4,
    price: 6,
    priceInUsd: 4,
    priceChangePercentage: 4,
    blockNumber: 5,
  },
  {
    user: "d",
    event: "Mint",
    amount: 4,
    price: 8,
    priceInUsd: 4,
    priceChangePercentage: 4,
    blockNumber: 6,
  },
  {
    user: "d",
    event: "Mint",
    amount: 4,
    price: 11,
    priceInUsd: 4,
    priceChangePercentage: 4,
    blockNumber: 10,
  },
];

const sampleTokenBTxs: ChartTokenTx[] = [
  {
    user: "a",
    event: "Mint",
    amount: 1,
    price: 3,
    priceInUsd: 1,
    priceChangePercentage: 1,
    blockNumber: 2,
  },
  {
    user: "b",
    event: "Burn",
    amount: 2,
    price: 5,
    priceInUsd: 2,
    priceChangePercentage: 2,
    blockNumber: 4,
  },
  {
    user: "c",
    event: "Mint",
    amount: 3,
    price: 7,
    priceInUsd: 3,
    priceChangePercentage: 3,
    blockNumber: 5,
  },
  {
    user: "d",
    event: "Mint",
    amount: 4,
    price: 9,
    priceInUsd: 4,
    priceChangePercentage: 4,
    blockNumber: 7,
  },
  {
    user: "d",
    event: "Mint",
    amount: 4,
    price: 10,
    priceInUsd: 4,
    priceChangePercentage: 4,
    blockNumber: 7,
  },
  {
    user: "d",
    event: "Burn",
    amount: 4,
    price: 7,
    priceInUsd: 4,
    priceChangePercentage: 4,
    blockNumber: 10,
  },
  {
    user: "d",
    event: "Burn",
    amount: 4,
    price: 6,
    priceInUsd: 4,
    priceChangePercentage: 4,
    blockNumber: 10,
  },
];

export const VersusTempTokenChart = ({
  noChannelData,
  isFullChart,
}: {
  noChannelData?: boolean;
  isFullChart?: boolean;
}) => {
  const { ethPriceInUsd } = useCacheContext();
  const { tokenA, tokenB } = useVersusTempTokenContext();
  const { network } = useNetworkContext();
  const { matchingChain } = network;

  const tokenAChartData = useInterfaceChartData({
    chartTimeIndexes: new Map<string, { index?: number }>(),
    txs: tokenA.tempTokenTxs,
  });

  const tokenBChartData = useInterfaceChartData({
    chartTimeIndexes: new Map<string, { index?: number }>(),
    txs: tokenB.tempTokenTxs,
  });

  const client = useApolloClient();

  const CustomTooltip = ({ active, payload }: any) => {
    const [asyncData, setAsyncData] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [lastDataKey, setLastDataKey] = useState<`0x${string}` | null>(null);

    useEffect(() => {
      // Early return if not active or payload is not as expected
      if (
        !(
          active &&
          payload &&
          payload.length &&
          (payload[0].payload.tokenATrader || payload[0].payload.tokenBTrader)
        )
      ) {
        setLoading(false);
        return;
      }
      const handler = setTimeout(async () => {
        setLoading(true);
        const dataKey = payload[0].payload.tokenATrader.concat(
          payload[0].payload.tokenBTrader
        );
        if (dataKey === lastDataKey) {
          setLoading(false);
          return;
        }

        const userPromises = [];
        if (payload[0].payload.tokenATrader) {
          userPromises.push(
            client.query({
              query: GET_USER_QUERY,
              variables: { data: { address: payload[0].payload.tokenATrader } },
            })
          );
        }
        if (payload[0].payload.tokenBTrader) {
          userPromises.push(
            client.query({
              query: GET_USER_QUERY,
              variables: { data: { address: payload[0].payload.tokenBTrader } },
            })
          );
        }

        await Promise.all(userPromises).then((results) => {
          const userNames: string[] = results.map((result, i) => {
            return (
              result.data?.getUser?.username ??
              (i === 0
                ? payload[0].payload.tokenATrader
                : payload[0].payload.tokenBTrader)
            );
          });
          setAsyncData(userNames.join(","));
          setLastDataKey(dataKey);
          setLoading(false);
        });
      }, 300);

      return () => {
        clearTimeout(handler);
      };
    }, [active, payload, lastDataKey]);

    // Conditional rendering moved outside of hook logic
    if (!(active && payload && payload.length)) {
      return null;
    }

    const percentageA = Number(
      truncateValue(
        payload[0].payload.tokenAPriceChangePercentage,
        2,
        true,
        2,
        false
      )
    );

    const percentageB = Number(
      truncateValue(
        payload[0].payload.tokenBPriceChangePercentage,
        2,
        true,
        2,
        false
      )
    );

    return (
      <Flex
        direction="column"
        bg="rgba(0, 0, 0, 0.5)"
        p="5px"
        gap="10px"
        borderRadius="15px"
      >
        <Flex direction="column">
          <Text>
            {!loading && asyncData !== null ? (
              <>
                {isAddress(asyncData.split(",")[0]) ? (
                  <Text color={"#d7a7ff"}>
                    {centerEllipses(asyncData.split(",")[0], 10)}
                  </Text>
                ) : (
                  <Text color={"#d7a7ff"}>{asyncData.split(",")[0]}</Text>
                )}
              </>
            ) : (
              <Text color={"#ffffff"}>
                {centerEllipses(payload[0].payload.tokenATrader, 10)}
              </Text>
            )}
          </Text>
          {payload[0].payload.tokenAEvent !== "" && (
            <>
              <Text
                color={
                  payload[0].payload.tokenAEvent === "Mint"
                    ? "#46a800"
                    : "#fe2815"
                }
              >{`${
                payload[0].payload.tokenAEvent === "Mint" ? "Bought" : "Sold"
              } ${truncateValue(payload[0].payload.tokenAAmount, 0)}`}</Text>
              {payload[0].payload.tokenAPriceInUsd !== undefined ? (
                <>
                  <Text>{`$${truncateValue(
                    payload[0].payload.tokenAPriceInUsd,
                    4
                  )}`}</Text>
                  <Text fontSize="10px" opacity="0.75">{`${truncateValue(
                    formatUnits(payload[0].payload.tokenAPrice, 18),
                    10
                  )} ETH`}</Text>
                </>
              ) : (
                <Text>{`${truncateValue(
                  formatUnits(payload[0].payload.tokenAPrice, 18),
                  10
                )} ETH`}</Text>
              )}
              {percentageA !== 0 && (
                <Text
                  color={
                    payload[0].payload.tokenAPriceChangePercentage > 0
                      ? "#46a800"
                      : "#fe2815"
                  }
                >{`${
                  payload[0].payload.priceChangePercentage > 0 ? "+" : ""
                }${percentageA}%`}</Text>
              )}
            </>
          )}
        </Flex>
        <Flex direction="column">
          <Text>
            {!loading && asyncData !== null ? (
              <>
                {isAddress(asyncData.split(",")[1]) ? (
                  <Text color={"#d7a7ff"}>
                    {centerEllipses(asyncData.split(",")[1], 10)}
                  </Text>
                ) : (
                  <Text color={"#d7a7ff"}>{asyncData.split(",")[1]}</Text>
                )}
              </>
            ) : (
              <Text color={"#ffffff"}>
                {centerEllipses(payload[0].payload.tokenBTrader, 10)}
              </Text>
            )}
          </Text>
          {payload[0].payload.tokenBEvent !== "" && (
            <>
              <Text
                color={
                  payload[0].payload.tokenBEvent === "Mint"
                    ? "#46a800"
                    : "#fe2815"
                }
              >{`${
                payload[0].payload.tokenBEvent === "Mint" ? "Bought" : "Sold"
              } ${truncateValue(payload[0].payload.tokenBAmount, 0)}`}</Text>
              {payload[0].payload.tokenBPriceInUsd !== undefined ? (
                <>
                  <Text>{`$${truncateValue(
                    payload[0].payload.tokenBPriceInUsd,
                    4
                  )}`}</Text>
                  <Text fontSize="10px" opacity="0.75">{`${truncateValue(
                    formatUnits(payload[0].payload.tokenBPrice, 18),
                    10
                  )} ETH`}</Text>
                </>
              ) : (
                <Text>{`${truncateValue(
                  formatUnits(payload[0].payload.tokenBPrice, 18),
                  10
                )} ETH`}</Text>
              )}
              {percentageB !== 0 && (
                <Text
                  color={
                    payload[0].payload.tokenBPriceChangePercentage > 0
                      ? "#46a800"
                      : "#fe2815"
                  }
                >{`${
                  payload[0].payload.priceChangePercentage > 0 ? "+" : ""
                }${percentageB}%`}</Text>
              )}
            </>
          )}
        </Flex>
      </Flex>
    );
  };

  const consolidatedChartData = useMemo(() => {
    // return consolidateChartData(
    //   tokenAChartData.chartTxs,
    //   tokenBChartData.chartTxs
    // );
    const res = consolidateChartData(sampleTokenATxs, sampleTokenBTxs);
    console.log(res);
    return res;
  }, [tokenAChartData.chartTxs, tokenBChartData.chartTxs]);

  return (
    <Flex gap="10px" flex="1" h="100%" direction="column">
      <Flex direction="column" w="100%" position="relative" h="100%">
        {noChannelData && (
          <Text
            textAlign="center"
            position="absolute"
            color="gray"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
          >
            could not fetch channel data
          </Text>
        )}
        {consolidatedChartData.length === 0 && matchingChain && (
          <Text
            textAlign="center"
            position="absolute"
            color="gray"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
          >
            no txs
          </Text>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={consolidatedChartData}>
            <XAxis
              hide
              dataKey="blockNumber"
              type="number"
              domain={["dataMin", "dataMax"]}
              allowDataOverflow={false}
            />
            <YAxis
              tickFormatter={(tick: number) => {
                return `$${truncateValue(
                  Number(formatUnits(BigInt(Math.floor(tick)), 18)) *
                    Number(ethPriceInUsd ?? "0"),
                  2
                )}`;
              }}
              domain={["dataMin", "dataMax"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="tokenAPrice"
              stroke={"rgba(255, 36, 36, 1)"}
              strokeWidth={2}
              animationDuration={200}
              dot={
                isFullChart
                  ? (props: any) => {
                      const { cx, cy, stroke, payload } = props;
                      // Change the dot stroke color based on the value
                      const dotStroke =
                        payload.event === "Mint"
                          ? "#00ff0d"
                          : payload.event === "Burn"
                          ? "#ff0000"
                          : "#ffffff";

                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={3}
                          fill={stroke}
                          stroke={dotStroke}
                          strokeWidth={2}
                        />
                      );
                    }
                  : false
              }
            />
            <Line
              type="monotone"
              dataKey="tokenBPrice"
              stroke={"rgba(42, 217, 255, 1)"}
              strokeWidth={2}
              animationDuration={200}
              dot={
                isFullChart
                  ? (props: any) => {
                      const { cx, cy, stroke, payload } = props;
                      // Change the dot stroke color based on the value
                      const dotStroke =
                        payload.event === "Mint"
                          ? "#00ff0d"
                          : payload.event === "Burn"
                          ? "#ff0000"
                          : "#ffffff";

                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={3}
                          fill={stroke}
                          stroke={dotStroke}
                          strokeWidth={2}
                        />
                      );
                    }
                  : false
              }
            />
          </LineChart>
        </ResponsiveContainer>
      </Flex>
    </Flex>
  );
};

const consolidateChartData = (
  arr_a: ChartTokenTx[],
  arr_b: ChartTokenTx[]
): ConsolidatedTradeData[] => {
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
        tokenBPrice: j > 0 ? arr_b[j - 1].price : 0,
        tokenBPriceInUsd: j > 0 ? arr_b[j - 1].priceInUsd : 0,
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
        tokenAPrice: i > 0 ? arr_a[i - 1].price : 0,
        tokenAPriceInUsd: i > 0 ? arr_a[i - 1].priceInUsd : 0,
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
      tokenBPrice: j > 0 ? arr_b[j - 1].price : 0,
      tokenBPriceInUsd: j > 0 ? arr_b[j - 1].priceInUsd : 0,
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
      tokenAPrice: i > 0 ? arr_a[i - 1].price : 0,
      tokenAPriceInUsd: i > 0 ? arr_a[i - 1].priceInUsd : 0,
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
