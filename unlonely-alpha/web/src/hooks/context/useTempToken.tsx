import { useContext, createContext, useMemo } from "react";
import {
  UseReadTempTokenStateType,
  useReadTempTokenInitialState,
  useReadTempTokenState,
} from "../internal/temp-token/read/useReadTempTokenState";

export const useTempTokenContext = () => {
  return useContext(TempTokenContext);
};

const TempTokenContext = createContext<{
  tempToken: UseReadTempTokenStateType;
}>({
  tempToken: useReadTempTokenInitialState,
});

export const TempTokenProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const readTempToken = useReadTempTokenState();

  const value = useMemo(() => {
    return {
      tempToken: readTempToken,
    };
  }, [readTempToken]);

  return (
    <TempTokenContext.Provider value={value}>
      {children}
    </TempTokenContext.Provider>
  );
};
