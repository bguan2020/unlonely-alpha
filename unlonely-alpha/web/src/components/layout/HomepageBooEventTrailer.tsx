import { Flex } from "@chakra-ui/react";

export const HomepageBooEventTrailer = () => {
  return (
    <Flex width={"100%"} height="auto">
      <video
        src="https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/1186m62d66tdy6i6/720p0.mp4"
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
