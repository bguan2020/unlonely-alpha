import { createContext, useContext, useMemo, useRef, useState } from "react";

import { useEmojiBlastAnimation } from "../internal/useEmojiBlastAnimation";

export const useScreenAnimationsContext = () => {
  return useContext(ScreenAnimationsContext);
};

type ScreenAnimationsContextType = {
  isFireworksPlaying: boolean;
  isEmojiBlastPlaying: boolean;
  emojiBlast: (emoji: JSX.Element) => void;
  fireworks: () => void;
};

const ScreenAnimationsContext = createContext<ScreenAnimationsContextType>({
  isFireworksPlaying: false,
  isEmojiBlastPlaying: false,
  emojiBlast: () => undefined,
  fireworks: () => undefined,
});

export const ScreenAnimationsProvider = ({
  children,
}: {
  children: JSX.Element[] | JSX.Element;
}) => {
  const [isFireworksPlaying, setIsFireworksPlaying] = useState(false);
  const fireworksTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isEmojiBlastPlaying, setIsEmojiBlastPlaying] = useState(false);
  const emojiBlastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [emojiBlastEmoji, setEmojiBlastEmoji] = useState<JSX.Element | null>(
    null
  );

  useEmojiBlastAnimation("emojiRainParent", isEmojiBlastPlaying);

  const fireworks = () => {
    if (fireworksTimerRef.current) {
      clearTimeout(fireworksTimerRef.current);
    }
    setIsFireworksPlaying(true);
    const newTimer = setTimeout(() => {
      setIsFireworksPlaying(false);
    }, 15000);

    fireworksTimerRef.current = newTimer;
  };

  const emojiBlast = (emoji: JSX.Element) => {
    if (emojiBlastTimerRef.current) {
      clearTimeout(emojiBlastTimerRef.current);
    }
    setEmojiBlastEmoji(emoji);
    setIsEmojiBlastPlaying(true);
    const newTimer = setTimeout(() => {
      setEmojiBlastEmoji(null);
      setIsEmojiBlastPlaying(false);
    }, 15000);
    emojiBlastTimerRef.current = newTimer;
  };

  const value = useMemo(
    () => ({
      isFireworksPlaying,
      isEmojiBlastPlaying,
      fireworks,
      emojiBlast,
    }),
    [isFireworksPlaying, isEmojiBlastPlaying]
  );

  return (
    <ScreenAnimationsContext.Provider value={value}>
      {isFireworksPlaying && (
        <div
          className="pyro"
          style={{
            position: "relative",
            zIndex: 2,
          }}
        >
          <div className="before"></div>
          <div className="after"></div>
        </div>
      )}
      {isEmojiBlastPlaying && (
        <div
          id="emojiRainParent"
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
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="emojiRainChild">
              {emojiBlastEmoji}
            </div>
          ))}
        </div>
      )}
      {children}
    </ScreenAnimationsContext.Provider>
  );
};
