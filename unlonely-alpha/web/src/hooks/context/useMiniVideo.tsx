import { Button, Flex } from "@chakra-ui/react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import videojs from "video.js";
import { VideoJSIVSTech, VideoJSQualityPlugin } from "amazon-ivs-player";
import { useRouter } from "next/router";

import {
  ChannelDetailMobileQuery,
  ChannelDetailQuery,
} from "../../generated/graphql";
import IVSPlayer from "../../components/stream/IVSPlayer";

export const useMiniVideo = () => {
  return useContext(MiniVideoContext);
};

const MiniVideoContext = createContext<{
  playbackUrl?: string;
  channelSlug?: string;
  updateMiniVideo: (
    channelData?:
      | ChannelDetailQuery["getChannelBySlug"]
      | ChannelDetailMobileQuery["getChannelByAwsId"]
  ) => void;
  trigger: (player: any, isMini?: boolean) => void;
  handlePlay: (isThisMini?: boolean) => void;
  handlePause: (isThisMini?: boolean) => void;
}>({
  playbackUrl: undefined,
  channelSlug: undefined,
  updateMiniVideo: () => undefined,
  trigger: () => undefined,
  handlePlay: () => undefined,
  handlePause: () => undefined,
});

export const MiniVideoProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const isChannelPage = useMemo(
    () => router.pathname.startsWith("/channels"),
    [router.pathname]
  );

  const miniPlayerRef = useRef<videojs.Player | null>(null);
  const originalPlayerRef = useRef<videojs.Player | null>(null);

  const [playbackUrl, setPlaybackUrl] = useState<string | undefined>(undefined);
  const [channelSlug, setChannelSlug] = useState<string | undefined>(undefined);
  const [isLive, setIsLive] = useState<boolean>(false);
  const avoidLoopRef = useRef(false);

  const updateMiniVideo = useCallback(
    (
      channelData?:
        | ChannelDetailQuery["getChannelBySlug"]
        | ChannelDetailMobileQuery["getChannelByAwsId"]
    ) => {
      setPlaybackUrl(channelData?.playbackUrl ?? undefined);
      setChannelSlug(channelData?.slug);
      setIsLive(channelData?.isLive ?? false);
    },
    []
  );

  const trigger = useCallback((player: any, isMini?: boolean) => {
    if (isMini) {
      miniPlayerRef.current = player;
    } else {
      originalPlayerRef.current = player;
    }
  }, []);

  const handlePlay = useCallback((isThisMini?: boolean) => {
    console.log("handlePlay", avoidLoopRef.current, isThisMini);
    if (avoidLoopRef.current) {
      avoidLoopRef.current = false;
    } else {
      avoidLoopRef.current = true;

      if (!isThisMini) {
        miniPlayerRef.current?.play();
      } else {
        originalPlayerRef.current?.play();
      }
    }
  }, []);

  const handlePause = useCallback((isThisMini?: boolean) => {
    console.log("handlePause", avoidLoopRef.current, isThisMini);

    if (avoidLoopRef.current) {
      avoidLoopRef.current = false;
    } else {
      avoidLoopRef.current = true;

      if (!isThisMini) {
        miniPlayerRef.current?.pause();
      } else {
        originalPlayerRef.current?.pause();
      }
    }
  }, []);

  const value = useMemo(() => {
    return {
      playbackUrl,
      channelSlug,
      updateMiniVideo,

      trigger,
      handlePlay,
      handlePause,
    };
  }, [
    playbackUrl,
    channelSlug,
    updateMiniVideo,

    trigger,
    handlePlay,
    handlePause,
  ]);

  return (
    <MiniVideoContext.Provider value={value}>
      {isLive && playbackUrl && !isChannelPage && (
        <Flex
          position="fixed"
          width="400px"
          zIndex="50"
          right="10px"
          bottom="10px"
          bg="black"
          direction="column"
        >
          <Flex width="400px" height="200px">
            <IVSPlayer
              playbackUrl={playbackUrl}
              uniqueId={"miniplayer"}
              isMini={true}
              ref={(
                player: videojs.Player & VideoJSIVSTech & VideoJSQualityPlugin
              ) => {
                trigger(player, true);
              }}
            />
          </Flex>
          <Flex>
            <Button>Expand</Button>
            <Button onClick={() => updateMiniVideo(undefined)}>X</Button>
          </Flex>
        </Flex>
      )}
      {children}
    </MiniVideoContext.Provider>
  );
};
