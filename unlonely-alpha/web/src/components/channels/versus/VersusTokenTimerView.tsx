import { Flex, Text } from "@chakra-ui/react";
import { getTimeFromMillis } from "../../../utils/time";
import { useTempTokenTimerState } from "../../../hooks/internal/temp-token/ui/useTempTokenTimerState";
import { useVersusTempTokenContext } from "../../../hooks/context/useVersusTempToken";

export const VersusTempTokenTimerView = ({
  disableChatbot,
  fontSize,
}: {
  disableChatbot: boolean;
  fontSize?: number;
}) => {
  const { gameState } = useVersusTempTokenContext();
  const {
    tokenA,
    tokenB,
    handleCanPlayToken,
    handleIsGameFinished,
    handleIsPreSaleOngoing,
  } = gameState;
  const { durationLeftForTempToken, durationLeftForPreSale } =
    useTempTokenTimerState({
      tokenEndTimestamp: tokenA.endTimestamp,
      preSaleEndTimestamp: tokenA.preSaleEndTimestamp,
      callbackOnExpiration: () => {
        handleCanPlayToken(false);
        handleIsGameFinished(true);
      },
      callbackonPresaleEnd: () => {
        handleIsPreSaleOngoing(false);
      },
      // chatbotMessages: disableChatbot
      //   ? undefined
      //   : {
      //       fiveMinuteWarningMessage: `The $${tokenA.symbol} and $${tokenB.symbol} tokens will expire in 5 minutes!`,
      //       presaleOverMessage: `The presale for $${tokenA.symbol} and $${tokenB.symbol} has ended (view)!`,
      //       expirationMessage: "Game finished! Both tokens are now expired!",
      //     },
      chatbotMessages: undefined,
    });

  return (
    <>
      {tokenA.endTimestamp !== undefined &&
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
              {typeof durationLeftForTempToken === "number"
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
