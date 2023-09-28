import { COLORS } from "../styles/Colors";

export enum InteractionType {
  CONTROL = "control-text-interaction",
  TIP = "tip-interaction",
  BUY = "buy-tokens-interaction",
  CUSTOM = "custom-action-interaction",
  BLAST = "blast-emoji-interaction",
  CLIP = "clip-interaction",
  BUY_SHARES = "buy-shares-interaction",
  SELL_SHARES = "sell-shares-interaction",
  EVENT_LIVE = "event-live-interaction",
  EVENT_PAYOUT = "event-payout-interaction",
  EVENT_END = "event-end-interaction",
}

export enum BaseChatCommand {
  COMMANDS = "!commands",
  CHATBOT = "!chatbot",
  RULES = "!rules",
  CLIP = "!clip",
}

export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

export const USER_APPROVAL_AMOUNT = "10000";

export const RANDOM_CHAT_COLOR =
  COLORS[Math.floor(Math.random() * COLORS.length)];

export const ADD_REACTION_EVENT = "add-reaction";
export const CHAT_MESSAGE_EVENT = "chat-message";
export const BAN_USER_EVENT = "ban-user";

export type CommandData = {
  command: string;
  response: string;
};

export const IPFS_PROJECT_ID = "2L4KPgsXhXNwOtkELX7xt2Sbrl4";
export const IPFS_PROJECT_SECRET = "7d400aacc9bc6c0f0d6e59b65a83d764";
