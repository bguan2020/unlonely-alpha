import React from "react";
import { useEffect, useRef } from "react";

import { useBlastRainAnimation } from "../../../hooks/internal/useBlastRainAnimation";

type Config = {
  numParticles?: number;
  vertSpeed?: number;
  horizSpeed?: number;
  notFixed?: boolean;
  durationInMillis?: number;
};

export const BlastRain = React.memo(
  ({
    emoji,
    uid,
    remove,
    config,
  }: {
    emoji: JSX.Element;
    uid: string;
    remove: (uid: string) => void;
    config?: Config;
  }) => {
    const parentId = "rp".concat(uid);
    const childClass = "rc".concat(uid);
    useBlastRainAnimation(parentId, childClass, config);
    const emojiBlastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

    useEffect(() => {
      if (emojiBlastTimerRef.current) {
        clearTimeout(emojiBlastTimerRef.current);
      }
      const newTimer = setTimeout(() => {
        remove(uid);
      }, config?.durationInMillis ?? 15000);
      emojiBlastTimerRef.current = newTimer;
    }, []);

    return (
      <div
        id={parentId}
        style={{
          position: config?.notFixed ? "absolute" : "fixed",
          top: 0,
          left: 0,
          width: config?.notFixed ? "100%" : "100vw",
          height: config?.notFixed ? "100%" : "100vh",
          overflow: "hidden",
          zIndex: 4,
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: config?.numParticles ?? 12 }).map((_, i) => (
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
