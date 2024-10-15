import { InteractionType } from "../constants";
import { ChatBotMessageBody } from "../constants/types/chat";
import { jp } from "./validation/jsonParse";

const deepBlueEventTypes = [
  InteractionType.EVENT_LIVE,
  InteractionType.EVENT_LOCK,
  InteractionType.EVENT_UNLOCK,
  InteractionType.EVENT_PAYOUT,
  InteractionType.PUBLISH_NFC,
  InteractionType.MINT_NFC_IN_CHAT,
];

const purpleEventTypes = [
  InteractionType.USE_BOO_PACKAGE,
  InteractionType.SEND_BOO_TTS,
];

const blueTempTokenInteractionTypes = [
  InteractionType.CREATE_TEMP_TOKEN,
  InteractionType.CREATE_MULTIPLE_TEMP_TOKENS,
  InteractionType.TEMP_TOKEN_REACHED_THRESHOLD,
  InteractionType.TEMP_TOKEN_DURATION_INCREASED,
  InteractionType.TEMP_TOKEN_BECOMES_ALWAYS_TRADEABLE,
  InteractionType.TEMP_TOKEN_THRESHOLD_INCREASED,
  InteractionType.SEND_REMAINING_FUNDS_TO_WINNER_AFTER_TEMP_TOKEN_EXPIRATION,
  InteractionType.VERSUS_WINNER_TOKENS_MINTED,
  InteractionType.VERSUS_SET_WINNING_TOKEN_TRADEABLE_AND_TRANSFER_LIQUIDITY,
];

const greenTempTokenInteractionTypes = [
  InteractionType.BUY_TEMP_TOKENS,

  InteractionType.BUY_BOO,
];

const redTempTokenInteractionTypes = [
  InteractionType.SELL_TEMP_TOKENS,
  InteractionType.TEMP_TOKEN_EXPIRATION_WARNING,
  InteractionType.TEMP_TOKEN_EXPIRED,
  InteractionType.PRESALE_OVER,
];

export const messageStyle = (dataBody?: string) => {
  if (!dataBody) return {};
  const jpData = jp(dataBody) as ChatBotMessageBody;
  if (
    dataBody &&
    (deepBlueEventTypes as string[]).includes(jpData.interactionType)
  ) {
    return {
      bg: "rgba(63, 59, 253, 1)",
    };
  } else if (
    dataBody &&
    (blueTempTokenInteractionTypes as string[]).includes(jpData.interactionType)
  ) {
    return {
      bg: "rgba(34, 167, 255, 0.26)",
      textColor: "#7ef0ff",
      fontStyle: "italic",
      fontWeight: "bold",
      showTimestamp: true,
    };
  } else if (
    dataBody &&
    (greenTempTokenInteractionTypes as string[]).includes(
      jpData.interactionType
    )
  ) {
    return {
      bg: "rgba(55, 255, 139, 0.26)",
      textColor: "rgba(55, 255, 139, 1)",
      fontStyle: "italic",
      fontWeight: "bold",
      showTimestamp: true,
    };
  } else if (
    dataBody &&
    (redTempTokenInteractionTypes as string[]).includes(jpData.interactionType)
  ) {
    return {
      bg: "rgba(255, 0, 0, 0.26)",
      textColor: "#ffadad",
      fontStyle: "italic",
      fontWeight: "bold",
      showTimestamp: true,
    };
  } else if (
    dataBody &&
    (purpleEventTypes as string[]).includes(jpData.interactionType)
  ) {
    return {
      bg: "rgba(172, 166, 255, 0.26)",
      textColor: "#d8d7fc",
      fontStyle: "italic",
      fontWeight: "bold",
      showTimestamp: true,
    };
  } else if (jpData.interactionType === InteractionType.CLIP) {
    return {
      bgGradient:
        "linear-gradient(138deg, rgba(0,0,0,1) 10%, rgba(125,125,125,1) 11%, rgba(125,125,125,1) 20%, rgba(0,0,0,1) 21%, rgba(0,0,0,1) 30%, rgba(125,125,125,1) 31%, rgba(125,125,125,1) 40%, rgba(0,0,0,1) 41%, rgba(0,0,0,1) 50%, rgba(125,125,125,1) 51%, rgba(125,125,125,1) 60%, rgba(0,0,0,1) 61%, rgba(0,0,0,1) 70%, rgba(125,125,125,1) 71%, rgba(125,125,125,1) 80%, rgba(0,0,0,1) 81%, rgba(0,0,0,1) 90%, rgba(125,125,125,1) 91%)",
    };
  } else if (jpData.interactionType === InteractionType.BUY_VIBES) {
    return {
      bg: "rgba(10, 179, 18, 1)",
    };
  } else if (jpData.interactionType === InteractionType.SELL_VIBES) {
    return {
      bg: "rgba(218, 58, 19, 1)",
    };
  } else {
    return {
      // bg: "rgba(19, 18, 37, 1)",
    };
  }
};
