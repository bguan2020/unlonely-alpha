import { COLORS } from "../styles/Colors";

export const ETHEREUM_MAINNET_CHAIN_ID = 1;
export const POLYGON_MATIC_CURRENCY = "Matic";
export const ETHEREUM_MAINNET_CURRENCY = "Eth";
export const YT_PUBLIC_KEY = "AIzaSyAobxgmgOkLIOnwDsKMF_e_4fFSUrcUIxk";
export const BRIAN_TOKEN_ADDRESS = "0x7e5f14b0910ABD7B361D2df7770a5aa3A853ef59";
export const TEST_TOKEN_ADDRESS = "0x24f143c3e00c04955f1E0B65823cF840c8aF2B36";
export const BRIAN_TOKEN_STREAM_INTERACTION_PRICE = "5000000000000000000";
export const BRIAN_TOKEN_STREAM_INTERACTION_PRICE_DECIMAL = "5";
export const BRIAN_TOKEN_APPROVAL_PRICE = "50000000000000000000"; // 50 BRIAN
export const UNLONELYNFCV2_ADDRESS =
  "0xC7E230CE8d67B2ad116208c69d616dD6bFC96a8d";

export enum InteractionType {
  CONTROL = "control-text-interaction",
  TIP = "tip-interaction",
  BUY = "buy-tokens-interaction",
  CUSTOM = "custom-interaction",
}

export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
export const DANNY_TOKEN_ADDRESS = "0x5fD600676F55e9a6e68BA2D2a58278D08f6BD978";

export const USER_APPROVAL_AMOUNT = "10000";

export const RANDOM_CHAT_COLOR =
  COLORS[Math.floor(Math.random() * COLORS.length)];

export const EMOJIS = [
  "https://i.imgur.com/wbUNcyS.gif",
  "https://i.imgur.com/zTfFgtZ.gif",
  "https://i.imgur.com/NurjwAK.gif",
  "⛽️",
  "😂",
  "❤️",
  "👑",
  "👀",
  "👍",
  "👎",
  "🚀",
];

export const ADD_REACTION_EVENT = "add-reaction";
