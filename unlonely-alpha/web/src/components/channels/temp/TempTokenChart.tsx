import { Flex, Text, Button, Tooltip as ChakraTooltip } from "@chakra-ui/react";
import { useNetworkContext } from "../../../hooks/context/useNetwork";
import { FaPause } from "react-icons/fa";
import { FaMagnifyingGlassChart } from "react-icons/fa6";
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
} from "../../../hooks/internal/useVibesCheck";
import { useInterfaceChartMarkers } from "../../../hooks/internal/temp-token/ui/useInterfaceChartMarkers";
import { UseInterfaceChartDataType } from "../../../hooks/internal/temp-token/ui/useInterfaceChartData";
import { useTempTokenContext } from "../../../hooks/context/useTempToken";
import { formatUnits } from "viem";
import { truncateValue } from "../../../utils/tokenDisplayFormatting";
import { TempTokenExchange } from "../temp/TempTokenExchange";
import { useMemo, useState } from "react";
import { useCacheContext } from "../../../hooks/context/useCache";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { useOwnerUpdateTotalSupplyThresholdState } from "../../../hooks/internal/temp-token/write/useOwnerUpdateTotalSupplyThresholdState";
import useUserAgent from "../../../hooks/internal/useUserAgent";
import { SingleTempTokenTimerView } from "../temp/TempTokenTimerView";
import { useUser } from "../../../hooks/context/useUser";

export const ZONE_BREADTH = 0.05;
export const NUMBER_OF_HOURS_IN_DAY = 24;
export const NUMBER_OF_DAYS_IN_MONTH = 30;

export const TempTokenChart = ({
  interfaceChartData,
  priceOfThreshold,
  priceOfThresholdInUsd,
  noChannelData,
  isFullChart,
  customChartHeightInPx,
}: {
  interfaceChartData: UseInterfaceChartDataType;
  priceOfThreshold: number;
  priceOfThresholdInUsd: string;
  noChannelData?: boolean;
  isFullChart?: boolean;
  customChartHeightInPx?: number;
}) => {
  const { walletIsConnected, privyUser, login, connectWallet, user } =
    useUser();
  const { isStandalone } = useUserAgent();

  const { channel } = useChannelContext();
  const { isOwner } = channel;

  const { tempToken } = useTempTokenContext();
  const {
    gameState,
    tempTokenChartTimeIndexes,
    currentBlockNumberForTempTokenChart,
  } = tempToken;
  const {
    currentActiveTokenHasHitTotalSupplyThreshold,
    currentActiveTokenTotalSupply,
    currentActiveTokenTotalSupplyThreshold,
    canPlayToken,
  } = gameState;
  const { ethPriceInUsd } = useCacheContext();

  const { network } = useNetworkContext();
  const { matchingChain } = network;

  const [thresholdOn, setThresholdOn] = useState(true);

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

  const {
    callSetTotalSupplyThresholdForTokens,
    loading: setTotalSupplyThresholdForTokensLoading,
  } = useOwnerUpdateTotalSupplyThresholdState();

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
      {canPlayToken && !isStandalone && (
        <Flex gap="5px" alignItems={"center"}>
          <Button
            bg={interfaceChartData.timeFilter === "1h" ? "#7874c9" : "#403c7d"}
            color="#c6c3fc"
            p={3}
            height="20px"
            _focus={{}}
            _active={{}}
            _hover={{}}
            onClick={() => interfaceChartData.handleTimeFilter("1h")}
          >
            1h
          </Button>
          <Button
            bg={interfaceChartData.timeFilter === "1d" ? "#7874c9" : "#403c7d"}
            color="#c6c3fc"
            p={3}
            height="20px"
            _focus={{}}
            _active={{}}
            _hover={{}}
            onClick={() => interfaceChartData.handleTimeFilter("1d")}
          >
            1d
          </Button>
          <Button
            bg={interfaceChartData.timeFilter === "all" ? "#7874c9" : "#403c7d"}
            color="#c6c3fc"
            p={3}
            height="20px"
            _focus={{}}
            _active={{}}
            _hover={{}}
            onClick={() => interfaceChartData.handleTimeFilter("all")}
          >
            all
          </Button>
          <Button
            bg={thresholdOn ? "#00d3c1" : "#077158"}
            color="#ffffff"
            p={3}
            height={"20px"}
            _focus={{}}
            _active={{}}
            _hover={{}}
            onClick={() => setThresholdOn((prev) => !prev)}
            boxShadow={
              thresholdOn ? "0px 0px 16px rgba(53, 234, 95, 0.4)" : undefined
            }
          >
            goal
          </Button>
          {!isStandalone && (
            <ChakraTooltip
              label="toggle chart zooming, will pause live updates when enabled"
              shouldWrapChildren
              openDelay={300}
            >
              <Button
                color="#ffffff"
                bg={
                  interfaceChartData.isChartPaused
                    ? "rgb(173, 169, 249)"
                    : "#4741c1"
                }
                _hover={{
                  transform: "scale(1.15)",
                }}
                _focus={{}}
                _active={{}}
                p={3}
                height={"20px"}
                onClick={() =>
                  interfaceChartData.handleIsChartPaused(
                    !interfaceChartData.isChartPaused
                  )
                }
                boxShadow={
                  interfaceChartData.isChartPaused
                    ? "0px 0px 25px rgba(173, 169, 249, 0.847)"
                    : undefined
                }
              >
                <FaMagnifyingGlassChart />
              </Button>
            </ChakraTooltip>
          )}
          {isOwner && currentActiveTokenHasHitTotalSupplyThreshold && (
            <ChakraTooltip
              label="increase the price goal"
              shouldWrapChildren
              openDelay={300}
            >
              <Flex gap="2px" bg="#fdbf2f" px="3px" borderRadius="5px">
                <Button
                  color="#ffffff"
                  bg={"rgba(0, 0, 0, 0.7)"}
                  _hover={{
                    bg: "rgba(0, 0, 0, 0.5)",
                  }}
                  _focus={{}}
                  _active={{}}
                  p={3}
                  height={"20px"}
                  onClick={() =>
                    callSetTotalSupplyThresholdForTokens(
                      BigInt(
                        Math.floor(
                          Number(currentActiveTokenTotalSupplyThreshold) * 1.05
                        )
                      )
                    )
                  }
                  isDisabled={
                    setTotalSupplyThresholdForTokensLoading ||
                    BigInt(
                      Math.floor(
                        Number(currentActiveTokenTotalSupplyThreshold) * 1.05
                      )
                    ) === currentActiveTokenTotalSupplyThreshold
                  }
                >
                  +5%
                </Button>
                <Button
                  color="#ffffff"
                  bg={"rgba(0, 0, 0, 0.7)"}
                  _hover={{
                    bg: "rgba(0, 0, 0, 0.5)",
                  }}
                  _focus={{}}
                  _active={{}}
                  p={3}
                  height={"20px"}
                  onClick={() =>
                    callSetTotalSupplyThresholdForTokens(
                      BigInt(
                        Math.floor(
                          Number(currentActiveTokenTotalSupplyThreshold) * 1.5
                        )
                      )
                    )
                  }
                  isDisabled={setTotalSupplyThresholdForTokensLoading}
                >
                  +50%
                </Button>
              </Flex>
            </ChakraTooltip>
          )}
        </Flex>
      )}
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
          !isStandalone &&
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
          !isStandalone &&
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
          !isStandalone &&
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
        {isStandalone && (
          <Flex
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            textAlign="center"
            position="absolute"
          >
            <SingleTempTokenTimerView
              disableChatbot={true}
              hidePresaleTimer={isStandalone}
            />
          </Flex>
        )}
        <ResponsiveContainer
          width="100%"
          height={customChartHeightInPx ?? "100%"}
        >
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
              hide={isStandalone ?? false}
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
          <Flex direction={"column"} height={isFullChart ? "150px" : undefined}>
            {walletIsConnected && user?.address ? (
              <TempTokenExchange />
            ) : (
              <Flex direction="column">
                <Text>you must sign in to trade</Text>
                <Button
                  color="white"
                  bg="#2562db"
                  _hover={{
                    bg: "#1c4d9e",
                  }}
                  _focus={{}}
                  _active={{}}
                  onClick={() => {
                    privyUser ? connectWallet() : login();
                  }}
                >
                  {privyUser ? "Connect" : "Sign in"}
                </Button>
              </Flex>
            )}
          </Flex>
        </Flex>
      )}
    </>
  );
};
