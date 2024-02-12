import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Flex,
  Spinner,
  Text,
  IconButton,
  Image,
  Container,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  Tooltip as CharkaTooltip,
} from "@chakra-ui/react";
import { formatUnits, isAddress, parseUnits } from "viem";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  Brush,
  YAxis,
  ReferenceArea,
  ReferenceLine,
  XAxis,
} from "recharts";
import * as AWS from "aws-sdk";
import Link from "next/link";
import { FaMagnifyingGlassChart } from "react-icons/fa6";

import { useCacheContext } from "../../hooks/context/useCache";
import centerEllipses from "../../utils/centerEllipses";
import { useChannelContext } from "../../hooks/context/useChannel";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { useUser } from "../../hooks/context/useUser";
import { AblyChannelPromise } from "../../constants";
import VibesTokenZoneModal from "../channels/VibesTokenZoneModal";
import VibesTokenExchange from "./VibesTokenExchange";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { useWindowSize } from "../../hooks/internal/useWindowSize";
import ConnectWallet from "../navigation/ConnectWallet";
import { useNetworkContext } from "../../hooks/context/useNetwork";
import { FaPause } from "react-icons/fa";
import {
  blockNumberDaysAgo,
  blockNumberHoursAgo,
} from "../../hooks/internal/useVibesCheck";

type ChartTokenTx = {
  user: string;
  event: string;
  amount: number;
  price: number;
  priceInUsd: number;
  priceChangePercentage: number;
  blockNumber: number;
};

const ZONE_BREADTH = 0.05;

const VibesTokenInterface = ({
  defaultTimeFilter,
  allStreams,
  previewMode,
  isFullChart,
  isExchangeColumn,
  ablyChannel,
  disableExchange,
  customLowerPrice,
  customHigherPrice,
}: {
  defaultTimeFilter?: "1h" | "1d" | "all";
  allStreams?: boolean;
  previewMode?: boolean;
  isFullChart?: boolean;
  isExchangeColumn?: boolean;
  ablyChannel?: AblyChannelPromise;
  disableExchange?: boolean;
  customLowerPrice?: number;
  customHigherPrice?: number;
}) => {
  const { userAddress, walletIsConnected } = useUser();
  const { isStandalone } = useUserAgent();
  const { vibesTokenTxs, vibesTokenLoading, chartTimeIndexes } =
    useCacheContext();
  const { channel, ui } = useChannelContext();
  const { channelQueryData } = channel;
  const { vibesTokenPriceRange } = ui;
  const { ethPriceInUsd, currentBlockNumberForVibes } = useCacheContext();
  const windowSize = useWindowSize();
  const { network } = useNetworkContext();
  const { matchingChain } = network;

  const [timeFilter, setTimeFilter] = useState<"1h" | "1d" | "all">(
    defaultTimeFilter ?? "1h"
  );

  const [zonesOn, setZonesOn] = useState(true);
  const [lowerTokensThreshold, setLowerTokensThreshold] = useState<
    number | undefined
  >(undefined);
  const [higherTokensThreshold, setHigherTokensThreshold] = useState<
    number | undefined
  >(undefined);

  const [lowerPriceInUsd, setLowerPriceInUsd] = useState<string | undefined>(
    undefined
  );
  const [higherPriceInUsd, setHigherPriceInUsd] = useState<string | undefined>(
    undefined
  );
  const [currentPriceInUsd, setCurrentPriceInUsd] = useState<
    string | undefined
  >(undefined);

  const [isChartPaused, setIsChartPaused] = useState(false);

  const txs: ChartTokenTx[] = useMemo(() => {
    return vibesTokenTxs.map((tx) => {
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
  }, [vibesTokenTxs, ethPriceInUsd]);

  const formattedHourData = useMemo(
    () =>
      chartTimeIndexes.get("1h") !== undefined
        ? txs.slice(chartTimeIndexes.get("1h")?.index as number)
        : txs,
    [txs, chartTimeIndexes]
  );

  const formattedDayData = useMemo(
    () =>
      chartTimeIndexes.get("1d") !== undefined
        ? txs.slice(chartTimeIndexes.get("1d")?.index as number)
        : txs,
    [txs, chartTimeIndexes]
  );

  const formattedData = useMemo(() => {
    if (timeFilter === "1h") return formattedHourData;
    if (timeFilter === "1d") return formattedDayData;
    return txs;
  }, [txs, timeFilter, formattedHourData, formattedDayData]);

  const [pausedDataForAllTime, setPausedDataForAllTime] = useState<
    ChartTokenTx[]
  >([]);
  const [pausedDataFor1Day, setPausedDataFor1Day] = useState<ChartTokenTx[]>(
    []
  );
  const [pausedDataFor1Hour, setPausedDataFor1Hour] = useState<ChartTokenTx[]>(
    []
  );

  useEffect(() => {
    if (!isChartPaused) {
      setPausedDataForAllTime(txs);
    } else {
      setPausedDataForAllTime((prev) => prependStartMarker(prev));
    }
  }, [isChartPaused, txs]);

  useEffect(() => {
    if (!isChartPaused) {
      setPausedDataFor1Day(formattedDayData);
    } else {
      setPausedDataFor1Day((prev) => prependStartMarker(prev));
    }
  }, [isChartPaused, formattedDayData]);

  useEffect(() => {
    if (!isChartPaused) {
      setPausedDataFor1Hour(formattedHourData);
    } else {
      setPausedDataFor1Hour((prev) => prependStartMarker(prev));
    }
  }, [isChartPaused, formattedHourData]);

  const formattedCurrentPrice = useMemo(
    () =>
      formattedData.length > 0
        ? formatUnits(BigInt(formattedData[formattedData.length - 1].price), 18)
        : "0",
    [formattedData]
  );

  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);

  const isOwner = userAddress === channelQueryData?.owner?.address;

  const lowerPrice = useMemo(() => {
    if (customLowerPrice !== undefined) return customLowerPrice;
    if (
      vibesTokenPriceRange[0] !== null &&
      vibesTokenPriceRange[0] !== undefined
    ) {
      return Number(parseUnits(vibesTokenPriceRange[0] as `${number}`, 18));
    }
    return 0;
  }, [vibesTokenPriceRange[0], customLowerPrice]);

  const higherPrice = useMemo(() => {
    if (customHigherPrice !== undefined) return customHigherPrice;
    if (
      vibesTokenPriceRange[1] !== null &&
      vibesTokenPriceRange[1] !== undefined
    ) {
      return Number(parseUnits(vibesTokenPriceRange[1] as `${number}`, 18));
    }
    return Number.MAX_SAFE_INTEGER;
  }, [vibesTokenPriceRange[1], customHigherPrice]);

  const openVibesPopout = () => {
    if (!channelQueryData) return;
    const windowFeatures = `width=${windowSize[0] + 100},height=${
      windowSize[1] + 100
    },menubar=yes,toolbar=yes`;
    window.open(
      `${window.location.origin}/vibes/${channelQueryData?.slug}`,
      "_blank",
      windowFeatures
    );
  };

  useEffect(() => {
    const calculateTokens = async () => {
      if (
        vibesTokenTxs.length === 0 ||
        vibesTokenPriceRange.length === 0 ||
        !isFullChart
      )
        return;
      const lambda = new AWS.Lambda({
        region: "us-west-2",
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY,
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
      });

      const lowerParams = {
        FunctionName: "calcNumTokensToReachPrice",
        Payload: JSON.stringify({
          detail: {
            current_token_supply: Number(
              vibesTokenTxs[vibesTokenTxs.length - 1].supply
            ),
            new_eth_price: Number(vibesTokenPriceRange[0]),
          },
        }),
      };

      const higherParams = {
        FunctionName: "calcNumTokensToReachPrice",
        Payload: JSON.stringify({
          detail: {
            current_token_supply: Number(
              vibesTokenTxs[vibesTokenTxs.length - 1].supply
            ),
            new_eth_price: Number(vibesTokenPriceRange[1]),
          },
        }),
      };

      const [lowerThreshold, higherThreshold] = await Promise.all([
        lambda.invoke(lowerParams).promise(),
        lambda.invoke(higherParams).promise(),
      ]);
      const responseForLower = JSON.parse(lowerThreshold.Payload as any);
      const responseForHigher = JSON.parse(higherThreshold.Payload as any);
      if (responseForLower.errorMessage) {
        console.error(
          "lambda calculate lower error:",
          responseForLower.errorMessage
        );
        setLowerTokensThreshold(-1);
      } else {
        const numTokensForLower = responseForLower.body.numOfTokens;
        setLowerTokensThreshold(numTokensForLower);
      }
      if (responseForHigher.errorMessage) {
        console.error(
          "lambda calculate higher error:",
          responseForHigher.errorMessage
        );
        setHigherTokensThreshold(-1);
      } else {
        const numTokensForHigher = responseForHigher.body.numOfTokens;
        setHigherTokensThreshold(numTokensForHigher);
      }
    };
    calculateTokens();
  }, [vibesTokenTxs, vibesTokenPriceRange]);

  useEffect(() => {
    if (ethPriceInUsd === undefined) return;
    setLowerPriceInUsd(
      truncateValue(
        Number(formatUnits(BigInt(lowerPrice), 18)) * Number(ethPriceInUsd),
        4
      )
    );
  }, [lowerPrice, ethPriceInUsd]);

  useEffect(() => {
    if (ethPriceInUsd === undefined) return;
    setHigherPriceInUsd(
      truncateValue(
        Number(formatUnits(BigInt(higherPrice), 18)) * Number(ethPriceInUsd),
        4
      )
    );
  }, [higherPrice, ethPriceInUsd]);

  useEffect(() => {
    if (ethPriceInUsd === undefined) return;
    setCurrentPriceInUsd(
      truncateValue(Number(formattedCurrentPrice) * Number(ethPriceInUsd), 4)
    );
  }, [formattedCurrentPrice, ethPriceInUsd]);

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
        <text x={props.viewBox.x} y={props.viewBox.y} fill="#00d3c1" dy={20}>
          {props.value}
        </text>
      </g>
    );
  };

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
    if (active && payload && payload.length) {
      const percentage = Number(
        truncateValue(
          payload[0].payload.priceChangePercentage,
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
          borderRadius="15px"
        >
          <Text>{`${
            isAddress(payload[0].payload.user)
              ? centerEllipses(payload[0].payload.user, 13)
              : payload[0].payload.user
          }`}</Text>
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
              {percentage !== 0 && isFullChart && (
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
    }

    return null;
  };

  const customBrushFormatter = (blockNumber: number) => {
    if (vibesTokenTxs.length === 0) return 0;
    const latestBlockNumber =
      vibesTokenTxs[vibesTokenTxs.length - 1].blockNumber;
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

  return (
    <>
      {vibesTokenLoading ? (
        <Flex
          direction="column"
          alignItems="center"
          width="100%"
          gap="5px"
          justifyContent={"center"}
        >
          <Text>loading $VIBES chart</Text>
          <Spinner size="md" />
        </Flex>
      ) : (
        <>
          {isFullChart && disableExchange !== true && (
            <Container overflowY="auto" maxW="300px" overflowX={"hidden"}>
              <Flex direction="column" justifyContent={"flex-end"} gap="2rem">
                {higherPrice < Number.MAX_SAFE_INTEGER && (
                  <Flex
                    direction="column"
                    bg="rgba(40, 129, 43, 0.5)"
                    p="0.5rem"
                    gap="1rem"
                  >
                    <Flex direction="column">
                      <Text opacity="0.8">green zone price:</Text>
                      {higherPriceInUsd !== undefined ? (
                        <>
                          <Text color="#b0efb2" fontSize="1.5rem">
                            ${higherPriceInUsd}
                          </Text>
                          <Text
                            whiteSpace={"nowrap"}
                            opacity="0.3"
                            fontSize="14px"
                          >
                            {formatUnits(BigInt(higherPrice), 18)} ETH
                          </Text>
                        </>
                      ) : (
                        <Text whiteSpace={"nowrap"} fontSize="1rem">
                          {formatUnits(BigInt(higherPrice), 18)} ETH
                        </Text>
                      )}
                    </Flex>
                    <Flex direction="column">
                      <Text opacity="0.8">tokens to buy:</Text>
                      <Text
                        color="#b0efb2"
                        fontSize={
                          higherTokensThreshold !== undefined &&
                          higherTokensThreshold >= 0
                            ? "1.5rem"
                            : "unset"
                        }
                      >
                        {higherTokensThreshold !== undefined
                          ? higherTokensThreshold >= 0
                            ? `${
                                Number(formattedCurrentPrice) >
                                Number(formatUnits(BigInt(higherPrice), 18))
                                  ? "-"
                                  : ""
                              }${truncateValue(higherTokensThreshold, 0)}`
                            : "error fetching tokens"
                          : "calculating..."}
                      </Text>
                    </Flex>
                  </Flex>
                )}
                <Flex direction="column" gap="10px">
                  <Flex direction="column">
                    <Text opacity="0.8">current price:</Text>
                    {currentPriceInUsd !== undefined ? (
                      <>
                        <Text color="#f3d584" fontSize="2rem">
                          ${currentPriceInUsd}
                        </Text>
                        <Text
                          whiteSpace={"nowrap"}
                          opacity="0.3"
                          fontSize="14px"
                        >
                          {formattedCurrentPrice} ETH
                        </Text>
                      </>
                    ) : (
                      <Text whiteSpace={"nowrap"} fontSize="1rem">
                        {formattedCurrentPrice} ETH
                      </Text>
                    )}
                  </Flex>
                  {walletIsConnected ? (
                    <VibesTokenExchange isFullChart />
                  ) : (
                    <Flex direction="column">
                      <Text>you must sign in to trade</Text>
                      <ConnectWallet />
                    </Flex>
                  )}
                </Flex>
                {lowerPrice > 0 && (
                  <Flex
                    direction="column"
                    bg="rgba(155, 15, 15, 0.5)"
                    p="0.5rem"
                    gap="1rem"
                  >
                    <Flex direction="column">
                      <Text opacity="0.8">red zone price:</Text>
                      {lowerPriceInUsd !== undefined ? (
                        <>
                          <Text
                            fontSize={
                              lowerTokensThreshold !== undefined &&
                              lowerTokensThreshold >= 0
                                ? "1.5rem"
                                : "unset"
                            }
                            color="#efc7b0"
                          >
                            ${lowerPriceInUsd}
                          </Text>
                          <Text
                            whiteSpace={"nowrap"}
                            opacity="0.3"
                            fontSize="14px"
                          >
                            {formatUnits(BigInt(lowerPrice), 18)} ETH
                          </Text>
                        </>
                      ) : (
                        <Text whiteSpace={"nowrap"} fontSize="1rem">
                          {formatUnits(BigInt(lowerPrice), 18)} ETH
                        </Text>
                      )}
                    </Flex>
                    <Flex direction="column">
                      <Text opacity="0.8">tokens to sell:</Text>
                      <Text
                        color="#efc7b0"
                        fontSize={
                          lowerTokensThreshold !== undefined &&
                          lowerTokensThreshold >= 0
                            ? "1.5rem"
                            : "unset"
                        }
                      >
                        {lowerTokensThreshold !== undefined
                          ? lowerTokensThreshold >= 0
                            ? `${
                                Number(formattedCurrentPrice) <
                                Number(formatUnits(BigInt(lowerPrice), 18))
                                  ? "-"
                                  : ""
                              }${truncateValue(lowerTokensThreshold, 0)}`
                            : "error fetching tokens"
                          : "calculating..."}
                      </Text>
                    </Flex>
                  </Flex>
                )}
              </Flex>
            </Container>
          )}
          <Flex
            direction="column"
            justifyContent={"space-between"}
            width="100%"
          >
            <Flex justifyContent={"space-between"} alignItems={"center"}>
              <Flex gap="5px" alignItems={"center"}>
                <Popover trigger="hover" placement="bottom" openDelay={200}>
                  <PopoverTrigger>
                    <Text fontSize={"20px"} color="#c6c3fc" fontWeight="bold">
                      $VIBES
                    </Text>
                  </PopoverTrigger>
                  <PopoverContent
                    bg="gray.800"
                    border="none"
                    width="200px"
                    p="2px"
                  >
                    <PopoverArrow bg="gray.800" />
                    {allStreams ? (
                      <Flex direction="column" gap="10px" p="5px">
                        <Text fontSize="13px">
                          buy or sell $VIBES, an ERC-20 token priced on a
                          bonding curve, depending on the vibes on this app!
                        </Text>
                        <Text fontSize="13px">
                          streamers and the protocol earn a 2% fee on txns.
                        </Text>
                        <Link
                          href="https://bit.ly/unlonelyFAQs"
                          target="_blank"
                        >
                          <Text
                            fontSize="13px"
                            color="#3cd8ff"
                            textAlign={"center"}
                          >
                            read more
                          </Text>
                        </Link>
                      </Flex>
                    ) : (
                      <Flex direction="column" gap="10px" p="5px">
                        <Text fontSize="13px">
                          buy or sell $VIBES, an ERC-20 token priced on a
                          bonding curve, depending on the vibes on this stream!
                        </Text>
                        <Text fontSize="13px">
                          streamers and the protocol earn a 2% fee on txns.
                        </Text>
                        <Link
                          href="https://bit.ly/unlonelyFAQs"
                          target="_blank"
                        >
                          <Text
                            fontSize="13px"
                            color="#3cd8ff"
                            textAlign={"center"}
                          >
                            read more
                          </Text>
                        </Link>
                      </Flex>
                    )}
                  </PopoverContent>
                </Popover>
                <Button
                  bg={timeFilter === "1h" ? "#7874c9" : "#403c7d"}
                  color="#c6c3fc"
                  p={
                    2 *
                    ((isStandalone || isFullChart) && !previewMode ? 1.5 : 1)
                  }
                  height={`${
                    20 *
                    ((isStandalone || isFullChart) && !previewMode ? 1.5 : 1)
                  }px`}
                  _focus={{}}
                  _active={{}}
                  _hover={{}}
                  onClick={() => setTimeFilter("1h")}
                >
                  1h
                </Button>
                {isFullChart && (
                  <Button
                    bg={timeFilter === "1d" ? "#7874c9" : "#403c7d"}
                    color="#c6c3fc"
                    p={
                      2 *
                      ((isStandalone || isFullChart) && !previewMode ? 1.5 : 1)
                    }
                    height={`${
                      20 *
                      ((isStandalone || isFullChart) && !previewMode ? 1.5 : 1)
                    }px`}
                    _focus={{}}
                    _active={{}}
                    _hover={{}}
                    onClick={() => setTimeFilter("1d")}
                  >
                    1d
                  </Button>
                )}
                <Button
                  bg={timeFilter === "all" ? "#7874c9" : "#403c7d"}
                  color="#c6c3fc"
                  p={
                    2 *
                    ((isStandalone || isFullChart) && !previewMode ? 1.5 : 1)
                  }
                  height={`${
                    20 *
                    ((isStandalone || isFullChart) && !previewMode ? 1.5 : 1)
                  }px`}
                  _focus={{}}
                  _active={{}}
                  _hover={{}}
                  onClick={() => setTimeFilter("all")}
                >
                  all
                </Button>
                {!allStreams &&
                  (previewMode ||
                    (!previewMode && lowerPrice > 0 && higherPrice > 0)) && (
                    <Button
                      bg={zonesOn ? "#1dc859" : "#004e1b"}
                      color="#ffffff"
                      p={
                        2 *
                        ((isStandalone || isFullChart) && !previewMode
                          ? 1.5
                          : 1)
                      }
                      height={`${
                        20 *
                        ((isStandalone || isFullChart) && !previewMode
                          ? 1.5
                          : 1)
                      }px`}
                      _focus={{}}
                      _active={{}}
                      _hover={{}}
                      onClick={() => setZonesOn((prev) => !prev)}
                      boxShadow={
                        zonesOn
                          ? "0px 0px 16px rgba(53, 234, 95, 0.4)"
                          : undefined
                      }
                    >
                      zones
                    </Button>
                  )}
                {isFullChart && !previewMode && (
                  <CharkaTooltip
                    label="toggle chart zooming, will pause live updates when enabled"
                    shouldWrapChildren
                    openDelay={300}
                  >
                    <Button
                      color="#ffffff"
                      bg={isChartPaused ? "rgb(173, 169, 249)" : "#4741c1"}
                      _hover={{
                        transform: "scale(1.15)",
                      }}
                      _focus={{}}
                      _active={{}}
                      p={2 * (isStandalone || isFullChart ? 1.5 : 1)}
                      height={`${
                        20 * (isStandalone || isFullChart ? 1.5 : 1)
                      }px`}
                      onClick={() => setIsChartPaused((prev) => !prev)}
                      boxShadow={
                        isChartPaused
                          ? "0px 0px 25px rgba(173, 169, 249, 0.847)"
                          : undefined
                      }
                    >
                      {<FaMagnifyingGlassChart />}
                    </Button>
                  </CharkaTooltip>
                )}
                {!allStreams && !previewMode && isOwner && !isStandalone && (
                  <>
                    <VibesTokenZoneModal
                      isOpen={isZoneModalOpen}
                      handleClose={() => setIsZoneModalOpen(false)}
                      formattedCurrentPrice={
                        formattedCurrentPrice as `${number}`
                      }
                      ablyChannel={ablyChannel}
                      isFullChart={isFullChart}
                    />
                    <Button
                      color="white"
                      bg="#0299ad"
                      onClick={() => setIsZoneModalOpen(true)}
                      _hover={{}}
                      _focus={{}}
                      _active={{}}
                      p={2 * (isStandalone || isFullChart ? 1.5 : 1)}
                      height={`${
                        20 * (isStandalone || isFullChart ? 1.5 : 1)
                      }px`}
                    >
                      set zones
                    </Button>
                  </>
                )}
              </Flex>
              {!isFullChart && !allStreams && !isStandalone && (
                <Popover trigger="hover" placement="top" openDelay={500}>
                  <PopoverTrigger>
                    <IconButton
                      onClick={openVibesPopout}
                      aria-label="vibes-popout"
                      _focus={{}}
                      _hover={{ transform: "scale(1.15)" }}
                      _active={{ transform: "scale(1.3)" }}
                      icon={<Image src="/svg/pop-out.svg" height={"20px"} />}
                      bg="transparent"
                      minWidth="auto"
                    />
                  </PopoverTrigger>
                  <PopoverContent
                    bg="#008d75"
                    border="none"
                    width="100%"
                    p="2px"
                  >
                    <PopoverArrow bg="#008d75" />
                    <Text fontSize="12px" textAlign={"center"}>
                      pop out chart in a new window!
                    </Text>
                  </PopoverContent>
                </Popover>
              )}
            </Flex>
            <Flex
              direction={isExchangeColumn ? "column" : "row"}
              gap="10px"
              flex="1"
            >
              <Flex direction="column" w="100%" position="relative" h="100%">
                {formattedHourData.length === 0 &&
                  timeFilter === "1h" &&
                  matchingChain && (
                    <Text position="absolute" color="gray" top="50%">
                      no txs in the past 24 hours
                    </Text>
                  )}
                {formattedData.length === 0 &&
                  timeFilter === "all" &&
                  matchingChain && (
                    <Text position="absolute" color="gray" top="50%">
                      no txs
                    </Text>
                  )}
                {isChartPaused && (
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
                      isChartPaused
                        ? timeFilter === "all"
                          ? pausedDataForAllTime
                          : timeFilter === "1d"
                          ? pausedDataFor1Day
                          : pausedDataFor1Hour
                        : formattedData
                    }
                    margin={
                      isFullChart && !previewMode
                        ? { left: 30, top: 10, bottom: 10 }
                        : isStandalone
                        ? { top: 10, bottom: 10 }
                        : {}
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
                      hide={
                        (isFullChart && !previewMode) === true ? false : true
                      }
                      domain={
                        !allStreams &&
                        zonesOn &&
                        lowerPrice > 0 &&
                        higherPrice > 0
                          ? [
                              lowerPrice * (1 - ZONE_BREADTH),
                              higherPrice * (1 + ZONE_BREADTH),
                            ]
                          : ["dataMin", "dataMax"]
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {(!allStreams || !previewMode) &&
                      higherPrice < Number.MAX_SAFE_INTEGER &&
                      zonesOn && (
                        <ReferenceArea
                          fill="green"
                          fillOpacity={0.2}
                          y1={higherPrice}
                          y2={Number.MAX_SAFE_INTEGER}
                          ifOverflow="hidden"
                        />
                      )}
                    {timeFilter === "all" && isFullChart && !previewMode && (
                      <>
                        {Array.from(chartTimeIndexes.keys())
                          .filter((i) => i.includes("d"))
                          .map((key) => {
                            return (
                              <ReferenceLine
                                key={key}
                                strokeDasharray="3 3"
                                x={
                                  chartTimeIndexes.get(key)
                                    ?.blockNumber as number
                                }
                                stroke="rgb(0, 211, 193)"
                                label={<CustomLabel value={`~${key}`} />}
                              />
                            );
                          })}
                        {[...Array(30).keys()]
                          .map((i) => i + 1)
                          .filter(
                            (d) =>
                              chartTimeIndexes.get(`${d}d`)?.blockNumber ===
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
                                    currentBlockNumberForVibes
                                  )
                                )}
                                stroke="rgba(0, 211, 193, 0.2)"
                              />
                            );
                          })}
                      </>
                    )}
                    {timeFilter === "1d" && isFullChart && !previewMode && (
                      <>
                        {Array.from(chartTimeIndexes.keys())
                          .filter((i) => i.includes("h"))
                          .map((key) => {
                            return (
                              <ReferenceLine
                                strokeDasharray="3 3"
                                x={
                                  chartTimeIndexes.get(key)
                                    ?.blockNumber as number
                                }
                                stroke="#00d3c1"
                                label={<CustomLabel value={`~${key}`} />}
                              />
                            );
                          })}
                        {[...Array(24).keys()]
                          .map((i) => i + 1)
                          .filter(
                            (h) =>
                              chartTimeIndexes.get(`${h}h`)?.blockNumber ===
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
                                    currentBlockNumberForVibes
                                  )
                                )}
                                stroke="rgba(0, 211, 193, 0.2)"
                              />
                            );
                          })}
                      </>
                    )}
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke={
                        Number(formattedCurrentPrice) >
                          Number(formatUnits(BigInt(higherPrice), 18)) &&
                        zonesOn &&
                        higherPrice > 0
                          ? "green"
                          : Number(formattedCurrentPrice) <
                              Number(formatUnits(BigInt(lowerPrice), 18)) &&
                            zonesOn &&
                            lowerPrice > 0
                          ? "red"
                          : "#8884d8"
                      }
                      strokeWidth={2}
                      animationDuration={200}
                      dot={isFullChart && !previewMode ? <CustomDot /> : false}
                    />
                    {(!allStreams || !previewMode) &&
                      lowerPrice > 0 &&
                      zonesOn && (
                        <ReferenceArea
                          fill="red"
                          fillOpacity={0.2}
                          y1={0}
                          y2={lowerPrice}
                          ifOverflow="hidden"
                        />
                      )}
                    {isFullChart && !previewMode && isChartPaused && (
                      <Brush
                        dataKey="blockNumber"
                        height={30}
                        fill={isChartPaused ? "#2c2970" : "transparent"}
                        stroke={isChartPaused ? "#ada9f9" : "#5e5e6a"}
                        tickFormatter={(tick) => customBrushFormatter(tick)}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </Flex>
              {!isFullChart && disableExchange !== true && (
                <>
                  {walletIsConnected ? (
                    <VibesTokenExchange />
                  ) : (
                    <Flex direction="column">
                      <Text fontSize="12px">you must sign in to trade</Text>
                      <ConnectWallet />
                    </Flex>
                  )}
                </>
              )}
            </Flex>
          </Flex>
        </>
      )}
    </>
  );
};

function prependStartMarker(data: ChartTokenTx[]): ChartTokenTx[] {
  if (data.length === 0 || data[0].event === "") return data;
  const firstBlockNumber = data.length > 0 ? data[0].blockNumber : 0;
  const firstElement: ChartTokenTx = {
    user: "Start",
    event: "",
    amount: 0,
    price: 0,
    priceInUsd: 0,
    priceChangePercentage: 0,
    blockNumber: firstBlockNumber,
  };
  return [firstElement, ...data];
}

export default VibesTokenInterface;
