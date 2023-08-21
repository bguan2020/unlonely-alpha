import { useEffect } from "react";

const usePreventIOSBounce = () => {
  useEffect(() => {
    const preventDefaultTouchMove = (event: any) => {
      event.preventDefault();
    };

    document.addEventListener("touchmove", preventDefaultTouchMove, {
      passive: false,
    });

    return () => {
      // Cleanup the listener when the component is unmounted or if the hook is no longer in use
      document.removeEventListener("touchmove", preventDefaultTouchMove);
    };
  }, []);
};

export default usePreventIOSBounce;
