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
import { memo, useEffect, useState } from "react";
import {
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button, Flex, Input, Spinner, Text, useToast } from "@chakra-ui/react";
import { formatTimestampToDate } from "../utils/time";
import { getColorFromString } from "../styles/Colors";
import {
  mergeMetrics,
  convertToObjectArray,
} from "../utils/dataMetricsFormatting";
import useDebounce from "../hooks/internal/useDebounce";

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
  const [toDate, setToDate] = useState<number>(0);
  const [fromDate, setFromDate] = useState<number>(0);
  const [selectedButton, setSelectedButton] = useState<
    "1d" | "1w" | "1m" | "3m" | "4m" | "5m" | "6m" | "custom" | "none"
  >("none");
  const [turnOnChannelLines, setTurnOnChannelLines] = useState<boolean>(false);

  const [fromString, setFromString] = useState<string>("");
  const [toString, setToString] = useState<string>("");

  const debouncedFromString = useDebounce(fromString, 500);
  const debouncedToString = useDebounce(toString, 500);

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
    setToDate(Date.now());
  }, []);

  return (
    <Flex>
      <Flex direction="column" width="10%" p="10px" gap="5px">
        <Button
          _hover={{}}
          _active={{}}
          _focus={{}}
          bg={selectedButton === "1d" ? "#15b8ce" : undefined}
          onClick={() => {
            if (selectedButton === "custom") setToDate(Date.now());
            setFromDate(
              selectedButton === "custom"
                ? Date.now()
                : toDate - 1000 * 60 * 60 * 24
            );
            setSelectedButton("1d");
            setTurnOnChannelLines(false);
          }}
        >
          1d
        </Button>
        <Button
          _hover={{}}
          _active={{}}
          _focus={{}}
          bg={selectedButton === "1w" ? "#15b8ce" : undefined}
          onClick={() => {
            if (selectedButton === "custom") setToDate(Date.now());
            setFromDate(
              selectedButton === "custom"
                ? Date.now()
                : toDate - 1000 * 60 * 60 * 24 * 7
            );
            setSelectedButton("1w");
            setTurnOnChannelLines(false);
          }}
        >
          1w
        </Button>
        <Button
          _hover={{}}
          _active={{}}
          _focus={{}}
          bg={selectedButton === "1m" ? "#15b8ce" : undefined}
          onClick={() => {
            if (selectedButton === "custom") setToDate(Date.now());
            setFromDate(
              selectedButton === "custom"
                ? Date.now()
                : toDate - 1000 * 60 * 60 * 24 * 30
            );
            setSelectedButton("1m");
            setTurnOnChannelLines(false);
          }}
        >
          1m
        </Button>
        <Button
          _hover={{}}
          _active={{}}
          _focus={{}}
          bg={selectedButton === "3m" ? "#15b8ce" : undefined}
          onClick={() => {
            if (selectedButton === "custom") setToDate(Date.now());
            setFromDate(
              selectedButton === "custom"
                ? Date.now()
                : toDate - 1000 * 60 * 60 * 24 * 30 * 3
            );
            setSelectedButton("3m");
            setTurnOnChannelLines(false);
          }}
        >
          3m
        </Button>
        <Button
          _hover={{}}
          _active={{}}
          _focus={{}}
          bg={selectedButton === "4m" ? "#15b8ce" : undefined}
          onClick={() => {
            if (selectedButton === "custom") setToDate(Date.now());
            setFromDate(
              selectedButton === "custom"
                ? Date.now()
                : toDate - 1000 * 60 * 60 * 24 * 30 * 4
            );
            setSelectedButton("4m");
            setTurnOnChannelLines(false);
          }}
        >
          4m
        </Button>
        <Button
          _hover={{}}
          _active={{}}
          _focus={{}}
          bg={selectedButton === "5m" ? "#15b8ce" : undefined}
          onClick={() => {
            if (selectedButton === "custom") setToDate(Date.now());
            setFromDate(
              selectedButton === "custom"
                ? Date.now()
                : toDate - 1000 * 60 * 60 * 24 * 30 * 5
            );
            setSelectedButton("5m");
            setTurnOnChannelLines(false);
          }}
        >
          5m
        </Button>
        <Button
          _hover={{}}
          _active={{}}
          _focus={{}}
          bg={selectedButton === "6m" ? "#15b8ce" : undefined}
          onClick={() => {
            if (selectedButton === "custom") setToDate(Date.now());
            setFromDate(
              selectedButton === "custom"
                ? Date.now()
                : toDate - 1000 * 60 * 60 * 24 * 30 * 6
            );
            setSelectedButton("6m");
            setTurnOnChannelLines(false);
          }}
        >
          6m
        </Button>
        <Flex direction={"column"} gap="5px">
          <Text>From</Text>
          <Input
            variant={isValidDate(debouncedFromString) ? undefined : "redGlow"}
            placeholder="MM/DD/YYYY"
            value={fromString}
            onChange={(e) => setFromString(e.target.value)}
          />
          <Text>To</Text>
          <Input
            variant={isValidDate(debouncedToString) ? undefined : "redGlow"}
            placeholder="MM/DD/YYYY"
            value={toString}
            onChange={(e) => setToString(e.target.value)}
          />
          <Button
            _hover={{}}
            _active={{}}
            _focus={{}}
            bg={selectedButton === "custom" ? "#15b8ce" : undefined}
            onClick={() => {
              if (
                isValidDate(debouncedFromString) &&
                isValidDate(debouncedToString)
              ) {
                setFromDate(new Date(debouncedFromString).getTime());
                setToDate(new Date(debouncedToString).getTime());
                setSelectedButton("custom");
              }
            }}
          >
            enter
          </Button>
        </Flex>
        <Button
          mt="10px"
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
            note: to reduce lag, lines of channels whose values are less than 1%
            of the channel with the largest value are not shown
          </Text>
        )}
      </Flex>
      <Graphs
        fromDate={fromDate}
        toDate={toDate}
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
    toDate,
    turnOnChannelLines,
    channels,
  }: {
    fromDate: number;
    toDate: number;
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
          playbackIdToPlaytimeMinsTotal[
            fromDate.toString().concat(toDate.toString())
          ] !== undefined ||
          fromDate === 0 ||
          toDate === 0
        ) {
          return;
        }
        setGraphsLoading("fetching");
        try {
          let timeStepsToTry: string[] = [];
          if (toDate - fromDate < 1000 * 60 * 60 * 24) {
            timeStepsToTry = ["hour"];
          } else if (toDate - fromDate < 1000 * 60 * 60 * 24 * 7) {
            timeStepsToTry = ["hour", "day"];
          } else if (toDate - fromDate < 1000 * 60 * 60 * 24 * 30) {
            timeStepsToTry = ["day", "week"];
          } else {
            timeStepsToTry = ["week", "month"];
          }
          let metricData: LivepeerViewershipMetrics[] = [];
          for (let t = 0; t < timeStepsToTry.length; t++) {
            const res = await getLivepeerViewershipMetricsQuery({
              variables: {
                data: {
                  // playbackId: "a9f1du5ebhy53prt",
                  timeStep: timeStepsToTry[t],
                  fromTimestampInMilliseconds: fromDate.toString(),
                  toTimestampInMilliseconds: toDate.toString(),
                },
              },
            });
            const data = res?.data?.getLivepeerViewershipMetrics;
            const nonNullData = data?.filter(
              (item): item is LivepeerViewershipMetrics => item !== null
            );
            if (nonNullData && nonNullData.length > 0) {
              metricData = nonNullData;
              setGraphsLoading("assembling");
              break;
            } else if (t === timeStepsToTry.length - 1) {
              setGraphsLoading(false);
              handleGraphError("Reached data limit for this time period");
              return;
            }
          }
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
              [fromDate.toString().concat(toDate.toString())]:
                _playbackIdToViewCountTotal,
            };
          });
          setPlaybackIdToPlaytimeMinsTotal((prev) => {
            return {
              ...prev,
              [fromDate.toString().concat(toDate.toString())]:
                _playbackIdToPlaytimeMinsTotal,
            };
          });
          setTotalViewCountChartData((prev) => {
            return {
              ...prev,
              [fromDate.toString().concat(toDate.toString())]:
                consolidatedTotalViewCountArray,
            };
          });
          setTotalPlaytimeMinsChartData((prev) => {
            return {
              ...prev,
              [fromDate.toString().concat(toDate.toString())]:
                consolidatedTotalPlaytimeMinsArray,
            };
          });
        } catch (e) {
          console.error(e);
        }
        setGraphsLoading(false);
      };
      call();
    }, [fromDate, toDate]);

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
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={
                    totalViewCountChartData[
                      fromDate.toString().concat(toDate.toString())
                    ]
                  }
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
                    playbackIdToViewCountTotal[
                      fromDate.toString().concat(toDate.toString())
                    ] &&
                    convertToObjectArray(
                      playbackIdToViewCountTotal[
                        fromDate.toString().concat(toDate.toString())
                      ],
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
                <Button
                  bg={"#1d6f42"}
                  color="white"
                  _hover={{}}
                  _active={{}}
                  _focus={{}}
                  onClick={() => {
                    saveMetricsAsCsv(
                      totalViewCountChartData[
                        fromDate.toString().concat(toDate.toString())
                      ],
                      "viewCount",
                      fromDate,
                      toDate
                    );
                  }}
                >
                  save graph as csv
                </Button>
                <Text textAlign={"center"}>Total Views per Channel</Text>
                <Flex direction="column" overflowY={"scroll"}>
                  {playbackIdToViewCountTotal[
                    fromDate.toString().concat(toDate.toString())
                  ] &&
                    convertToObjectArray(
                      playbackIdToViewCountTotal[
                        fromDate.toString().concat(toDate.toString())
                      ],
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
                            {
                              playbackIdToViewCountTotal[
                                fromDate.toString().concat(toDate.toString())
                              ][p]
                            }
                          </Text>
                        </Flex>
                      );
                    })}
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
                  data={
                    totalPlaytimeMinsChartData[
                      fromDate.toString().concat(toDate.toString())
                    ]
                  }
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
                    playbackIdToPlaytimeMinsTotal[
                      fromDate.toString().concat(toDate.toString())
                    ] &&
                    convertToObjectArray(
                      playbackIdToPlaytimeMinsTotal[
                        fromDate.toString().concat(toDate.toString())
                      ],
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
                <Button
                  bg={"#1d6f42"}
                  color="white"
                  _hover={{}}
                  _active={{}}
                  _focus={{}}
                  onClick={() => {
                    saveMetricsAsCsv(
                      totalPlaytimeMinsChartData[
                        fromDate.toString().concat(toDate.toString())
                      ],
                      "playtimeMins",
                      fromDate,
                      toDate
                    );
                  }}
                >
                  save graph as csv
                </Button>
                <Text textAlign={"center"}>
                  Total play time (mins) per Channel
                </Text>
                <Flex direction="column" overflowY={"scroll"}>
                  {playbackIdToPlaytimeMinsTotal[
                    fromDate.toString().concat(toDate.toString())
                  ] &&
                    convertToObjectArray(
                      playbackIdToPlaytimeMinsTotal[
                        fromDate.toString().concat(toDate.toString())
                      ],
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
                              playbackIdToPlaytimeMinsTotal[
                                fromDate.toString().concat(toDate.toString())
                              ][p]
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

const isValidDate = (dateString: string) => {
  // Regular expression to check if string is in MM/DD/YYYY format
  const regexPattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;

  // Check if the date string matches the regex pattern
  if (!regexPattern.test(dateString)) {
    return false;
  }

  // Parse the date parts to integers
  const parts = dateString.split("/");
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  // Check if the date is valid using Date object
  const date = new Date(year, month - 1, day); // Months are 0-based in JavaScript Date
  return (
    date &&
    date.getMonth() + 1 === month &&
    date.getDate() === day &&
    date.getFullYear() === year
  );
};

const saveMetricsAsCsv = (
  data: ConsolidatedPlaytimeMinsMetrics[] | ConsolidatedViewCountMetrics[],
  keyword: "playtimeMins" | "viewCount",
  fromDate: number,
  toDate: number
) => {
  if (data.length === 0) return;

  const convertedFromDate = formatTimestampToDate(fromDate, true);
  const convertedToDate = formatTimestampToDate(toDate, true);

  const totalKeyword =
    keyword === "playtimeMins" ? "totalPlaytimeMins" : "totalViewCount";
  const playbackIdKeyword =
    keyword === "playtimeMins" ? "_playtimeMins" : "_viewCount";

  // Extract all unique playbackIds
  const playbackIds = Object.keys(data[0]).filter(
    (key) => key !== "timestamp" && key !== totalKeyword
  );

  const renamedPlaybackIds = playbackIds.map((id) =>
    id.replace(playbackIdKeyword, "")
  );

  // Create CSV headers
  const headers = ["timestamp", totalKeyword, ...renamedPlaybackIds];
  const csvRows = [headers.join(",")];

  // Create CSV rows
  data.forEach((row) => {
    const formattedDate = formatTimestampToDate(row.timestamp);
    const rowData = [formattedDate, row[totalKeyword]];

    playbackIds.forEach((id) => {
      rowData.push(row[id] || 0); // Default to 0 if the playtimeMins is not available
    });

    csvRows.push(rowData.join(","));
  });

  // Create a Blob from the CSV string
  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv" });

  // Create a link element and trigger a download
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${keyword}_${convertedFromDate}_${convertedToDate}.csv`;
  link.click();

  // Clean up
  URL.revokeObjectURL(link.href);
};
