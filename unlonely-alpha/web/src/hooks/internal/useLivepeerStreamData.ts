import { useLazyQuery } from "@apollo/client";
import { Livepeer } from "livepeer";
import { PlaybackInfo } from "livepeer/models/components/playbackinfo";
import { useState, useEffect } from "react";
import { GET_LIVEPEER_STREAM_DATA_QUERY } from "../../constants/queries";
import { GetLivepeerStreamDataQuery } from "../../generated/graphql";

export const useLivepeerStreamData = ({
  livepeerStreamId,
  livepeerPlaybackId,
}: {
  livepeerStreamId?: string;
  livepeerPlaybackId?: string;
}) => {
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
  const [checkedForLivepeerPlaybackInfo, setCheckedForLivepeerPlaybackInfo] =
    useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      if (livepeerPlaybackId) {
        console.log("first if statment passed", livepeerPlaybackId);
        try {
          const res = await livepeer.playback.get(livepeerPlaybackId);
          console.log("res livepeer playback", res);
          if (!res) throw new Error("No response from livepeer playback.");
          const playbackInfo = res.playbackInfo;
          setPlaybackInfo(playbackInfo);
        } catch (e) {
          console.log("error livepeer playback", e);
        }
      }
      setCheckedForLivepeerPlaybackInfo(true);
    };
    init();
  }, [livepeerPlaybackId]);

  useEffect(() => {
    const init = async () => {
      if (livepeerStreamId) {
        const res = await getLivepeerStreamData({
          variables: {
            data: { streamId: livepeerStreamId },
          },
        });
        setLivepeerData(res.data?.getLivepeerStreamData);
      }
    };
    init();
  }, [livepeerStreamId]);

  return {
    livepeerData,
    playbackInfo,
    checkedForLivepeerPlaybackInfo,
  };
};
