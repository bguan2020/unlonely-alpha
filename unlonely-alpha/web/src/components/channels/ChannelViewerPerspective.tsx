import { Flex, Stack } from "@chakra-ui/react";

import StreamComponent from "../stream/StreamComponent";
import { useCacheContext } from "../../hooks/context/useCache";
import { useEffect, useState } from "react";

const ChannelViewerPerspective = ({ mobile }: { mobile?: boolean }) => {
  const { isFocusedOnInput } = useCacheContext();

  const [sizes, setSizes] = useState({
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height,
    },
    keyboardVisible: false,
  });

  useEffect(() => {
    // Handler to call on visual viewport resize
    const handleResize = () => {
      if (window.visualViewport) {
        // Detect if the keyboard is visible by comparing visual viewport height with window height
        const keyboardVisible =
          window.visualViewport.height < window.innerHeight;

        // Update state with new viewport dimensions and keyboard visibility
        setSizes({
          viewport: {
            width: window.visualViewport.width,
            height: window.visualViewport.height,
          },
          screen: {
            // screen.width and screen.height remain constant
            width: window.screen.width,
            height: window.screen.height,
          },
          keyboardVisible,
        });
      } else {
        // Fallback for browsers not supporting visualViewport
        // This won't accurately detect keyboard visibility but will update viewport sizes
        setSizes((prevSizes) => ({
          ...prevSizes,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        }));
      }
    };

    if (window.visualViewport) {
      // Use visualViewport API when available
      window.visualViewport.addEventListener("resize", handleResize);
    } else {
      // Fallback to using the window's resize event
      window.addEventListener("resize", handleResize);
    }

    // Call the handler right away to set initial size
    handleResize();

    // Cleanup function to remove event listener
    return () => {
      if (window.visualViewport) {
        // Use visualViewport API when available
        window.visualViewport.removeEventListener("resize", handleResize);
      } else {
        // Fallback to using the window's resize event
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  return (
    <Stack
      direction="column"
      width={"100%"}
      position={mobile ? "fixed" : "unset"}
      zIndex={5}
    >
      <Flex width={"100%"} position="relative">
        <StreamComponent />
        <div>
          <p>Viewport Width: {sizes.viewport.width}px</p>
          <p>Viewport Height: {sizes.viewport.height}px</p>
          <p>Screen Width: {sizes.screen.width}px</p>
          <p>Screen Height: {sizes.screen.height}px</p>
          <p>Keyboard Visible: {sizes.keyboardVisible ? "Yes" : "No"}</p>
        </div>
      </Flex>
    </Stack>
  );
};

export default ChannelViewerPerspective;
