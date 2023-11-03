import React from "react";
import { useEffect, useRef } from "react";

import { useBlastRainAnimation } from "../../../hooks/internal/useBlastRainAnimation";

export const BlastRain = React.memo(
  ({
    emoji,
    uid,
    remove,
  }: {
    emoji: JSX.Element;
    uid: string;
    remove: (uid: string) => void;
  }) => {
    const parentId = "rp".concat(uid);
    const childClass = "rc".concat(uid);
    useBlastRainAnimation(parentId, childClass);
    const emojiBlastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

    useEffect(() => {
      if (emojiBlastTimerRef.current) {
        clearTimeout(emojiBlastTimerRef.current);
      }
      const newTimer = setTimeout(() => {
        remove(uid);
      }, 15000);
      emojiBlastTimerRef.current = newTimer;
    }, []);

    return (
      <div
        id={parentId}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          zIndex: 4,
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={childClass}
            style={{
              willChange: "transform",
            }}
          >
            {emoji}
          </div>
        ))}
      </div>
    );
  }
);
