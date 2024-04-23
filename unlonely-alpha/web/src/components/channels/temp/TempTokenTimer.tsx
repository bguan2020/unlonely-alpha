import { Flex, Text } from "@chakra-ui/react";
import { getTimeFromMillis } from "../../../utils/time";
import { NULL_ADDRESS } from "../../../constants";
import { useTempTokenTimerState } from "../../../hooks/internal/temp-token/ui/useTempTokenTimerState";
import { useTempTokenContext } from "../../../hooks/context/useTempToken";

export const TempTokenTimerView = ({
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
    currentActiveTokenSymbol,
    currentActiveTokenEndTimestamp,
    () => {
      handleCanPlayToken(false);
      handleIsGameFailed(true);
      handleIsFailedGameModalOpen(true);
    },
    disableChatbot
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
