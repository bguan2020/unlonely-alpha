import React, { useEffect, useState } from "react";
import videojs from "video.js";
import {
  VideoJSQualityPlugin,
  VideoJSIVSTech,
  VideoJSEvents,
} from "amazon-ivs-player";
import { Flex } from "@chakra-ui/react";

type Props = {
  isTheatreMode: boolean;
  playbackUrl: string;
};

const IVSPlayer: React.FunctionComponent<Props> = ({
  isTheatreMode,
  playbackUrl,
}) => {
  const [offline, setOffline] = useState<boolean>(false);
  useEffect(() => {
    const PLAYBACK_URL = playbackUrl;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.registerIVSTech(videojs);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.registerIVSQualityPlugin(videojs);

    const player = videojs(
      "amazon-ivs-videojs",
      {
        techOrder: ["AmazonIVS"],
        autoplay: true,
      },
      () => {
        player.src(PLAYBACK_URL);
      }
    ) as videojs.Player & VideoJSIVSTech & VideoJSQualityPlugin;

    player.enableIVSQualityPlugin();

    const events: VideoJSEvents = player.getIVSEvents();
    const ivsPlayer = player.getIVSPlayer();

    ivsPlayer.addEventListener(events.PlayerEventType.ERROR, (payload) => {
      const { type, code, source, message } = payload;
      setOffline(true);
    });
  }, []);

  return (
    <>
      <Flex direction="column" width={isTheatreMode ? "100%" : "889px"}>
        <video
          id="amazon-ivs-videojs"
          className="video-js vjs-4-3 vjs-big-play-centered"
          controls
          autoPlay
          playsInline
          style={{
            padding: "0px !important",
            maxWidth: isTheatreMode ? "100%" : "889px",
            height: "100% !important",
            width: "100% !important",
          }}
        ></video>
        <Flex justifyContent="center" bg="#FF6D6A">
          {offline && <>Stream offline</>}
        </Flex>
      </Flex>
    </>
  );
};

export default IVSPlayer;
