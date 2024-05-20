import { useState, useMemo, useEffect } from "react";
import { NULL_ADDRESS } from "../../../../constants";
import { useTempTokenContext } from "../../../context/useTempToken";
import { useVersusTempTokenContext } from "../../../context/useVersusTempToken";
import { useChannelContext } from "../../../context/useChannel";

export const useIsGameOngoing = () => {
    const { channel } = useChannelContext();
    const {
      isOwner,
    } = channel;
  const { tempToken } = useTempTokenContext();
  const { gameState, loadingCurrentOnMount, loadingLastOnMount } = tempToken;
  const {
    currentActiveTokenAddress,
    lastInactiveTokenAddress,
  } = gameState;
  
  const { gameState: versusGameState, loadingOnMount } =
    useVersusTempTokenContext();
  const {
    isGameOngoing: isVersusGameOngoing,
    ownerMustPermamint,
    ownerMustMakeWinningTokenTradeable,
  } = versusGameState;
  const [tokenStateView, setTokenStateView] = useState<
  "owner-choose" | "single" | "versus"
>("owner-choose");

const isVersusOnGoing = useMemo(() => {
  return (
    (isVersusGameOngoing ||
      (typeof ownerMustPermamint === "number" && ownerMustPermamint > 0) ||
      ownerMustMakeWinningTokenTradeable) &&
    !loadingOnMount
  );
}, [
  isVersusGameOngoing,
  ownerMustPermamint,
  ownerMustMakeWinningTokenTradeable,
  loadingOnMount,
]);

const isSingleOnGoing = useMemo(() => {
  return (
    !loadingCurrentOnMount &&
    (!loadingLastOnMount || !isOwner) &&
    (currentActiveTokenAddress !== NULL_ADDRESS ||
      lastInactiveTokenAddress !== NULL_ADDRESS)
  );
}, [
  loadingCurrentOnMount,
  loadingLastOnMount,
  currentActiveTokenAddress,
  lastInactiveTokenAddress,
  isOwner,
]);

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
      setTokenStateView("owner-choose");
    }
  }, [isGameOngoing]);

    return { isGameOngoing, tokenStateView, setTokenStateView };
}