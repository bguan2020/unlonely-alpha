// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import unicodeMap from "emoji-unicode-map";

const _unicodeEmojis = {
  crypto: [
    "💰",
    "⛽️",
    "🌝",
    "📉",
    "🚀",
  ],
  powerUsers: [
    "coming soon"
  ]
};

export const categories = {
  crypto: "🪙",
  powerUsers: "🥇"
};

export const categoriesList = Object.keys(categories);

export const unicodeEmojis = categoriesList.reduce((prevVal: any, category: string) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  prevVal[category] = _unicodeEmojis[category].map((unicodeString: string) => ({
    type: "unicode",
    unicodeString,
    name: unicodeMap.get(unicodeString) || "",
  }));
  return prevVal;
}, {});