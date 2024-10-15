import { Flex } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

export const HomepageBooEventTrailer = ({
  callback,
}: {
  callback?: () => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    // Monitor for changes in the 'muted' property
    const checkMuteStatus = () => {
      if (!video?.muted) {
        callback?.(); // Trigger the callback when the video is unmuted
      }
    };

    // Listen for the "volumechange" event to detect changes in mute status
    video?.addEventListener("volumechange", checkMuteStatus);

    // Clean up event listener on component unmount
    return () => {
      video?.removeEventListener("volumechange", checkMuteStatus);
    };
  }, []);

  return (
    <Flex width={"100%"} height="auto">
      <video
        ref={videoRef}
        src="https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/8f257gta7zmj1wlg/video/download.mp4"
        autoPlay
        controls
        muted
        loop
        playsInline
        style={{
          width: "100%",
          height: "100%",
        }}
      ></video>
    </Flex>
  );
};
