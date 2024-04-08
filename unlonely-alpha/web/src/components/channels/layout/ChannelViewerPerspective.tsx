import { Flex, Stack } from "@chakra-ui/react";

import StreamComponent from "../../stream/StreamComponent";
import { PlaybackInfo } from "livepeer/dist/models/components";

const ChannelViewerPerspective = ({
  livepeerPlaybackInfo,
  mobile,
}: {
  livepeerPlaybackInfo?: PlaybackInfo;
  mobile?: boolean;
}) => {
  return (
    <Stack
      direction="column"
      width={"100%"}
      position={mobile ? "fixed" : "unset"}
    >
      <Flex width={"100%"} position="relative">
        <StreamComponent livepeerPlaybackInfo={livepeerPlaybackInfo} />
      </Flex>
    </Stack>
  );
};

export default ChannelViewerPerspective;
