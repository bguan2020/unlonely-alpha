import { Flex, Stack } from "@chakra-ui/react";

import StreamComponent from "../stream/StreamComponent";
import { useCacheContext } from "../../hooks/context/useCache";
import { useMemo } from "react";
import useUserAgent from "../../hooks/internal/useUserAgent";

/**
 * If the virtual keyboard is open on mobile devices, the page is usually
 * pushed upward, in our case pushing the video up out of view.
 *
 * We want to situate the video at the top of the user's viewport, so we
 * calculate the new top position of the video based on the height of the
 * virtual keyboard. The new top position is calculated based on the
 * difference between the viewport height and the screen height. THere are differences between
 * iOS and Android, so we need to account for that and employ two separate strategies.
 */
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
