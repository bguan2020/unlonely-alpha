import { createContext, useContext, useMemo } from "react";
import {
  UseVibesCheckType,
  useVibesCheck,
  useVibesCheckInitial,
} from "../internal/useVibesCheck";

export const useVibesContext = () => {
  return useContext(VibesContext);
};

const VibesContext = createContext<UseVibesCheckType>({
  ...useVibesCheckInitial,
});

export const VibesProvider = ({ children }: { children: React.ReactNode }) => {
  const vibesCheck = useVibesCheck();

  const value = useMemo(() => {
    return {
      ...vibesCheck,
    };
  }, [vibesCheck]);

  return (
    <VibesContext.Provider value={value}>{children}</VibesContext.Provider>
  );
};
