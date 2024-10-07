import { Flex, Text } from "@chakra-ui/react";
import { getTimeFromMillis } from "../../../utils/time";
import { InteractionType, NULL_ADDRESS } from "../../../constants";
import { useTempTokenTimerState } from "../../../hooks/internal/temp-token/ui/useTempTokenTimerState";
import { useTempTokenContext } from "../../../hooks/context/useTempToken";
import { useCallback } from "react";
import { useRouter } from "next/router";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { useUser } from "../../../hooks/context/useUser";

export const SingleTempTokenTimerView = ({
  disableChatbot,
  hidePresaleTimer,
  fontSize,
}: {
  disableChatbot: boolean;
  hidePresaleTimer?: boolean;
  fontSize?: number;
}) => {
  const { channel, chat } = useChannelContext();
  const { isOwner } = channel;
  const { addToChatbot: addToChatbotForTempToken } = chat;
  const { user } = useUser();
  const { tempToken } = useTempTokenContext();
  const { gameState } = tempToken;
  const router = useRouter();

  const {
    currentActiveTokenIsAlwaysTradable,
    currentActiveTokenAddress,
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
        onGameFinish();
        handleCanPlayToken(false);
        handleIsGameFailed(true);
        handleIsFailedGameModalOpen(true);
      },
      callbackonPresaleEnd: () => {
        handleIsPreSaleOngoing(false);
      },
      chatbotMessages: undefined,
    });

  const onGameFinish = useCallback(() => {
    if (isOwner && router.pathname.startsWith("/channels")) {
      addToChatbotForTempToken({
        username: user?.username ?? "",
        address: user?.address ?? "",
        taskType: InteractionType.TEMP_TOKEN_EXPIRED,
        title: "Game finished! Token is now expired!",
        description: "",
      });
    }
  }, [isOwner, router.pathname]);

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
            {!hidePresaleTimer && (
              <Flex justifyContent={"space-between"}>
                <Text
                  color={durationLeftForPreSale > 0 ? "#37FF8B" : "#ec3f3f"}
                >
                  presale:
                </Text>
                <Text
                  color={durationLeftForPreSale > 0 ? "#37FF8B" : "#ec3f3f"}
                >
                  {durationLeftForPreSale > 0
                    ? getTimeFromMillis(
                        durationLeftForPreSale * 1000,
                        true,
                        true
                      )
                    : "over"}
                </Text>
              </Flex>
            )}
          </Flex>
        )}
    </>
  );
};
