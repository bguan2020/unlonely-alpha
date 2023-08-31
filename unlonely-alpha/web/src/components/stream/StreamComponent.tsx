import { useMemo } from "react";
import { Text, Flex, Spinner } from "@chakra-ui/react";
import { VideoJSIVSTech, VideoJSQualityPlugin } from "amazon-ivs-player";
import videojs from "video.js";

import IVSPlayer from "./IVSPlayer";
import useScript from "../../hooks/internal/useScript";
import { useChannelContext } from "../../hooks/context/useChannel";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { useMiniVideo } from "../../hooks/context/useMiniVideo";

const StreamComponent = () => {
  const { trigger } = useMiniVideo();
  const { isStandalone } = useUserAgent();
  const { channel } = useChannelContext();
  const { channelQueryData, loading: channelLoading } = channel;

  const playbackUrl = useMemo(
    () =>
      channelQueryData?.playbackUrl == null
        ? undefined
        : channelQueryData?.playbackUrl,
    [channelQueryData]
  );

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

  return (
    <Flex
      flexDirection="row"
      justifyContent="center"
      width="100%"
      height={
        !isStandalone
          ? { base: "100%", sm: "500px", md: "600px", lg: "700px" }
          : "25vh"
      }
    >
      {playbackUrl ? (
        <IVSPlayer
          playbackUrl={playbackUrl}
          uniqueId={"original"}
          ref={(
            player: videojs.Player & VideoJSIVSTech & VideoJSQualityPlugin
          ) => {
            trigger(player);
          }}
        />
      ) : (
        <Flex
          direction="column"
          width="100%"
          maxW="100%"
          pl="10px"
          fontWeight="bold"
          fontSize="40px"
          bg="black"
          borderRadius="10px"
          justifyContent={"center"}
        >
          {channelLoading ? (
            <Spinner />
          ) : (
            <Text
              fontFamily="Neue Pixel Sans"
              textAlign="center"
              fontSize="25px"
            >
              missing playback url, stream cannot be reached at this time
            </Text>
          )}
        </Flex>
      )}
    </Flex>
  );
};

export default StreamComponent;
