import React, { forwardRef, useEffect, useState } from "react";
import videojs from "video.js";
import {
  VideoJSQualityPlugin,
  VideoJSIVSTech,
  VideoJSEvents,
} from "amazon-ivs-player";
import { Flex, Text } from "@chakra-ui/react";

import useUserAgent from "../../hooks/internal/useUserAgent";
import { useMiniVideo } from "../../hooks/context/useMiniVideo";

type Props = {
  playbackUrl: string;
  uniqueId: string;
  isMini?: boolean;
};

const IVSPlayer = forwardRef((props: Props, ref: any) => {
  const [offline, setOffline] = useState<boolean>(false);
  const { handlePlay, handlePause } = useMiniVideo();

  const { isStandalone } = useUserAgent();

  useEffect(() => {
    const PLAYBACK_URL = props.playbackUrl;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.registerIVSTech(videojs);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.registerIVSQualityPlugin(videojs);

    const player = videojs(
      `amazon-ivs-videojs-${props.uniqueId}`,
      {
        techOrder: ["AmazonIVS"],
        controlBar: {
          pictureInPictureToggle: true,
        },
      },
      () => {
        player.src(PLAYBACK_URL);
      }
    ) as videojs.Player & VideoJSIVSTech & VideoJSQualityPlugin;

    player.enableIVSQualityPlugin();

    if (ref && typeof ref === "function") {
      ref(player);
    }

    player.on("play", () => {
      console.log("hello");
      handlePlay(props.isMini);
    });

    player.on("pause", () => {
      handlePause(props.isMini);
    });

    const events: VideoJSEvents = player.getIVSEvents();
    const ivsPlayer = player.getIVSPlayer();

    const errorHandler = (payload: any) => {
      setOffline(true);
    };

    ivsPlayer.addEventListener(events.PlayerEventType.ERROR, errorHandler);

    return () => {
      ivsPlayer.removeEventListener(events.PlayerEventType.ERROR, errorHandler);
      player.dispose();
    };
  }, [props.playbackUrl, props.uniqueId, props.isMini]);

  return (
    <>
      <Flex direction="column" width={"100%"} position="relative">
        <video
          id={`amazon-ivs-videojs-${props.uniqueId}`}
          className="video-js vjs-4-3 vjs-big-play-centered"
          controls
          autoPlay
          playsInline
          style={{
            padding: "0px !important",
            maxWidth: "100%",
            height: "100% !important",
            width: "100% !important",
            borderRadius: "10px",
            minHeight: "100%",
          }}
        />
        {offline && (
          <Flex
            direction="column"
            bg="black"
            position="absolute"
            width="100%"
            height="100%"
            justifyContent={"center"}
            gap="20px"
          >
            <Text
              fontFamily="Neue Pixel Sans"
              textAlign="center"
              fontSize="30px"
            >
              stream offline
            </Text>
            {!isStandalone && (
              <Text
                fontFamily="Neue Pixel Sans"
                textAlign="center"
                fontSize="18px"
              >
                or install the app on your mobile device to sign up for future
                notifications
              </Text>
            )}
          </Flex>
        )}
      </Flex>
    </>
  );
});

export default IVSPlayer;
