import { Flex, Stack } from "@chakra-ui/react";

import StreamComponent from "../../stream/StreamComponent";
import { PlaybackInfo } from "livepeer/models/components/playbackinfo";

const ChannelViewerPerspective = ({
  playbackData,
  mobile,
}: {
  playbackData:
    | {
        infra: "aws";
      }
    | {
        infra: "livepeer";
        livepeerPlaybackInfo: PlaybackInfo;
      };
  mobile?: boolean;
}) => {
  return (
    <Stack
      direction="column"
      width={"100%"}
      position={mobile ? "fixed" : "unset"}
    >
      <Flex width={"100%"} position="relative">
        <StreamComponent playbackData={playbackData} />
      </Flex>
    </Stack>
  );
};

export default ChannelViewerPerspective;
