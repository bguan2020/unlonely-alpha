import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  BlastRain,
  RainAnimationConfig,
} from "../../components/chat/emoji/BlastRain";

export const useScreenAnimationsContext = () => {
  return useContext(ScreenAnimationsContext);
};

type ScreenAnimationsContextType = {
  isFireworksPlaying: boolean;
  emojiBlast: (emoji: JSX.Element, config?: RainAnimationConfig) => void;
  fireworks: () => void;
};

const ScreenAnimationsContext = createContext<ScreenAnimationsContextType>({
  isFireworksPlaying: false,
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

  const [emojiQueue, setEmojiQueue] = useState<
    { emoji: JSX.Element; uid: string; config?: RainAnimationConfig }[]
  >([]);

  const fireworks = () => {
    if (fireworksTimerRef.current) {
      clearTimeout(fireworksTimerRef.current);
    }
    setIsFireworksPlaying(true);
    const newTimer = setTimeout(() => {
      setIsFireworksPlaying(false);
    }, 14000);

    fireworksTimerRef.current = newTimer;
  };

  const emojiBlast = (emoji: JSX.Element, config?: RainAnimationConfig) => {
    setEmojiQueue((prev) => [
      ...prev,
      { emoji, uid: Date.now().toString(), config },
    ]);
  };

  const removeEmoji = useCallback((uid: string) => {
    setEmojiQueue((prev) => prev.filter((e) => e.uid !== uid));
  }, []);

  const emojiRainComponents = useMemo(
    () =>
      emojiQueue.map(({ emoji, uid, config }) => (
        <BlastRain
          key={uid}
          emoji={emoji}
          uid={uid}
          remove={removeEmoji}
          config={config}
        />
      )),
    [emojiQueue, removeEmoji]
  );

  const value = useMemo(
    () => ({
      isFireworksPlaying,
      fireworks,
      emojiBlast,
    }),
    [isFireworksPlaying]
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
      {emojiRainComponents}
      {/* <BlastRain
        emoji={<span>testing🎉</span>}
        uid="test"
        remove={() => undefined}
      /> */}
      {children}
    </ScreenAnimationsContext.Provider>
  );
};
