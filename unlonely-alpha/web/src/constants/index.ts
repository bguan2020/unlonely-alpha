import Ably from "ably/promises";

import { COLORS } from "../styles/Colors";

export enum InteractionType {
  CONTROL = "control-text-interaction",
  TIP = "tip-interaction",
  BUY = "buy-tokens-interaction",
  CUSTOM = "custom-action-interaction",
  BLAST = "blast-emoji-interaction",
  CLIP = "clip-interaction",
  BUY_VOTES = "buy-votes-interaction",
  SELL_VOTES = "sell-votes-interaction",
  BUY_BADGES = "buy-badges-interaction",
  SELL_BADGES = "sell-badges-interaction",
  BUY_VIBES = "buy-vibes-interaction",
  SELL_VIBES = "sell-vibes-interaction",
  EVENT_LIVE = "event-live-interaction",
  EVENT_LOCK = "event-lock-interaction",
  EVENT_UNLOCK = "event-unlock-interaction",
  EVENT_PAYOUT = "event-payout-interaction",
}

export enum BaseChatCommand {
  COMMANDS = "!commands",
  CHATBOT = "!chatbot",
  RULES = "!rules",
  CLIP = "!clip",
}

export enum EventTypeForContract {
  YAY_NAY_VOTE = 0,
  VIP_BADGE = 1,
  SIDE_BET = 2,
}

export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
export const NULL_ADDRESS_BYTES32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export const USER_APPROVAL_AMOUNT = "10000";

export const RANDOM_CHAT_COLOR =
  COLORS[Math.floor(Math.random() * COLORS.length)];

export const ADD_REACTION_EVENT = "add-reaction";
export const CHAT_MESSAGE_EVENT = "chat-message";
export const CHANGE_USER_ROLE_EVENT = "change-user-role";
export const VIBES_TOKEN_PRICE_RANGE_EVENT = "vibes-token-price-range";

export type CommandData = {
  command: string;
  response: string;
};

export type AblyChannelPromise = Ably.Types.RealtimeChannelPromise;

export const MAX_VIBES_PRICE = 399999999934464;

export const IPFS_PROJECT_ID = "2L4KPgsXhXNwOtkELX7xt2Sbrl4";
export const IPFS_PROJECT_SECRET = "7d400aacc9bc6c0f0d6e59b65a83d764";

export const CREATION_BLOCK = BigInt(9018023);
