export type EmojiTypes = [
  {
    emojiType: "👑";
    count: number;
  },
  {
    emojiType: "❤️";
    count: number;
  },
  {
    emojiType: "👎";
    count: number;
  },
  {
    emojiType: "👍";
    count: number;
  },
  {
    emojiType: "👀";
    count: number;
  },
  {
    emojiType: "⛽️";
    count: number;
  },
  {
    emojiType: "🚀";
    count: number;
  },
  {
    emojiType: "😂";
    count: number;
  },
  {
    emojiType: "https://i.imgur.com/wbUNcyS.gif";
    count: number;
  },
  {
    emojiType: "https://i.imgur.com/zTfFgtZ.gif";
    count: number;
  },
  {
    emojiType: "https://i.imgur.com/NurjwAK.gif";
    count: number;
  }
];

export type Message = {
  clientId: string;
  connectionId: string;
  name: string;
  data: {
    messageText: string;
    username: string;
    chatColor: string;
    address: string;
    isFC: boolean;
    isLens: boolean;
    lensHandle?: string;
    powerUserLvl: number | null;
    videoSavantLvl: number | null;
    nfcRank: number | null;
    reactions: EmojiTypes;
    tokenHolderRank?: number;
    isGif: boolean;
    body?: string;
  };
  id: string;
  timestamp: number;
  extras: {
    timeserial: string;
  };
};

export const initializeEmojis = [
  {
    emojiType: "👑",
    count: 0,
  },
  {
    emojiType: "❤️",
    count: 0,
  },
  {
    emojiType: "👍",
    count: 0,
  },
  {
    emojiType: "👎",
    count: 0,
  },
  {
    emojiType: "👀",
    count: 0,
  },
  {
    emojiType: "⛽️",
    count: 0,
  },
  {
    emojiType: "🚀",
    count: 0,
  },
  {
    emojiType: "😂",
    count: 0,
  },
  {
    emojiType: "https://i.imgur.com/wbUNcyS.gif",
    count: 0,
  },
  {
    emojiType: "https://i.imgur.com/zTfFgtZ.gif",
    count: 0,
  },
  {
    emojiType: "https://i.imgur.com/NurjwAK.gif",
    count: 0,
  },
];
