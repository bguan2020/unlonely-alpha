import { Text, Flex, Spinner } from "@chakra-ui/react";
import { PlaybackInfo } from "livepeer/dist/models/components";
import { useMemo } from "react";
import { useChannelContext } from "../../../hooks/context/useChannel";
import useScript from "../../../hooks/internal/useScript";
import { getSrc } from "@livepeer/react/external";
import IVSPlayer from "../../stream/IVSPlayer";
import LivepeerPlayer from "../../stream/LivepeerPlayer";
import { ChatWithTokenTimer } from "../../chat/ChatWithTempTokenTimer";
import { ChatReturnType } from "../../../hooks/chat/useChat";

export const DesktopChannelViewerPerspectiveSimplified = ({
  livepeerPlaybackInfo,
  chat,
  openOverlappingChat,
}: {
  livepeerPlaybackInfo?: PlaybackInfo;
  chat: ChatReturnType;
  openOverlappingChat: boolean;
}) => {
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
    <Flex width="100%" position="relative" height={"100%"}>
      {openOverlappingChat && <ChatWithTokenTimer chat={chat} />}
      <Flex flexDirection="row" justifyContent="center" width="100%">
        {livepeerPlaybackInfo ? (
          <LivepeerPlayer src={getSrc(livepeerPlaybackInfo)} />
        ) : playbackUrl ? (
          <IVSPlayer playbackUrl={playbackUrl} />
        ) : (
          <Flex
            direction="column"
            width="100%"
            maxW="100%"
            pl="10px"
            fontWeight="bold"
            fontSize="40px"
            bg="black"
            justifyContent={"center"}
          >
            {channelLoading ? (
              <Spinner />
            ) : (
              <Text fontFamily="LoRes15" textAlign="center" fontSize="25px">
                missing playback url, stream cannot be reached at this time
              </Text>
            )}
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};
