import { Flex, Text } from "@chakra-ui/react";
import { getTimeFromMillis } from "../../../utils/time";
import { NULL_ADDRESS } from "../../../constants";
import { useTempTokenTimerState } from "../../../hooks/internal/temp-token/ui/useTempTokenTimerState";
import { useTempTokenContext } from "../../../hooks/context/useTempToken";

export const SingleTempTokenTimerView = ({
  disableChatbot,
  fontSize,
}: {
  disableChatbot: boolean;
  fontSize?: number;
}) => {
  const { tempToken } = useTempTokenContext();
  const { gameState } = tempToken;
  const {
    currentActiveTokenIsAlwaysTradable,
    currentActiveTokenAddress,
    currentActiveTokenSymbol,
    currentActiveTokenEndTimestamp,
    currentActiveTokenPreSaleEndTimestamp,
    handleIsGameFailed,
    handleIsFailedGameModalOpen,
    handleCanPlayToken,
    handleIsPreSaleOngoing,
  } = gameState;
  const { durationLeftForTempToken, durationLeftForPreSale } =
    useTempTokenTimerState({
      tokenEndTimestamp: currentActiveTokenEndTimestamp,
      preSaleEndTimestamp: currentActiveTokenPreSaleEndTimestamp,
      callbackOnExpiration: () => {
        handleCanPlayToken(false);
        handleIsGameFailed(true);
        handleIsFailedGameModalOpen(true);
      },
      callbackonPresaleEnd: () => {
        handleIsPreSaleOngoing(false);
      },
      chatbotMessages: undefined,
    });

  return (
    <>
      {currentActiveTokenAddress !== NULL_ADDRESS &&
        durationLeftForTempToken !== undefined && (
          <Flex
            justifyContent={"center"}
            bg={"rgba(0, 0, 0, 0.2)"}
            mx="auto"
            direction="column"
          >
            <Text
              fontSize={`${fontSize ?? 40}px`}
              color={"#ec3f3f"}
              className={"flashing-text"}
              fontWeight="bold"
            >
              {currentActiveTokenIsAlwaysTradable
                ? "winner"
                : typeof durationLeftForTempToken === "number"
                ? getTimeFromMillis(durationLeftForTempToken * 1000, true, true)
                : "expired"}
            </Text>
            <Flex justifyContent={"space-between"}>
              <Text color={durationLeftForPreSale > 0 ? "#37FF8B" : "#ec3f3f"}>
                presale:
              </Text>
              <Text color={durationLeftForPreSale > 0 ? "#37FF8B" : "#ec3f3f"}>
                {durationLeftForPreSale > 0
                  ? getTimeFromMillis(durationLeftForPreSale * 1000, true, true)
                  : "over"}
              </Text>
            </Flex>
          </Flex>
        )}
    </>
  );
};
