import { useEffect, useState } from "react";
import { MobileViewSizes } from "../../constants/types";

export function useMobileViewSize() {
    const [sizes, setSizes] = useState<MobileViewSizes>({
        viewport: {
          width: 0,
          height: 0,
        },
        screen: {
          width: 0,
          height: 0,
        },
        keyboardVisible: false,
      });

      const [initialWindowInnerHeight, setInitialWindowInnerHeight] = useState(0);

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

        if (window) setInitialWindowInnerHeight(window.innerHeight);
    
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

    
      return { sizes, initialWindowInnerHeight}
}