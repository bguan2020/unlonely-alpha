import { useEffect, useState } from "react";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { Flex, Text } from "@chakra-ui/react";
import { getTimeFromMillis } from "../../../utils/time";
import { InteractionType, NULL_ADDRESS } from "../../../constants";
import { useUser } from "../../../hooks/context/useUser";

export const TempTokenTimerView = () => {
  const { channel } = useChannelContext();
  const { currentActiveTokenIsAlwaysTradable, currentActiveTokenAddress } =
    channel;
  const { durationLeftForTempToken } = useTempTokenTimerState();

  return (
    <>
      {currentActiveTokenAddress !== NULL_ADDRESS &&
        durationLeftForTempToken !== undefined && (
          <Flex
            justifyContent={"center"}
            bg={"rgba(0, 0, 0, 0.2)"}
            className={durationLeftForTempToken > 300 ? "" : "flashing-text"}
          >
            <Text
              fontSize={"30px"}
              color={durationLeftForTempToken > 300 ? "#c6c3fc" : "#d12424"} // change timer color to red when less than 5 minutes left
              fontWeight="bold"
            >
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

export const useTempTokenTimerState = () => {
  const { userAddress, user } = useUser();
  const { channel, chat } = useChannelContext();
  const {
    currentActiveTokenEndTimestamp,
    currentActiveTokenSymbol,
    isOwner: isChannelOwner,
    handleIsGameFailed,
    handleIsFailedGameModalOpen,
    handleCanPlayToken,
  } = channel;
  const { addToChatbot } = chat;

  const [durationLeftForTempToken, setDurationLeftForTempToken] = useState<
    number | undefined
  >(0); // notes the seconds that the token has remaining, we will use undefined as the flag to initiate the expiration flow, 0 is the default value for when there is no token

  /**
   * token countdown
   */
  useEffect(() => {
    // if currentActiveTokenEndTimestamp is undefined or is BigInt(0), then the token is not active, so set duration to 0
    if (!currentActiveTokenEndTimestamp) {
      setDurationLeftForTempToken(0);
      return;
    }
    // if currentActiveTokenEndTimestamp greater than BigInt(0), then the token is not active,
    // so duration will be a number greater than 0 and durationLeft will follow suit,
    // but if duration becomes negative, then durationLeft will become undefined

    // Function to update the countdown
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const _duration = Number(currentActiveTokenEndTimestamp) - now;

      if (_duration < 0) {
        // If the duration is negative, the countdown is over and the game can no longer be played
        setDurationLeftForTempToken(undefined);
        return;
      }

      setDurationLeftForTempToken(_duration);
    };

    // Initial update
    updateCountdown();

    // Set the interval to update the countdown every X seconds
    const interval = setInterval(updateCountdown, 1 * 1000);

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, [currentActiveTokenEndTimestamp]);

  useEffect(() => {
    if (
      durationLeftForTempToken !== undefined &&
      durationLeftForTempToken === 300
    ) {
      // if the duration left is 5 minutes, send a chatbot message to notify everyone that the token is about to expire
      const title = `The $${currentActiveTokenSymbol} token will expire in 5 minutes!`;
      addToChatbot({
        username: user?.username ?? "",
        address: userAddress ?? "",
        taskType: InteractionType.TEMP_TOKEN_EXPIRATION_WARNING,
        title,
        description: "",
      });
    }
    if (durationLeftForTempToken === undefined) {
      if (isChannelOwner) {
        const title = `The $${currentActiveTokenSymbol} token expired!`;
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.TEMP_TOKEN_EXPIRED,
          title,
          description: "",
        });
      }
      handleCanPlayToken(false);
      handleIsGameFailed(true);
      handleIsFailedGameModalOpen(true);
    }
  }, [durationLeftForTempToken, isChannelOwner, currentActiveTokenSymbol]);

  return {
    durationLeftForTempToken,
  };
};
