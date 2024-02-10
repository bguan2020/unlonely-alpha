import { Flex, Stack } from "@chakra-ui/react";

import StreamComponent from "../stream/StreamComponent";
import { useCacheContext } from "../../hooks/context/useCache";

const ChannelViewerPerspective = ({ mobile }: { mobile?: boolean }) => {
  const { isFocusedOnInput } = useCacheContext();

  return (
    <Stack
      direction="column"
      width={"100%"}
      position={mobile ? "fixed" : "unset"}
      bottom={isFocusedOnInput ? "160px" : "unset"}
      zIndex={5}
    >
      <Flex width={"100%"} position="relative">
        <StreamComponent />
      </Flex>
    </Stack>
  );
};

export default ChannelViewerPerspective;
