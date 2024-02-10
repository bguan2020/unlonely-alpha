import { Flex, Stack } from "@chakra-ui/react";

import StreamComponent from "../stream/StreamComponent";
import { useCacheContext } from "../../hooks/context/useCache";
import { useMemo } from "react";
import useUserAgent from "../../hooks/internal/useUserAgent";

const ChannelViewerPerspective = ({ mobile }: { mobile?: boolean }) => {
  const { isFocusedOnInput, mobileSizes, keyboardVisible, videoTop } =
    useCacheContext();
  const { isIOS } = useUserAgent();

  const newTop = useMemo(() => {
    if (isIOS && (isFocusedOnInput || keyboardVisible)) {
      return `${videoTop}px`;
    }
    if (!isIOS && mobileSizes.keyboardVisible) {
      return `${
        mobileSizes.viewport.height -
        (mobileSizes.screen.height - window.innerHeight)
      }px`;
    }
    return "unset";
  }, [isIOS, isFocusedOnInput, mobileSizes, keyboardVisible, videoTop]);

  return (
    <Stack
      direction="column"
      width={"100%"}
      position={mobile ? "fixed" : "unset"}
      zIndex={5}
      top={newTop}
    >
      <Flex width={"100%"} position="relative">
        <StreamComponent />
        <div>
          <p>Viewport Height: {mobileSizes.viewport.height}px</p>
          <p>Screen Height: {mobileSizes.screen.height}px</p>
          <p>window innerHeight: {window.innerHeight}px </p>
          <p>Visible 1: {keyboardVisible ? "Yes" : "No"}</p>
          <p>Visible 2: {mobileSizes.keyboardVisible ? "Yes" : "No"}</p>
          <p>isFocusedOnInput: {isFocusedOnInput ? "Yes" : "No"}</p>
        </div>
      </Flex>
    </Stack>
  );
};

export default ChannelViewerPerspective;
