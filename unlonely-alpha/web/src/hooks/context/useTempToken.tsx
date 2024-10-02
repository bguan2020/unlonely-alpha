import { useContext, createContext, useMemo } from "react";
import {
  UseReadTempTokenContextStateType,
  useReadTempTokenInitialState,
  useReadTempTokenContextState,
} from "../internal/temp-token/read/useReadTempTokenContextState";

export const useTempTokenContext = () => {
  return useContext(TempTokenContext);
};

const TempTokenContext = createContext<{
  tempToken: UseReadTempTokenContextStateType;
}>({
  tempToken: useReadTempTokenInitialState,
});

export const TempTokenProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const readTempToken = useReadTempTokenContextState();

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
