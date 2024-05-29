import { useLazyQuery } from "@apollo/client";
import AppLayout from "../components/layout/AppLayout";
import { GET_LIVEPEER_VIEWERSHIP_METRICS_QUERY } from "../constants/queries";
import {
  GetLivepeerViewershipMetricsQuery,
  LivepeerViewershipMetrics,
} from "../generated/graphql";
import { useEffect, useState } from "react";
import {
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Flex, Text } from "@chakra-ui/react";
import Header from "../components/navigation/Header";
import { formatTimestampToDate } from "../utils/time";
import { stringToHexColor } from "../styles/Colors";

const sample = [
  {
    timestamp: "1716800400000",
    viewCount: "11",
    playbackId: "2b14lwxvdqh5ziry",
    playtimeMins: "7",
  },
  {
    timestamp: "1716872500000",
    viewCount: "3",
    playbackId: "2d87ig5p5hl0r8t3",
    playtimeMins: "21",
  },
  {
    timestamp: "1716429600000",
    viewCount: "30",
    playbackId: "2c7bsdd18av8ayh8",
    playtimeMins: "23",
  },
  {
    timestamp: "1716793200000",
    viewCount: "1",
    playbackId: "2b14lwxvdqh5ziry",
    playtimeMins: "66",
  },
  {
    timestamp: "1716868700000",
    viewCount: "2",
    playbackId: "2b14lwxvdqh5ziry",
    playtimeMins: "10",
  },
  {
    timestamp: "1716868700000",
    viewCount: "28",
    playbackId: "2d87ig5p5hl0r8t3",
    playtimeMins: "2",
  },
  {
    timestamp: "1716872400000",
    viewCount: "19",
    playbackId: "2b14lwxvdqh5ziry",
    playtimeMins: "22",
  },
];

type MergedMetrics = {
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
  const [playbackIdsToShowDataFor, setPlaybackIdsToShowDataFor] = useState<
    string[]
  >([]);

  const [totalViewCountChartData, setTotalViewCountChartData] = useState<
    ConsolidatedViewCountMetrics[]
  >([]);

  const [totalPlaytimeMinsChartData, setTotalPlaytimeMinsChartData] = useState<
    ConsolidatedPlaytimeMinsMetrics[]
  >([]);

  const [getLivepeerViewershipMetricsQuery] =
    useLazyQuery<GetLivepeerViewershipMetricsQuery>(
      GET_LIVEPEER_VIEWERSHIP_METRICS_QUERY,
      {
        fetchPolicy: "network-only",
      }
    );

  useEffect(() => {
    const call = async () => {
      try {
        const dateNow = Date.now();
        const res = await getLivepeerViewershipMetricsQuery({
          variables: {
            data: {
              // playbackId: "a9f1du5ebhy53prt",
              timeStep: "hour", // hour, day, week, month, year
              fromTimestampInMilliseconds: "1716425987000",
              toTimestampInMilliseconds: "1716494400000",
            },
          },
        });
        const data = res?.data?.getLivepeerViewershipMetrics;
        const nonNullData = data?.filter(
          (item): item is LivepeerViewershipMetrics => item !== null
        );
        if (!nonNullData || nonNullData.length === 0) return;
        const {
          viewCounts,
          playtimeMins,
          totalViewCountArray,
          totalPlaytimeMinsArray,
          playbackIdToViewCountTotal,
          playbackIdToPlaytimeMinsTotal,
        } = mergeMetrics(nonNullData);
        const consolidatedTotalViewCountArray = viewCounts.map((metric, i) => {
          return {
            ...metric,
            totalViewCount: totalViewCountArray[i].totalViewCount,
          };
        });
        const consolidatedTotalPlaytimeMinsArray = playtimeMins.map(
          (metric, i) => {
            return {
              ...metric,
              totalPlaytimeMins: totalPlaytimeMinsArray[i].totalPlaytimeMins,
            };
          }
        );
        console.log(
          "consolidatedTotalViewCountArray",
          consolidatedTotalViewCountArray
        );
        console.log(
          "consolidatedTotalPlaytimeMinsArray",
          consolidatedTotalPlaytimeMinsArray
        );
        setPlaybackIdsToShowDataFor(Object.keys(playbackIdToViewCountTotal));
        setTotalViewCountChartData(consolidatedTotalViewCountArray);
        setTotalPlaytimeMinsChartData(consolidatedTotalPlaytimeMinsArray);
      } catch (e) {
        console.error(e);
      }
    };
    call();
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    const [loading, setLoading] = useState(false);
    const [activeChannels, setActiveChannels] = useState<any[]>([]);
    const [topTenPerformingChannels, setTopTenPerformingChannels] = useState<
      [string, number][]
    >([]);
    const [totalViews, setTotalViews] = useState<number>(0);
    useEffect(() => {
      if (!active || !payload || payload.length === 0 || !payload[0].payload) {
        setLoading(false);
        return;
      }
      const enumerableArray = Object.entries(payload[0].payload);
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
      console.log(_activeChannels);
      setActiveChannels(_activeChannels);
      setTopTenPerformingChannels(_topTenPerformingChannels);
    }, [active, payload]);

    return (
      <Flex
        direction="column"
        bg="rgba(0, 0, 0, 0.80)"
        p="5px"
        borderRadius="15px"
      >
        <Flex gap="5px">
          <Text>Total Views</Text>
          <Text>{totalViews}</Text>
        </Flex>
        <Text>{activeChannels.length} active channels</Text>
        <Text>Top Channels</Text>
        {topTenPerformingChannels.map(([key, value]) => (
          <Flex key={key} gap="5px">
            <Text color={stringToHexColor(key.replace("_viewCount", ""))}>
              {key.replace("_viewCount", "")}
            </Text>
            <Text>{value}</Text>
          </Flex>
        ))}
      </Flex>
    );
  };

  return (
    <AppLayout isCustomHeader={false} noHeader>
      <Flex
        direction="column"
        overflowY={"hidden"}
        height="100vh"
        p="10px"
        bg="rgba(5, 0, 31, 1)"
      >
        <Header />
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={totalViewCountChartData}
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
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="totalViewCount"
              stroke="#8884d8"
              strokeWidth={2}
              animationDuration={200}
              dot={false}
            />
            {playbackIdsToShowDataFor.map((playbackId) => (
              <Line
                key={playbackId}
                type="monotone"
                dataKey={`${playbackId}_viewCount`}
                stroke={stringToHexColor(playbackId)}
                animationDuration={200}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Flex>
    </AppLayout>
  );
};
export default Metrics;

const mergeMetrics = (data: LivepeerViewershipMetrics[]) => {
  const allTimestamps = new Set<number>();
  const viewCountsResult: MergedMetrics[] = [];
  const playtimeMinsResult: MergedMetrics[] = [];

  const playbackIdToViewCountTotal: Record<string, number> = {};
  const playbackIdToPlaytimeMinsTotal: Record<string, number> = {};

  // Collect all unique timestamps
  data.forEach((metric) => {
    allTimestamps.add(Number(metric.timestamp));
  });

  // Sort the timestamps
  const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

  // Create a map for quick lookup
  const metricsMap: Record<
    number,
    Record<string, LivepeerViewershipMetrics>
  > = {};
  data.forEach((metric) => {
    const timestamp = Number(metric.timestamp);
    if (!metricsMap[timestamp]) {
      metricsMap[timestamp] = {};
    }
    metricsMap[timestamp][metric.playbackId] = metric;

    // Initialize totals for playbackIds
    if (!(metric.playbackId in playbackIdToViewCountTotal)) {
      playbackIdToViewCountTotal[metric.playbackId] = Number(metric.viewCount);
    } else {
      playbackIdToViewCountTotal[metric.playbackId] += Number(metric.viewCount);
    }
    if (!(metric.playbackId in playbackIdToPlaytimeMinsTotal)) {
      playbackIdToPlaytimeMinsTotal[metric.playbackId] = Number(
        metric.playtimeMins
      );
    } else {
      playbackIdToPlaytimeMinsTotal[metric.playbackId] += Number(
        metric.playtimeMins
      );
    }
  });

  sortedTimestamps.forEach((timestamp) => {
    const viewCountEntry: MergedMetrics = { timestamp };
    const playtimeMinsEntry: MergedMetrics = { timestamp };

    data.forEach((metric) => {
      if (
        metricsMap[timestamp] &&
        metricsMap[timestamp][metric.playbackId] !== undefined
      ) {
        const metricViewCount = Number(
          metricsMap[timestamp][metric.playbackId].viewCount
        );
        const metricPlaytimeMins = Number(
          metricsMap[timestamp][metric.playbackId].playtimeMins
        );

        viewCountEntry[`${metric.playbackId}_viewCount`] = metricViewCount;

        playtimeMinsEntry[`${metric.playbackId}_playtimeMins`] =
          metricPlaytimeMins;
      } else {
        viewCountEntry[`${metric.playbackId}_viewCount`] = 0;
        playtimeMinsEntry[`${metric.playbackId}_playtimeMins`] = 0;
      }
    });

    viewCountsResult.push(viewCountEntry);
    playtimeMinsResult.push(playtimeMinsEntry);
  });

  const totalViewCountArray = viewCountsResult.map((item) => {
    const countableKeys = Object.keys(item).filter((key) =>
      key.includes("_viewCount")
    );
    const sumOfViewCounts = countableKeys
      .map((key) => item[key])
      .reduce((acc, item) => acc + item, 0);
    return {
      timestamp: item.timestamp,
      totalViewCount: sumOfViewCounts,
    };
  });

  const totalPlaytimeMinsArray = playtimeMinsResult.map((item) => {
    const countableKeys = Object.keys(item).filter((key) =>
      key.includes("_playtimeMins")
    );
    const sumOfPlaytimeMins = countableKeys
      .map((key) => item[key])
      .reduce((acc, item) => acc + item, 0);
    return {
      timestamp: item.timestamp,
      totalPlaytimeMins: sumOfPlaytimeMins,
    };
  });

  return {
    viewCounts: viewCountsResult, // This is the viewCount for each playbackId at each timestamp
    playtimeMins: playtimeMinsResult, // This is the playtimeMins for each playbackId at each timestamp
    totalViewCountArray, // This is the sum of all viewCounts for each timestamp
    totalPlaytimeMinsArray, // This is the sum of all playtimeMins for each timestamp
    playbackIdToViewCountTotal, // This is the total viewCount for each playbackId
    playbackIdToPlaytimeMinsTotal, // This is the total playtimeMins for each playbackId
  };
};
