import { Flex, Stack } from "@chakra-ui/react";

import StreamComponent from "../stream/StreamComponent";
import { useCacheContext } from "../../hooks/context/useCache";
import { useMemo } from "react";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { useChannelContext } from "../../hooks/context/useChannel";

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
  const { isIOS, isStandalone } = useUserAgent();
  const { ui } = useChannelContext();
  const { currentMobileTab } = ui;

  const iosKeyboardDetected = useMemo(
    () => isIOS && isFocusedOnInput,
    [isIOS, isFocusedOnInput]
  );

  const androidKeyboardDetected = useMemo(
    () => !isIOS && mobileSizes.keyboardVisible,
    [isIOS, mobileSizes]
  );

  const newTop = useMemo(() => {
    if (currentMobileTab !== "chat" || !isStandalone) return "unset";
    if (iosKeyboardDetected) {
      return `${
        mobileSizes.viewport.height -
        (mobileSizes.screen.height - initialWindowInnerHeight)
      }px`;
    }
    if (androidKeyboardDetected) {
      return `${
        mobileSizes.viewport.height -
        (mobileSizes.screen.height - window.innerHeight)
      }px`;
    }
    return "unset";
  }, [
    mobileSizes,
    initialWindowInnerHeight,
    currentMobileTab,
    isStandalone,
    iosKeyboardDetected,
    androidKeyboardDetected,
  ]);

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
          <p>S: {Math.floor(mobileSizes.screen.height)}</p>
          <p>V: {Math.floor(mobileSizes.viewport.height)}</p>
          <p>W: {Math.floor(window.innerHeight)}</p>
          <p>I: {Math.floor(initialWindowInnerHeight)}</p>
          <p>K: {mobileSizes.keyboardVisible ? "Y" : "N"}</p>
          <p>F: {isFocusedOnInput}</p>
          <p>newTop: {newTop}</p>
        </div>
      </Flex>
    </Stack>
  );
};

export default ChannelViewerPerspective;
