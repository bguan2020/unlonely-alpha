import { Flex, Text } from "@chakra-ui/react";
import { getTimeFromMillis } from "../../../utils/time";
import { NULL_ADDRESS } from "../../../constants";
import { useTempTokenTimerState } from "../../../hooks/internal/temp-token/ui/useTempTokenTimerState";
import { useTempTokenContext } from "../../../hooks/context/useTempToken";
import { useVersusTempTokenContext } from "../../../hooks/context/useVersusTempToken";
import { useVersusTempTokenTimerState } from "../../../hooks/internal/versus-token/ui/useVersusTempTokenTimerState";

export const SingleTempTokenTimerView = ({
  disableChatbot,
}: {
  disableChatbot: boolean;
}) => {
  const { tempToken } = useTempTokenContext();
  const {
    currentActiveTokenIsAlwaysTradable,
    currentActiveTokenAddress,
    currentActiveTokenSymbol,
    currentActiveTokenEndTimestamp,
    handleIsGameFailed,
    handleIsFailedGameModalOpen,
    handleCanPlayToken,
  } = tempToken;
  const { durationLeftForTempToken } = useTempTokenTimerState(
    currentActiveTokenEndTimestamp,
    () => {
      handleCanPlayToken(false);
      handleIsGameFailed(true);
      handleIsFailedGameModalOpen(true);
    },
    disableChatbot,
    `The $${currentActiveTokenSymbol} token will expire in 5 minutes!`,
    `The $${currentActiveTokenSymbol} token has expired!`
  );

  return (
    <>
      {currentActiveTokenAddress !== NULL_ADDRESS &&
        durationLeftForTempToken !== undefined && (
          <Flex
            justifyContent={"center"}
            bg={"rgba(0, 0, 0, 0.2)"}
            className={"flashing-text"}
          >
            <Text fontSize={"40px"} color={"#ec3f3f"} fontWeight="bold">
              {currentActiveTokenIsAlwaysTradable
                ? "winner"
                : durationLeftForTempToken
                ? getTimeFromMillis(durationLeftForTempToken * 1000, true, true)
                : "expired"}
            </Text>
          </Flex>
        )}
    </>
  );
};

export const VersusTempTokenTimerView = ({
  disableChatbot,
}: {
  disableChatbot: boolean;
}) => {
  const { gameState } = useVersusTempTokenContext();
  const { tokenA, tokenB, handleCanPlayToken, handleIsGameFinished } =
    gameState;
  const { durationLeftForTempToken } = useVersusTempTokenTimerState(
    tokenA.endTimestamp,
    () => {
      handleCanPlayToken(false);
      handleIsGameFinished(true);
    },
    disableChatbot,
    `The $${tokenA.symbol} and $${tokenB.symbol} tokens will expire in 5 minutes!`,
    ""
  );

  return (
    <>
      {tokenA.endTimestamp !== undefined &&
        durationLeftForTempToken !== undefined && (
          <Flex
            justifyContent={"center"}
            bg={"rgba(0, 0, 0, 0.2)"}
            className={"flashing-text"}
          >
            <Text fontSize={"40px"} color={"#ec3f3f"} fontWeight="bold">
              {durationLeftForTempToken
                ? getTimeFromMillis(durationLeftForTempToken * 1000, true, true)
                : "expired"}
            </Text>
          </Flex>
        )}
    </>
  );
};
