// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import unicodeMap from "emoji-unicode-map";

export const base_emojis = ["😂", "💰", "⛽️", "🌝", "📉", "🚀", "🔥"];

const _unicodeEmojis = {
  crypto: base_emojis,
};

export const categories = {
  crypto: "🪙",
};

export const gifsList = [
  "https://i.imgur.com/VXcq6We.gif", // what just happened
  "https://i.imgur.com/H9cnvfn.gif", // whoo yay grace
  "https://i.imgur.com/VyPH0Az.gif", // the metaverse
  "https://i.imgur.com/wbUNcyS.gif", // salute
  "https://i.imgur.com/ynQN8Ct.gif", // jeff bezos
  // "https://i.imgur.com/NurjwAK.gif", // bong hit
  "https://i.imgur.com/zTfFgtZ.gif", // dancing
  // "https://i.imgur.com/IW1whk4.gif", // tofu
];

export const categoriesList = Object.keys(categories);

export const unicodeEmojis = categoriesList.reduce(
  (prevVal: any, category: string) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    prevVal[category] = _unicodeEmojis[category].map(
      (unicodeString: string) => ({
        type: "unicode",
        unicodeString,
        name: unicodeMap.get(unicodeString) || "",
      })
    );
    return prevVal;
  },
  {}
);
