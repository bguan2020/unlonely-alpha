import { useState, useEffect } from "react";
import { InteractionType } from "../../../../constants";
import { useChannelContext } from "../../../context/useChannel";
import { useUser } from "../../../context/useUser";

// pure temp token function hook
export const useTempTokenTimerState = (
  tokenSymbol: string,
  tokenEndTimestamp: bigint | undefined,
  callbackOnExpiration: () => void,
  disableChatbot: boolean
) => {
  const { userAddress, user } = useUser();
  const { channel, chat } = useChannelContext();
  const { isOwner: isChannelOwner } = channel;
  const { addToChatbot: addToChatbotForTempToken } = chat;

  const [durationLeftForTempToken, setDurationLeftForTempToken] = useState<
    number | undefined
  >(0); // notes the seconds that the token has remaining, we will use undefined as the flag to initiate the expiration flow, 0 is the default value for when there is no token

  /**
   * token countdown
   */
  useEffect(() => {
    // if tokenEndTimestamp is undefined or is BigInt(0), then the token is not active, so set duration to 0
    if (!tokenEndTimestamp) {
      setDurationLeftForTempToken(0);
      return;
    }
    // if tokenEndTimestamp greater than BigInt(0), then the token is not active,
    // so duration will be a number greater than 0 and durationLeft will follow suit,
    // but if duration becomes negative, then durationLeft will become undefined

    // Function to update the countdown
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const _duration = Number(tokenEndTimestamp) - now;

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
  }, [tokenEndTimestamp]);

  useEffect(() => {
    if (
      durationLeftForTempToken !== undefined &&
      durationLeftForTempToken === 300 &&
      isChannelOwner &&
      !disableChatbot
    ) {
      // if the duration left is 5 minutes, send a chatbot message to notify everyone that the token is about to expire
      const title = `The $${tokenSymbol} token will expire in 5 minutes!`;
      addToChatbotForTempToken({
        username: user?.username ?? "",
        address: userAddress ?? "",
        taskType: InteractionType.TEMP_TOKEN_EXPIRATION_WARNING,
        title,
        description: "",
      });
    }
    if (durationLeftForTempToken === undefined) {
      if (isChannelOwner && !disableChatbot) {
        const title = `The $${tokenSymbol} token expired!`;
        addToChatbotForTempToken({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.TEMP_TOKEN_EXPIRED,
          title,
          description: "",
        });
      }
      callbackOnExpiration();
    }
  }, [durationLeftForTempToken, isChannelOwner, disableChatbot]);

  return {
    durationLeftForTempToken,
  };
};
