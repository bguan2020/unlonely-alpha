import { useLazyQuery } from "@apollo/client";
import { Livepeer } from "livepeer";
import { PlaybackInfo } from "livepeer/dist/models/components";
import { useState, useEffect } from "react";
import { GET_LIVEPEER_STREAM_DATA_QUERY } from "../../constants/queries";
import { GetLivepeerStreamDataQuery } from "../../generated/graphql";
import { useChannelContext } from "../context/useChannel";

export const useLivepeerStreamData = () => {
  const { channel } = useChannelContext();
  const { channelQueryData } = channel;
  const [livepeerData, setLivepeerData] =
    useState<GetLivepeerStreamDataQuery["getLivepeerStreamData"]>();

  const livepeer = new Livepeer({
    apiKey: String(process.env.NEXT_PUBLIC_STUDIO_API_KEY),
  });

  const [getLivepeerStreamData] = useLazyQuery<GetLivepeerStreamDataQuery>(
    GET_LIVEPEER_STREAM_DATA_QUERY,
    {
      fetchPolicy: "network-only",
    }
  );

  const [playbackInfo, setPlaybackInfo] = useState<PlaybackInfo | undefined>(
    undefined
  );

  useEffect(() => {
    const init = async () => {
      if (channelQueryData?.livepeerPlaybackId) {
        const res = await livepeer.playback.get(
          channelQueryData?.livepeerPlaybackId
        );
        const playbackInfo = res.playbackInfo;
        setPlaybackInfo(playbackInfo);
      }
    };
    init();
  }, [channelQueryData?.livepeerPlaybackId]);

  useEffect(() => {
    const init = async () => {
      if (channelQueryData?.livepeerStreamId) {
        const res = await getLivepeerStreamData({
          variables: {
            data: { streamId: channelQueryData?.livepeerStreamId },
          },
        });
        setLivepeerData(res.data?.getLivepeerStreamData);
      }
    };
    init();
  }, [channelQueryData?.livepeerStreamId]);

  return {
    livepeerData,
    playbackInfo,
  };
};
