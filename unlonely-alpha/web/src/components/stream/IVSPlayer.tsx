import React, { useEffect, useState } from "react";
import videojs from "video.js";
import {
  VideoJSQualityPlugin,
  VideoJSIVSTech,
  VideoJSEvents,
} from "amazon-ivs-player";
import { Flex, Spinner, Text } from "@chakra-ui/react";

import useUserAgent from "../../hooks/internal/useUserAgent";
import Participants from "../presence/Participants";
import { useChannelContext } from "../../hooks/context/useChannel";
import useScript from "../../hooks/internal/useScript";

type Props = {
  playbackUrl: string;
};

const IVSPlayer: React.FunctionComponent<Props> = ({ playbackUrl }) => {
  const { loading: scriptLoading, error } = useScript({
    src: "https://player.live-video.net/1.2.0/amazon-ivs-videojs-tech.min.js",
  });
  // Load IVS quality plugin
  const { loading: loadingPlugin, error: pluginError } = useScript({
    src: "https://player.live-video.net/1.2.0/amazon-ivs-quality-plugin.min.js",
  });

  if (scriptLoading || loadingPlugin) {
    return (
      <>
        <Flex
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          width="100%"
          height={{ base: "80%", sm: "300px", md: "400px", lg: "500px" }}
          bg="black"
          borderRadius="10px"
        >
          <Spinner />
        </Flex>
      </>
    );
  }

  if (error || pluginError) {
    return <>error</>;
  }

  return <IVSPlayerView playbackUrl={playbackUrl} />;
};

const IVSPlayerView: React.FunctionComponent<Props> = ({ playbackUrl }) => {
  const [offline, setOffline] = useState<boolean>(false);
  const { chat } = useChannelContext();
  const { presenceChannel } = chat;

  const { isStandalone } = useUserAgent();

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

    const errorHandler = (payload: any) => {
      setOffline(true);
    };

    ivsPlayer.addEventListener(events.PlayerEventType.ERROR, errorHandler);

    return () => {
      ivsPlayer.removeEventListener(events.PlayerEventType.ERROR, errorHandler);
      player.dispose();
    };
  }, [playbackUrl]);

  const showOverlay = () => {
    const overlay = document.getElementById("video-overlay");

    if (overlay) {
      overlay.style.animationName = "none";

      requestAnimationFrame(() => {
        setTimeout(() => {
          overlay.style.animationName = "";
        }, 0);
      });
    }
  };

  return (
    <>
      <Flex
        direction="column"
        width={"100%"}
        position="relative"
        onMouseMove={showOverlay}
        onTouchStart={showOverlay}
      >
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
            minHeight: "100%",
          }}
        />
        {!offline && isStandalone && (
          <Flex
            direction="column"
            bg="rgba(0, 0, 0, 0)"
            position="absolute"
            top={0}
            right={0}
            bottom={0}
            left={0}
            justifyContent="center"
            alignItems="center"
            className="show-then-hide"
            id="video-overlay"
          >
            {presenceChannel && (
              <Flex position="absolute" left="20px" top="10px">
                <Participants ablyPresenceChannel={presenceChannel} mobile />
              </Flex>
            )}
          </Flex>
        )}
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
            <Text fontFamily="LoRes15" textAlign="center" fontSize="30px">
              stream offline
            </Text>
            {!isStandalone && (
              <Text fontFamily="LoRes15" textAlign="center" fontSize="18px">
                or install the app on your mobile device to sign up for future
                notifications
              </Text>
            )}
          </Flex>
        )}
      </Flex>
    </>
  );
};

export default IVSPlayer;
