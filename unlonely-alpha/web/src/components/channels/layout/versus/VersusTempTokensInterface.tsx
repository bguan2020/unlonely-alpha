import { AblyChannelPromise } from "../../../../constants";
import { useVersusTempTokenContext } from "../../../../hooks/context/useVersusTempToken";
import { useTradeTempTokenState } from "../../../../hooks/internal/temp-token/write/useTradeTempTokenState";

export const VersusTempTokensInterface = ({
  customHeight,
  isFullChart,
  ablyChannel,
  customLoading,
  noChannelData,
}: {
  customHeight?: string;
  isFullChart?: boolean;
  ablyChannel?: AblyChannelPromise;
  customLoading?: boolean;
  noChannelData?: boolean;
}) => {
  const { gameState, tokenA, tokenB } = useVersusTempTokenContext();
  const {
    canPlayToken,
    focusedTokenToTrade,
    isGameFinished,
    isGameFinishedModalOpen,
    handleCanPlayToken,
    handleFocusedTokenToTrade,
    handleIsGameFinished,
    handleIsGameFinishedModalOpen,
  } = gameState;
  const tradeTempTokenState_a = useTradeTempTokenState(
    tokenA.address,
    tokenA.symbol,
    tokenA.tempTokenTxs
  );
  const tradeTempTokenState_b = useTradeTempTokenState(
    tokenB.address,
    tokenB.symbol,
    tokenB.tempTokenTxs
  );

  return <></>;
};
