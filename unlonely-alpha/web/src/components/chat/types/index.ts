export type EmojiUsage = {
  emoji: string;
  usedBy: string[];
};

export type Message = {
  clientId: string;
  connectionId: string;
  data: {
    messageText: string;
    username: string;
    chatColor: string;
    address: string;
    isFC: boolean;
    powerUserLvl: number | null;
    videoSavantLvl: number | null;
    reactions?: EmojiUsage[];
  };
  id: string;
  timestamp: number;
  timeserial?: string;
};
