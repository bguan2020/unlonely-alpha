import { useEffect, useRef, useState } from "react";
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

      const containerRef = useRef<HTMLDivElement>(null); // Ref for the element to observe
      const [keyboardVisible, setKeyboardVisible] = useState(false);
      const [videoTop, setVideoTop] = useState(0); // State to manage video's top position
    

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

      useEffect(() => {
        // Ensure ResizeObserver is supported
        if (typeof ResizeObserver === "undefined") return;
      
        const observer = new ResizeObserver(entries => {
          for (const entry of entries) {
            const { height } = entry.contentRect;
            const keyboardIsVisible = height < window.innerHeight;
            setKeyboardVisible(keyboardIsVisible);
      
            if (keyboardIsVisible) {
              // Assuming the keyboard takes up roughly half the screen,
              // adjust the video to be positioned at the top of the visible viewport area.
              // This calculation might need tweaking based on actual keyboard size.
              const estimatedKeyboardHeight = window.innerHeight - height;
              setVideoTop(estimatedKeyboardHeight);
            } else {
              setVideoTop(0); // Reset position when keyboard is not visible
            }
          }
        });
      
        if (containerRef.current) {
          observer.observe(containerRef.current);
        }
      
        return () => observer.disconnect(); // Clean up observer on component unmount
      }, []);
    
      return { sizes, keyboardVisible, containerRef, videoTop}
}