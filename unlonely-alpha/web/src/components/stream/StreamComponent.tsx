import { useMemo } from "react";
import { Text, Flex, Spinner } from "@chakra-ui/react";

import IVSPlayer from "./IVSPlayer";
import { useChannelContext } from "../../hooks/context/useChannel";
import useUserAgent from "../../hooks/internal/useUserAgent";
import LivepeerPlayer from "./LivepeerPlayer";
import { PlaybackInfo } from "livepeer/models/components/playbackinfo";
import { getSrc } from "@livepeer/react/external";
import { DESKTOP_VIDEO_VH, MOBILE_VIDEO_VH } from "../../constants";

const StreamComponent = ({
  isStreamer,
  playbackData,
}: {
  isStreamer?: boolean;
  playbackData:
    | {
        infra: "aws";
      }
    | {
        infra: "livepeer";
        livepeerPlaybackInfo: PlaybackInfo;
      };
}) => {
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

  return (
    <Flex
      flexDirection="row"
      justifyContent="center"
      width="100%"
      height={
        !isStandalone
          ? { base: isStreamer ? "unset" : `${DESKTOP_VIDEO_VH}%` }
          : isStreamer
          ? "unset"
          : `${MOBILE_VIDEO_VH}vh`
      }
    >
      <Flex width="100%">
        {playbackData.infra === "livepeer" ? (
          <LivepeerPlayer src={getSrc(playbackData.livepeerPlaybackInfo)} />
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

export default StreamComponent;
