import { Flex, Text } from "@chakra-ui/react";
import { useNetworkContext } from "../../../../hooks/context/useNetwork";
import { FaPause } from "react-icons/fa";
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  ReferenceLine,
  Line,
  Brush,
  Tooltip,
} from "recharts";
import {
  blockNumberDaysAgo,
  blockNumberHoursAgo,
} from "../../../../hooks/internal/useVibesCheck";
import { useInterfaceChartMarkers } from "../../../../hooks/internal/temp-token/ui/useInterfaceChartMarkers";
import { useTradeTempTokenState } from "../../../../hooks/internal/temp-token/write/useTradeTempTokenState";
import { UseInterfaceChartDataType } from "../../../../hooks/internal/temp-token/ui/useInterfaceChartData";
import { useTempTokenContext } from "../../../../hooks/context/useTempToken";
import { formatUnits } from "viem";
import { truncateValue } from "../../../../utils/tokenDisplayFormatting";
import { TempTokenExchange } from "../../temp/TempTokenExchange";
import { useMemo } from "react";
import { useCacheContext } from "../../../../hooks/context/useCache";

const ZONE_BREADTH = 0.05;
const NUMBER_OF_HOURS_IN_DAY = 24;
const NUMBER_OF_DAYS_IN_MONTH = 30;

export const TempTokenChart = ({
  interfaceChartData,
  thresholdOn,
  priceOfThreshold,
  priceOfThresholdInUsd,
  noChannelData,
  isFullChart,
}: {
  interfaceChartData: UseInterfaceChartDataType;
  thresholdOn: boolean;
  priceOfThreshold: number;
  priceOfThresholdInUsd: string;
  noChannelData?: boolean;
  isFullChart?: boolean;
}) => {
  const { tempToken } = useTempTokenContext();
  const {
    currentActiveTokenAddress,
    currentActiveTokenSymbol,
    currentActiveTokenHasHitTotalSupplyThreshold,
    currentActiveTokenTotalSupply,
    currentActiveTokenTotalSupplyThreshold,
    canPlayToken,
    tempTokenChartTimeIndexes,
    currentBlockNumberForTempTokenChart,
    tempTokenTxs,
  } = tempToken;
  const { ethPriceInUsd } = useCacheContext();

  const { network } = useNetworkContext();
  const { matchingChain } = network;

  const tradeTempTokenState = useTradeTempTokenState({
    tokenAddress: currentActiveTokenAddress,
    tokenSymbol: currentActiveTokenSymbol,
    tokenTxs: tempTokenTxs,
  });

  const {
    CustomDot,
    CustomTooltip,
    formatYAxisTick,
    CustomLabel,
    customBrushFormatter,
  } = useInterfaceChartMarkers(
    interfaceChartData.chartTxs,
    interfaceChartData.timeFilter
  );

  const formattedCurrentPrice = useMemo(
    () =>
      interfaceChartData.formattedData.length > 0
        ? formatUnits(
            BigInt(
              interfaceChartData.formattedData[
                interfaceChartData.formattedData.length - 1
              ].price
            ),
            18
          )
        : "0",
    [interfaceChartData.formattedData]
  );

  const currentPriceInUsd = useMemo(
    () =>
      ethPriceInUsd === undefined
        ? undefined
        : truncateValue(
            Number(formattedCurrentPrice) * Number(ethPriceInUsd),
            4
          ),
    [formattedCurrentPrice, ethPriceInUsd]
  );

  return (
    <>
      <Flex direction="column" w="100%" position="relative" h="60%">
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
        {interfaceChartData.pausedData_1h.length === 0 &&
          interfaceChartData.timeFilter === "1h" &&
          matchingChain && (
            <Text
              textAlign="center"
              position="absolute"
              color="gray"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
            >
              no txs in the past hour
            </Text>
          )}
        {interfaceChartData.pausedData_1d.length === 0 &&
          interfaceChartData.timeFilter === "1d" &&
          matchingChain && (
            <Text
              textAlign="center"
              position="absolute"
              color="gray"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
            >
              no txs in the past 24 hours
            </Text>
          )}
        {interfaceChartData.formattedData.length === 0 &&
          interfaceChartData.timeFilter === "all" &&
          matchingChain && (
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
        {interfaceChartData.isChartPaused && (
          <Text
            position="absolute"
            color="#626262"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            fontSize={"6rem"}
            fontWeight={"bold"}
            textAlign={"center"}
            opacity="0.5"
          >
            <FaPause />
          </Text>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={
              interfaceChartData.isChartPaused
                ? interfaceChartData.timeFilter === "all"
                  ? interfaceChartData.pausedDataForAllTime
                  : interfaceChartData.timeFilter === "1h"
                  ? interfaceChartData.pausedData_1h
                  : interfaceChartData.pausedData_1d
                : interfaceChartData.formattedData
            }
          >
            <XAxis
              hide
              dataKey="blockNumber"
              type="number"
              domain={["dataMin", "dataMax"]}
              allowDataOverflow={false}
            />
            <YAxis
              tickFormatter={formatYAxisTick}
              domain={
                currentActiveTokenTotalSupplyThreshold >
                  currentActiveTokenTotalSupply && thresholdOn
                  ? ["dataMin", priceOfThreshold * (1 + ZONE_BREADTH)]
                  : ["dataMin", "dataMax"]
              }
            />
            <Tooltip content={<CustomTooltip />} />
            {interfaceChartData.timeFilter === "all" && (
              <>
                {Array.from(tempTokenChartTimeIndexes.keys())
                  .filter((i) => i.includes("d"))
                  .map((key) => {
                    return (
                      <ReferenceLine
                        key={key}
                        strokeDasharray="3 3"
                        x={
                          tempTokenChartTimeIndexes.get(key)
                            ?.blockNumber as number
                        }
                        stroke="rgb(0, 211, 193)"
                        label={<CustomLabel value={`~${key}`} />}
                      />
                    );
                  })}
                {[...Array(NUMBER_OF_DAYS_IN_MONTH).keys()]
                  .map((i) => i + 1)
                  .filter(
                    (d) =>
                      tempTokenChartTimeIndexes.get(`${d}d`)?.blockNumber ===
                      undefined
                  )
                  .map((key) => {
                    return (
                      <ReferenceLine
                        key={key}
                        strokeDasharray="1 1"
                        x={Number(
                          blockNumberDaysAgo(
                            key,
                            currentBlockNumberForTempTokenChart
                          )
                        )}
                        stroke="rgba(0, 211, 193, 0.2)"
                      />
                    );
                  })}
              </>
            )}
            {interfaceChartData.timeFilter === "1d" && (
              <>
                {Array.from(tempTokenChartTimeIndexes.keys())
                  .filter((i) => i.includes("h"))
                  .map((key) => {
                    return (
                      <ReferenceLine
                        key={key}
                        strokeDasharray="3 3"
                        x={
                          tempTokenChartTimeIndexes.get(key)
                            ?.blockNumber as number
                        }
                        stroke="#00d3c1"
                        label={<CustomLabel value={`~${key}`} />}
                      />
                    );
                  })}
                {[...Array(NUMBER_OF_HOURS_IN_DAY).keys()]
                  .map((i) => i + 1)
                  .filter(
                    (h) =>
                      tempTokenChartTimeIndexes.get(`${h}h`)?.blockNumber ===
                      undefined
                  )
                  .map((key) => {
                    return (
                      <ReferenceLine
                        key={key}
                        strokeDasharray="1 1"
                        x={Number(
                          blockNumberHoursAgo(
                            key,
                            currentBlockNumberForTempTokenChart
                          )
                        )}
                        stroke="rgba(0, 211, 193, 0.2)"
                      />
                    );
                  })}
              </>
            )}
            {thresholdOn && (
              <ReferenceLine
                y={priceOfThreshold}
                stroke="#ff0000"
                strokeDasharray="3 3"
                label={
                  <CustomLabel value={`goal: $${priceOfThresholdInUsd}`} />
                }
              />
            )}
            <Line
              type="monotone"
              dataKey="price"
              stroke={
                currentActiveTokenHasHitTotalSupplyThreshold
                  ? "#ffd014"
                  : "#8884d8"
              }
              strokeWidth={2}
              animationDuration={200}
              dot={isFullChart ? <CustomDot /> : false}
            />
            {interfaceChartData.isChartPaused && (
              <Brush
                dataKey="blockNumber"
                height={30}
                fill={
                  interfaceChartData.isChartPaused ? "#2c2970" : "transparent"
                }
                stroke={
                  interfaceChartData.isChartPaused ? "#ada9f9" : "#5e5e6a"
                }
                tickFormatter={(tick) => customBrushFormatter(tick)}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </Flex>
      {canPlayToken && (
        <Flex direction="column" justifyContent={"space-between"} gap="5px">
          <Flex gap="10px" justifyContent={"space-evenly"}>
            <Flex direction="column">
              <Text fontSize={"12px"} color="#c6c3fc">
                Current Price
              </Text>
              {currentPriceInUsd !== undefined ? (
                <>
                  <Text color="#f3d584" fontSize="2rem">
                    ${currentPriceInUsd}
                  </Text>
                  <Text whiteSpace={"nowrap"} opacity="0.3" fontSize="14px">
                    {formattedCurrentPrice} ETH
                  </Text>
                </>
              ) : (
                <Text whiteSpace={"nowrap"} fontSize="1rem">
                  {formattedCurrentPrice} ETH
                </Text>
              )}
            </Flex>
            <Flex direction="column">
              {currentActiveTokenHasHitTotalSupplyThreshold ? (
                <Text fontSize={"12px"} color="#ffd014">
                  Target Price Reached
                </Text>
              ) : (
                <Text fontSize={"12px"} color="#c6c3fc">
                  tokens to reach goal
                </Text>
              )}
              {!currentActiveTokenHasHitTotalSupplyThreshold && (
                <>
                  <Text color="#f3d584" fontSize="2rem">
                    {truncateValue(
                      String(
                        currentActiveTokenTotalSupplyThreshold -
                          currentActiveTokenTotalSupply
                      ),
                      4
                    )}
                  </Text>
                </>
              )}
            </Flex>
          </Flex>
          <TempTokenExchange tradeTempTokenState={tradeTempTokenState} />
        </Flex>
      )}
    </>
  );
};
