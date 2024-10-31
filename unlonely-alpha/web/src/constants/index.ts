import Ably from "ably/promises";
import { PublicKey } from "@solana/web3.js";

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

  BUY_TEMP_TOKENS = "buy-temp-tokens-interaction",
  SELL_TEMP_TOKENS = "sell-temp-tokens-interaction",
  CREATE_TEMP_TOKEN = "create-temp-token-interaction",
  CREATE_MULTIPLE_TEMP_TOKENS = "create-multiple-temp-tokens-interaction",
  TEMP_TOKEN_EXPIRED = "expired-temp-token-interaction",
  TEMP_TOKEN_EXPIRATION_WARNING = "temp-token-expiration-warning-interaction",
  TEMP_TOKEN_REACHED_THRESHOLD = "temp-token-reached-threshold-interaction",
  TEMP_TOKEN_DURATION_INCREASED = "temp-token-duration-increased-interaction",
  TEMP_TOKEN_BECOMES_ALWAYS_TRADEABLE = "temp-token-becomes-always-tradeable-interaction",
  TEMP_TOKEN_THRESHOLD_INCREASED = "temp-token-threshold-increased-interaction",
  SEND_REMAINING_FUNDS_TO_WINNER_AFTER_TEMP_TOKEN_EXPIRATION = "send-remaining-funds-to-winner-after-temp-token-expiration-interaction",
  VERSUS_SET_WINNING_TOKEN_TRADEABLE_AND_TRANSFER_LIQUIDITY = "versus-set-winning-token-tradeable-and-transfer-liquidity-interaction",
  VERSUS_WINNER_TOKENS_MINTED = "versus-winner-tokens-minted-interaction",
  PRESALE_OVER = "presale-over-interaction",

  EVENT_LIVE = "event-live-interaction",
  EVENT_LOCK = "event-lock-interaction",
  EVENT_UNLOCK = "event-unlock-interaction",
  EVENT_PAYOUT = "event-payout-interaction",

  PUBLISH_NFC = "publish-nfc-interaction",
  MINT_NFC_IN_CHAT = "mint-nfc-in-chat-interaction",

  USE_BOO_PACKAGE = "use-boo-package-interaction",
  SEND_BOO_TTS = "send-tts-interaction",
  BUY_BOO = "buy-boo-interaction",
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

export enum Contract {
  TEMP_TOKEN_FACTORY_V1 = "tempTokenFactoryV1",
  VIBES_TOKEN_V1 = "vibesTokenV1",
  SHARES_V2 = "unlonelySharesV2",
  TOURNAMENT = "unlonelyTournament",
}

export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
export const NULL_ADDRESS_BYTES32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export const USER_APPROVAL_AMOUNT = "10000";

export const RANDOM_CHAT_COLOR =
  COLORS[Math.floor(Math.random() * COLORS.length)];

export const CHAT_MESSAGE_EVENT = "chat-message";
export const CHANGE_USER_ROLE_EVENT = "change-user-role";
export const CHANGE_CHANNEL_DETAILS_EVENT = "change-channel-details";
export const VIBES_TOKEN_PRICE_RANGE_EVENT = "vibes-token-price-range";
export const TOKEN_TRANSFER_EVENT = "token-transfer";
export const PINNED_CHAT_MESSAGES_EVENT = "pinned-chat-messages";
export const PACKAGE_PRICE_CHANGE_EVENT = "package-price-change";
export const ROOM_CHANGE_EVENT = "room-change";
export const PACKAGE_PURCHASE_EVENT = "package-purchase";
export const SEND_TTS_EVENT = "send-tts";

export type CommandData = {
  command: string;
  response: string;
};

export type AblyChannelPromise = Ably.Types.RealtimeChannelPromise;

export const MAX_VIBES_PRICE = 399999999934464;

export const IPFS_PROJECT_ID = "2L4KPgsXhXNwOtkELX7xt2Sbrl4";
export const IPFS_PROJECT_SECRET = String(
  process.env.NEXT_PUBLIC_IPFS_PROJECT_SECRET
);

export const CREATION_BLOCK = BigInt(9018023); // vibes token creation block number

export const SECONDS_IN_A_MINUTE = 60;
export const MINUTES_IN_AN_HOUR = 60;
export const HOURS_IN_A_DAY = 24;
export const DAYS_IN_A_WEEK = 7;
export const AVERAGE_BLOCK_TIME_SECS = 2;
export const SECONDS_PER_HOUR = MINUTES_IN_AN_HOUR * SECONDS_IN_A_MINUTE;
export const SECONDS_PER_DAY = HOURS_IN_A_DAY * SECONDS_PER_HOUR;
export const DESKTOP_VIDEO_VH = 100;
export const MOBILE_VIDEO_VH = 25;
export const CHAKRA_UI_TX_TOAST_DURATION = 5000;

export const NEW_STREAMER_URL_QUERY_PARAM = "new";
export const STREAMER_MIGRATION_URL_QUERY_PARAM = "migrate";
export const ADMIN_GRAPH_QUERY_PARAM = "graph";
export const CLIP_CHANNEL_ID_QUERY_PARAM = "channelId";
export const NFCS_SORT_QUERY_PARAM = "sort";

export const DEFAULT_TOKEN_TRADE_AMOUNT = 1000;
export const DEFAULT_TOKEN_CLAIM_AMOUNT = 10;
export const PRE_SALE_MAX_SUPPLY = 1000;
export const PRE_SALE_PRICE_PER_TOKEN = 23 * 10 ** 12;
export const MIN_BASE_TOKEN_PRICE = BigInt(2 * 10 ** 13);
export const ETH_COST_FOR_ONE_NFT_MINT = 0.000777;

export const CHANNEL_IDS_NO_VIP = [4];
export const CHANNEL_SLUGS_CAN_HIDE_PARTICIPANTS = ["loveonleverage"];
export const UNLONELY_LOGO_IPFS_URL =
  "ipfs://QmWsm34cghYfsrrkzzRzgPEktqFXuVtYde3bv9Yup2bYhF";

export const SOLANA_RPC_URL =
  "https://solana-mainnet.g.alchemy.com/v2/-D7ZPwVOE8mWLx2zsHpYC2dpZDNkhzjf";
export const FIXED_SOLANA_MINT = {
  mintAddress: "GdiPk4dx3pFDrrxHZmbnyed8W9sL5DR6WpigrBANpj7y",
  poolAddress: "HKyrNi2yfBQyFY7jH3c2h9YqVrmuLqe3tUZXFQhNY6PW",
  decimals: 6,
};

export enum SwapMode {
  ExactInOrOut = "ExactInOrOut",
  ExactIn = "ExactIn",
  ExactOut = "ExactOut",
}

export interface FormProps {
  /** Default to `ExactInOrOut`. ExactOut can be used to get an exact output of a token (e.g. for Payments) */
  swapMode?: SwapMode;
  /** Initial amount to swap */
  initialAmount?: string;
  /** When true, user cannot change the amount (e.g. for Payments) */
  fixedAmount?: boolean;
  /** Initial input token to swap */
  initialInputMint?: string;
  /** When true, user cannot change the input token */
  fixedInputMint?: boolean;
  /** Initial output token to swap */
  initialOutputMint?: string;
  /** When true, user cannot change the output token (e.g. to buy your project's token) */
  fixedOutputMint?: boolean;
  /** Initial slippage to swap */
  initialSlippageBps?: number;
}

export const WRAPPED_SOL_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112"
);

export interface IFormConfigurator {
  simulateWalletPassthrough: boolean;
  strictTokenList: boolean;
  defaultExplorer: "Solana Explorer" | "Solscan" | "Solana Beach" | "SolanaFM";
  formProps: FormProps;
  useUserSlippage: boolean;
}

export const INITIAL_FORM_CONFIG: IFormConfigurator = Object.freeze({
  simulateWalletPassthrough: false,
  strictTokenList: true,
  defaultExplorer: "Solana Explorer",
  formProps: {
    fixedInputMint: true,
    fixedOutputMint: true,
    swapMode: SwapMode.ExactInOrOut,
    fixedAmount: false,
    initialAmount: "",
    initialInputMint: WRAPPED_SOL_MINT.toString(),
    initialOutputMint: FIXED_SOLANA_MINT.mintAddress,
  },
  useUserSlippage: true,
});

export const TEXT_TO_SPEECH_PACKAGE_NAME = "text-to-speech";
export const RESET_COOLDOWNS_NAME = "reset-cooldowns";

export enum CarePackageName {
  WATER_BOTTLE = "water-bottle",
  TOILET = "toilet",
  PIZZA = "pizza",
  TORCH = "torch",
  PAPER_ROLL = "paper-roll",
  PHONE = "phone",
}

export enum ScarePackageName {
  BLACKOUT = "blackout",
  FOG = "fog",
  BOOM = "boom",
  WHALE = "whale",
  FIREBALL = "fireball",
  FART_SPRAY = "fart-spray",
}

export const CarePackageToTooltipDescription: Record<CarePackageName, string> =
  {
    [CarePackageName.WATER_BOTTLE]: "send water to a thirsty contestant",
    [CarePackageName.TOILET]: "let a contestant use the bathroom",
    [CarePackageName.PIZZA]: "send pizza to a hungry contestant",
    [CarePackageName.TORCH]: "too dark? send 1 light-able match",
    [CarePackageName.PAPER_ROLL]:
      "things got messy? send 1 sheet of paper towel",
    [CarePackageName.PHONE]:
      "give a contestant their phone for 1 min to make a desperate tweet",
  };

export const ScarePackageToTooltipDescription: Record<
  ScarePackageName,
  string
> = {
  [ScarePackageName.BLACKOUT]: "turn all the lights out in this room for 1 min",
  [ScarePackageName.FOG]: "add some fog to this room",
  [ScarePackageName.BOOM]: "???",
  [ScarePackageName.WHALE]: "oh ur a whale? tell us what you want happen",
  [ScarePackageName.FIREBALL]: "send a contestant a shot of fireball whiskey",
  [ScarePackageName.FART_SPRAY]: "send fart spray",
};

export const PackageNameToModalTitle: Record<string, string> = {
  [TEXT_TO_SPEECH_PACKAGE_NAME]:
    "send a custom text-to-speech message to contestants!",
  [RESET_COOLDOWNS_NAME]: "reset package cooldowns to start using them again!",
  [CarePackageName.WATER_BOTTLE]: "send water to a contestant!",
  [CarePackageName.TOILET]: "let a contestant use the bathroom!",
  [CarePackageName.PIZZA]: "send pizza to a contestant!",
  [CarePackageName.TORCH]: "send a match!",
  [CarePackageName.PAPER_ROLL]: "send 1 sheet of paper towel!",
  [CarePackageName.PHONE]: "give phone for 1 min!",
  [ScarePackageName.BLACKOUT]: "LIGHTS OUT!",
  [ScarePackageName.FOG]: "add fog!",
  [ScarePackageName.BOOM]: "a surprise?!",
  [ScarePackageName.WHALE]: "custom whale request!",
  [ScarePackageName.FIREBALL]: "one shot of fireball coming right up!",
  [ScarePackageName.FART_SPRAY]: "send fart spray!",
};

export const PackageNameToModalExampleMessage: Record<string, string> = {
  [TEXT_TO_SPEECH_PACKAGE_NAME]: "tell rasmr to stop bitching",
  [CarePackageName.WATER_BOTTLE]: "send this bottle of water to my gf linda",
  [CarePackageName.TOILET]: "let sarah use the bathroom omg",
  [CarePackageName.PIZZA]:
    "send pizza to rasmr so he has energy to keep getting spanked",
  [CarePackageName.TORCH]: "send a match to sarah she's so blind rn",
  [CarePackageName.PAPER_ROLL]: "send 1 paper towel to linda pls",
  [CarePackageName.PHONE]: "tell rasmr it better be a banger tweet",
  [ScarePackageName.WHALE]:
    "suggest something and we'll do everything in our power to make it happen",
  [ScarePackageName.FIREBALL]: "send this shot to rasmr frrrrr",
};

export const PackageNameToModalDescription: Record<string, string> = {
  [ScarePackageName.BLACKOUT]:
    "turn the lights off in this room for 30 seconds",
  [ScarePackageName.FOG]:
    "we'll turn the fog machine on in this room for 1 minute",
  [ScarePackageName.BOOM]: "send it to find out 👀",
  [ScarePackageName.FART_SPRAY]: "it's time to stink up this room",
};

export enum BooRoom {
  WAITING_ROOM = "waiting-room",
  MANNEQUIN_ROOM = "mannequin-room",
  BLOOD_BATH = "blood-bath",
  SEX_DUNGEON = "sex-dungeon",
  BLACK_OUT = "black-out",
  CLASSROOM = "classroom",
  ATH = "ath",
}
