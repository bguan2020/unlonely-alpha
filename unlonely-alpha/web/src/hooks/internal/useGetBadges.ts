import { useState, useEffect } from "react";

import { useChannelContext } from "../context/useChannel";

export const useGetBadges = (rank?: number) => {
  const { channel } = useChannelContext();
  const { channelQueryData } = channel;
  const [rankUrl, setRankUrl] = useState<string | undefined>(undefined);
  const [rankDesc, setRankDesc] = useState<string>("");

  useEffect(() => {
    if (rank === undefined || rank === -1) {
      setRankUrl(undefined);
      setRankDesc("");
      return;
    }
    if (rank < 10) {
      setRankUrl("/svg/holder-1.svg");
      setRankDesc("Top 10 Badge Holder");
      return;
    }
    if (rank < 20) {
      setRankUrl("/svg/holder-2.svg");
      setRankDesc("Top 20 Badge Holder");
      return;
    }
    if (rank < 30) {
      setRankUrl("/svg/holder-3.svg");
      setRankDesc("Top 30 Badge Holder");
      return;
    }
    setRankUrl("/svg/holder-general.svg");
    setRankDesc("Badge Holder");
  }, [rank, channelQueryData]);

  return {
    rankUrl,
    rankDesc,
  };
};
