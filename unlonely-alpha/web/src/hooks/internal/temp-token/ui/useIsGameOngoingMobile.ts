import { useState, useMemo, useEffect } from "react";
import { NULL_ADDRESS } from "../../../../constants";
import { useTempTokenContext } from "../../../context/useTempToken";
import { useVersusTempTokenContext } from "../../../context/useVersusTempToken";

export const useIsGameOngoingMobile = () => {
  const { tempToken } = useTempTokenContext();
  const { gameState, loadingCurrentOnMount } = tempToken;
  const { currentActiveTokenAddress } = gameState;

  const { gameState: versusGameState, loadingOnMount } =
    useVersusTempTokenContext();
  const {
    isGameOngoing: isVersusGameOngoing,
    ownerMustMakeWinningTokenTradeable,
  } = versusGameState;
  const [tokenStateView, setTokenStateView] = useState<
    "chat" | "single" | "versus"
  >("chat");

  const isVersusOnGoing = useMemo(() => {
    return (
      (isVersusGameOngoing || ownerMustMakeWinningTokenTradeable) &&
      !loadingOnMount
    );
  }, [isVersusGameOngoing, ownerMustMakeWinningTokenTradeable, loadingOnMount]);

  const isSingleOnGoing = useMemo(() => {
    return !loadingCurrentOnMount && currentActiveTokenAddress !== NULL_ADDRESS;
  }, [loadingCurrentOnMount, currentActiveTokenAddress]);

  const isGameOngoing = useMemo(() => {
    return isVersusOnGoing || isSingleOnGoing;
  }, [isVersusOnGoing, isSingleOnGoing]);

  useEffect(() => {
    if (isVersusOnGoing) {
      setTokenStateView("versus");
    }
  }, [isVersusOnGoing]);

  useEffect(() => {
    if (isSingleOnGoing) {
      setTokenStateView("single");
    }
  }, [isSingleOnGoing]);

  useEffect(() => {
    if (!isGameOngoing) {
      setTokenStateView("chat");
    }
  }, [isGameOngoing]);

  return { tokenStateView };
};
