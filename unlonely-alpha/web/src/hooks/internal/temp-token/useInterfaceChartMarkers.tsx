import { useApolloClient } from "@apollo/client";
import { Flex, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { isAddress, formatUnits } from "viem";
import { GET_USER_QUERY } from "../../../constants/queries";
import centerEllipses from "../../../utils/centerEllipses";
import { truncateValue } from "../../../utils/tokenDisplayFormatting";
import { useCacheContext } from "../../context/useCache";
import { ChartTokenTx } from "../../../components/chat/VibesTokenInterface";

export const useInterfaceChartMarkers = (
  chartTxs: ChartTokenTx[],
  timeFilter: "1h" | "1d" | "all"
) => {
  const client = useApolloClient();
  const { ethPriceInUsd } = useCacheContext();

  const CustomDot = (props: any) => {
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
  };

  const CustomTooltip = ({ active, payload }: any) => {
    const [asyncData, setAsyncData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastDataKey, setLastDataKey] = useState<`0x${string}` | null>(null);

    useEffect(() => {
      // Early return if not active or payload is not as expected
      if (!(active && payload && payload.length && payload[0].payload.user)) {
        setLoading(false);
        return;
      }
      const handler = setTimeout(async () => {
        setLoading(true);
        if (payload[0].payload.user === lastDataKey) {
          setLoading(false);
          return;
        }

        await client
          .query({
            query: GET_USER_QUERY,
            variables: { data: { address: payload[0].payload.user } },
          })
          .then(({ data }) => {
            setAsyncData(data?.getUser?.username ?? payload[0].payload.user);
            setLastDataKey(payload[0].payload.user);
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

    const percentage = Number(
      truncateValue(payload[0].payload.priceChangePercentage, 2, true, 2, false)
    );
    return (
      <Flex
        direction="column"
        bg="rgba(0, 0, 0, 0.5)"
        p="5px"
        borderRadius="15px"
      >
        <>
          {loading ? (
            <Text color={"#ffffff"}>
              {centerEllipses(payload[0].payload.user, 10)}
            </Text>
          ) : (
            <>
              {asyncData !== null ? (
                <>
                  {isAddress(asyncData) ? (
                    <Text color={"#d7a7ff"}>
                      {centerEllipses(asyncData, 10)}
                    </Text>
                  ) : (
                    <Text color={"#d7a7ff"}>{asyncData}</Text>
                  )}
                </>
              ) : (
                <Text color={"#d7a7ff"}>
                  {centerEllipses(payload[0].payload.user, 10)}
                </Text>
              )}
            </>
          )}
        </>
        {payload[0].payload.event !== "" && (
          <>
            <Text
              color={
                payload[0].payload.event === "Mint" ? "#46a800" : "#fe2815"
              }
            >{`${
              payload[0].payload.event === "Mint" ? "Bought" : "Sold"
            } ${truncateValue(payload[0].payload.amount, 0)}`}</Text>
            {payload[0].payload.priceInUsd !== undefined ? (
              <>
                <Text>{`$${truncateValue(
                  payload[0].payload.priceInUsd,
                  4
                )}`}</Text>
                <Text fontSize="10px" opacity="0.75">{`${truncateValue(
                  formatUnits(payload[0].payload.price, 18),
                  10
                )} ETH`}</Text>
              </>
            ) : (
              <Text>{`${truncateValue(
                formatUnits(payload[0].payload.price, 18),
                10
              )} ETH`}</Text>
            )}
            {percentage !== 0 && (
              <Text
                color={
                  payload[0].payload.priceChangePercentage > 0
                    ? "#46a800"
                    : "#fe2815"
                }
              >{`${
                payload[0].payload.priceChangePercentage > 0 ? "+" : ""
              }${percentage}%`}</Text>
            )}
          </>
        )}
      </Flex>
    );
  };

  const formatYAxisTick = (tick: number) => {
    return `$${truncateValue(
      Number(formatUnits(BigInt(Math.floor(tick)), 18)) *
        Number(ethPriceInUsd ?? "0"),
      2
    )}`;
  };

  const CustomLabel = (props: any) => {
    return (
      <g>
        <text
          x={props.viewBox.x}
          y={props.viewBox.y}
          fill="#00d3c1"
          dy={10}
          fontSize={12}
        >
          {props.value}
        </text>
      </g>
    );
  };

  const customBrushFormatter = (blockNumber: number) => {
    if (chartTxs.length === 0) return 0;
    const latestBlockNumber = chartTxs[chartTxs.length - 1].blockNumber;
    const AVERAGE_BLOCK_TIME = 2;
    const timeDifferenceInSeconds =
      (latestBlockNumber - blockNumber) * AVERAGE_BLOCK_TIME;
    if (timeFilter === "all") {
      const timeDifferenceInDays = Math.floor(
        timeDifferenceInSeconds / 60 / 60 / 24
      );
      return `~${timeDifferenceInDays}d ago`;
    }

    const timeDifferenceInHours = Math.floor(timeDifferenceInSeconds / 60 / 60);
    return `~${timeDifferenceInHours}h ago`;
  };

  return {
    CustomDot,
    CustomTooltip,
    formatYAxisTick,
    CustomLabel,
    customBrushFormatter,
  };
};
