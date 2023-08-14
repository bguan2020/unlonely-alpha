import React, { useEffect, useState } from "react";
import videojs from "video.js";
import {
  VideoJSQualityPlugin,
  VideoJSIVSTech,
  VideoJSEvents,
} from "amazon-ivs-player";
import { Flex, Text } from "@chakra-ui/react";
import Link from "next/link";

import useUserAgent from "../../hooks/internal/useUserAgent";

type Props = {
  playbackUrl: string;
};

const IVSPlayer: React.FunctionComponent<Props> = ({ playbackUrl }) => {
  const [offline, setOffline] = useState<boolean>(false);

  const { isIOS } = useUserAgent();

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
      <Flex direction="column" width={"100%"} position="relative">
        <video
          id="amazon-ivs-videojs"
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
            <Link target="_blank" href={"https://lu.ma/unlonely"} passHref>
              <Text
                fontFamily="Neue Pixel Sans"
                textAlign="center"
                fontSize="20px"
                textDecoration="underline"
              >
                see upcoming streams here
              </Text>
            </Link>
            <Link
              href={
                isIOS
                  ? "https://testflight.apple.com/join/z4PpYxXz"
                  : "https://dub.sh/unlonely-android"
              }
              passHref
              target="_blank"
            >
              <Text
                fontFamily="Neue Pixel Sans"
                textAlign="center"
                fontSize="20px"
                textDecoration="underline"
              >
                or download the mobile app to sign up for future notifications
              </Text>
            </Link>
          </Flex>
        )}
      </Flex>
    </>
  );
};

export default IVSPlayer;
