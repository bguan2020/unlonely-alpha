import { Flex, Text } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";

const PullToRefresh = () => {
  const [pullDownDistance, setPullDownDistance] = useState(0);
  const [isPullingDown, setIsPullingDown] = useState(false);
  let startY = 0;

  useEffect(() => {
    function handleTouchStart(e: any) {
      if (window.pageYOffset === 0) {
        startY = e.touches[0].clientY;
        setIsPullingDown(true);
      }
    }

    function handleTouchMove(e: any) {
      if (!isPullingDown) return;

      const pullDistance = e.touches[0].clientY - startY;
      if (pullDistance > 0) {
        setPullDownDistance(pullDistance);
      } else {
        setIsPullingDown(false);
        setPullDownDistance(0);
      }
    }

    function handleTouchEnd() {
      if (pullDownDistance > 300) {
        location.reload();
      }
      setIsPullingDown(false);
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
  }, [isPullingDown, pullDownDistance]);

  return (
    <Flex style={{ height: `${pullDownDistance}px` }}>
      {pullDownDistance > 60 && (
        <Text textAlign={"center"}>Release to refresh...</Text>
      )}
    </Flex>
  );
};

export default PullToRefresh;
