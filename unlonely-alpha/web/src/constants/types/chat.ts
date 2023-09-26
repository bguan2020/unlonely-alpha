export type EmojiType = {
  type: "unicode";
  name: string;
  unicodeString: string;
};

export type EmojiTypes = { emojiType: "unicode" | string; count: number }[];

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
