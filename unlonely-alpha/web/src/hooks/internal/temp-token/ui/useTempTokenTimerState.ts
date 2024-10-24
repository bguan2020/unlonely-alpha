import { useState, useEffect, useCallback } from "react";
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
  chatbotMessages,
}: {
  tokenEndTimestamp: bigint | undefined;
  preSaleEndTimestamp: bigint;
  callbackOnExpiration: () => void;
  callbackonPresaleEnd: () => void;
  chatbotMessages?: {
    fiveMinuteWarningMessage: string;
    presaleOverMessage: string;
  };
}) => {
  const { user } = useUser();
  const { channel, chat } = useChannelContext();
  const { isOwner: isChannelOwner } = channel;
  const { addToChatbot: addToChatbotForTempToken } = chat;
  const router = useRouter();

  const [durationLeftForTempToken, setDurationLeftForTempToken] = useState<
    number | "over" | "inactive"
  >("inactive");

  const [durationLeftForPreSale, setDurationLeftForPreSale] =
    useState<number>(0);
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

  const onExpire = useCallback(
    (message: string) => {
      addToChatbotForTempToken({
        username: user?.username ?? "",
        address: user?.address ?? "",
        taskType: InteractionType.TEMP_TOKEN_EXPIRATION_WARNING,
        title: message,
        description: "",
      });
    },
    [user]
  );

  useEffect(() => {
    if (
      durationLeftForTempToken === 300 &&
      isChannelOwner &&
      chatbotMessages &&
      chatbotMessages.fiveMinuteWarningMessage.length > 0 &&
      router.pathname.startsWith("/channels")
    ) {
      const title = chatbotMessages.fiveMinuteWarningMessage;
      onExpire(title);
    }
    if (durationLeftForTempToken === "over" && canCallExpiration) {
      console.log(
        "useTempTokenTimerState",
        durationLeftForTempToken,
        canCallExpiration
      );
      callbackOnExpiration();
      setCanCallExpiration(false);
    }
  }, [durationLeftForTempToken]);

  useEffect(() => {
    if (durationLeftForPreSale === 0 && canCallPresaleEnd) {
      if (
        isChannelOwner &&
        chatbotMessages &&
        chatbotMessages.presaleOverMessage.length > 0 &&
        router.pathname.startsWith("/channels")
      ) {
        const title = chatbotMessages.presaleOverMessage;
        addToChatbotForTempToken({
          username: user?.username ?? "",
          address: user?.address ?? "",
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
  }, [
    durationLeftForPreSale,
    isChannelOwner,
    chatbotMessages,
    router.pathname,
  ]);

  return {
    durationLeftForTempToken,
    durationLeftForPreSale,
  };
};
