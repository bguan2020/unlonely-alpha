import { useEffect, useState } from "react";

function PullToRefresh() {
  const [pullDownDistance, setPullDownDistance] = useState(0);

  useEffect(() => {
    let startY = 0;

    function handleTouchStart(e: any) {
      startY = e.touches[0].clientY;
    }

    function handleTouchMove(e: any) {
      const pullDistance = e.touches[0].clientY - startY;
      if (pullDistance > 0) {
        setPullDownDistance(pullDistance);
      }
    }

    function handleTouchEnd() {
      if (pullDownDistance > 300) {
        location.reload();
      }
      setPullDownDistance(0);
    }

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pullDownDistance]);

  return (
    <div style={{ height: `${pullDownDistance}px` }}>
      {pullDownDistance > 60 && <span>release to refresh...</span>}
    </div>
  );
}

export default PullToRefresh;
