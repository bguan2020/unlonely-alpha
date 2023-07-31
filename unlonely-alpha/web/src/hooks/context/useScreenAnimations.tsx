import { createContext, useContext, useMemo, useState } from "react";

export const useScreenAnimationsContext = () => {
  return useContext(ScreenAnimationsContext);
};

type ScreenAnimationsContextType = {
  isFireworksPlaying: boolean;
  fireworks: () => void;
};

const ScreenAnimationsContext = createContext<ScreenAnimationsContextType>({
  isFireworksPlaying: false,
  fireworks: () => undefined,
});

export const ScreenAnimationsProvider = ({
  children,
}: {
  children: JSX.Element[] | JSX.Element;
}) => {
  const [isFireworksPlaying, setIsFireworksPlaying] = useState(false);

  const fireworks = () => {
    setIsFireworksPlaying(true);
    setTimeout(() => {
      setIsFireworksPlaying(false);
    }, 10000);
  };

  const value = useMemo(
    () => ({
      isFireworksPlaying,
      fireworks,
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
      {children}
    </ScreenAnimationsContext.Provider>
  );
};