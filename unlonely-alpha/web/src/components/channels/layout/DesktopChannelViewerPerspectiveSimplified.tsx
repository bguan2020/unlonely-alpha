import { Text, Flex, Spinner } from "@chakra-ui/react";
import { PlaybackInfo } from "livepeer/models/components/playbackinfo";
import { useMemo, useRef, useState } from "react";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { getSrc } from "@livepeer/react/external";
import IVSPlayer from "../../stream/IVSPlayer";
import LivepeerPlayer from "../../stream/LivepeerPlayer";
import { ChatWithTempTokenTimer } from "../../chat/ChatWithTempTokenTimer";
import { ChatReturnType } from "../../../hooks/chat/useChat";
import ChannelDesc from "../ChannelDesc";

export const DesktopChannelViewerPerspectiveSimplified = ({
  playbackData,
  chat,
  mode,
}: {
  playbackData:
    | {
        infra: "aws";
      }
    | {
        infra: "livepeer";
        livepeerPlaybackInfo: PlaybackInfo;
      };
  chat: ChatReturnType;
  mode: "single-temp-token" | "versus-mode" | "";
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

  const [opacity, setOpacity] = useState(0);

  const timeoutRef = useRef<number | NodeJS.Timeout | null>(null);

  const handleOpacity = () => {
    setOpacity(1); // Set opacity to 1 on touch
    // Clear any existing timeout to prevent it from resetting opacity prematurely
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout and store its ID in the ref
    timeoutRef.current = setTimeout(() => {
      setOpacity(0); // Change back to 0 after 3 seconds
      timeoutRef.current = null; // Reset the ref after the timeout completes
    }, 2000);
  };

  return (
    <Flex
      width="100%"
      position="relative"
      height={"100%"}
      onTouchStart={handleOpacity} // Handle touch event
      onMouseMove={handleOpacity} // Set opacity to 1 on mouse enter
    >
      <Flex
        position="absolute"
        top="0"
        left="0"
        opacity={opacity}
        zIndex={1}
        transition={"opacity 0.5s"}
        background="rgba(0, 0, 0, 0.5)"
        maxWidth="75%"
      >
        <ChannelDesc />
      </Flex>
      {mode !== "" && <ChatWithTempTokenTimer chat={chat} mode={mode} />}
      <Flex flexDirection="row" justifyContent="center" width="100%">
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
