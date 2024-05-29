import { LivepeerViewershipMetrics } from "../generated/graphql";
import { MergedMetrics } from "../pages/metrics";

export const mergeMetrics = (data: LivepeerViewershipMetrics[]) => {
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

  export const convertToObjectArray = (data: Record<string, number>, thresholdPercentage: number): string[] => {
    // Convert the object to an array of entries
    const entries = Object.entries(data);

    // Determine the largest value
    const largestValue = Math.max(...entries.map(entry => entry[1]));

    // Filter entries to include only those with values >= 1% of the largest value
    const filteredEntries = entries.filter(entry => entry[1] >= largestValue * thresholdPercentage);

    // Sort the filtered entries by the number values in descending order
    filteredEntries.sort((a, b) => b[1] - a[1]);

    // Map the sorted entries to an array of keys
    const sortedKeys = filteredEntries.map(entry => entry[0]);
  
    return sortedKeys;
  };