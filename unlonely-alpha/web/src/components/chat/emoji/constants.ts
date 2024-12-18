// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import unicodeMap from "emoji-unicode-map";

export const _unicodeEmojis = {
  "crypto emojis": [
    "😂",
    "💰",
    "⛽️",
    "🌝",
    "📉",
    "🚀",
    "🔥",
    "👀",
    "🥵",
    "💀",
    "💘",
    "📈",
    "🫣",
    "💔",
  ],
};

export const gifsList = () => {
  const today = new Date();
  const year = today.getFullYear();
  const halloweenStart = new Date(year, 9, 1); // October is month 9 (zero-based)
  const hallowweenEnd = new Date(year, 10, 1); // November is month 10 (zero-based)
  const originalGifs = [
    "https://i.imgur.com/VXcq6We.gif", // what just happened
    "https://i.imgur.com/H9cnvfn.gif", // whoo yay grace
    "https://i.imgur.com/wbUNcyS.gif", // salute
    // "https://i.imgur.com/ynQN8Ct.gif", // jeff bezos
    "https://i.imgur.com/NurjwAK.gif", // bong hit
    "https://i.imgur.com/zTfFgtZ.gif", // dancing
    // "https://i.imgur.com/IW1whk4.gif", // tofu
    // "https://media.tenor.com/nxh5YC7o1YYAAAAM/jack-nicholson-yes.gif", // jack ni
  ];
  if (today >= halloweenStart && today <= hallowweenEnd) {
    originalGifs.push("https://i.imgur.com/he6L5cp.gif"); // spider
  } else {
    originalGifs.push("https://i.imgur.com/VyPH0Az.gif"); // the metaverse
  }

  return originalGifs;
};

export const unicodeEmojis = Object.keys(_unicodeEmojis)?.reduce(
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
