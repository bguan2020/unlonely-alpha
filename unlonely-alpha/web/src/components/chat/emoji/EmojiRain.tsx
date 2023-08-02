import React from "react";
import { useEffect, useRef } from "react";

import { useEmojiBlastAnimation } from "../../../hooks/internal/useEmojiBlastAnimation";

export const EmojiRain = React.memo(
  ({
    emoji,
    uid,
    remove,
  }: {
    emoji: JSX.Element;
    uid: string;
    remove: (uid: string) => void;
  }) => {
    useEmojiBlastAnimation("emojiRainParent".concat(uid), true);
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
        id={"emojiRainParent".concat(uid)}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          zIndex: 2,
          pointerEvents: "none", // Add this line
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="emojiRainChild">
            {emoji}
          </div>
        ))}
      </div>
    );
  }
);
