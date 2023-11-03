import { Flex, Stack } from "@chakra-ui/react";

import StreamComponent from "../stream/StreamComponent";

const ChannelViewerPerspective = ({ mobile }: { mobile?: boolean }) => {
  return (
    <Stack
      direction="column"
      width={"100%"}
      position={mobile ? "fixed" : "unset"}
    >
      <Flex width={"100%"} position="relative">
        <StreamComponent />
      </Flex>
    </Stack>
  );
};

export default ChannelViewerPerspective;
