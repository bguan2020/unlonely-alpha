import { useState, useEffect } from "react";
import { InteractionType } from "../../../../constants";
import { useChannelContext } from "../../../context/useChannel";
import { useUser } from "../../../context/useUser";
import { useRouter } from "next/router";

// pure temp token function hook
export const useTempTokenTimerState = ({
  tokenEndTimestamp,
  preSaleEndTimestamp,
  callbackOnExpiration,
  callbackonPresaleEnd,
  chatbotMessages
}:{
  tokenEndTimestamp: bigint | undefined,
  preSaleEndTimestamp: bigint,
  callbackOnExpiration: () => void,
  callbackonPresaleEnd: () => void,
  chatbotMessages?: {
    fiveMinuteWarningMessage: string,
    presaleOverMessage: string
  }
}) => {
  const { userAddress, user } = useUser();
  const { channel, chat } = useChannelContext();
  const { isOwner: isChannelOwner } = channel;
  const { addToChatbot: addToChatbotForTempToken } = chat;
  const router = useRouter()

  const [durationLeftForTempToken, setDurationLeftForTempToken] = useState<
    number | "over" | "inactive"
  >("inactive");

  const [durationLeftForPreSale, setDurationLeftForPreSale] = useState<number>(0);
  const [canCallExpiration, setCanCallExpiration] = useState<boolean>(false);
  const [canCallPresaleEnd, setCanCallPresaleEnd] = useState<boolean>(false);

  /**
   * Unified countdown timer
   */
  useEffect(() => {
    const updateCountdowns = () => {
      const now = Math.floor(Date.now() / 1000);

      // Update token duration
      if (tokenEndTimestamp) {
        const tokenDuration = Number(tokenEndTimestamp) - now;
        if (tokenDuration > 0) {
          setDurationLeftForTempToken(tokenDuration);
          setCanCallExpiration(true);
        } else {
          setDurationLeftForTempToken("over");
        }
      } else {
        setDurationLeftForTempToken("inactive");
      }

      // Update pre-sale duration
      const preSaleDuration = Number(preSaleEndTimestamp) - now;
      if (preSaleDuration > 0) {
        setDurationLeftForPreSale(preSaleDuration);
        setCanCallPresaleEnd(true);
      } else {
        setDurationLeftForPreSale(0);
      }
    };

    // Initial update
    updateCountdowns();

    // Set the interval to update the countdowns every second
    const interval = setInterval(updateCountdowns, 1 * 1000);

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, [tokenEndTimestamp, preSaleEndTimestamp]);

  useEffect(() => {
    if (
      durationLeftForTempToken !== "over" &&
      durationLeftForTempToken === 300 &&
      isChannelOwner &&
      chatbotMessages &&
      chatbotMessages.fiveMinuteWarningMessage.length > 0 && router.pathname.startsWith("/channels")
    ) {
      const title = chatbotMessages.fiveMinuteWarningMessage;
      addToChatbotForTempToken({
        username: user?.username ?? "",
        address: userAddress ?? "",
        taskType: InteractionType.TEMP_TOKEN_EXPIRATION_WARNING,
        title,
        description: "",
      });
    }
    if (durationLeftForTempToken === "over" && canCallExpiration) {
      console.log("useTempTokenTimerState", durationLeftForTempToken, canCallExpiration)
      callbackOnExpiration();
      setCanCallExpiration(false);
    }
  }, [durationLeftForTempToken, isChannelOwner, chatbotMessages, router.pathname]);

  useEffect(() => {
    if (durationLeftForPreSale === 0 && canCallPresaleEnd) {
      if (isChannelOwner && chatbotMessages &&
        chatbotMessages.presaleOverMessage.length > 0 && router.pathname.startsWith("/channels")) {
        const title = chatbotMessages.presaleOverMessage;
        addToChatbotForTempToken({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.PRESALE_OVER,
          title,
          description: "",
        });
      }
      console.log(
        "durationLeftForPreSale",
        durationLeftForPreSale,
        canCallPresaleEnd
      );
      callbackonPresaleEnd();
      setCanCallPresaleEnd(false);
    }
  }, [durationLeftForPreSale, isChannelOwner, chatbotMessages, router.pathname]);

  return {
    durationLeftForTempToken,
    durationLeftForPreSale,
  };
};
