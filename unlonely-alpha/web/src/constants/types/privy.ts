/**
 * Object representation of a user's wallet.
 */
interface Wallet {
  /** The wallet address. */
  address: string;
  /**
   * @deprecated Use `chainId` instead.
   *
   * Chain type of the wallet address.
   */
  chainType: "ethereum" | "solana";
  /**
   * CAIP-2 formatted chain ID during the most recent verification.
   *
   * e.g. eip155:1, eip155:5, eip155:137, etc.
   */
  chainId?: string;
  /**
   * @deprecated Use `walletClientType` instead.
   */
  walletClient: "privy" | "unknown";
  /**
   * The wallet client used for this wallet during the most recent verification.
   *
   * If the value is `privy`, then this is a privy embedded wallet.
   *
   * Other values include but are not limited to `metamask`, `rainbow`, `coinbase_wallet`, etc.
   */
  walletClientType?: string;
  /**
   * The connector type used for this wallet during the most recent verification.
   *
   * This includes but is not limited to `injected`, `wallet_connect`, `coinbase_wallet`, `embedded`.
   */
  connectorType?: string;
  /**
   * If this is a 'privy' embedded wallet, stores the recovery method:
   *
   *     1. 'privy': privy escrow of the recovery material
   *     2. 'user-passcode': recovery protected by user-input passcode
   */
  recoveryMethod?: "privy" | "user-passcode";
}

type LinkedAccountType =
  | "wallet"
  | "email"
  | "phone"
  | "google_oauth"
  | "twitter_oauth"
  | "discord_oauth"
  | "github_oauth"
  | "apple_oauth";

interface LinkMetadata {
  /** Account type, most commonly useful when filtering through linkedAccounts */
  type: LinkedAccountType;
  /** Datetime when this account was linked to the user. */
  verifiedAt: Date;
}

/** Object representation of a user's email. */
interface Email {
  /** The email address. */
  address: string;
}
/** Object representation of a user's phone number. */
interface Phone {
  /** The phone number. */
  number: string;
}
/** Object representation of a user's Google account. */
interface Google {
  /** The `sub` claim from the Google-issued JWT for this account. */
  subject: string;
  /** The email associated with the Google account. */
  email: string;
  /** The name associated with the Google account. */
  name: string | null;
}
/** Object representation of a user's Twitter account. */
interface Twitter {
  /** The `sub` claim from the Twitter-issued JWT for this account. */
  subject: string;
  /** The username associated with the Twitter account. */
  username: string | null;
  /** The name associated with the Twitter account. */
  name: string | null;
}
/** Object representation of a user's Discord account. */
interface Discord {
  /** The `sub` claim from the Discord-issued JWT for this account. */
  subject: string;
  /** The username associated with the Discord account.  */
  username: string | null;
  /** The email associated with the Discord account. */
  email: string | null;
}
/** Object representation of a user's Github account. */
interface Github {
  /** The `sub` claim from the Github-issued JWT for this account. */
  subject: string;
  /** The username associated with the Github account.  */
  username: string | null;
  /** The name associated with the Github account. */
  name: string | null;
  /** The email associated with the Github account. */
  email: string | null;
}
/** Object representation of a user's Apple account. */
interface Apple {
  /** The `sub` claim from the Apple-issued JWT for this account. */
  subject: string;
  /** The email associated with the Apple account. */
  email: string;
}
/** Object representation of a user's email, with additional metadata for advanced use cases. */
interface EmailWithMetadata extends LinkMetadata, Email {
  /** Denotes that this is an email account. */
  type: "email";
}
/** Object representation of a user's phone number, with additional metadata for advanced use cases. */
interface PhoneWithMetadata extends LinkMetadata, Phone {
  /** Denotes that this is a phone account. */
  type: "phone";
}
/** Object representation of a user's wallet, with additional metadata for advanced use cases. */
interface WalletWithMetadata extends LinkMetadata, Wallet {
  /** Denotes that this is a wallet account. */
  type: "wallet";
}
/** Object representation of a user's Google Account, with additional metadata for advanced use cases. */
interface GoogleOAuthWithMetadata extends LinkMetadata, Google {
  /** Denotes that this is a Google account. */
  type: "google_oauth";
}
/** Object representation of a user's Twitter Account, with additional metadata for advanced use cases. */
interface TwitterOAuthWithMetadata extends LinkMetadata, Twitter {
  /** Denotes that this is a Twitter account. */
  type: "twitter_oauth";
}
/** Object representation of a user's Discord Account, with additional metadata for advanced use cases. */
interface DiscordOAuthWithMetadata extends LinkMetadata, Discord {
  /** Denotes that this is a Discord account. */
  type: "discord_oauth";
}
/** Object representation of a user's Github Account, with additional metadata for advanced use cases. */
interface GithubOAuthWithMetadata extends LinkMetadata, Github {
  /** Denotes that this is a Github account. */
  type: "github_oauth";
}
/** Object representation of a user's Apple Account, with additional metadata for advanced use cases. */
interface AppleOAuthWithMetadata extends LinkMetadata, Apple {
  /** Denotes that this is a Apple account. */
  type: "apple_oauth";
}
/**
 * Object representation of a user's linked accounts
 */
type LinkedAccountWithMetadata =
  | WalletWithMetadata
  | EmailWithMetadata
  | PhoneWithMetadata
  | GoogleOAuthWithMetadata
  | TwitterOAuthWithMetadata
  | DiscordOAuthWithMetadata
  | GithubOAuthWithMetadata
  | AppleOAuthWithMetadata;

export interface PrivyUser {
  /** The Privy-issued DID for the user. If you need to store additional information
   * about a user, you can use this DID to reference them. */
  id: string;
  /** The datetime of when the user was created. */
  createdAt: Date;
  /** The user's email address, if they have linked one. It cannot be linked to another user. */
  email?: Email;
  /** The user's phone number, if they have linked one. It cannot be linked to another user. */
  phone?: Phone;
  /** The user's most recently linked wallet, if they have linked at least one wallet.
   *  It cannot be linked to another user.
   *  This wallet is the wallet that will be used for transactions and signing if it is connected.
   **/
  wallet?: Wallet;
  /** The user's Google account, if they have linked one. It cannot be linked to another user. */
  google?: Google;
  /** The user's Twitter account, if they have linked one. It cannot be linked to another user. */
  twitter?: Twitter;
  /** The user's Discord account, if they have linked one. It cannot be linked to another user. */
  discord?: Discord;
  /** The user's Github account, if they have linked one. It cannot be linked to another user. */
  github?: Github;
  /** The user's Apple account, if they have linked one. It cannot be linked to another user. */
  apple?: Apple;
  /** The list of accounts associated with this user. Each account contains additional metadata
   * that may be helpful for advanced use cases. */
  linkedAccounts: Array<LinkedAccountWithMetadata>;
}
