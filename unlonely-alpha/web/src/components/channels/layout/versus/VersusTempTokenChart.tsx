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
import { useCacheContext } from "../../../../hooks/context/useCache";
import { formatUnits, isAddress, isAddressEqual } from "viem";
import { truncateValue } from "../../../../utils/tokenDisplayFormatting";
import { GET_USER_QUERY } from "../../../../constants/queries";
import centerEllipses from "../../../../utils/centerEllipses";
import { useApolloClient } from "@apollo/client";
import { useInterfaceChartMarkers } from "../../../../hooks/internal/temp-token/ui/useInterfaceChartMarkers";
import { VersusTokenExchange } from "../../versus/VersusTokenExchange";
import useUserAgent from "../../../../hooks/internal/useUserAgent";
import { VersusTempTokenTimerView } from "../../versus/VersusTokenTimerView";
import { consolidateChartData } from "../../../../utils/chart";

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

export const VersusTempTokenChart = ({
  noChannelData,
  isFullChart,
  customChartHeightInPx,
}: {
  noChannelData?: boolean;
  isFullChart?: boolean;
  customChartHeightInPx?: number;
}) => {
  const { isStandalone } = useUserAgent();

  const { ethPriceInUsd } = useCacheContext();
  const { gameState, tokenATxs, tokenBTxs } = useVersusTempTokenContext();
  const {
    winningToken,
    canPlayToken,
    isGameOngoing,
    isGameFinished,
    focusedTokenToTrade,
    ownerMustMakeWinningTokenTradeable,
    tokenA,
    tokenB,
  } = gameState;
  const { network } = useNetworkContext();
  const { matchingChain } = network;

  const { CustomTooltip: SingleCustomTooltip } = useInterfaceChartMarkers(
    [],
    "all"
  );

  const tokenAChartData = useInterfaceChartData({
    chartTimeIndexes: new Map<string, { index?: number }>(),
    txs: tokenATxs.tempTokenTxs,
  });

  const tokenBChartData = useInterfaceChartData({
    chartTimeIndexes: new Map<string, { index?: number }>(),
    txs: tokenBTxs.tempTokenTxs,
  });

  const tokenAWon = useMemo(
    () =>
      isAddress(tokenA.address) &&
      isAddress(winningToken.address) &&
      isAddressEqual(
        tokenA.address as `0x${string}`,
        winningToken.address as `0x${string}`
      ),
    [tokenA, winningToken]
  );

  const tokenBWon = useMemo(
    () =>
      isAddress(tokenB.address) &&
      isAddress(winningToken.address) &&
      isAddressEqual(
        tokenB.address as `0x${string}`,
        winningToken.address as `0x${string}`
      ),
    [tokenB, winningToken]
  );

  const client = useApolloClient();

  const VersusCustomTooltip = ({ active, payload }: any) => {
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

    return (
      <Flex
        direction="column"
        bg="rgba(0, 0, 0, 0.5)"
        p="5px"
        gap="10px"
        borderRadius="15px"
      >
        <Flex direction="column">
          <>
            {payload[0].payload.tokenAEvent !== "" && (
              <>
                <Text>
                  {!loading && asyncData !== null ? (
                    <>
                      {isAddress(asyncData.split(",")[0] ?? asyncData) ? (
                        <Text color={"#d7a7ff"}>
                          {centerEllipses(
                            asyncData.split(",")[0] ?? asyncData,
                            10
                          )}
                        </Text>
                      ) : (
                        <Text color={"#d7a7ff"}>
                          {asyncData.split(",")[0] ?? asyncData}
                        </Text>
                      )}
                    </>
                  ) : (
                    <Text color={"#ffffff"}>
                      {centerEllipses(payload[0].payload.tokenATrader, 10)}
                    </Text>
                  )}
                </Text>
                <Text
                  color={
                    payload[0].payload.tokenAEvent === "Mint"
                      ? "#46a800"
                      : "#fe2815"
                  }
                >
                  {`${
                    payload[0].payload.tokenAEvent === "Mint"
                      ? "Bought"
                      : "Sold"
                  } ${truncateValue(payload[0].payload.tokenAAmount, 0)}`}{" "}
                  {payload[0].payload.tokenASymbol}
                </Text>
              </>
            )}
            {payload[0].payload.tokenAPriceInUsd !== undefined ? (
              <>
                <Text color="rgba(255, 36, 36, 1)">{`$${truncateValue(
                  payload[0].payload.tokenAPriceInUsd,
                  4
                )}`}</Text>
                <Text
                  color="rgba(255, 36, 36, 1)"
                  fontSize="10px"
                  opacity="0.75"
                >{`${
                  //   truncateValue(
                  //   formatUnits(payload[0].payload.tokenAPrice, 18),
                  //   10
                  // )
                  formatUnits(payload[0].payload.tokenAPrice, 18)
                } ETH`}</Text>
              </>
            ) : (
              <Text>{`${
                //   truncateValue(
                //   formatUnits(payload[0].payload.tokenAPrice, 18),
                //   10
                // )
                formatUnits(payload[0].payload.tokenAPrice, 18)
              } ETH`}</Text>
            )}
          </>
        </Flex>
        <Flex direction="column">
          <>
            {payload[0].payload.tokenBEvent !== "" && (
              <>
                <Text>
                  {!loading && asyncData !== null ? (
                    <>
                      {isAddress(asyncData.split(",")[1] ?? asyncData) ? (
                        <Text color={"#d7a7ff"}>
                          {centerEllipses(
                            asyncData.split(",")[1] ?? asyncData,
                            10
                          )}
                        </Text>
                      ) : (
                        <Text color={"#d7a7ff"}>
                          {asyncData.split(",")[1] ?? asyncData}
                        </Text>
                      )}
                    </>
                  ) : (
                    <Text color={"#ffffff"}>
                      {centerEllipses(payload[0].payload.tokenBTrader, 10)}
                    </Text>
                  )}
                </Text>
                <Text
                  color={
                    payload[0].payload.tokenBEvent === "Mint"
                      ? "#46a800"
                      : "#fe2815"
                  }
                >
                  {`${
                    payload[0].payload.tokenBEvent === "Mint"
                      ? "Bought"
                      : "Sold"
                  } ${truncateValue(payload[0].payload.tokenBAmount, 0)}`}{" "}
                  {payload[0].payload.tokenBSymbol}
                </Text>
              </>
            )}
            {payload[0].payload.tokenBPriceInUsd !== undefined ? (
              <>
                <Text color="rgba(42, 217, 255, 1)">{`$${truncateValue(
                  payload[0].payload.tokenBPriceInUsd,
                  4
                )}`}</Text>
                <Text
                  color="rgba(42, 217, 255, 1)"
                  fontSize="10px"
                  opacity="0.75"
                >{`${
                  //   truncateValue(
                  //   formatUnits(payload[0].payload.tokenBPrice, 18),
                  //   10
                  // )
                  formatUnits(payload[0].payload.tokenBPrice, 18)
                } ETH`}</Text>
              </>
            ) : (
              <Text>{`${
                //   truncateValue(
                //   formatUnits(payload[0].payload.tokenBPrice, 18),
                //   10
                // )
                formatUnits(payload[0].payload.tokenBPrice, 18)
              } ETH`}</Text>
            )}
          </>
        </Flex>
      </Flex>
    );
  };

  const consolidatedChartData = useMemo(() => {
    return consolidateChartData(
      tokenAChartData.chartTxs,
      tokenBChartData.chartTxs,
      tokenA.minBaseTokenPrice,
      ethPriceInUsd
    );
  }, [
    tokenAChartData.chartTxs,
    tokenBChartData.chartTxs,
    tokenA,
    ethPriceInUsd,
  ]);

  const canBuyPostGame = useMemo(
    () =>
      isAddress(winningToken.address) &&
      !isGameFinished &&
      !isGameOngoing &&
      !ownerMustMakeWinningTokenTradeable,
    [
      winningToken,
      isGameFinished,
      isGameOngoing,
      ownerMustMakeWinningTokenTradeable,
    ]
  );

  return (
    <Flex h="100%" gap="10px" direction={canBuyPostGame ? "row" : "column"}>
      <Flex
        direction="column"
        w="100%"
        position="relative"
        h={canPlayToken && !isFullChart ? "100%" : "70%"}
      >
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
        {!tokenA.symbol && !tokenB.symbol && (
          <Text
            textAlign="center"
            position="absolute"
            color="gray"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
          >
            streamer has not launched versus token yet
          </Text>
        )}
        {consolidatedChartData.length === 0 &&
          matchingChain &&
          !isStandalone &&
          tokenA.symbol &&
          tokenB.symbol && (
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
        {isStandalone && (
          <Flex
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            textAlign="center"
            position="absolute"
          >
            <VersusTempTokenTimerView
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
              tokenAWon
                ? tokenAChartData.chartTxs
                : tokenBWon
                ? tokenBChartData.chartTxs
                : consolidatedChartData
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
              tickFormatter={(tick: number) => {
                return `$${truncateValue(
                  Number(formatUnits(BigInt(Math.floor(tick)), 18)) *
                    Number(ethPriceInUsd ?? "0"),
                  2
                )}`;
              }}
              hide={(!isFullChart && !canPlayToken) || (isStandalone ?? false)}
              domain={["dataMin", "dataMax"]}
            />
            <Tooltip
              content={
                tokenAWon || tokenBWon ? (
                  <SingleCustomTooltip />
                ) : (
                  <VersusCustomTooltip />
                )
              }
            />
            {!tokenBWon && (
              <Line
                key="0"
                type="monotone"
                dataKey={!tokenBWon && tokenAWon ? "price" : "tokenAPrice"}
                stroke={"rgba(255, 36, 36, 1)"}
                strokeWidth={
                  focusedTokenToTrade?.address !== undefined &&
                  isAddress(focusedTokenToTrade?.address) &&
                  isAddress(gameState.tokenA.address) &&
                  isAddressEqual(
                    focusedTokenToTrade?.address,
                    gameState.tokenA.address as `0x${string}`
                  ) &&
                  !tokenAWon
                    ? 4
                    : 2
                }
                animationDuration={200}
                dot={false}
              />
            )}
            {!tokenAWon && (
              <Line
                key="1"
                type="monotone"
                dataKey={!tokenAWon && tokenBWon ? "price" : "tokenBPrice"}
                stroke={"rgba(42, 217, 255, 1)"}
                strokeWidth={
                  focusedTokenToTrade?.address !== undefined &&
                  isAddress(focusedTokenToTrade?.address) &&
                  isAddress(gameState.tokenB.address) &&
                  isAddressEqual(
                    focusedTokenToTrade?.address,
                    gameState.tokenB.address as `0x${string}`
                  ) &&
                  !tokenBWon
                    ? 4
                    : 2
                }
                animationDuration={200}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </Flex>
      {!isStandalone && (canPlayToken || canBuyPostGame) && (
        <Flex direction={"column"} height={isFullChart ? "150px" : undefined}>
          <VersusTokenExchange />
        </Flex>
      )}
    </Flex>
  );
};
