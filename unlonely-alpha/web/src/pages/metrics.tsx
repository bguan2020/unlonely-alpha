import { useLazyQuery } from "@apollo/client";
import {
  GET_CHANNELS_QUERY,
  GET_LIVEPEER_VIEWERSHIP_METRICS_QUERY,
} from "../constants/queries";
import {
  GetChannelsQuery,
  GetLivepeerViewershipMetricsQuery,
  LivepeerViewershipMetrics,
} from "../generated/graphql";
import { memo, useEffect, useMemo, useState } from "react";
import {
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button, Flex, Spinner, Text, useToast } from "@chakra-ui/react";
import { formatTimestampToDate } from "../utils/time";
import { getColorFromString } from "../styles/Colors";
import {
  mergeMetrics,
  convertToObjectArray,
} from "../utils/dataMetricsFormatting";

export type MergedMetrics = {
  timestamp: number;
  [playbackId: string]: number; // Allow playbackId-specific viewCounts
};

type ConsolidatedViewCountMetrics = MergedMetrics & {
  totalViewCount: number;
};

type ConsolidatedPlaytimeMinsMetrics = MergedMetrics & {
  totalPlaytimeMins: number;
};

const Metrics = () => {
  const [fromDate, setFromDate] = useState<
    "1d" | "1w" | "1m" | "3m" | "4m" | "5m" | "6m"
  >("1d");
  const [dateNow, setDateNow] = useState<number>(Date.now());
  const [turnOnChannelLines, setTurnOnChannelLines] = useState<boolean>(false);

  const [getChannels, { data: channels, loading: channelsLoading, error }] =
    useLazyQuery<GetChannelsQuery>(GET_CHANNELS_QUERY, {
      variables: {
        data: {},
      },
      fetchPolicy: "cache-first",
    });

  useEffect(() => {
    const _getChannels = async () => {
      try {
        await getChannels();
      } catch (e) {
        console.error(e);
      }
    };
    _getChannels();
    setDateNow(Date.now());
  }, []);

  return (
    <Flex>
      <Flex direction="column" width="10%" p="10px" gap="5px">
        <Button
          _hover={{}}
          _active={{}}
          _focus={{}}
          bg={fromDate === "1d" ? "#15b8ce" : undefined}
          onClick={() => {
            setFromDate("1d");
            setTurnOnChannelLines(false);
          }}
        >
          1d
        </Button>
        <Button
          _hover={{}}
          _active={{}}
          _focus={{}}
          bg={fromDate === "1w" ? "#15b8ce" : undefined}
          onClick={() => {
            setFromDate("1w");
            setTurnOnChannelLines(false);
          }}
        >
          1w
        </Button>
        <Button
          _hover={{}}
          _active={{}}
          _focus={{}}
          bg={fromDate === "1m" ? "#15b8ce" : undefined}
          onClick={() => {
            setFromDate("1m");
            setTurnOnChannelLines(false);
          }}
        >
          1m
        </Button>

        <Button
          _hover={{}}
          _active={{}}
          _focus={{}}
          bg={fromDate === "3m" ? "#15b8ce" : undefined}
          onClick={() => {
            setFromDate("3m");
            setTurnOnChannelLines(false);
          }}
        >
          3m
        </Button>
        <Button
          _hover={{}}
          _active={{}}
          _focus={{}}
          bg={fromDate === "4m" ? "#15b8ce" : undefined}
          onClick={() => {
            setFromDate("4m");
            setTurnOnChannelLines(false);
          }}
        >
          4m
        </Button>
        <Button
          _hover={{}}
          _active={{}}
          _focus={{}}
          bg={fromDate === "5m" ? "#15b8ce" : undefined}
          onClick={() => {
            setFromDate("5m");
            setTurnOnChannelLines(false);
          }}
        >
          5m
        </Button>
        <Button
          _hover={{}}
          _active={{}}
          _focus={{}}
          bg={fromDate === "6m" ? "#15b8ce" : undefined}
          onClick={() => {
            setFromDate("6m");
            setTurnOnChannelLines(false);
          }}
        >
          6m
        </Button>
        <Button
          _hover={{}}
          _active={{}}
          _focus={{}}
          bg={turnOnChannelLines ? "#f56e00" : undefined}
          onClick={() => setTurnOnChannelLines((prev) => !prev)}
        >
          Show Channels
        </Button>
        {turnOnChannelLines && (
          <Text>
            note: to prevent lag, lines of channels whose values are less than
            1% of the channel with the largest value are not shown
          </Text>
        )}
      </Flex>
      <Graphs
        fromDate={fromDate}
        dateNow={dateNow}
        channels={channels}
        turnOnChannelLines={turnOnChannelLines}
      />
    </Flex>
  );
};

export default Metrics;

const Graphs = memo(
  ({
    fromDate,
    dateNow,
    turnOnChannelLines,
    channels,
  }: {
    fromDate: "1d" | "1w" | "1m" | "3m" | "4m" | "5m" | "6m";
    dateNow: number;
    turnOnChannelLines: boolean;
    channels?: GetChannelsQuery;
  }) => {
    const toast = useToast();

    const [graphsLoading, setGraphsLoading] = useState<
      "fetching" | "assembling" | false
    >(false);
    const [playbackIdToViewCountTotal, setPlaybackIdToViewCountTotal] =
      useState<Record<string, Record<string, number>>>({});

    const [playbackIdToPlaytimeMinsTotal, setPlaybackIdToPlaytimeMinsTotal] =
      useState<Record<string, Record<string, number>>>({});

    const [totalViewCountChartData, setTotalViewCountChartData] = useState<
      Record<string, ConsolidatedViewCountMetrics[]>
    >({});

    const [totalPlaytimeMinsChartData, setTotalPlaytimeMinsChartData] =
      useState<Record<string, ConsolidatedPlaytimeMinsMetrics[]>>({});

    const [playbackIdToChannelSlugMap, setPlaybackIdToChannelSlugMap] =
      useState<Record<string, string>>({});

    const canUseTooltip = useMemo(() => {
      if (turnOnChannelLines && fromDate.includes("m")) {
        return false;
      }
      return true;
    }, [fromDate, turnOnChannelLines]);

    const [getLivepeerViewershipMetricsQuery] =
      useLazyQuery<GetLivepeerViewershipMetricsQuery>(
        GET_LIVEPEER_VIEWERSHIP_METRICS_QUERY,
        {
          fetchPolicy: "network-only",
        }
      );

    const handleGraphError = (str: string) => {
      toast({
        title: str,
        status: "error",
        duration: 5000,
        position: "bottom",
        isClosable: true,
      });
    };

    useEffect(() => {
      const call = async () => {
        if (
          graphsLoading ||
          playbackIdToPlaytimeMinsTotal[fromDate] !== undefined
        ) {
          return;
        }
        setGraphsLoading("fetching");
        try {
          const fromDateInMilliseconds = (() => {
            switch (fromDate) {
              case "1d":
                return dateNow - 1000 * 60 * 60 * 24;
              case "1w":
                return dateNow - 1000 * 60 * 60 * 24 * 7;
              case "1m":
                return dateNow - 1000 * 60 * 60 * 24 * 30;
              case "3m":
                return dateNow - 1000 * 60 * 60 * 24 * 30 * 3;
              case "4m":
                return dateNow - 1000 * 60 * 60 * 24 * 30 * 4;
              case "5m":
                return dateNow - 1000 * 60 * 60 * 24 * 30 * 5;
              case "6m":
                return dateNow - 1000 * 60 * 60 * 24 * 30 * 6;
            }
          })();
          let timeStepsToTry: string[] = [];
          if (fromDate === "1d") timeStepsToTry = ["hour"];
          if (fromDate === "1w") timeStepsToTry = ["hour", "day"];
          if (fromDate === "1m") {
            timeStepsToTry = ["day", "week"];
          } else if (fromDate.includes("m")) {
            timeStepsToTry = ["week", "month"];
          }
          let metricData: LivepeerViewershipMetrics[] = [];
          for (let t = 0; t < timeStepsToTry.length; t++) {
            const res = await getLivepeerViewershipMetricsQuery({
              variables: {
                data: {
                  // playbackId: "a9f1du5ebhy53prt",
                  timeStep: timeStepsToTry[t],
                  fromTimestampInMilliseconds:
                    fromDateInMilliseconds.toString(),
                  toTimestampInMilliseconds: dateNow.toString(),
                },
              },
            });
            const data = res?.data?.getLivepeerViewershipMetrics;
            const nonNullData = data?.filter(
              (item): item is LivepeerViewershipMetrics => item !== null
            );
            if (nonNullData && nonNullData.length > 0) {
              metricData = nonNullData;
              break;
            } else if (t === timeStepsToTry.length - 1) {
              setGraphsLoading(false);
              handleGraphError("No data found for this time period");
              return;
            }
          }
          setGraphsLoading("assembling");
          const {
            viewCounts,
            playtimeMins,
            totalViewCountArray,
            totalPlaytimeMinsArray,
            playbackIdToViewCountTotal: _playbackIdToViewCountTotal,
            playbackIdToPlaytimeMinsTotal: _playbackIdToPlaytimeMinsTotal,
          } = mergeMetrics(metricData);
          const consolidatedTotalViewCountArray = viewCounts.map(
            (metric, i) => {
              return {
                ...metric,
                totalViewCount: totalViewCountArray[i].totalViewCount,
              };
            }
          );
          const consolidatedTotalPlaytimeMinsArray = playtimeMins.map(
            (metric, i) => {
              return {
                ...metric,
                totalPlaytimeMins: totalPlaytimeMinsArray[i].totalPlaytimeMins,
              };
            }
          );
          setPlaybackIdToViewCountTotal((prev) => {
            return {
              ...prev,
              [fromDate]: _playbackIdToViewCountTotal,
            };
          });
          setPlaybackIdToPlaytimeMinsTotal((prev) => {
            return {
              ...prev,
              [fromDate]: _playbackIdToPlaytimeMinsTotal,
            };
          });
          setTotalViewCountChartData((prev) => {
            return { ...prev, [fromDate]: consolidatedTotalViewCountArray };
          });
          setTotalPlaytimeMinsChartData((prev) => {
            return { ...prev, [fromDate]: consolidatedTotalPlaytimeMinsArray };
          });
        } catch (e) {
          console.error(e);
        }
        setGraphsLoading(false);
      };
      call();
    }, [fromDate, dateNow]);

    useEffect(() => {
      if (!channels?.getChannelFeed) return;
      const channelSlugMap: Record<string, string> = {};
      channels?.getChannelFeed.forEach((channel) => {
        if (channel?.livepeerPlaybackId)
          channelSlugMap[channel?.livepeerPlaybackId] = channel.slug;
      });
      setPlaybackIdToChannelSlugMap(channelSlugMap);
    }, [channels]);

    const ViewCustomTooltip = ({ active, payload }: any) => {
      const [loading, setLoading] = useState(false);
      const [activeChannels, setActiveChannels] = useState<any[]>([]);
      const [topTenPerformingChannels, setTopTenPerformingChannels] = useState<
        [string, number][]
      >([]);
      const [totalViews, setTotalViews] = useState<number>(0);
      const [timeStamp, setTimeStamp] = useState<string>("");
      useEffect(() => {
        if (
          !active ||
          !payload ||
          payload.length === 0 ||
          !payload[0].payload
        ) {
          setLoading(false);
          setActiveChannels([]);
          setTopTenPerformingChannels([]);
          return;
        }
        // const handler = setTimeout(async () => {
        setLoading(true);
        const enumerableArray = Object.entries(payload[0].payload);
        setTimeStamp(payload[0].payload["timestamp"]);
        setTotalViews(
          enumerableArray.filter(
            ([key]) => key === "totalViewCount"
          )[0][1] as number
        );
        const _activeChannels = enumerableArray
          .filter(([key, value]) => key.includes("_viewCount"))
          .filter(([key, value]) => (value as number) > 0);
        const _topTenPerformingChannels = activeChannels
          .sort((a, b) => (b[1] as number) - (a[1] as number))
          .slice(0, 10);
        setActiveChannels(_activeChannels);
        setTopTenPerformingChannels(_topTenPerformingChannels);
        setLoading(false);
        // }, 500);

        // return () => clearTimeout(handler);
      }, [active, payload]);

      return (
        <Flex
          direction="column"
          bg="rgba(0, 0, 0, 0.80)"
          p="5px"
          borderRadius="15px"
        >
          {loading ? (
            <>
              <Text>loading</Text>
            </>
          ) : (
            <>
              {timeStamp !== "" && (
                <Text>{formatTimestampToDate(Number(timeStamp))}</Text>
              )}
              <Flex gap="5px">
                <Text>Total Views</Text>
                <Text>{totalViews}</Text>
              </Flex>
              <Text>{activeChannels.length} active channels</Text>
              <Text>Top Channels</Text>
              {topTenPerformingChannels.map(([key, value]) => {
                const _key = key.replace("_viewCount", "");
                return (
                  <Flex key={_key} gap="5px">
                    <Text color={getColorFromString(_key)}>
                      {playbackIdToChannelSlugMap[_key] ?? _key}
                    </Text>
                    <Text>{value}</Text>
                  </Flex>
                );
              })}
            </>
          )}
        </Flex>
      );
    };

    const PlaytimeCustomTooltip = ({ active, payload }: any) => {
      const [activeChannels, setActiveChannels] = useState<any[]>([]);
      const [loading, setLoading] = useState(false);
      const [topTenPerformingChannels, setTopTenPerformingChannels] = useState<
        [string, number][]
      >([]);
      const [totalPlaytime, setTotalPlaytime] = useState<number>(0);
      const [timeStamp, setTimeStamp] = useState<string>("");
      useEffect(() => {
        if (
          !active ||
          !payload ||
          payload.length === 0 ||
          !payload[0].payload
        ) {
          setLoading(false);
          return;
        }
        // const handler = setTimeout(async () => {
        setLoading(true);
        const enumerableArray = Object.entries(payload[0].payload);
        setTimeStamp(payload[0].payload["timestamp"]);
        setTotalPlaytime(
          enumerableArray.filter(
            ([key]) => key === "totalPlaytimeMins"
          )[0][1] as number
        );
        const _activeChannels = enumerableArray
          .filter(([key, value]) => key.includes("_playtimeMins"))
          .filter(([key, value]) => (value as number) > 0);
        const _topTenPerformingChannels = activeChannels
          .sort((a, b) => (b[1] as number) - (a[1] as number))
          .slice(0, 10);
        setActiveChannels(_activeChannels);
        setTopTenPerformingChannels(_topTenPerformingChannels);
        setLoading(false);
        // }, 500);

        // return () => clearTimeout(handler);
      }, [active, payload]);

      return (
        <Flex
          direction="column"
          bg="rgba(0, 0, 0, 0.80)"
          p="5px"
          borderRadius="15px"
        >
          {loading ? (
            <>
              <Text>loading</Text>
            </>
          ) : (
            <>
              {timeStamp !== "" && (
                <Text>{formatTimestampToDate(Number(timeStamp))}</Text>
              )}
              <Flex gap="5px">
                <Text>Total Playtime</Text>
                <Text>{Math.floor(totalPlaytime)}</Text>
              </Flex>
              <Text>{activeChannels.length} active channels</Text>
              <Text>Top Channels</Text>
              {topTenPerformingChannels.map(([key, value]) => {
                const _key = key.replace("_playtimeMins", "");
                return (
                  <Flex key={_key} gap="5px">
                    <Text color={getColorFromString(_key)}>
                      {playbackIdToChannelSlugMap[_key] ?? _key}
                    </Text>
                    <Text>{Math.floor(value)}</Text>
                  </Flex>
                );
              })}
            </>
          )}
        </Flex>
      );
    };

    return (
      <Flex
        direction="column"
        width="100%"
        justifyContent={"center"}
        alignItems={"center"}
      >
        {graphsLoading ? (
          <Flex direction="column">
            <Flex justifyContent={"center"}>
              <Spinner />
            </Flex>
            <Text>{graphsLoading}</Text>
          </Flex>
        ) : (
          <>
            <Flex
              overflowY={"hidden"}
              p="10px"
              bg="rgba(5, 0, 31, 1)"
              height="50vh"
              width="100%"
            >
              <Flex>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={totalViewCountChartData[fromDate]}
                    margin={{ top: 15, right: 30, left: 20, bottom: 20 }}
                  >
                    <XAxis
                      tickFormatter={(value) => formatTimestampToDate(value)}
                      dataKey="timestamp"
                      type="number"
                      domain={["dataMin", "dataMax"]}
                      allowDataOverflow={false}
                    >
                      <Label value="time" offset={0} position="insideBottom" />
                    </XAxis>
                    <YAxis
                      label={{
                        value: "ViewCount",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip content={<ViewCustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="totalViewCount"
                      stroke="#8884d8"
                      strokeWidth={3}
                      animationDuration={200}
                      dot={false}
                    />
                    {turnOnChannelLines &&
                      playbackIdToViewCountTotal[fromDate] &&
                      convertToObjectArray(
                        playbackIdToViewCountTotal[fromDate],
                        0.01
                      ).map((playbackId) => (
                        <Line
                          key={playbackId}
                          type="monotone"
                          dataKey={`${playbackId}_viewCount`}
                          stroke={getColorFromString(playbackId)}
                          animationDuration={200}
                          dot={false}
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
                <Flex
                  width="15%"
                  direction="column"
                  height="50vh"
                  p="5px"
                  gap="10px"
                >
                  <Text textAlign={"center"}>Total Views per Channel</Text>
                  <Flex direction="column" overflowY={"scroll"}>
                    {playbackIdToViewCountTotal[fromDate] &&
                      convertToObjectArray(
                        playbackIdToViewCountTotal[fromDate],
                        0
                      ).map((p) => {
                        return (
                          <Flex
                            key={p}
                            gap="5px"
                            justifyContent={"space-between"}
                          >
                            <Text color={getColorFromString(p)}>
                              {playbackIdToChannelSlugMap[p] ?? p}
                            </Text>
                            <Text>
                              {playbackIdToViewCountTotal[fromDate][p]}
                            </Text>
                          </Flex>
                        );
                      })}
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
            <Flex
              overflowY={"hidden"}
              p="10px"
              bg="rgba(5, 0, 31, 1)"
              height="50vh"
              width="100%"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={totalPlaytimeMinsChartData[fromDate]}
                  margin={{ top: 15, right: 30, left: 20, bottom: 20 }}
                >
                  <XAxis
                    tickFormatter={(value) => formatTimestampToDate(value)}
                    dataKey="timestamp"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    allowDataOverflow={false}
                  >
                    <Label value="time" offset={0} position="insideBottom" />
                  </XAxis>
                  <YAxis
                    label={{
                      value: "Playtime (mins)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip content={<PlaytimeCustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="totalPlaytimeMins"
                    stroke="#8884d8"
                    strokeWidth={3}
                    animationDuration={200}
                    dot={false}
                  />
                  {turnOnChannelLines &&
                    playbackIdToPlaytimeMinsTotal[fromDate] &&
                    convertToObjectArray(
                      playbackIdToPlaytimeMinsTotal[fromDate],
                      0.01
                    ).map((playbackId) => (
                      <Line
                        key={playbackId}
                        type="monotone"
                        dataKey={`${playbackId}_playtimeMins`}
                        stroke={getColorFromString(playbackId)}
                        animationDuration={200}
                        dot={false}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
              <Flex
                width="15%"
                direction="column"
                height="50vh"
                p="5px"
                gap="10px"
              >
                <Text textAlign={"center"}>
                  Total play time (mins) per Channel
                </Text>
                <Flex direction="column" overflowY={"scroll"}>
                  {playbackIdToPlaytimeMinsTotal[fromDate] &&
                    convertToObjectArray(
                      playbackIdToPlaytimeMinsTotal[fromDate],
                      0
                    ).map((p) => {
                      return (
                        <Flex
                          key={p}
                          gap="5px"
                          justifyContent={"space-between"}
                        >
                          <Text color={getColorFromString(p)}>
                            {playbackIdToChannelSlugMap[p] ?? p}
                          </Text>
                          <Text>
                            {Math.floor(
                              playbackIdToPlaytimeMinsTotal[fromDate][p]
                            )}
                          </Text>
                        </Flex>
                      );
                    })}
                </Flex>
              </Flex>
            </Flex>
          </>
        )}
      </Flex>
    );
  }
);
