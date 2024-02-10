import { Flex, Stack } from "@chakra-ui/react";

import StreamComponent from "../stream/StreamComponent";
import { useCacheContext } from "../../hooks/context/useCache";
import { useMemo } from "react";
import useUserAgent from "../../hooks/internal/useUserAgent";

const ChannelViewerPerspective = ({ mobile }: { mobile?: boolean }) => {
  const { isFocusedOnInput, mobileSizes, initialWindowInnerHeight } =
    useCacheContext();
  const { isIOS } = useUserAgent();

  const newTop = useMemo(() => {
    if (isIOS && isFocusedOnInput) {
      return `${
        mobileSizes.viewport.height -
        (mobileSizes.screen.height - initialWindowInnerHeight)
      }px`;
    }
    if (!isIOS && mobileSizes.keyboardVisible) {
      return `${
        mobileSizes.viewport.height -
        (mobileSizes.screen.height - window.innerHeight)
      }px`;
    }
    return "unset";
  }, [isIOS, isFocusedOnInput, mobileSizes, initialWindowInnerHeight]);

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
          <p>Visible keyboard: {mobileSizes.keyboardVisible ? "Yes" : "No"}</p>
          <p>isFocusedOnInput: {isFocusedOnInput ? "Yes" : "No"}</p>
          <p>isIOS: {isIOS ? "Yes" : "No"}</p>
          <p>newTop: {newTop}px</p>
        </div>
      </Flex>
    </Stack>
  );
};

export default ChannelViewerPerspective;
