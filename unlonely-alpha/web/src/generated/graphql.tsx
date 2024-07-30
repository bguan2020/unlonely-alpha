import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  AccountNumber: any;
  BigInt: any;
  Byte: any;
  CountryCode: any;
  Cuid: any;
  Currency: any;
  DID: any;
  Date: string;
  DateTime: any;
  DateTimeISO: any;
  DeweyDecimal: any;
  Duration: any;
  EmailAddress: any;
  GUID: any;
  HSL: any;
  HSLA: any;
  HexColorCode: any;
  Hexadecimal: any;
  IBAN: any;
  IP: any;
  IPCPatent: any;
  IPv4: any;
  IPv6: any;
  ISBN: any;
  ISO8601Duration: any;
  JSON: any;
  JSONObject: any;
  JWT: any;
  LCCSubclass: any;
  Latitude: any;
  LocalDate: any;
  LocalDateTime: any;
  LocalEndTime: any;
  LocalTime: any;
  Locale: any;
  Long: any;
  Longitude: any;
  MAC: any;
  NegativeFloat: any;
  NegativeInt: any;
  NonEmptyString: any;
  NonNegativeFloat: any;
  NonNegativeInt: any;
  NonPositiveFloat: any;
  NonPositiveInt: any;
  ObjectID: any;
  PhoneNumber: any;
  Port: any;
  PositiveFloat: any;
  PositiveInt: any;
  PostalCode: any;
  RGB: any;
  RGBA: any;
  RoutingNumber: any;
  SESSN: any;
  SafeInt: any;
  SemVer: any;
  Time: any;
  TimeZone: any;
  Timestamp: any;
  URL: any;
  USCurrency: any;
  UUID: any;
  UnsignedFloat: any;
  UnsignedInt: any;
  UtcOffset: any;
  Void: any;
};

export type AddSuggestedChannelsToSubscriptionsInput = {
  channelIds: Array<Scalars["ID"]>;
};

export type Asset = {
  __typename?: "Asset";
  createdAt: Scalars["String"];
  id: Scalars["String"];
  name: Scalars["String"];
  playbackId: Scalars["String"];
  status: AssetStatus;
  userId: Scalars["String"];
};

export type AssetStatus = {
  __typename?: "AssetStatus";
  errorMessage?: Maybe<Scalars["String"]>;
  phase: Scalars["String"];
  progress?: Maybe<Scalars["Float"]>;
  updatedAt: Scalars["String"];
};

export type AssetTask = {
  __typename?: "AssetTask";
  id: Scalars["String"];
};

export type BaseLeaderboard = {
  __typename?: "BaseLeaderboard";
  amount: Scalars["Float"];
  id: Scalars["ID"];
  owner?: Maybe<User>;
};

export type Channel = {
  __typename?: "Channel";
  allowNFCs?: Maybe<Scalars["Boolean"]>;
  awsId: Scalars["String"];
  channel: Channel;
  channelArn?: Maybe<Scalars["String"]>;
  chatCommands?: Maybe<Array<Maybe<ChatCommand>>>;
  command: Scalars["String"];
  contract1155Address?: Maybe<Scalars["String"]>;
  contract1155ChainId?: Maybe<Scalars["Int"]>;
  createdAt: Scalars["DateTime"];
  customButtonAction?: Maybe<Scalars["String"]>;
  customButtonPrice?: Maybe<Scalars["Int"]>;
  description?: Maybe<Scalars["String"]>;
  id: Scalars["ID"];
  isLive?: Maybe<Scalars["Boolean"]>;
  lastNotificationAt: Scalars["DateTime"];
  livepeerPlaybackId?: Maybe<Scalars["String"]>;
  livepeerStreamId?: Maybe<Scalars["String"]>;
  name?: Maybe<Scalars["String"]>;
  nfcs?: Maybe<Array<Maybe<Nfc>>>;
  owner: User;
  pinnedChatMessages?: Maybe<Array<Maybe<Scalars["String"]>>>;
  playbackUrl?: Maybe<Scalars["String"]>;
  response: Scalars["String"];
  roles?: Maybe<Array<Maybe<ChannelUserRole>>>;
  sharesEvent?: Maybe<Array<Maybe<SharesEvent>>>;
  slug: Scalars["String"];
  softDelete?: Maybe<Scalars["Boolean"]>;
  streamKey?: Maybe<Scalars["String"]>;
  thumbnailUrl?: Maybe<Scalars["String"]>;
  token?: Maybe<CreatorToken>;
  updatedAt: Scalars["DateTime"];
  vibesTokenPriceRange?: Maybe<Array<Maybe<Scalars["String"]>>>;
};

export type ChannelContract1155Mapping = {
  __typename?: "ChannelContract1155Mapping";
  contract1155Address: Scalars["String"];
  contract1155ChainId: Scalars["Int"];
};

export type ChannelFeedInput = {
  isLive?: InputMaybe<Scalars["Boolean"]>;
  limit?: InputMaybe<Scalars["Int"]>;
  offset?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<SortBy>;
};

export type ChannelSearchInput = {
  containsSlug?: InputMaybe<Scalars["Boolean"]>;
  includeSoftDeletedChannels?: InputMaybe<Scalars["Boolean"]>;
  limit?: InputMaybe<Scalars["Int"]>;
  query?: InputMaybe<Scalars["String"]>;
  skip?: InputMaybe<Scalars["Int"]>;
  slugOnly?: InputMaybe<Scalars["Boolean"]>;
};

export type ChannelUserRole = {
  __typename?: "ChannelUserRole";
  channelId: Scalars["Int"];
  createdAt: Scalars["String"];
  id: Scalars["Int"];
  role: Scalars["Int"];
  updatedAt: Scalars["String"];
  userAddress: Scalars["String"];
};

export type Chat = {
  __typename?: "Chat";
  channel: Channel;
  createdAt: Scalars["DateTime"];
  id: Scalars["ID"];
  owner: User;
  text: Scalars["String"];
  updatedAt: Scalars["DateTime"];
};

export type ChatCommand = {
  __typename?: "ChatCommand";
  command: Scalars["String"];
  response: Scalars["String"];
};

export type ChatCommandInput = {
  command: Scalars["String"];
  response: Scalars["String"];
};

export type ClipNfcOutput = Likable & {
  __typename?: "ClipNFCOutput";
  createdAt: Scalars["DateTime"];
  disliked?: Maybe<Scalars["Boolean"]>;
  errorMessage?: Maybe<Scalars["String"]>;
  id: Scalars["ID"];
  liked?: Maybe<Scalars["Boolean"]>;
  openseaLink?: Maybe<Scalars["String"]>;
  owner: User;
  score: Scalars["Int"];
  thumbnail?: Maybe<Scalars["String"]>;
  title?: Maybe<Scalars["String"]>;
  updatedAt: Scalars["DateTime"];
  url?: Maybe<Scalars["String"]>;
  videoLink?: Maybe<Scalars["String"]>;
  videoThumbnail?: Maybe<Scalars["String"]>;
};

export type ClipOutput = {
  __typename?: "ClipOutput";
  errorMessage?: Maybe<Scalars["String"]>;
  thumbnail?: Maybe<Scalars["String"]>;
  url?: Maybe<Scalars["String"]>;
};

export type CloseSideBetInput = {
  id: Scalars["ID"];
};

export type ConcatenateOutroToTrimmedVideoInput = {
  name: Scalars["String"];
  trimmedVideoFileName: Scalars["String"];
};

export type CreateClipInput = {
  channelArn: Scalars["String"];
  channelId: Scalars["ID"];
  title: Scalars["String"];
};

export type CreateCreatorTokenInput = {
  address: Scalars["String"];
  channelId: Scalars["ID"];
  name: Scalars["String"];
  price: Scalars["Float"];
  symbol: Scalars["String"];
};

export type CreateLivepeerClipInput = {
  channelId: Scalars["ID"];
  livepeerPlaybackId: Scalars["String"];
  noDatabasePush?: InputMaybe<Scalars["Boolean"]>;
  title: Scalars["String"];
};

export type CreatorToken = {
  __typename?: "CreatorToken";
  address: Scalars["String"];
  channel: Channel;
  holders?: Maybe<Scalars["Int"]>;
  id: Scalars["ID"];
  name: Scalars["String"];
  price: Scalars["Float"];
  symbol: Scalars["String"];
  users: Array<UserCreatorToken>;
};

export type DateRange = {
  end?: InputMaybe<Scalars["DateTime"]>;
  start?: InputMaybe<Scalars["DateTime"]>;
};

export type DeviceToken = {
  __typename?: "DeviceToken";
  address?: Maybe<Scalars["String"]>;
  createdAt: Scalars["DateTime"];
  id: Scalars["ID"];
  notificationsLive: Scalars["Boolean"];
  notificationsNFCs: Scalars["Boolean"];
  token: Scalars["String"];
  updatedAt: Scalars["DateTime"];
};

export enum EventType {
  SideBet = "SIDE_BET",
  VipBadge = "VIP_BADGE",
  YayNayVote = "YAY_NAY_VOTE",
}

export enum GamblableEvent {
  BadgeBuy = "BADGE_BUY",
  BadgeClaimPayout = "BADGE_CLAIM_PAYOUT",
  BadgeSell = "BADGE_SELL",
  BetClaimPayout = "BET_CLAIM_PAYOUT",
  BetCreate = "BET_CREATE",
  BetNoBuy = "BET_NO_BUY",
  BetNoSell = "BET_NO_SELL",
  BetYesBuy = "BET_YES_BUY",
  BetYesSell = "BET_YES_SELL",
}

export type GamblableEventLeaderboard = {
  __typename?: "GamblableEventLeaderboard";
  chainId: Scalars["Int"];
  channelId: Scalars["Int"];
  id: Scalars["ID"];
  totalFees: Scalars["Float"];
  user: User;
};

export type GamblableInteraction = {
  __typename?: "GamblableInteraction";
  channel: Channel;
  createdAt: Scalars["DateTime"];
  eventId?: Maybe<Scalars["Int"]>;
  eventType?: Maybe<EventType>;
  id: Scalars["ID"];
  softDelete?: Maybe<Scalars["Boolean"]>;
  type: GamblableEvent;
  user: User;
};

export type GetBadgeHoldersByChannelInput = {
  channelId: Scalars["ID"];
};

export type GetBetsByChannelInput = {
  channelId: Scalars["ID"];
};

export type GetBetsByUserInput = {
  userAddress: Scalars["String"];
};

export type GetChatInput = {
  channelId: Scalars["Int"];
  limit: Scalars["Int"];
};

export type GetDeviceByTokenInput = {
  token: Scalars["String"];
};

export type GetGamblableEventLeaderboardByChannelIdInput = {
  chainId: Scalars["Int"];
  channelId: Scalars["ID"];
};

export type GetGamblableEventUserRankInput = {
  chainId: Scalars["Int"];
  channelId: Scalars["ID"];
  userAddress: Scalars["String"];
};

export type GetLivepeerClipDataInput = {
  assetId: Scalars["String"];
};

export type GetLivepeerStreamDataInput = {
  streamId?: InputMaybe<Scalars["String"]>;
};

export type GetPoapInput = {
  date: Scalars["String"];
};

export type GetRecentStreamInteractionsByChannelInput = {
  channelId: Scalars["ID"];
};

export type GetStreamerVibesStatInput = {
  streamerAddress: Scalars["String"];
};

export type GetSubscriptionsByChannelIdInput = {
  channelId: Scalars["ID"];
};

export type GetTempTokensInput = {
  chainId?: InputMaybe<Scalars["Int"]>;
  channelId?: InputMaybe<Scalars["Int"]>;
  factoryAddress?: InputMaybe<Scalars["String"]>;
  fulfillAllNotAnyConditions: Scalars["Boolean"];
  hasHitTotalSupplyThreshold?: InputMaybe<Scalars["Boolean"]>;
  isAlwaysTradeable?: InputMaybe<Scalars["Boolean"]>;
  onlyActiveTokens?: InputMaybe<Scalars["Boolean"]>;
  onlyTradeableTokens?: InputMaybe<Scalars["Boolean"]>;
  ownerAddress?: InputMaybe<Scalars["String"]>;
  tokenAddress?: InputMaybe<Scalars["String"]>;
  tokenType?: InputMaybe<TempTokenType>;
};

export type GetTokenHoldersInput = {
  channelId: Scalars["ID"];
  limit?: InputMaybe<Scalars["Int"]>;
  offset?: InputMaybe<Scalars["Int"]>;
};

export type GetUnclaimedEvents = {
  chainId: Scalars["Int"];
  channelId?: InputMaybe<Scalars["ID"]>;
  userAddress?: InputMaybe<Scalars["String"]>;
};

export type GetUserInput = {
  address?: InputMaybe<Scalars["String"]>;
};

export type GetUserTokenHoldingInput = {
  tokenAddress?: InputMaybe<Scalars["String"]>;
  userAddress?: InputMaybe<Scalars["String"]>;
};

export type GetVibesTransactionsInput = {
  chainId: Scalars["Int"];
  dateRange?: InputMaybe<DateRange>;
  skip?: InputMaybe<Scalars["Int"]>;
  streamerAddress: Scalars["String"];
  take?: InputMaybe<Scalars["Int"]>;
};

export type HandleLikeInput = {
  likableId: Scalars["ID"];
  likedObj: LikeObj;
  value: Scalars["Int"];
};

export type IGetLivepeerStreamSessionsDataInput = {
  limit: Scalars["Int"];
  skip: Scalars["Int"];
  streamId: Scalars["String"];
};

export type IGetLivepeerViewershipMetricsInput = {
  fromTimestampInMilliseconds: Scalars["String"];
  playbackId?: InputMaybe<Scalars["String"]>;
  timeStep: Scalars["String"];
  toTimestampInMilliseconds: Scalars["String"];
};

export type Likable = {
  disliked?: Maybe<Scalars["Boolean"]>;
  id: Scalars["ID"];
  liked?: Maybe<Scalars["Boolean"]>;
  score: Scalars["Int"];
};

export type Like = {
  __typename?: "Like";
  disliked: Scalars["Boolean"];
  id: Scalars["ID"];
  liked: Scalars["Boolean"];
  liker: User;
  nFC?: Maybe<Nfc>;
};

export enum LikeObj {
  Hostevent = "HOSTEVENT",
  Nfc = "NFC",
}

export type LivepeerClipDataResponse = {
  __typename?: "LivepeerClipDataResponse";
  error: Scalars["Boolean"];
  videoLink: Scalars["String"];
  videoThumbnail: Scalars["String"];
};

export type LivepeerStreamData = {
  __typename?: "LivepeerStreamData";
  isActive?: Maybe<Scalars["Boolean"]>;
  playbackId?: Maybe<Scalars["String"]>;
  record?: Maybe<Scalars["Boolean"]>;
  streamKey?: Maybe<Scalars["String"]>;
};

export type LivepeerStreamSessionsData = {
  __typename?: "LivepeerStreamSessionsData";
  createdAt: Scalars["BigInt"];
  duration: Scalars["Float"];
  id: Scalars["String"];
  mp4Url: Scalars["String"];
};

export type LivepeerViewershipMetrics = {
  __typename?: "LivepeerViewershipMetrics";
  playbackId: Scalars["String"];
  playtimeMins: Scalars["String"];
  timestamp: Scalars["String"];
  viewCount: Scalars["String"];
};

export type MigrateChannelToLivepeerInput = {
  canRecord?: InputMaybe<Scalars["Boolean"]>;
  slug: Scalars["String"];
};

export type MoveChannelAlongSubscriptionInput = {
  channelId: Scalars["ID"];
  endpoint: Scalars["String"];
};

export type Mutation = {
  __typename?: "Mutation";
  _empty?: Maybe<Scalars["String"]>;
  addChannelToSubscription?: Maybe<Subscription>;
  addSuggestedChannelsToSubscriptions?: Maybe<Array<Maybe<Subscription>>>;
  bulkLivepeerStreamIdMigration?: Maybe<UpdateManyResponse>;
  closeSharesEvents?: Maybe<UpdateManyResponse>;
  closeSideBet?: Maybe<SideBet>;
  concatenateOutroToTrimmedVideo?: Maybe<Scalars["String"]>;
  createClip?: Maybe<ClipNfcOutput>;
  createCreatorToken: CreatorToken;
  createLivepeerClip?: Maybe<ClipNfcOutput>;
  handleLike?: Maybe<Likable>;
  migrateChannelToLivepeer?: Maybe<Channel>;
  openseaNFCScript?: Maybe<Scalars["String"]>;
  postBadgeTrade: GamblableInteraction;
  postBaseLeaderboard: BaseLeaderboard;
  postBet: GamblableInteraction;
  postBetTrade: GamblableInteraction;
  postChannel?: Maybe<Channel>;
  postChatByAwsId?: Maybe<Chat>;
  postClaimPayout: GamblableInteraction;
  postDeviceToken?: Maybe<DeviceToken>;
  postFirstChat?: Maybe<Chat>;
  postNFC?: Maybe<Nfc>;
  postSharesEvent?: Maybe<Channel>;
  postSideBet?: Maybe<SideBet>;
  postStreamInteraction?: Maybe<StreamInteraction>;
  postSubscription?: Maybe<Subscription>;
  postTask?: Maybe<Task>;
  postTempToken?: Maybe<TempToken>;
  postUserRoleForChannel?: Maybe<ChannelUserRole>;
  postVibesTrades?: Maybe<Array<Maybe<VibesTransaction>>>;
  postVideo?: Maybe<Video>;
  removeChannelFromSubscription?: Maybe<Subscription>;
  requestUploadFromLivepeer?: Maybe<RequestUploadResponse>;
  resetLastNotificationAtMigration?: Maybe<Scalars["Boolean"]>;
  softDeleteChannel?: Maybe<Channel>;
  softDeleteSubscription?: Maybe<Subscription>;
  softDeleteTask?: Maybe<Scalars["Boolean"]>;
  softDeleteVideo?: Maybe<Scalars["Boolean"]>;
  toggleSubscription?: Maybe<Subscription>;
  trimVideo?: Maybe<Scalars["String"]>;
  updateChannelAllowNfcs?: Maybe<Channel>;
  updateChannelCustomButton?: Maybe<Channel>;
  updateChannelFidSubscription?: Maybe<Scalars["String"]>;
  updateChannelText?: Maybe<Channel>;
  updateChannelVibesTokenPriceRange?: Maybe<Channel>;
  updateCreatorTokenPrice: CreatorToken;
  updateDeleteChatCommands?: Maybe<Channel>;
  updateDeviceToken?: Maybe<DeviceToken>;
  updateEndTimestampForTokens?: Maybe<Array<Maybe<TempToken>>>;
  updateLivepeerStreamData?: Maybe<LivepeerStreamData>;
  updateNFC?: Maybe<Nfc>;
  updateOpenseaLink?: Maybe<Nfc>;
  updatePinnedChatMessages?: Maybe<Channel>;
  updateSharesEvent?: Maybe<Channel>;
  updateSideBet?: Maybe<SideBet>;
  updateTempTokenHasHitTotalSupplyThreshold: Scalars["Boolean"];
  updateTempTokenHasRemainingFundsForCreator?: Maybe<
    Array<Maybe<TempTokenWithBalance>>
  >;
  updateTempTokenHighestTotalSupply?: Maybe<Array<Maybe<TempToken>>>;
  updateTempTokenIsAlwaysTradeable: Scalars["Boolean"];
  updateTempTokenTransferredLiquidityOnExpiration?: Maybe<TempToken>;
  updateUser?: Maybe<User>;
  updateUserChannelContract1155Mapping?: Maybe<User>;
  updateUserCreatorTokenQuantity: UserCreatorToken;
  updateUserNotifications?: Maybe<User>;
};

export type MutationAddChannelToSubscriptionArgs = {
  data: MoveChannelAlongSubscriptionInput;
};

export type MutationAddSuggestedChannelsToSubscriptionsArgs = {
  data: AddSuggestedChannelsToSubscriptionsInput;
};

export type MutationCloseSharesEventsArgs = {
  data: PostCloseSharesEventsInput;
};

export type MutationCloseSideBetArgs = {
  data: CloseSideBetInput;
};

export type MutationConcatenateOutroToTrimmedVideoArgs = {
  data: ConcatenateOutroToTrimmedVideoInput;
};

export type MutationCreateClipArgs = {
  data?: InputMaybe<CreateClipInput>;
};

export type MutationCreateCreatorTokenArgs = {
  data: CreateCreatorTokenInput;
};

export type MutationCreateLivepeerClipArgs = {
  data?: InputMaybe<CreateLivepeerClipInput>;
};

export type MutationHandleLikeArgs = {
  data: HandleLikeInput;
};

export type MutationMigrateChannelToLivepeerArgs = {
  data: MigrateChannelToLivepeerInput;
};

export type MutationPostBadgeTradeArgs = {
  data: PostBadgeTradeInput;
};

export type MutationPostBaseLeaderboardArgs = {
  data: PostBaseLeaderboardInput;
};

export type MutationPostBetArgs = {
  data: PostBetInput;
};

export type MutationPostBetTradeArgs = {
  data: PostBetTradeInput;
};

export type MutationPostChannelArgs = {
  data: PostChannelInput;
};

export type MutationPostChatByAwsIdArgs = {
  data: PostChatByAwsIdInput;
};

export type MutationPostClaimPayoutArgs = {
  data: PostClaimPayoutInput;
};

export type MutationPostDeviceTokenArgs = {
  data: PostDeviceTokenInput;
};

export type MutationPostFirstChatArgs = {
  data: PostChatInput;
};

export type MutationPostNfcArgs = {
  data: PostNfcInput;
};

export type MutationPostSharesEventArgs = {
  data: PostSharesEventInput;
};

export type MutationPostSideBetArgs = {
  data: PostSideBetInput;
};

export type MutationPostStreamInteractionArgs = {
  data: PostStreamInteractionInput;
};

export type MutationPostSubscriptionArgs = {
  data: PostSubscriptionInput;
};

export type MutationPostTaskArgs = {
  data: PostTaskInput;
};

export type MutationPostTempTokenArgs = {
  data: PostTempTokenInput;
};

export type MutationPostUserRoleForChannelArgs = {
  data?: InputMaybe<PostUserRoleForChannelInput>;
};

export type MutationPostVibesTradesArgs = {
  data: PostVibesTradesInput;
};

export type MutationPostVideoArgs = {
  data: PostVideoInput;
};

export type MutationRemoveChannelFromSubscriptionArgs = {
  data: MoveChannelAlongSubscriptionInput;
};

export type MutationRequestUploadFromLivepeerArgs = {
  data: RequestUploadFromLivepeerInput;
};

export type MutationSoftDeleteChannelArgs = {
  data: SoftDeleteChannelInput;
};

export type MutationSoftDeleteSubscriptionArgs = {
  data: SoftDeleteSubscriptionInput;
};

export type MutationSoftDeleteTaskArgs = {
  id: Scalars["ID"];
};

export type MutationSoftDeleteVideoArgs = {
  id: Scalars["ID"];
};

export type MutationToggleSubscriptionArgs = {
  data: ToggleSubscriptionInput;
};

export type MutationTrimVideoArgs = {
  data: TrimVideoInput;
};

export type MutationUpdateChannelAllowNfcsArgs = {
  data: UpdateChannelAllowNfcsInput;
};

export type MutationUpdateChannelCustomButtonArgs = {
  data: UpdateChannelCustomButtonInput;
};

export type MutationUpdateChannelFidSubscriptionArgs = {
  data: UpdateChannelFidSubscriptionInput;
};

export type MutationUpdateChannelTextArgs = {
  data: UpdateChannelTextInput;
};

export type MutationUpdateChannelVibesTokenPriceRangeArgs = {
  data: UpdateChannelVibesTokenPriceRangeInput;
};

export type MutationUpdateCreatorTokenPriceArgs = {
  data: UpdateCreatorTokenPriceInput;
};

export type MutationUpdateDeleteChatCommandsArgs = {
  data: UpdateDeleteChatCommandInput;
};

export type MutationUpdateDeviceTokenArgs = {
  data: UpdateDeviceInput;
};

export type MutationUpdateEndTimestampForTokensArgs = {
  data: UpdateEndTimestampForTokensInput;
};

export type MutationUpdateLivepeerStreamDataArgs = {
  data: UpdateLivepeerStreamDataInput;
};

export type MutationUpdateNfcArgs = {
  data: UpdateNfcInput;
};

export type MutationUpdatePinnedChatMessagesArgs = {
  data: UpdatePinnedChatMessagesInput;
};

export type MutationUpdateSharesEventArgs = {
  data: UpdateSharesEventInput;
};

export type MutationUpdateSideBetArgs = {
  data: UpdateSideBetInput;
};

export type MutationUpdateTempTokenHasHitTotalSupplyThresholdArgs = {
  data: UpdateTempTokenHasHitTotalSupplyThresholdInput;
};

export type MutationUpdateTempTokenHasRemainingFundsForCreatorArgs = {
  data: UpdateTempTokenHasRemainingFundsForCreatorInput;
};

export type MutationUpdateTempTokenHighestTotalSupplyArgs = {
  data: UpdateTempTokenHighestTotalSupplyInput;
};

export type MutationUpdateTempTokenIsAlwaysTradeableArgs = {
  data: UpdateTempTokenIsAlwaysTradeableInput;
};

export type MutationUpdateTempTokenTransferredLiquidityOnExpirationArgs = {
  data: UpdateTempTokenTransferredLiquidityOnExpirationInput;
};

export type MutationUpdateUserArgs = {
  data: UpdateUserInput;
};

export type MutationUpdateUserChannelContract1155MappingArgs = {
  data: UpdateUserChannelContract1155MappingInput;
};

export type MutationUpdateUserCreatorTokenQuantityArgs = {
  data: UpdateUserCreatorTokenQuantityInput;
};

export type MutationUpdateUserNotificationsArgs = {
  data: UpdateUserNotificationsInput;
};

export type Nfc = Likable & {
  __typename?: "NFC";
  channel: Channel;
  contract1155Address?: Maybe<Scalars["String"]>;
  contract1155ChainId?: Maybe<Scalars["Int"]>;
  createdAt: Scalars["DateTime"];
  disliked?: Maybe<Scalars["Boolean"]>;
  id: Scalars["ID"];
  liked?: Maybe<Scalars["Boolean"]>;
  openseaLink?: Maybe<Scalars["String"]>;
  owner: User;
  score: Scalars["Int"];
  title?: Maybe<Scalars["String"]>;
  updatedAt: Scalars["DateTime"];
  videoLink?: Maybe<Scalars["String"]>;
  videoThumbnail?: Maybe<Scalars["String"]>;
};

export type NfcFeedInput = {
  limit?: InputMaybe<Scalars["Int"]>;
  offset?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<SortBy>;
};

export type NumberOfHolders = {
  __typename?: "NumberOfHolders";
  channel: Channel;
  holders: Scalars["Int"];
};

export type Poap = {
  __typename?: "Poap";
  createdAt: Scalars["DateTime"];
  date: Scalars["String"];
  id: Scalars["ID"];
  isUsed: Scalars["Boolean"];
  link?: Maybe<Scalars["String"]>;
  owner: User;
  updatedAt: Scalars["DateTime"];
};

export type PostBadgeTradeInput = {
  chainId: Scalars["Int"];
  channelId: Scalars["ID"];
  eventId: Scalars["Int"];
  fees: Scalars["Float"];
  isBuying: Scalars["Boolean"];
  userAddress: Scalars["String"];
};

export type PostBaseLeaderboardInput = {
  amount: Scalars["Float"];
};

export type PostBetInput = {
  channelId: Scalars["ID"];
  eventId: Scalars["Int"];
  eventType: EventType;
  userAddress: Scalars["String"];
};

export type PostBetTradeInput = {
  chainId: Scalars["Int"];
  channelId: Scalars["ID"];
  eventId: Scalars["Int"];
  eventType: EventType;
  fees: Scalars["Float"];
  type: GamblableEvent;
  userAddress: Scalars["String"];
};

export type PostChannelInput = {
  allowNfcs?: InputMaybe<Scalars["Boolean"]>;
  canRecord?: InputMaybe<Scalars["Boolean"]>;
  description?: InputMaybe<Scalars["String"]>;
  name?: InputMaybe<Scalars["String"]>;
  slug: Scalars["String"];
};

export type PostChatByAwsIdInput = {
  awsId: Scalars["String"];
  text: Scalars["String"];
};

export type PostChatInput = {
  channelId: Scalars["Int"];
  text: Scalars["String"];
};

export type PostClaimPayoutInput = {
  channelId: Scalars["ID"];
  eventId: Scalars["Int"];
  eventType: EventType;
  type: GamblableEvent;
  userAddress: Scalars["String"];
};

export type PostCloseSharesEventsInput = {
  chainId: Scalars["Int"];
  channelId: Scalars["ID"];
  sharesEventIds: Array<Scalars["ID"]>;
};

export type PostDeviceTokenInput = {
  address?: InputMaybe<Scalars["String"]>;
  notificationsLive?: InputMaybe<Scalars["Boolean"]>;
  notificationsNFCs?: InputMaybe<Scalars["Boolean"]>;
  token: Scalars["String"];
};

export type PostNfcInput = {
  channelId: Scalars["ID"];
  contract1155Address?: InputMaybe<Scalars["String"]>;
  openseaLink: Scalars["String"];
  title: Scalars["String"];
  tokenId?: InputMaybe<Scalars["Int"]>;
  videoLink: Scalars["String"];
  videoThumbnail: Scalars["String"];
  zoraLink?: InputMaybe<Scalars["String"]>;
};

export type PostSharesEventInput = {
  chainId: Scalars["Int"];
  channelId: Scalars["ID"];
  options?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
  sharesSubjectAddress?: InputMaybe<Scalars["String"]>;
  sharesSubjectQuestion?: InputMaybe<Scalars["String"]>;
};

export type PostSideBetInput = {
  chainId: Scalars["Int"];
  channelId: Scalars["ID"];
  creatorAddress?: InputMaybe<Scalars["String"]>;
  opponentAddress?: InputMaybe<Scalars["String"]>;
  wagerDescription?: InputMaybe<Scalars["String"]>;
};

export type PostStreamInteractionInput = {
  channelId: Scalars["ID"];
  interactionType: Scalars["String"];
  text?: InputMaybe<Scalars["String"]>;
};

export type PostSubscriptionInput = {
  auth: Scalars["String"];
  endpoint: Scalars["String"];
  expirationTime?: InputMaybe<Scalars["String"]>;
  p256dh: Scalars["String"];
};

export type PostTaskInput = {
  description?: InputMaybe<Scalars["String"]>;
  link?: InputMaybe<Scalars["String"]>;
  taskType: Scalars["String"];
  thumbnail?: InputMaybe<Scalars["String"]>;
  title?: InputMaybe<Scalars["String"]>;
  youtubeId?: InputMaybe<Scalars["String"]>;
};

export type PostTempTokenInput = {
  chainId: Scalars["Int"];
  channelId: Scalars["Int"];
  creationBlockNumber: Scalars["String"];
  endUnixTimestamp: Scalars["String"];
  factoryAddress: Scalars["String"];
  minBaseTokenPrice: Scalars["String"];
  name: Scalars["String"];
  ownerAddress: Scalars["String"];
  protocolFeePercentage: Scalars["String"];
  streamerFeePercentage: Scalars["String"];
  symbol: Scalars["String"];
  tokenAddress: Scalars["String"];
  tokenType: TempTokenType;
};

export type PostUserRoleForChannelInput = {
  channelId: Scalars["ID"];
  role: Scalars["Int"];
  userAddress: Scalars["String"];
};

export type PostVibesTradesInput = {
  chainId: Scalars["Int"];
  tokenAddress: Scalars["String"];
};

export type PostVideoInput = {
  description?: InputMaybe<Scalars["String"]>;
  duration?: InputMaybe<Scalars["Int"]>;
  thumbnail?: InputMaybe<Scalars["String"]>;
  title?: InputMaybe<Scalars["String"]>;
  youtubeId?: InputMaybe<Scalars["String"]>;
};

export type Query = {
  __typename?: "Query";
  _empty?: Maybe<Scalars["String"]>;
  chatBot?: Maybe<Array<Maybe<Chat>>>;
  checkSubscriptionByEndpoint?: Maybe<Scalars["Boolean"]>;
  currentUser?: Maybe<User>;
  currentUserAuthMessage?: Maybe<Scalars["String"]>;
  firstChatExists?: Maybe<Scalars["Boolean"]>;
  getAllActiveSubscriptions?: Maybe<Array<Maybe<Subscription>>>;
  getAllDevices?: Maybe<Array<Maybe<DeviceToken>>>;
  getAllUsers?: Maybe<Array<Maybe<User>>>;
  getAllUsersWithChannel?: Maybe<Array<Maybe<User>>>;
  getAllUsersWithNotificationsToken?: Maybe<Array<Maybe<User>>>;
  getBadgeHoldersByChannel: Array<Maybe<Scalars["String"]>>;
  getBaseLeaderboard: Array<BaseLeaderboard>;
  getBetsByChannel: Array<Maybe<GamblableInteraction>>;
  getBetsByUser: Array<Maybe<GamblableInteraction>>;
  getChannelByAwsId?: Maybe<Channel>;
  getChannelById?: Maybe<Channel>;
  getChannelBySlug?: Maybe<Channel>;
  getChannelFeed?: Maybe<Array<Maybe<Channel>>>;
  getChannelSearchResults?: Maybe<Array<Maybe<Channel>>>;
  getChannelWithTokenById?: Maybe<Channel>;
  getChannelsByNumberOfBadgeHolders: Array<Maybe<NumberOfHolders>>;
  getChannelsByOwnerAddress?: Maybe<Array<Maybe<Channel>>>;
  getDeviceByToken?: Maybe<DeviceToken>;
  getGamblableEventLeaderboardByChannelId: Array<GamblableEventLeaderboard>;
  getGamblableEventUserRank: Scalars["Int"];
  getLeaderboard?: Maybe<Array<Maybe<User>>>;
  getLivepeerClipData?: Maybe<LivepeerClipDataResponse>;
  getLivepeerStreamData?: Maybe<LivepeerStreamData>;
  getLivepeerStreamSessionsData?: Maybe<
    Array<Maybe<LivepeerStreamSessionsData>>
  >;
  getLivepeerViewershipMetrics?: Maybe<Array<Maybe<LivepeerViewershipMetrics>>>;
  getNFC?: Maybe<Nfc>;
  getNFCFeed?: Maybe<Array<Maybe<Nfc>>>;
  getPoap?: Maybe<Poap>;
  getRecentChats?: Maybe<Array<Maybe<Chat>>>;
  getRecentStreamInteractionsByChannel?: Maybe<Array<Maybe<StreamInteraction>>>;
  getSideBetByChannelId?: Maybe<SideBet>;
  getSideBetById?: Maybe<SideBet>;
  getSideBetByUser?: Maybe<SideBet>;
  getStreamerVibesStat?: Maybe<Array<Maybe<StreamerVibesStat>>>;
  getSubscriptionByEndpoint?: Maybe<Subscription>;
  getSubscriptionsByChannelId?: Maybe<Array<Maybe<Subscription>>>;
  getTaskFeed?: Maybe<Array<Maybe<Task>>>;
  getTempTokens?: Maybe<Array<Maybe<TempToken>>>;
  getTokenHoldersByChannel: Array<UserCreatorToken>;
  getTokenLeaderboard: Array<CreatorToken>;
  getUnclaimedEvents: Array<Maybe<SharesEvent>>;
  getUser?: Maybe<User>;
  getUserChannelContract1155Mapping?: Maybe<Scalars["JSON"]>;
  getUserTokenHolding?: Maybe<Scalars["Int"]>;
  getVibesTransactions?: Maybe<Array<Maybe<VibesTransaction>>>;
  getVideo?: Maybe<Video>;
  getVideoFeed?: Maybe<Array<Maybe<Video>>>;
  sendAllNotifications?: Maybe<Scalars["Boolean"]>;
  updateAllUsers?: Maybe<Array<Maybe<User>>>;
};

export type QueryCheckSubscriptionByEndpointArgs = {
  data: ToggleSubscriptionInput;
};

export type QueryGetBadgeHoldersByChannelArgs = {
  data?: InputMaybe<GetBadgeHoldersByChannelInput>;
};

export type QueryGetBetsByChannelArgs = {
  data?: InputMaybe<GetBetsByChannelInput>;
};

export type QueryGetBetsByUserArgs = {
  data?: InputMaybe<GetBetsByUserInput>;
};

export type QueryGetChannelByAwsIdArgs = {
  awsId: Scalars["String"];
};

export type QueryGetChannelByIdArgs = {
  id: Scalars["ID"];
};

export type QueryGetChannelBySlugArgs = {
  slug: Scalars["String"];
};

export type QueryGetChannelFeedArgs = {
  data?: InputMaybe<ChannelFeedInput>;
};

export type QueryGetChannelSearchResultsArgs = {
  data: ChannelSearchInput;
};

export type QueryGetChannelWithTokenByIdArgs = {
  id: Scalars["ID"];
};

export type QueryGetChannelsByOwnerAddressArgs = {
  ownerAddress: Scalars["String"];
};

export type QueryGetDeviceByTokenArgs = {
  data: GetDeviceByTokenInput;
};

export type QueryGetGamblableEventLeaderboardByChannelIdArgs = {
  data?: InputMaybe<GetGamblableEventLeaderboardByChannelIdInput>;
};

export type QueryGetGamblableEventUserRankArgs = {
  data?: InputMaybe<GetGamblableEventUserRankInput>;
};

export type QueryGetLivepeerClipDataArgs = {
  data?: InputMaybe<GetLivepeerClipDataInput>;
};

export type QueryGetLivepeerStreamDataArgs = {
  data: GetLivepeerStreamDataInput;
};

export type QueryGetLivepeerStreamSessionsDataArgs = {
  data: IGetLivepeerStreamSessionsDataInput;
};

export type QueryGetLivepeerViewershipMetricsArgs = {
  data: IGetLivepeerViewershipMetricsInput;
};

export type QueryGetNfcArgs = {
  id: Scalars["ID"];
};

export type QueryGetNfcFeedArgs = {
  data?: InputMaybe<NfcFeedInput>;
};

export type QueryGetPoapArgs = {
  data?: InputMaybe<GetPoapInput>;
};

export type QueryGetRecentChatsArgs = {
  data: GetChatInput;
};

export type QueryGetRecentStreamInteractionsByChannelArgs = {
  data?: InputMaybe<GetRecentStreamInteractionsByChannelInput>;
};

export type QueryGetSideBetByChannelIdArgs = {
  id: Scalars["ID"];
};

export type QueryGetSideBetByIdArgs = {
  id: Scalars["ID"];
};

export type QueryGetSideBetByUserArgs = {
  userAddress: Scalars["String"];
};

export type QueryGetStreamerVibesStatArgs = {
  data: GetStreamerVibesStatInput;
};

export type QueryGetSubscriptionByEndpointArgs = {
  data: ToggleSubscriptionInput;
};

export type QueryGetSubscriptionsByChannelIdArgs = {
  data: GetSubscriptionsByChannelIdInput;
};

export type QueryGetTaskFeedArgs = {
  data?: InputMaybe<TaskFeedInput>;
};

export type QueryGetTempTokensArgs = {
  data?: InputMaybe<GetTempTokensInput>;
};

export type QueryGetTokenHoldersByChannelArgs = {
  data?: InputMaybe<GetTokenHoldersInput>;
};

export type QueryGetUnclaimedEventsArgs = {
  data?: InputMaybe<GetUnclaimedEvents>;
};

export type QueryGetUserArgs = {
  data: GetUserInput;
};

export type QueryGetUserChannelContract1155MappingArgs = {
  data: GetUserInput;
};

export type QueryGetUserTokenHoldingArgs = {
  data: GetUserTokenHoldingInput;
};

export type QueryGetVibesTransactionsArgs = {
  data: GetVibesTransactionsInput;
};

export type QueryGetVideoArgs = {
  id: Scalars["ID"];
};

export type QueryGetVideoFeedArgs = {
  data?: InputMaybe<VideoFeedInput>;
};

export type QuerySendAllNotificationsArgs = {
  data: SendAllNotificationsInput;
};

export type RequestUploadFromLivepeerInput = {
  name: Scalars["String"];
};

export type RequestUploadResponse = {
  __typename?: "RequestUploadResponse";
  asset: Asset;
  task: AssetTask;
  tusEndpoint: Scalars["String"];
  url: Scalars["String"];
};

export type SendAllNotificationsInput = {
  body: Scalars["String"];
  channelId?: InputMaybe<Scalars["ID"]>;
  pathname?: InputMaybe<Scalars["String"]>;
  title: Scalars["String"];
};

export type SharesEvent = {
  __typename?: "SharesEvent";
  chainId?: Maybe<Scalars["Int"]>;
  channelId?: Maybe<Scalars["ID"]>;
  createdAt: Scalars["DateTime"];
  eventState?: Maybe<SharesEventState>;
  id: Scalars["ID"];
  options?: Maybe<Array<Maybe<Scalars["String"]>>>;
  resultIndex?: Maybe<Scalars["Int"]>;
  sharesSubjectAddress?: Maybe<Scalars["String"]>;
  sharesSubjectQuestion?: Maybe<Scalars["String"]>;
  softDelete?: Maybe<Scalars["Boolean"]>;
};

export enum SharesEventState {
  Live = "LIVE",
  Lock = "LOCK",
  Payout = "PAYOUT",
  PayoutCurrent = "PAYOUT_CURRENT",
  PayoutPrevious = "PAYOUT_PREVIOUS",
  Pending = "PENDING",
}

export type SideBet = {
  __typename?: "SideBet";
  chainId?: Maybe<Scalars["Int"]>;
  createdAt: Scalars["DateTime"];
  creatorAddress?: Maybe<Scalars["String"]>;
  id: Scalars["ID"];
  opponentAddress?: Maybe<Scalars["String"]>;
  result?: Maybe<Scalars["Boolean"]>;
  softDelete?: Maybe<Scalars["Boolean"]>;
  wagerDescription?: Maybe<Scalars["String"]>;
};

export type SoftDeleteChannelInput = {
  slug: Scalars["String"];
};

export type SoftDeleteSubscriptionInput = {
  id: Scalars["ID"];
};

export enum SortBy {
  CreatedAt = "createdAt",
  Score = "score",
}

export enum SortOrder {
  Asc = "asc",
  Desc = "desc",
}

export type StreamInteraction = {
  __typename?: "StreamInteraction";
  channel: Channel;
  createdAt: Scalars["DateTime"];
  id: Scalars["ID"];
  interactionType: Scalars["String"];
  owner: User;
  text?: Maybe<Scalars["String"]>;
  updatedAt: Scalars["DateTime"];
};

export type StreamerVibesStat = {
  __typename?: "StreamerVibesStat";
  allTimeTotalProtocolWeiFees: Scalars["String"];
  allTimeTotalStreamerWeiFees: Scalars["String"];
  allTimeTotalVibesVolume: Scalars["String"];
  allTimeTotalWeiVolume: Scalars["String"];
  chainId: Scalars["Int"];
  createdAt: Scalars["DateTime"];
  id: Scalars["ID"];
  streamerAddress: Scalars["String"];
  uniqueStatId: Scalars["String"];
  updatedAt: Scalars["DateTime"];
};

export type Subscription = {
  __typename?: "Subscription";
  allowedChannels?: Maybe<Array<Scalars["ID"]>>;
  auth: Scalars["String"];
  createdAt: Scalars["DateTime"];
  endpoint: Scalars["String"];
  expirationTime?: Maybe<Scalars["String"]>;
  id: Scalars["ID"];
  p256dh: Scalars["String"];
  softDelete: Scalars["Boolean"];
};

export type Task = {
  __typename?: "Task";
  completed: Scalars["Boolean"];
  createdAt: Scalars["DateTime"];
  description?: Maybe<Scalars["String"]>;
  id: Scalars["ID"];
  isDeleted?: Maybe<Scalars["Boolean"]>;
  link?: Maybe<Scalars["String"]>;
  owner: User;
  taskType: Scalars["String"];
  thumbnail?: Maybe<Scalars["String"]>;
  title?: Maybe<Scalars["String"]>;
  updatedAt: Scalars["DateTime"];
  youtubeId?: Maybe<Scalars["String"]>;
};

export type TaskFeedInput = {
  limit?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<SortOrder>;
  searchString?: InputMaybe<Scalars["String"]>;
  skip?: InputMaybe<Scalars["Int"]>;
};

export type TempToken = {
  __typename?: "TempToken";
  chainId: Scalars["Int"];
  channel: Channel;
  channelId: Scalars["Int"];
  createdAt: Scalars["DateTime"];
  creationBlockNumber: Scalars["BigInt"];
  endUnixTimestamp: Scalars["BigInt"];
  factoryAddress: Scalars["String"];
  hasHitTotalSupplyThreshold: Scalars["Boolean"];
  hasRemainingFundsForCreator: Scalars["Boolean"];
  highestTotalSupply: Scalars["BigInt"];
  id: Scalars["ID"];
  isAlwaysTradeable: Scalars["Boolean"];
  minBaseTokenPrice: Scalars["BigInt"];
  name: Scalars["String"];
  ownerAddress: Scalars["String"];
  protocolFeePercentage: Scalars["BigInt"];
  streamerFeePercentage: Scalars["BigInt"];
  symbol: Scalars["String"];
  tokenAddress: Scalars["String"];
  tokenType?: Maybe<TempTokenType>;
  totalSupply: Scalars["BigInt"];
  transferredLiquidityOnExpiration?: Maybe<Scalars["BigInt"]>;
};

export enum TempTokenType {
  SingleMode = "SINGLE_MODE",
  VersusMode = "VERSUS_MODE",
}

export type TempTokenWithBalance = {
  __typename?: "TempTokenWithBalance";
  balance: Scalars["BigInt"];
  chainId: Scalars["Int"];
  channelId: Scalars["Int"];
  creationBlockNumber: Scalars["BigInt"];
  endUnixTimestamp: Scalars["BigInt"];
  hasHitTotalSupplyThreshold: Scalars["Boolean"];
  hasRemainingFundsForCreator: Scalars["Boolean"];
  highestTotalSupply: Scalars["BigInt"];
  id: Scalars["ID"];
  isAlwaysTradeable: Scalars["Boolean"];
  name: Scalars["String"];
  ownerAddress: Scalars["String"];
  protocolFeePercentage: Scalars["BigInt"];
  streamerFeePercentage: Scalars["BigInt"];
  symbol: Scalars["String"];
  tokenAddress: Scalars["String"];
  tokenType?: Maybe<TempTokenType>;
  totalSupply: Scalars["BigInt"];
};

export type ToggleSubscriptionInput = {
  endpoint: Scalars["String"];
};

export type TrimVideoInput = {
  endTime: Scalars["Float"];
  startTime: Scalars["Float"];
  videoLink: Scalars["String"];
};

export type UpdateChannelAllowNfcsInput = {
  allowNfcs?: InputMaybe<Scalars["Boolean"]>;
  id: Scalars["ID"];
};

export type UpdateChannelCustomButtonInput = {
  customButtonAction: Scalars["String"];
  customButtonPrice: Scalars["Int"];
  id: Scalars["ID"];
};

export type UpdateChannelFidSubscriptionInput = {
  channelId: Scalars["Int"];
  fid: Scalars["Int"];
  isAddingSubscriber: Scalars["Boolean"];
};

export type UpdateChannelTextInput = {
  description: Scalars["String"];
  id: Scalars["ID"];
  name: Scalars["String"];
};

export type UpdateChannelVibesTokenPriceRangeInput = {
  id: Scalars["ID"];
  vibesTokenPriceRange: Array<InputMaybe<Scalars["String"]>>;
};

export type UpdateCreatorTokenPriceInput = {
  price: Scalars["Float"];
  tokenAddress: Scalars["String"];
};

export type UpdateDeleteChatCommandInput = {
  chatCommands: Array<InputMaybe<ChatCommandInput>>;
  id: Scalars["ID"];
};

export type UpdateDeviceInput = {
  notificationsLive: Scalars["Boolean"];
  notificationsNFCs: Scalars["Boolean"];
  token: Scalars["String"];
};

export type UpdateEndTimestampForTokensInput = {
  additionalDurationInSeconds: Scalars["Int"];
  chainId: Scalars["Int"];
  tokenAddresses?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type UpdateLivepeerStreamDataInput = {
  canRecord?: InputMaybe<Scalars["Boolean"]>;
  streamId?: InputMaybe<Scalars["String"]>;
};

export type UpdateManyResponse = {
  __typename?: "UpdateManyResponse";
  count: Scalars["Int"];
};

export type UpdateNfcInput = {
  id: Scalars["ID"];
  openseaLink: Scalars["String"];
  title: Scalars["String"];
  videoLink: Scalars["String"];
  videoThumbnail: Scalars["String"];
};

export type UpdatePinnedChatMessagesInput = {
  id: Scalars["ID"];
  pinnedChatMessages: Array<InputMaybe<Scalars["String"]>>;
};

export type UpdateSharesEventInput = {
  eventState?: InputMaybe<SharesEventState>;
  id: Scalars["ID"];
  resultIndex?: InputMaybe<Scalars["Int"]>;
  sharesSubjectAddress?: InputMaybe<Scalars["String"]>;
  sharesSubjectQuestion?: InputMaybe<Scalars["String"]>;
};

export type UpdateSideBetInput = {
  creatorAddress?: InputMaybe<Scalars["String"]>;
  id: Scalars["ID"];
  opponentAddress?: InputMaybe<Scalars["String"]>;
  wagerDescription?: InputMaybe<Scalars["String"]>;
};

export type UpdateTempTokenHasHitTotalSupplyThresholdInput = {
  chainId: Scalars["Int"];
  tokenAddressesSetFalse?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
  tokenAddressesSetTrue?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type UpdateTempTokenHasRemainingFundsForCreatorInput = {
  chainId: Scalars["Int"];
  channelId: Scalars["Int"];
  factoryAddress?: InputMaybe<Scalars["String"]>;
  tokenType: TempTokenType;
};

export type UpdateTempTokenHighestTotalSupplyInput = {
  chainId: Scalars["Int"];
  newTotalSupplies?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
  tokenAddresses?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type UpdateTempTokenIsAlwaysTradeableInput = {
  chainId: Scalars["Int"];
  tokenAddressesSetFalse?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
  tokenAddressesSetTrue?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
};

export type UpdateTempTokenTransferredLiquidityOnExpirationInput = {
  chainId: Scalars["Int"];
  finalLiquidityInWei: Scalars["String"];
  losingTokenAddress: Scalars["String"];
};

export type UpdateUserChannelContract1155MappingInput = {
  channelId: Scalars["ID"];
  contract1155Address: Scalars["String"];
  contract1155ChainId: Scalars["Int"];
  userAddress: Scalars["String"];
};

export type UpdateUserCreatorTokenQuantityInput = {
  purchasedAmount: Scalars["Int"];
  tokenAddress: Scalars["String"];
};

export type UpdateUserInput = {
  address?: InputMaybe<Scalars["String"]>;
};

export type UpdateUserNotificationsInput = {
  notificationsLive?: InputMaybe<Scalars["Boolean"]>;
  notificationsNFCs?: InputMaybe<Scalars["Boolean"]>;
  notificationsTokens?: InputMaybe<Scalars["String"]>;
};

export type User = {
  __typename?: "User";
  FCImageUrl?: Maybe<Scalars["String"]>;
  address: Scalars["String"];
  authedAsMe: Scalars["Boolean"];
  bio?: Maybe<Scalars["String"]>;
  channel?: Maybe<Array<Maybe<Channel>>>;
  channelContract1155Mapping?: Maybe<Scalars["JSON"]>;
  createdAt: Scalars["DateTime"];
  id: Scalars["ID"];
  isFCUser: Scalars["Boolean"];
  isLensUser: Scalars["Boolean"];
  lensHandle?: Maybe<Scalars["String"]>;
  lensImageUrl?: Maybe<Scalars["String"]>;
  nfcRank: Scalars["Int"];
  notificationsLive?: Maybe<Scalars["Boolean"]>;
  notificationsNFCs?: Maybe<Scalars["Boolean"]>;
  notificationsTokens?: Maybe<Scalars["String"]>;
  powerUserLvl: Scalars["Int"];
  reputation?: Maybe<Scalars["Int"]>;
  sigTimestamp?: Maybe<Scalars["BigInt"]>;
  signature?: Maybe<Scalars["String"]>;
  updatedAt: Scalars["DateTime"];
  username?: Maybe<Scalars["String"]>;
  videoSavantLvl: Scalars["Int"];
};

export type UserCreatorToken = {
  __typename?: "UserCreatorToken";
  quantity: Scalars["Int"];
  token: CreatorToken;
  tokenId: Scalars["ID"];
  user: User;
  userId: Scalars["String"];
};

export type VibesTransaction = {
  __typename?: "VibesTransaction";
  blockNumber?: Maybe<Scalars["BigInt"]>;
  chainId: Scalars["Int"];
  createdAt: Scalars["DateTime"];
  id: Scalars["ID"];
  protocolWeiFees?: Maybe<Scalars["String"]>;
  streamerAddress?: Maybe<Scalars["String"]>;
  streamerWeiFees?: Maybe<Scalars["String"]>;
  totalVibesSupplyAfterTrade?: Maybe<Scalars["String"]>;
  traderAddress?: Maybe<Scalars["String"]>;
  transactionHash: Scalars["String"];
  transactionType?: Maybe<VibesTransactionType>;
  uniqueTransactionId: Scalars["String"];
  vibesAmount?: Maybe<Scalars["String"]>;
  weiAmount?: Maybe<Scalars["String"]>;
};

export enum VibesTransactionType {
  Buy = "BUY",
  Sell = "SELL",
}

export type Video = {
  __typename?: "Video";
  createdAt: Scalars["DateTime"];
  currentVideo: Scalars["Boolean"];
  description: Scalars["String"];
  duration: Scalars["Int"];
  id: Scalars["ID"];
  isDeleted: Scalars["Boolean"];
  liked?: Maybe<Scalars["Boolean"]>;
  owner: User;
  pause?: Maybe<Scalars["Int"]>;
  score: Scalars["Int"];
  skip?: Maybe<Scalars["Int"]>;
  skipped?: Maybe<Scalars["Boolean"]>;
  thumbnail: Scalars["String"];
  title: Scalars["String"];
  updatedAt: Scalars["DateTime"];
  youtubeId: Scalars["String"];
};

export type VideoFeedInput = {
  limit?: InputMaybe<Scalars["Int"]>;
  orderBy?: InputMaybe<SortOrder>;
  searchString?: InputMaybe<Scalars["String"]>;
  skip?: InputMaybe<Scalars["Int"]>;
};

export type GetUserQueryVariables = Exact<{
  data: GetUserInput;
}>;

export type GetUserQuery = {
  __typename?: "Query";
  getUser?: {
    __typename?: "User";
    address: string;
    username?: string | null;
    signature?: string | null;
    powerUserLvl: number;
    videoSavantLvl: number;
    nfcRank: number;
    FCImageUrl?: string | null;
    isFCUser: boolean;
    isLensUser: boolean;
    lensHandle?: string | null;
    lensImageUrl?: string | null;
    channel?: Array<{ __typename?: "Channel"; slug: string } | null> | null;
  } | null;
};

export type GetUserChannelContract1155MappingQueryVariables = Exact<{
  data: GetUserInput;
}>;

export type GetUserChannelContract1155MappingQuery = {
  __typename?: "Query";
  getUserChannelContract1155Mapping?: any | null;
};

export type GetLivepeerClipDataQueryVariables = Exact<{
  data?: InputMaybe<GetLivepeerClipDataInput>;
}>;

export type GetLivepeerClipDataQuery = {
  __typename?: "Query";
  getLivepeerClipData?: {
    __typename?: "LivepeerClipDataResponse";
    error: boolean;
    videoThumbnail: string;
    videoLink: string;
  } | null;
};

export type GetUserTokenHoldingQueryVariables = Exact<{
  data: GetUserTokenHoldingInput;
}>;

export type GetUserTokenHoldingQuery = {
  __typename?: "Query";
  getUserTokenHolding?: number | null;
};

export type SendAllNotificationsQueryVariables = Exact<{
  data: SendAllNotificationsInput;
}>;

export type SendAllNotificationsQuery = {
  __typename?: "Query";
  sendAllNotifications?: boolean | null;
};

export type GetUnclaimedEventsQueryVariables = Exact<{
  data?: InputMaybe<GetUnclaimedEvents>;
}>;

export type GetUnclaimedEventsQuery = {
  __typename?: "Query";
  getUnclaimedEvents: Array<{
    __typename?: "SharesEvent";
    sharesSubjectQuestion?: string | null;
    sharesSubjectAddress?: string | null;
    resultIndex?: number | null;
    options?: Array<string | null> | null;
    id: string;
    eventState?: SharesEventState | null;
    createdAt: any;
    chainId?: number | null;
    channelId?: string | null;
  } | null>;
};

export type GetTokenLeaderboardQueryVariables = Exact<{ [key: string]: never }>;

export type GetTokenLeaderboardQuery = {
  __typename?: "Query";
  getTokenLeaderboard: Array<{
    __typename?: "CreatorToken";
    symbol: string;
    price: number;
    name: string;
    id: string;
    holders?: number | null;
    address: string;
    channel: {
      __typename?: "Channel";
      slug: string;
      owner: { __typename?: "User"; address: string; username?: string | null };
    };
  }>;
};

export type ChannelDetailQueryVariables = Exact<{
  slug: Scalars["String"];
}>;

export type ChannelDetailQuery = {
  __typename?: "Query";
  getChannelBySlug?: {
    __typename?: "Channel";
    awsId: string;
    channelArn?: string | null;
    description?: string | null;
    livepeerPlaybackId?: string | null;
    livepeerStreamId?: string | null;
    streamKey?: string | null;
    isLive?: boolean | null;
    id: string;
    name?: string | null;
    slug: string;
    allowNFCs?: boolean | null;
    vibesTokenPriceRange?: Array<string | null> | null;
    pinnedChatMessages?: Array<string | null> | null;
    playbackUrl?: string | null;
    sharesEvent?: Array<{
      __typename?: "SharesEvent";
      sharesSubjectQuestion?: string | null;
      sharesSubjectAddress?: string | null;
      options?: Array<string | null> | null;
      chainId?: number | null;
      channelId?: string | null;
      eventState?: SharesEventState | null;
      createdAt: any;
      id: string;
      resultIndex?: number | null;
    } | null> | null;
    owner: {
      __typename?: "User";
      FCImageUrl?: string | null;
      lensImageUrl?: string | null;
      username?: string | null;
      address: string;
    };
    roles?: Array<{
      __typename?: "ChannelUserRole";
      id: number;
      userAddress: string;
      role: number;
    } | null> | null;
    chatCommands?: Array<{
      __typename?: "ChatCommand";
      command: string;
      response: string;
    } | null> | null;
  } | null;
};

export type ChannelStaticQueryVariables = Exact<{
  slug: Scalars["String"];
}>;

export type ChannelStaticQuery = {
  __typename?: "Query";
  getChannelBySlug?: {
    __typename?: "Channel";
    awsId: string;
    channelArn?: string | null;
    description?: string | null;
    livepeerPlaybackId?: string | null;
    livepeerStreamId?: string | null;
    streamKey?: string | null;
    isLive?: boolean | null;
    id: string;
    name?: string | null;
    slug: string;
    allowNFCs?: boolean | null;
    vibesTokenPriceRange?: Array<string | null> | null;
    pinnedChatMessages?: Array<string | null> | null;
    playbackUrl?: string | null;
    owner: {
      __typename?: "User";
      FCImageUrl?: string | null;
      lensImageUrl?: string | null;
      username?: string | null;
      address: string;
    };
    chatCommands?: Array<{
      __typename?: "ChatCommand";
      command: string;
      response: string;
    } | null> | null;
    roles?: Array<{
      __typename?: "ChannelUserRole";
      id: number;
      userAddress: string;
      role: number;
    } | null> | null;
  } | null;
};

export type ChannelInteractableQueryVariables = Exact<{
  slug: Scalars["String"];
}>;

export type ChannelInteractableQuery = {
  __typename?: "Query";
  getChannelBySlug?: {
    __typename?: "Channel";
    sharesEvent?: Array<{
      __typename?: "SharesEvent";
      sharesSubjectQuestion?: string | null;
      sharesSubjectAddress?: string | null;
      options?: Array<string | null> | null;
      chainId?: number | null;
      channelId?: string | null;
      eventState?: SharesEventState | null;
      createdAt: any;
      id: string;
      resultIndex?: number | null;
    } | null> | null;
  } | null;
};

export type GetTokenHoldersByChannelQueryVariables = Exact<{
  data?: InputMaybe<GetTokenHoldersInput>;
}>;

export type GetTokenHoldersByChannelQuery = {
  __typename?: "Query";
  getTokenHoldersByChannel: Array<{
    __typename?: "UserCreatorToken";
    quantity: number;
    user: { __typename?: "User"; username?: string | null; address: string };
  }>;
};

export type GetAllDevicesQueryVariables = Exact<{ [key: string]: never }>;

export type GetAllDevicesQuery = {
  __typename?: "Query";
  getAllDevices?: Array<{
    __typename?: "DeviceToken";
    token: string;
    notificationsLive: boolean;
    notificationsNFCs: boolean;
    address?: string | null;
  } | null> | null;
};

export type GetAllUsersWithChannelQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetAllUsersWithChannelQuery = {
  __typename?: "Query";
  getAllUsersWithChannel?: Array<{
    __typename?: "User";
    address: string;
    username?: string | null;
  } | null> | null;
};

export type GetGamblableEventUserRankQueryVariables = Exact<{
  data: GetGamblableEventUserRankInput;
}>;

export type GetGamblableEventUserRankQuery = {
  __typename?: "Query";
  getGamblableEventUserRank: number;
};

export type GetGamblableEventLeaderboardByChannelIdQueryVariables = Exact<{
  data: GetGamblableEventLeaderboardByChannelIdInput;
}>;

export type GetGamblableEventLeaderboardByChannelIdQuery = {
  __typename?: "Query";
  getGamblableEventLeaderboardByChannelId: Array<{
    __typename?: "GamblableEventLeaderboard";
    chainId: number;
    channelId: number;
    id: string;
    totalFees: number;
    user: { __typename?: "User"; address: string; username?: string | null };
  }>;
};

export type CheckSubscriptionQueryVariables = Exact<{
  data: ToggleSubscriptionInput;
}>;

export type CheckSubscriptionQuery = {
  __typename?: "Query";
  checkSubscriptionByEndpoint?: boolean | null;
};

export type GetSubscriptionQueryVariables = Exact<{
  data: ToggleSubscriptionInput;
}>;

export type GetSubscriptionQuery = {
  __typename?: "Query";
  getSubscriptionByEndpoint?: {
    __typename?: "Subscription";
    allowedChannels?: Array<string> | null;
    softDelete: boolean;
  } | null;
};

export type GetChannelFeedQueryVariables = Exact<{
  data: ChannelFeedInput;
}>;

export type GetChannelFeedQuery = {
  __typename?: "Query";
  getChannelFeed?: Array<{
    __typename?: "Channel";
    id: string;
    isLive?: boolean | null;
    name?: string | null;
    description?: string | null;
    slug: string;
    thumbnailUrl?: string | null;
    owner: {
      __typename?: "User";
      username?: string | null;
      address: string;
      FCImageUrl?: string | null;
      lensImageUrl?: string | null;
    };
  } | null> | null;
};

export type GetChannelsQueryVariables = Exact<{
  data: ChannelFeedInput;
}>;

export type GetChannelsQuery = {
  __typename?: "Query";
  getChannelFeed?: Array<{
    __typename?: "Channel";
    id: string;
    livepeerPlaybackId?: string | null;
    slug: string;
  } | null> | null;
};

export type NfcFeedQueryVariables = Exact<{
  data: NfcFeedInput;
}>;

export type NfcFeedQuery = {
  __typename?: "Query";
  getNFCFeed?: Array<{
    __typename?: "NFC";
    createdAt: any;
    id: string;
    videoLink?: string | null;
    videoThumbnail?: string | null;
    openseaLink?: string | null;
    score: number;
    liked?: boolean | null;
    title?: string | null;
    owner: {
      __typename?: "User";
      username?: string | null;
      address: string;
      FCImageUrl?: string | null;
      powerUserLvl: number;
      videoSavantLvl: number;
    };
  } | null> | null;
};

export type GetTempTokensQueryVariables = Exact<{
  data?: InputMaybe<GetTempTokensInput>;
}>;

export type GetTempTokensQuery = {
  __typename?: "Query";
  getTempTokens?: Array<{
    __typename?: "TempToken";
    tokenAddress: string;
    symbol: string;
    streamerFeePercentage: any;
    protocolFeePercentage: any;
    ownerAddress: string;
    name: string;
    factoryAddress: string;
    isAlwaysTradeable: boolean;
    totalSupply: any;
    highestTotalSupply: any;
    hasRemainingFundsForCreator: boolean;
    hasHitTotalSupplyThreshold: boolean;
    creationBlockNumber: any;
    endUnixTimestamp: any;
    minBaseTokenPrice: any;
    channelId: number;
    chainId: number;
    transferredLiquidityOnExpiration?: any | null;
    id: string;
    createdAt: any;
    channel: {
      __typename?: "Channel";
      slug: string;
      owner: { __typename?: "User"; address: string; username?: string | null };
    };
  } | null> | null;
};

export type GetBaseLeaderboardQueryVariables = Exact<{ [key: string]: never }>;

export type GetBaseLeaderboardQuery = {
  __typename?: "Query";
  getBaseLeaderboard: Array<{
    __typename?: "BaseLeaderboard";
    id: string;
    amount: number;
    owner?: {
      __typename?: "User";
      address: string;
      username?: string | null;
      FCImageUrl?: string | null;
      lensImageUrl?: string | null;
    } | null;
  }>;
};

export type GetLivepeerStreamDataQueryVariables = Exact<{
  data: GetLivepeerStreamDataInput;
}>;

export type GetLivepeerStreamDataQuery = {
  __typename?: "Query";
  getLivepeerStreamData?: {
    __typename?: "LivepeerStreamData";
    streamKey?: string | null;
    record?: boolean | null;
    playbackId?: string | null;
    isActive?: boolean | null;
  } | null;
};

export type GetLivepeerStreamSessionsDataQueryVariables = Exact<{
  data: IGetLivepeerStreamSessionsDataInput;
}>;

export type GetLivepeerStreamSessionsDataQuery = {
  __typename?: "Query";
  getLivepeerStreamSessionsData?: Array<{
    __typename?: "LivepeerStreamSessionsData";
    mp4Url: string;
    id: string;
    createdAt: any;
    duration: number;
  } | null> | null;
};

export type GetLivepeerViewershipMetricsQueryVariables = Exact<{
  data: IGetLivepeerViewershipMetricsInput;
}>;

export type GetLivepeerViewershipMetricsQuery = {
  __typename?: "Query";
  getLivepeerViewershipMetrics?: Array<{
    __typename?: "LivepeerViewershipMetrics";
    timestamp: string;
    viewCount: string;
    playtimeMins: string;
    playbackId: string;
  } | null> | null;
};

export type GetChannelSearchResultsQueryVariables = Exact<{
  data: ChannelSearchInput;
}>;

export type GetChannelSearchResultsQuery = {
  __typename?: "Query";
  getChannelSearchResults?: Array<{
    __typename?: "Channel";
    id: string;
    isLive?: boolean | null;
    name?: string | null;
    description?: string | null;
    slug: string;
    thumbnailUrl?: string | null;
    owner: {
      __typename?: "User";
      username?: string | null;
      address: string;
      FCImageUrl?: string | null;
      lensImageUrl?: string | null;
    };
  } | null> | null;
};

export type GetBadgeHoldersByChannelQueryVariables = Exact<{
  data: GetBadgeHoldersByChannelInput;
}>;

export type GetBadgeHoldersByChannelQuery = {
  __typename?: "Query";
  getBadgeHoldersByChannel: Array<string | null>;
};

export type GetChannelsByOwnerAddressQueryVariables = Exact<{
  ownerAddress: Scalars["String"];
}>;

export type GetChannelsByOwnerAddressQuery = {
  __typename?: "Query";
  getChannelsByOwnerAddress?: Array<{
    __typename?: "Channel";
    slug: string;
    createdAt: any;
    name?: string | null;
  } | null> | null;
};

export type GetChannelByIdQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetChannelByIdQuery = {
  __typename?: "Query";
  getChannelById?: {
    __typename?: "Channel";
    awsId: string;
    channelArn?: string | null;
    description?: string | null;
    customButtonPrice?: number | null;
    customButtonAction?: string | null;
    isLive?: boolean | null;
    id: string;
    name?: string | null;
    slug: string;
    allowNFCs?: boolean | null;
    livepeerPlaybackId?: string | null;
    sharesEvent?: Array<{
      __typename?: "SharesEvent";
      sharesSubjectQuestion?: string | null;
      sharesSubjectAddress?: string | null;
      chainId?: number | null;
      channelId?: string | null;
      options?: Array<string | null> | null;
      eventState?: SharesEventState | null;
      createdAt: any;
      id: string;
      resultIndex?: number | null;
    } | null> | null;
    owner: {
      __typename?: "User";
      FCImageUrl?: string | null;
      lensImageUrl?: string | null;
      username?: string | null;
      address: string;
    };
    token?: {
      __typename?: "CreatorToken";
      id: string;
      name: string;
      symbol: string;
      address: string;
    } | null;
  } | null;
};

export type GetChannelsByNumberOfBadgeHoldersQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetChannelsByNumberOfBadgeHoldersQuery = {
  __typename?: "Query";
  getChannelsByNumberOfBadgeHolders: Array<{
    __typename?: "NumberOfHolders";
    holders: number;
    channel: {
      __typename?: "Channel";
      awsId: string;
      channelArn?: string | null;
      description?: string | null;
      customButtonPrice?: number | null;
      customButtonAction?: string | null;
      isLive?: boolean | null;
      id: string;
      name?: string | null;
      slug: string;
      allowNFCs?: boolean | null;
      sharesEvent?: Array<{
        __typename?: "SharesEvent";
        sharesSubjectQuestion?: string | null;
        sharesSubjectAddress?: string | null;
        chainId?: number | null;
        channelId?: string | null;
        options?: Array<string | null> | null;
        eventState?: SharesEventState | null;
        createdAt: any;
        id: string;
        resultIndex?: number | null;
      } | null> | null;
      owner: {
        __typename?: "User";
        FCImageUrl?: string | null;
        lensImageUrl?: string | null;
        username?: string | null;
        address: string;
      };
      token?: {
        __typename?: "CreatorToken";
        id: string;
        name: string;
        symbol: string;
        address: string;
      } | null;
    };
  } | null>;
};

export type CreateCreatorTokenMutationVariables = Exact<{
  data: CreateCreatorTokenInput;
}>;

export type CreateCreatorTokenMutation = {
  __typename?: "Mutation";
  createCreatorToken: { __typename?: "CreatorToken"; id: string };
};

export type UpdateCreatorTokenPriceMutationVariables = Exact<{
  data: UpdateCreatorTokenPriceInput;
}>;

export type UpdateCreatorTokenPriceMutation = {
  __typename?: "Mutation";
  updateCreatorTokenPrice: {
    __typename?: "CreatorToken";
    address: string;
    price: number;
  };
};

export type UpdateUserCreatorTokenQuantityMutationVariables = Exact<{
  data: UpdateUserCreatorTokenQuantityInput;
}>;

export type UpdateUserCreatorTokenQuantityMutation = {
  __typename?: "Mutation";
  updateUserCreatorTokenQuantity: {
    __typename?: "UserCreatorToken";
    quantity: number;
  };
};

export type UpdateDeleteChatCommandsMutationVariables = Exact<{
  data: UpdateDeleteChatCommandInput;
}>;

export type UpdateDeleteChatCommandsMutation = {
  __typename?: "Mutation";
  updateDeleteChatCommands?: {
    __typename?: "Channel";
    id: string;
    chatCommands?: Array<{
      __typename?: "ChatCommand";
      command: string;
      response: string;
    } | null> | null;
  } | null;
};

export type CloseSharesEventsMutationVariables = Exact<{
  data: PostCloseSharesEventsInput;
}>;

export type CloseSharesEventsMutation = {
  __typename?: "Mutation";
  closeSharesEvents?: {
    __typename?: "UpdateManyResponse";
    count: number;
  } | null;
};

export type ConcatenateOutroToTrimmedVideoMutationVariables = Exact<{
  data: ConcatenateOutroToTrimmedVideoInput;
}>;

export type ConcatenateOutroToTrimmedVideoMutation = {
  __typename?: "Mutation";
  concatenateOutroToTrimmedVideo?: string | null;
};

export type CreateClipMutationVariables = Exact<{
  data: CreateClipInput;
}>;

export type CreateClipMutation = {
  __typename?: "Mutation";
  createClip?: {
    __typename?: "ClipNFCOutput";
    url?: string | null;
    thumbnail?: string | null;
    errorMessage?: string | null;
    id: string;
  } | null;
};

export type CreateLivepeerClipMutationVariables = Exact<{
  data: CreateLivepeerClipInput;
}>;

export type CreateLivepeerClipMutation = {
  __typename?: "Mutation";
  createLivepeerClip?: {
    __typename?: "ClipNFCOutput";
    url?: string | null;
    thumbnail?: string | null;
    errorMessage?: string | null;
    id: string;
  } | null;
};

export type MigrateChannelToLivepeerMutationVariables = Exact<{
  data: MigrateChannelToLivepeerInput;
}>;

export type MigrateChannelToLivepeerMutation = {
  __typename?: "Mutation";
  migrateChannelToLivepeer?: {
    __typename?: "Channel";
    id: string;
    streamKey?: string | null;
    livepeerPlaybackId?: string | null;
    livepeerStreamId?: string | null;
    slug: string;
  } | null;
};

export type PostChannelMutationVariables = Exact<{
  data: PostChannelInput;
}>;

export type PostChannelMutation = {
  __typename?: "Mutation";
  postChannel?: {
    __typename?: "Channel";
    id: string;
    streamKey?: string | null;
    livepeerPlaybackId?: string | null;
    livepeerStreamId?: string | null;
    slug: string;
    name?: string | null;
    description?: string | null;
  } | null;
};

export type PostSharesEventMutationVariables = Exact<{
  data: PostSharesEventInput;
}>;

export type PostSharesEventMutation = {
  __typename?: "Mutation";
  postSharesEvent?: { __typename?: "Channel"; id: string } | null;
};

export type PostUserRoleForChannelMutationVariables = Exact<{
  data: PostUserRoleForChannelInput;
}>;

export type PostUserRoleForChannelMutation = {
  __typename?: "Mutation";
  postUserRoleForChannel?: {
    __typename?: "ChannelUserRole";
    id: number;
    channelId: number;
    userAddress: string;
    role: number;
  } | null;
};

export type RemoveChannelFromSubscriptionMutationVariables = Exact<{
  data: MoveChannelAlongSubscriptionInput;
}>;

export type RemoveChannelFromSubscriptionMutation = {
  __typename?: "Mutation";
  removeChannelFromSubscription?: {
    __typename?: "Subscription";
    id: string;
  } | null;
};

export type RequestUploadFromLivepeerMutationVariables = Exact<{
  data: RequestUploadFromLivepeerInput;
}>;

export type RequestUploadFromLivepeerMutation = {
  __typename?: "Mutation";
  requestUploadFromLivepeer?: {
    __typename?: "RequestUploadResponse";
    url: string;
    tusEndpoint: string;
    task: { __typename?: "AssetTask"; id: string };
    asset: {
      __typename?: "Asset";
      userId: string;
      status: {
        __typename?: "AssetStatus";
        updatedAt: string;
        progress?: number | null;
        phase: string;
        errorMessage?: string | null;
      };
    };
  } | null;
};

export type SoftDeleteChannelMutationVariables = Exact<{
  data: SoftDeleteChannelInput;
}>;

export type SoftDeleteChannelMutation = {
  __typename?: "Mutation";
  softDeleteChannel?: {
    __typename?: "Channel";
    id: string;
    streamKey?: string | null;
    livepeerPlaybackId?: string | null;
    livepeerStreamId?: string | null;
    slug: string;
    name?: string | null;
    description?: string | null;
    owner: {
      __typename?: "User";
      FCImageUrl?: string | null;
      lensImageUrl?: string | null;
      username?: string | null;
      address: string;
    };
  } | null;
};

export type ToggleSubscriptionMutationVariables = Exact<{
  data: ToggleSubscriptionInput;
}>;

export type ToggleSubscriptionMutation = {
  __typename?: "Mutation";
  toggleSubscription?: { __typename?: "Subscription"; id: string } | null;
};

export type TrimVideoMutationVariables = Exact<{
  data: TrimVideoInput;
}>;

export type TrimVideoMutation = {
  __typename?: "Mutation";
  trimVideo?: string | null;
};

export type UpdateChannelAllowNfcsMutationVariables = Exact<{
  data: UpdateChannelAllowNfcsInput;
}>;

export type UpdateChannelAllowNfcsMutation = {
  __typename?: "Mutation";
  updateChannelAllowNfcs?: {
    __typename?: "Channel";
    allowNFCs?: boolean | null;
    id: string;
  } | null;
};

export type UpdateChannelCustomButtonMutationVariables = Exact<{
  data: UpdateChannelCustomButtonInput;
}>;

export type UpdateChannelCustomButtonMutation = {
  __typename?: "Mutation";
  updateChannelCustomButton?: {
    __typename?: "Channel";
    customButtonAction?: string | null;
    customButtonPrice?: number | null;
    id: string;
  } | null;
};

export type UpdateChannelTextMutationVariables = Exact<{
  data: UpdateChannelTextInput;
}>;

export type UpdateChannelTextMutation = {
  __typename?: "Mutation";
  updateChannelText?: {
    __typename?: "Channel";
    id: string;
    name?: string | null;
    description?: string | null;
  } | null;
};

export type UpdateChannelVibesTokenPriceRangeMutationVariables = Exact<{
  data: UpdateChannelVibesTokenPriceRangeInput;
}>;

export type UpdateChannelVibesTokenPriceRangeMutation = {
  __typename?: "Mutation";
  updateChannelVibesTokenPriceRange?: {
    __typename?: "Channel";
    vibesTokenPriceRange?: Array<string | null> | null;
    id: string;
  } | null;
};

export type UpdateLivepeerStreamDataMutationVariables = Exact<{
  data: UpdateLivepeerStreamDataInput;
}>;

export type UpdateLivepeerStreamDataMutation = {
  __typename?: "Mutation";
  updateLivepeerStreamData?: {
    __typename?: "LivepeerStreamData";
    streamKey?: string | null;
    record?: boolean | null;
    playbackId?: string | null;
    isActive?: boolean | null;
  } | null;
};

export type UpdatePinnedChatMessagesMutationVariables = Exact<{
  data: UpdatePinnedChatMessagesInput;
}>;

export type UpdatePinnedChatMessagesMutation = {
  __typename?: "Mutation";
  updatePinnedChatMessages?: {
    __typename?: "Channel";
    pinnedChatMessages?: Array<string | null> | null;
  } | null;
};

export type UpdateSharesEventMutationVariables = Exact<{
  data: UpdateSharesEventInput;
}>;

export type UpdateSharesEventMutation = {
  __typename?: "Mutation";
  updateSharesEvent?: { __typename?: "Channel"; id: string } | null;
};

export type UpdateUserChannelContract1155MappingMutationVariables = Exact<{
  data: UpdateUserChannelContract1155MappingInput;
}>;

export type UpdateUserChannelContract1155MappingMutation = {
  __typename?: "Mutation";
  updateUserChannelContract1155Mapping?: {
    __typename?: "User";
    address: string;
    username?: string | null;
    channelContract1155Mapping?: any | null;
  } | null;
};

export type PostBadgeTradeMutationVariables = Exact<{
  data: PostBadgeTradeInput;
}>;

export type PostBadgeTradeMutation = {
  __typename?: "Mutation";
  postBadgeTrade: { __typename?: "GamblableInteraction"; id: string };
};

export type PostBetMutationVariables = Exact<{
  data: PostBetInput;
}>;

export type PostBetMutation = {
  __typename?: "Mutation";
  postBet: { __typename?: "GamblableInteraction"; id: string };
};

export type PostBetTradeMutationVariables = Exact<{
  data: PostBetTradeInput;
}>;

export type PostBetTradeMutation = {
  __typename?: "Mutation";
  postBetTrade: { __typename?: "GamblableInteraction"; id: string };
};

export type PostTempTokenMutationVariables = Exact<{
  data: PostTempTokenInput;
}>;

export type PostTempTokenMutation = {
  __typename?: "Mutation";
  postTempToken?: {
    __typename?: "TempToken";
    tokenAddress: string;
    symbol: string;
    streamerFeePercentage: any;
    protocolFeePercentage: any;
    creationBlockNumber: any;
    factoryAddress: string;
    ownerAddress: string;
    id: string;
    name: string;
    highestTotalSupply: any;
    endUnixTimestamp: any;
    minBaseTokenPrice: any;
    channelId: number;
    chainId: number;
  } | null;
};

export type UpdateEndTimestampForTokensMutationVariables = Exact<{
  data: UpdateEndTimestampForTokensInput;
}>;

export type UpdateEndTimestampForTokensMutation = {
  __typename?: "Mutation";
  updateEndTimestampForTokens?: Array<{
    __typename?: "TempToken";
    tokenAddress: string;
    endUnixTimestamp: any;
    channelId: number;
    chainId: number;
  } | null> | null;
};

export type UpdateTempTokenHasHitTotalSupplyThresholdMutationVariables = Exact<{
  data: UpdateTempTokenHasHitTotalSupplyThresholdInput;
}>;

export type UpdateTempTokenHasHitTotalSupplyThresholdMutation = {
  __typename?: "Mutation";
  updateTempTokenHasHitTotalSupplyThreshold: boolean;
};

export type UpdateTempTokenHasRemainingFundsForCreatorMutationVariables =
  Exact<{
    data: UpdateTempTokenHasRemainingFundsForCreatorInput;
  }>;

export type UpdateTempTokenHasRemainingFundsForCreatorMutation = {
  __typename?: "Mutation";
  updateTempTokenHasRemainingFundsForCreator?: Array<{
    __typename?: "TempTokenWithBalance";
    tokenAddress: string;
    hasRemainingFundsForCreator: boolean;
    channelId: number;
    chainId: number;
    balance: any;
    isAlwaysTradeable: boolean;
    symbol: string;
  } | null> | null;
};

export type UpdateTempTokenHighestTotalSupplyMutationVariables = Exact<{
  data: UpdateTempTokenHighestTotalSupplyInput;
}>;

export type UpdateTempTokenHighestTotalSupplyMutation = {
  __typename?: "Mutation";
  updateTempTokenHighestTotalSupply?: Array<{
    __typename?: "TempToken";
    tokenAddress: string;
    symbol: string;
    ownerAddress: string;
    name: string;
    highestTotalSupply: any;
    hasHitTotalSupplyThreshold: boolean;
    channelId: number;
    endUnixTimestamp: any;
    chainId: number;
  } | null> | null;
};

export type UpdateTempTokenIsAlwaysTradeableMutationVariables = Exact<{
  data: UpdateTempTokenIsAlwaysTradeableInput;
}>;

export type UpdateTempTokenIsAlwaysTradeableMutation = {
  __typename?: "Mutation";
  updateTempTokenIsAlwaysTradeable: boolean;
};

export type UpdateTempTokenTransferredLiquidityOnExpirationMutationVariables =
  Exact<{
    data: UpdateTempTokenTransferredLiquidityOnExpirationInput;
  }>;

export type UpdateTempTokenTransferredLiquidityOnExpirationMutation = {
  __typename?: "Mutation";
  updateTempTokenTransferredLiquidityOnExpiration?: {
    __typename?: "TempToken";
    transferredLiquidityOnExpiration?: any | null;
    tokenAddress: string;
    symbol: string;
    streamerFeePercentage: any;
    protocolFeePercentage: any;
    ownerAddress: string;
    name: string;
    isAlwaysTradeable: boolean;
    id: string;
    highestTotalSupply: any;
    factoryAddress: string;
    hasHitTotalSupplyThreshold: boolean;
    hasRemainingFundsForCreator: boolean;
    endUnixTimestamp: any;
    creationBlockNumber: any;
    chainId: number;
    channelId: number;
  } | null;
};

export type AddChannelToSubscriptionMutationVariables = Exact<{
  data: MoveChannelAlongSubscriptionInput;
}>;

export type AddChannelToSubscriptionMutation = {
  __typename?: "Mutation";
  addChannelToSubscription?: { __typename?: "Subscription"; id: string } | null;
};

export type LikeMutationVariables = Exact<{
  data: HandleLikeInput;
}>;

export type LikeMutation = {
  __typename?: "Mutation";
  handleLike?:
    | {
        __typename?: "ClipNFCOutput";
        id: string;
        score: number;
        liked?: boolean | null;
        disliked?: boolean | null;
      }
    | {
        __typename?: "NFC";
        id: string;
        score: number;
        liked?: boolean | null;
        disliked?: boolean | null;
      }
    | null;
};

export type PostBaseLeaderboardMutationVariables = Exact<{
  data: PostBaseLeaderboardInput;
}>;

export type PostBaseLeaderboardMutation = {
  __typename?: "Mutation";
  postBaseLeaderboard: { __typename?: "BaseLeaderboard"; id: string };
};

export type PostChatByAwsIdMutationVariables = Exact<{
  data: PostChatByAwsIdInput;
}>;

export type PostChatByAwsIdMutation = {
  __typename?: "Mutation";
  postChatByAwsId?: { __typename?: "Chat"; id: string } | null;
};

export type PostClaimPayoutMutationVariables = Exact<{
  data: PostClaimPayoutInput;
}>;

export type PostClaimPayoutMutation = {
  __typename?: "Mutation";
  postClaimPayout: { __typename?: "GamblableInteraction"; id: string };
};

export type PostFirstChatMutationVariables = Exact<{
  data: PostChatInput;
}>;

export type PostFirstChatMutation = {
  __typename?: "Mutation";
  postFirstChat?: { __typename?: "Chat"; id: string } | null;
};

export type PostNfcMutationVariables = Exact<{
  data: PostNfcInput;
}>;

export type PostNfcMutation = {
  __typename?: "Mutation";
  postNFC?: { __typename?: "NFC"; id: string } | null;
};

export type PostStreamInteractionMutationVariables = Exact<{
  data: PostStreamInteractionInput;
}>;

export type PostStreamInteractionMutation = {
  __typename?: "Mutation";
  postStreamInteraction?: {
    __typename?: "StreamInteraction";
    id: string;
  } | null;
};

export type PostSubscriptionMutationVariables = Exact<{
  data: PostSubscriptionInput;
}>;

export type PostSubscriptionMutation = {
  __typename?: "Mutation";
  postSubscription?: { __typename?: "Subscription"; id: string } | null;
};

export type PostTaskMutationVariables = Exact<{
  data: PostTaskInput;
}>;

export type PostTaskMutation = {
  __typename?: "Mutation";
  postTask?: { __typename?: "Task"; id: string } | null;
};

export type PostVideoMutationVariables = Exact<{
  data: PostVideoInput;
}>;

export type PostVideoMutation = {
  __typename?: "Mutation";
  postVideo?: { __typename?: "Video"; id: string } | null;
};

export type UpdateNfcMutationVariables = Exact<{
  data: UpdateNfcInput;
}>;

export type UpdateNfcMutation = {
  __typename?: "Mutation";
  updateNFC?: { __typename?: "NFC"; id: string } | null;
};

export type UpdateUserMutationVariables = Exact<{
  data: UpdateUserInput;
}>;

export type UpdateUserMutation = {
  __typename?: "Mutation";
  updateUser?: {
    __typename?: "User";
    address: string;
    lensHandle?: string | null;
    FCImageUrl?: string | null;
    username?: string | null;
  } | null;
};

export type UpdateUserNotificationsMutationVariables = Exact<{
  data: UpdateUserNotificationsInput;
}>;

export type UpdateUserNotificationsMutation = {
  __typename?: "Mutation";
  updateUserNotifications?: {
    __typename?: "User";
    notificationsTokens?: string | null;
    notificationsLive?: boolean | null;
    notificationsNFCs?: boolean | null;
  } | null;
};

export type UpdateChannelFidSubscriptionMutationVariables = Exact<{
  data: UpdateChannelFidSubscriptionInput;
}>;

export type UpdateChannelFidSubscriptionMutation = {
  __typename?: "Mutation";
  updateChannelFidSubscription?: string | null;
};

export type NfcDetailQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type NfcDetailQuery = {
  __typename?: "Query";
  getNFC?: {
    __typename?: "NFC";
    id: string;
    title?: string | null;
    videoLink?: string | null;
    openseaLink?: string | null;
    videoThumbnail?: string | null;
    score: number;
    liked?: boolean | null;
    updatedAt: any;
    owner: {
      __typename?: "User";
      address: string;
      FCImageUrl?: string | null;
      username?: string | null;
    };
  } | null;
};

export type NfcRecommendationsQueryVariables = Exact<{
  data: NfcFeedInput;
}>;

export type NfcRecommendationsQuery = {
  __typename?: "Query";
  getNFCFeed?: Array<{
    __typename?: "NFC";
    createdAt: any;
    id: string;
    videoLink?: string | null;
    videoThumbnail?: string | null;
    openseaLink?: string | null;
    score: number;
    liked?: boolean | null;
    title?: string | null;
    owner: {
      __typename?: "User";
      username?: string | null;
      address: string;
      FCImageUrl?: string | null;
      powerUserLvl: number;
      videoSavantLvl: number;
    };
  } | null> | null;
};

export type FetchAuthMessageQueryVariables = Exact<{ [key: string]: never }>;

export type FetchAuthMessageQuery = {
  __typename?: "Query";
  currentUserAuthMessage?: string | null;
};

export type FetchCurrentUserQueryVariables = Exact<{ [key: string]: never }>;

export type FetchCurrentUserQuery = {
  __typename?: "Query";
  currentUser?: {
    __typename?: "User";
    signature?: string | null;
    sigTimestamp?: any | null;
  } | null;
};

export const GetUserDocument = gql`
  query GetUser($data: GetUserInput!) {
    getUser(data: $data) {
      address
      username
      signature
      powerUserLvl
      videoSavantLvl
      nfcRank
      FCImageUrl
      isFCUser
      isLensUser
      lensHandle
      lensImageUrl
      channel {
        slug
      }
    }
  }
`;

/**
 * __useGetUserQuery__
 *
 * To run a query within a React component, call `useGetUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useGetUserQuery(
  baseOptions: Apollo.QueryHookOptions<GetUserQuery, GetUserQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUserQuery, GetUserQueryVariables>(
    GetUserDocument,
    options
  );
}
export function useGetUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetUserQuery, GetUserQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetUserQuery, GetUserQueryVariables>(
    GetUserDocument,
    options
  );
}
export type GetUserQueryHookResult = ReturnType<typeof useGetUserQuery>;
export type GetUserLazyQueryHookResult = ReturnType<typeof useGetUserLazyQuery>;
export type GetUserQueryResult = Apollo.QueryResult<
  GetUserQuery,
  GetUserQueryVariables
>;
export const GetUserChannelContract1155MappingDocument = gql`
  query GetUserChannelContract1155Mapping($data: GetUserInput!) {
    getUserChannelContract1155Mapping(data: $data)
  }
`;

/**
 * __useGetUserChannelContract1155MappingQuery__
 *
 * To run a query within a React component, call `useGetUserChannelContract1155MappingQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserChannelContract1155MappingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserChannelContract1155MappingQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useGetUserChannelContract1155MappingQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUserChannelContract1155MappingQuery,
    GetUserChannelContract1155MappingQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUserChannelContract1155MappingQuery,
    GetUserChannelContract1155MappingQueryVariables
  >(GetUserChannelContract1155MappingDocument, options);
}
export function useGetUserChannelContract1155MappingLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserChannelContract1155MappingQuery,
    GetUserChannelContract1155MappingQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserChannelContract1155MappingQuery,
    GetUserChannelContract1155MappingQueryVariables
  >(GetUserChannelContract1155MappingDocument, options);
}
export type GetUserChannelContract1155MappingQueryHookResult = ReturnType<
  typeof useGetUserChannelContract1155MappingQuery
>;
export type GetUserChannelContract1155MappingLazyQueryHookResult = ReturnType<
  typeof useGetUserChannelContract1155MappingLazyQuery
>;
export type GetUserChannelContract1155MappingQueryResult = Apollo.QueryResult<
  GetUserChannelContract1155MappingQuery,
  GetUserChannelContract1155MappingQueryVariables
>;
export const GetLivepeerClipDataDocument = gql`
  query GetLivepeerClipData($data: GetLivepeerClipDataInput) {
    getLivepeerClipData(data: $data) {
      error
      videoThumbnail
      videoLink
    }
  }
`;

/**
 * __useGetLivepeerClipDataQuery__
 *
 * To run a query within a React component, call `useGetLivepeerClipDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLivepeerClipDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLivepeerClipDataQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useGetLivepeerClipDataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetLivepeerClipDataQuery,
    GetLivepeerClipDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetLivepeerClipDataQuery,
    GetLivepeerClipDataQueryVariables
  >(GetLivepeerClipDataDocument, options);
}
export function useGetLivepeerClipDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetLivepeerClipDataQuery,
    GetLivepeerClipDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetLivepeerClipDataQuery,
    GetLivepeerClipDataQueryVariables
  >(GetLivepeerClipDataDocument, options);
}
export type GetLivepeerClipDataQueryHookResult = ReturnType<
  typeof useGetLivepeerClipDataQuery
>;
export type GetLivepeerClipDataLazyQueryHookResult = ReturnType<
  typeof useGetLivepeerClipDataLazyQuery
>;
export type GetLivepeerClipDataQueryResult = Apollo.QueryResult<
  GetLivepeerClipDataQuery,
  GetLivepeerClipDataQueryVariables
>;
export const GetUserTokenHoldingDocument = gql`
  query GetUserTokenHolding($data: GetUserTokenHoldingInput!) {
    getUserTokenHolding(data: $data)
  }
`;

/**
 * __useGetUserTokenHoldingQuery__
 *
 * To run a query within a React component, call `useGetUserTokenHoldingQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserTokenHoldingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserTokenHoldingQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useGetUserTokenHoldingQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUserTokenHoldingQuery,
    GetUserTokenHoldingQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUserTokenHoldingQuery,
    GetUserTokenHoldingQueryVariables
  >(GetUserTokenHoldingDocument, options);
}
export function useGetUserTokenHoldingLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserTokenHoldingQuery,
    GetUserTokenHoldingQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserTokenHoldingQuery,
    GetUserTokenHoldingQueryVariables
  >(GetUserTokenHoldingDocument, options);
}
export type GetUserTokenHoldingQueryHookResult = ReturnType<
  typeof useGetUserTokenHoldingQuery
>;
export type GetUserTokenHoldingLazyQueryHookResult = ReturnType<
  typeof useGetUserTokenHoldingLazyQuery
>;
export type GetUserTokenHoldingQueryResult = Apollo.QueryResult<
  GetUserTokenHoldingQuery,
  GetUserTokenHoldingQueryVariables
>;
export const SendAllNotificationsDocument = gql`
  query SendAllNotifications($data: SendAllNotificationsInput!) {
    sendAllNotifications(data: $data)
  }
`;

/**
 * __useSendAllNotificationsQuery__
 *
 * To run a query within a React component, call `useSendAllNotificationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSendAllNotificationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSendAllNotificationsQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useSendAllNotificationsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SendAllNotificationsQuery,
    SendAllNotificationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SendAllNotificationsQuery,
    SendAllNotificationsQueryVariables
  >(SendAllNotificationsDocument, options);
}
export function useSendAllNotificationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SendAllNotificationsQuery,
    SendAllNotificationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SendAllNotificationsQuery,
    SendAllNotificationsQueryVariables
  >(SendAllNotificationsDocument, options);
}
export type SendAllNotificationsQueryHookResult = ReturnType<
  typeof useSendAllNotificationsQuery
>;
export type SendAllNotificationsLazyQueryHookResult = ReturnType<
  typeof useSendAllNotificationsLazyQuery
>;
export type SendAllNotificationsQueryResult = Apollo.QueryResult<
  SendAllNotificationsQuery,
  SendAllNotificationsQueryVariables
>;
export const GetUnclaimedEventsDocument = gql`
  query GetUnclaimedEvents($data: GetUnclaimedEvents) {
    getUnclaimedEvents(data: $data) {
      sharesSubjectQuestion
      sharesSubjectAddress
      resultIndex
      options
      id
      eventState
      createdAt
      chainId
      channelId
    }
  }
`;

/**
 * __useGetUnclaimedEventsQuery__
 *
 * To run a query within a React component, call `useGetUnclaimedEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUnclaimedEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUnclaimedEventsQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useGetUnclaimedEventsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetUnclaimedEventsQuery,
    GetUnclaimedEventsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUnclaimedEventsQuery,
    GetUnclaimedEventsQueryVariables
  >(GetUnclaimedEventsDocument, options);
}
export function useGetUnclaimedEventsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUnclaimedEventsQuery,
    GetUnclaimedEventsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUnclaimedEventsQuery,
    GetUnclaimedEventsQueryVariables
  >(GetUnclaimedEventsDocument, options);
}
export type GetUnclaimedEventsQueryHookResult = ReturnType<
  typeof useGetUnclaimedEventsQuery
>;
export type GetUnclaimedEventsLazyQueryHookResult = ReturnType<
  typeof useGetUnclaimedEventsLazyQuery
>;
export type GetUnclaimedEventsQueryResult = Apollo.QueryResult<
  GetUnclaimedEventsQuery,
  GetUnclaimedEventsQueryVariables
>;
export const GetTokenLeaderboardDocument = gql`
  query GetTokenLeaderboard {
    getTokenLeaderboard {
      symbol
      price
      name
      id
      holders
      address
      channel {
        slug
        owner {
          address
          username
        }
      }
    }
  }
`;

/**
 * __useGetTokenLeaderboardQuery__
 *
 * To run a query within a React component, call `useGetTokenLeaderboardQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTokenLeaderboardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTokenLeaderboardQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTokenLeaderboardQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetTokenLeaderboardQuery,
    GetTokenLeaderboardQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetTokenLeaderboardQuery,
    GetTokenLeaderboardQueryVariables
  >(GetTokenLeaderboardDocument, options);
}
export function useGetTokenLeaderboardLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTokenLeaderboardQuery,
    GetTokenLeaderboardQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetTokenLeaderboardQuery,
    GetTokenLeaderboardQueryVariables
  >(GetTokenLeaderboardDocument, options);
}
export type GetTokenLeaderboardQueryHookResult = ReturnType<
  typeof useGetTokenLeaderboardQuery
>;
export type GetTokenLeaderboardLazyQueryHookResult = ReturnType<
  typeof useGetTokenLeaderboardLazyQuery
>;
export type GetTokenLeaderboardQueryResult = Apollo.QueryResult<
  GetTokenLeaderboardQuery,
  GetTokenLeaderboardQueryVariables
>;
export const ChannelDetailDocument = gql`
  query ChannelDetail($slug: String!) {
    getChannelBySlug(slug: $slug) {
      awsId
      channelArn
      description
      livepeerPlaybackId
      livepeerStreamId
      streamKey
      isLive
      id
      name
      slug
      allowNFCs
      vibesTokenPriceRange
      pinnedChatMessages
      sharesEvent {
        sharesSubjectQuestion
        sharesSubjectAddress
        options
        chainId
        channelId
        eventState
        createdAt
        id
        resultIndex
      }
      owner {
        FCImageUrl
        lensImageUrl
        username
        address
      }
      roles {
        id
        userAddress
        role
      }
      playbackUrl
      chatCommands {
        command
        response
      }
    }
  }
`;

/**
 * __useChannelDetailQuery__
 *
 * To run a query within a React component, call `useChannelDetailQuery` and pass it any options that fit your needs.
 * When your component renders, `useChannelDetailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChannelDetailQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useChannelDetailQuery(
  baseOptions: Apollo.QueryHookOptions<
    ChannelDetailQuery,
    ChannelDetailQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ChannelDetailQuery, ChannelDetailQueryVariables>(
    ChannelDetailDocument,
    options
  );
}
export function useChannelDetailLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ChannelDetailQuery,
    ChannelDetailQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ChannelDetailQuery, ChannelDetailQueryVariables>(
    ChannelDetailDocument,
    options
  );
}
export type ChannelDetailQueryHookResult = ReturnType<
  typeof useChannelDetailQuery
>;
export type ChannelDetailLazyQueryHookResult = ReturnType<
  typeof useChannelDetailLazyQuery
>;
export type ChannelDetailQueryResult = Apollo.QueryResult<
  ChannelDetailQuery,
  ChannelDetailQueryVariables
>;
export const ChannelStaticDocument = gql`
  query ChannelStatic($slug: String!) {
    getChannelBySlug(slug: $slug) {
      awsId
      channelArn
      description
      livepeerPlaybackId
      livepeerStreamId
      streamKey
      isLive
      id
      name
      slug
      allowNFCs
      vibesTokenPriceRange
      pinnedChatMessages
      owner {
        FCImageUrl
        lensImageUrl
        username
        address
      }
      playbackUrl
      chatCommands {
        command
        response
      }
      roles {
        id
        userAddress
        role
      }
    }
  }
`;

/**
 * __useChannelStaticQuery__
 *
 * To run a query within a React component, call `useChannelStaticQuery` and pass it any options that fit your needs.
 * When your component renders, `useChannelStaticQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChannelStaticQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useChannelStaticQuery(
  baseOptions: Apollo.QueryHookOptions<
    ChannelStaticQuery,
    ChannelStaticQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ChannelStaticQuery, ChannelStaticQueryVariables>(
    ChannelStaticDocument,
    options
  );
}
export function useChannelStaticLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ChannelStaticQuery,
    ChannelStaticQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ChannelStaticQuery, ChannelStaticQueryVariables>(
    ChannelStaticDocument,
    options
  );
}
export type ChannelStaticQueryHookResult = ReturnType<
  typeof useChannelStaticQuery
>;
export type ChannelStaticLazyQueryHookResult = ReturnType<
  typeof useChannelStaticLazyQuery
>;
export type ChannelStaticQueryResult = Apollo.QueryResult<
  ChannelStaticQuery,
  ChannelStaticQueryVariables
>;
export const ChannelInteractableDocument = gql`
  query ChannelInteractable($slug: String!) {
    getChannelBySlug(slug: $slug) {
      sharesEvent {
        sharesSubjectQuestion
        sharesSubjectAddress
        options
        chainId
        channelId
        eventState
        createdAt
        id
        resultIndex
      }
    }
  }
`;

/**
 * __useChannelInteractableQuery__
 *
 * To run a query within a React component, call `useChannelInteractableQuery` and pass it any options that fit your needs.
 * When your component renders, `useChannelInteractableQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChannelInteractableQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useChannelInteractableQuery(
  baseOptions: Apollo.QueryHookOptions<
    ChannelInteractableQuery,
    ChannelInteractableQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    ChannelInteractableQuery,
    ChannelInteractableQueryVariables
  >(ChannelInteractableDocument, options);
}
export function useChannelInteractableLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ChannelInteractableQuery,
    ChannelInteractableQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    ChannelInteractableQuery,
    ChannelInteractableQueryVariables
  >(ChannelInteractableDocument, options);
}
export type ChannelInteractableQueryHookResult = ReturnType<
  typeof useChannelInteractableQuery
>;
export type ChannelInteractableLazyQueryHookResult = ReturnType<
  typeof useChannelInteractableLazyQuery
>;
export type ChannelInteractableQueryResult = Apollo.QueryResult<
  ChannelInteractableQuery,
  ChannelInteractableQueryVariables
>;
export const GetTokenHoldersByChannelDocument = gql`
  query GetTokenHoldersByChannel($data: GetTokenHoldersInput) {
    getTokenHoldersByChannel(data: $data) {
      quantity
      user {
        username
        address
      }
    }
  }
`;

/**
 * __useGetTokenHoldersByChannelQuery__
 *
 * To run a query within a React component, call `useGetTokenHoldersByChannelQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTokenHoldersByChannelQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTokenHoldersByChannelQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useGetTokenHoldersByChannelQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetTokenHoldersByChannelQuery,
    GetTokenHoldersByChannelQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetTokenHoldersByChannelQuery,
    GetTokenHoldersByChannelQueryVariables
  >(GetTokenHoldersByChannelDocument, options);
}
export function useGetTokenHoldersByChannelLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTokenHoldersByChannelQuery,
    GetTokenHoldersByChannelQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetTokenHoldersByChannelQuery,
    GetTokenHoldersByChannelQueryVariables
  >(GetTokenHoldersByChannelDocument, options);
}
export type GetTokenHoldersByChannelQueryHookResult = ReturnType<
  typeof useGetTokenHoldersByChannelQuery
>;
export type GetTokenHoldersByChannelLazyQueryHookResult = ReturnType<
  typeof useGetTokenHoldersByChannelLazyQuery
>;
export type GetTokenHoldersByChannelQueryResult = Apollo.QueryResult<
  GetTokenHoldersByChannelQuery,
  GetTokenHoldersByChannelQueryVariables
>;
export const GetAllDevicesDocument = gql`
  query GetAllDevices {
    getAllDevices {
      token
      notificationsLive
      notificationsNFCs
      address
    }
  }
`;

/**
 * __useGetAllDevicesQuery__
 *
 * To run a query within a React component, call `useGetAllDevicesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllDevicesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllDevicesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllDevicesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetAllDevicesQuery,
    GetAllDevicesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetAllDevicesQuery, GetAllDevicesQueryVariables>(
    GetAllDevicesDocument,
    options
  );
}
export function useGetAllDevicesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAllDevicesQuery,
    GetAllDevicesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetAllDevicesQuery, GetAllDevicesQueryVariables>(
    GetAllDevicesDocument,
    options
  );
}
export type GetAllDevicesQueryHookResult = ReturnType<
  typeof useGetAllDevicesQuery
>;
export type GetAllDevicesLazyQueryHookResult = ReturnType<
  typeof useGetAllDevicesLazyQuery
>;
export type GetAllDevicesQueryResult = Apollo.QueryResult<
  GetAllDevicesQuery,
  GetAllDevicesQueryVariables
>;
export const GetAllUsersWithChannelDocument = gql`
  query GetAllUsersWithChannel {
    getAllUsersWithChannel {
      address
      username
    }
  }
`;

/**
 * __useGetAllUsersWithChannelQuery__
 *
 * To run a query within a React component, call `useGetAllUsersWithChannelQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllUsersWithChannelQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllUsersWithChannelQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllUsersWithChannelQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetAllUsersWithChannelQuery,
    GetAllUsersWithChannelQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetAllUsersWithChannelQuery,
    GetAllUsersWithChannelQueryVariables
  >(GetAllUsersWithChannelDocument, options);
}
export function useGetAllUsersWithChannelLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAllUsersWithChannelQuery,
    GetAllUsersWithChannelQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetAllUsersWithChannelQuery,
    GetAllUsersWithChannelQueryVariables
  >(GetAllUsersWithChannelDocument, options);
}
export type GetAllUsersWithChannelQueryHookResult = ReturnType<
  typeof useGetAllUsersWithChannelQuery
>;
export type GetAllUsersWithChannelLazyQueryHookResult = ReturnType<
  typeof useGetAllUsersWithChannelLazyQuery
>;
export type GetAllUsersWithChannelQueryResult = Apollo.QueryResult<
  GetAllUsersWithChannelQuery,
  GetAllUsersWithChannelQueryVariables
>;
export const GetGamblableEventUserRankDocument = gql`
  query GetGamblableEventUserRank($data: GetGamblableEventUserRankInput!) {
    getGamblableEventUserRank(data: $data)
  }
`;

/**
 * __useGetGamblableEventUserRankQuery__
 *
 * To run a query within a React component, call `useGetGamblableEventUserRankQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGamblableEventUserRankQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGamblableEventUserRankQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useGetGamblableEventUserRankQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetGamblableEventUserRankQuery,
    GetGamblableEventUserRankQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetGamblableEventUserRankQuery,
    GetGamblableEventUserRankQueryVariables
  >(GetGamblableEventUserRankDocument, options);
}
export function useGetGamblableEventUserRankLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGamblableEventUserRankQuery,
    GetGamblableEventUserRankQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetGamblableEventUserRankQuery,
    GetGamblableEventUserRankQueryVariables
  >(GetGamblableEventUserRankDocument, options);
}
export type GetGamblableEventUserRankQueryHookResult = ReturnType<
  typeof useGetGamblableEventUserRankQuery
>;
export type GetGamblableEventUserRankLazyQueryHookResult = ReturnType<
  typeof useGetGamblableEventUserRankLazyQuery
>;
export type GetGamblableEventUserRankQueryResult = Apollo.QueryResult<
  GetGamblableEventUserRankQuery,
  GetGamblableEventUserRankQueryVariables
>;
export const GetGamblableEventLeaderboardByChannelIdDocument = gql`
  query GetGamblableEventLeaderboardByChannelId(
    $data: GetGamblableEventLeaderboardByChannelIdInput!
  ) {
    getGamblableEventLeaderboardByChannelId(data: $data) {
      chainId
      channelId
      id
      totalFees
      user {
        address
        username
      }
    }
  }
`;

/**
 * __useGetGamblableEventLeaderboardByChannelIdQuery__
 *
 * To run a query within a React component, call `useGetGamblableEventLeaderboardByChannelIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGamblableEventLeaderboardByChannelIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGamblableEventLeaderboardByChannelIdQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useGetGamblableEventLeaderboardByChannelIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetGamblableEventLeaderboardByChannelIdQuery,
    GetGamblableEventLeaderboardByChannelIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetGamblableEventLeaderboardByChannelIdQuery,
    GetGamblableEventLeaderboardByChannelIdQueryVariables
  >(GetGamblableEventLeaderboardByChannelIdDocument, options);
}
export function useGetGamblableEventLeaderboardByChannelIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGamblableEventLeaderboardByChannelIdQuery,
    GetGamblableEventLeaderboardByChannelIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetGamblableEventLeaderboardByChannelIdQuery,
    GetGamblableEventLeaderboardByChannelIdQueryVariables
  >(GetGamblableEventLeaderboardByChannelIdDocument, options);
}
export type GetGamblableEventLeaderboardByChannelIdQueryHookResult = ReturnType<
  typeof useGetGamblableEventLeaderboardByChannelIdQuery
>;
export type GetGamblableEventLeaderboardByChannelIdLazyQueryHookResult =
  ReturnType<typeof useGetGamblableEventLeaderboardByChannelIdLazyQuery>;
export type GetGamblableEventLeaderboardByChannelIdQueryResult =
  Apollo.QueryResult<
    GetGamblableEventLeaderboardByChannelIdQuery,
    GetGamblableEventLeaderboardByChannelIdQueryVariables
  >;
export const CheckSubscriptionDocument = gql`
  query CheckSubscription($data: ToggleSubscriptionInput!) {
    checkSubscriptionByEndpoint(data: $data)
  }
`;

/**
 * __useCheckSubscriptionQuery__
 *
 * To run a query within a React component, call `useCheckSubscriptionQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckSubscriptionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckSubscriptionQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCheckSubscriptionQuery(
  baseOptions: Apollo.QueryHookOptions<
    CheckSubscriptionQuery,
    CheckSubscriptionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    CheckSubscriptionQuery,
    CheckSubscriptionQueryVariables
  >(CheckSubscriptionDocument, options);
}
export function useCheckSubscriptionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CheckSubscriptionQuery,
    CheckSubscriptionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    CheckSubscriptionQuery,
    CheckSubscriptionQueryVariables
  >(CheckSubscriptionDocument, options);
}
export type CheckSubscriptionQueryHookResult = ReturnType<
  typeof useCheckSubscriptionQuery
>;
export type CheckSubscriptionLazyQueryHookResult = ReturnType<
  typeof useCheckSubscriptionLazyQuery
>;
export type CheckSubscriptionQueryResult = Apollo.QueryResult<
  CheckSubscriptionQuery,
  CheckSubscriptionQueryVariables
>;
export const GetSubscriptionDocument = gql`
  query GetSubscription($data: ToggleSubscriptionInput!) {
    getSubscriptionByEndpoint(data: $data) {
      allowedChannels
      softDelete
    }
  }
`;

/**
 * __useGetSubscriptionQuery__
 *
 * To run a query within a React component, call `useGetSubscriptionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSubscriptionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSubscriptionQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useGetSubscriptionQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetSubscriptionQuery,
    GetSubscriptionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetSubscriptionQuery, GetSubscriptionQueryVariables>(
    GetSubscriptionDocument,
    options
  );
}
export function useGetSubscriptionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetSubscriptionQuery,
    GetSubscriptionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetSubscriptionQuery,
    GetSubscriptionQueryVariables
  >(GetSubscriptionDocument, options);
}
export type GetSubscriptionQueryHookResult = ReturnType<
  typeof useGetSubscriptionQuery
>;
export type GetSubscriptionLazyQueryHookResult = ReturnType<
  typeof useGetSubscriptionLazyQuery
>;
export type GetSubscriptionQueryResult = Apollo.QueryResult<
  GetSubscriptionQuery,
  GetSubscriptionQueryVariables
>;
export const GetChannelFeedDocument = gql`
  query GetChannelFeed($data: ChannelFeedInput!) {
    getChannelFeed(data: $data) {
      id
      isLive
      name
      description
      slug
      owner {
        username
        address
        FCImageUrl
        lensImageUrl
      }
      thumbnailUrl
    }
  }
`;

/**
 * __useGetChannelFeedQuery__
 *
 * To run a query within a React component, call `useGetChannelFeedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetChannelFeedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetChannelFeedQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useGetChannelFeedQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetChannelFeedQuery,
    GetChannelFeedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetChannelFeedQuery, GetChannelFeedQueryVariables>(
    GetChannelFeedDocument,
    options
  );
}
export function useGetChannelFeedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetChannelFeedQuery,
    GetChannelFeedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetChannelFeedQuery, GetChannelFeedQueryVariables>(
    GetChannelFeedDocument,
    options
  );
}
export type GetChannelFeedQueryHookResult = ReturnType<
  typeof useGetChannelFeedQuery
>;
export type GetChannelFeedLazyQueryHookResult = ReturnType<
  typeof useGetChannelFeedLazyQuery
>;
export type GetChannelFeedQueryResult = Apollo.QueryResult<
  GetChannelFeedQuery,
  GetChannelFeedQueryVariables
>;
export const GetChannelsDocument = gql`
  query GetChannels($data: ChannelFeedInput!) {
    getChannelFeed(data: $data) {
      id
      livepeerPlaybackId
      slug
    }
  }
`;

/**
 * __useGetChannelsQuery__
 *
 * To run a query within a React component, call `useGetChannelsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetChannelsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetChannelsQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useGetChannelsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetChannelsQuery,
    GetChannelsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetChannelsQuery, GetChannelsQueryVariables>(
    GetChannelsDocument,
    options
  );
}
export function useGetChannelsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetChannelsQuery,
    GetChannelsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetChannelsQuery, GetChannelsQueryVariables>(
    GetChannelsDocument,
    options
  );
}
export type GetChannelsQueryHookResult = ReturnType<typeof useGetChannelsQuery>;
export type GetChannelsLazyQueryHookResult = ReturnType<
  typeof useGetChannelsLazyQuery
>;
export type GetChannelsQueryResult = Apollo.QueryResult<
  GetChannelsQuery,
  GetChannelsQueryVariables
>;
export const NfcFeedDocument = gql`
  query NFCFeed($data: NFCFeedInput!) {
    getNFCFeed(data: $data) {
      createdAt
      id
      videoLink
      videoThumbnail
      openseaLink
      score
      liked
      owner {
        username
        address
        FCImageUrl
        powerUserLvl
        videoSavantLvl
      }
      title
    }
  }
`;

/**
 * __useNfcFeedQuery__
 *
 * To run a query within a React component, call `useNfcFeedQuery` and pass it any options that fit your needs.
 * When your component renders, `useNfcFeedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNfcFeedQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useNfcFeedQuery(
  baseOptions: Apollo.QueryHookOptions<NfcFeedQuery, NfcFeedQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<NfcFeedQuery, NfcFeedQueryVariables>(
    NfcFeedDocument,
    options
  );
}
export function useNfcFeedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<NfcFeedQuery, NfcFeedQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<NfcFeedQuery, NfcFeedQueryVariables>(
    NfcFeedDocument,
    options
  );
}
export type NfcFeedQueryHookResult = ReturnType<typeof useNfcFeedQuery>;
export type NfcFeedLazyQueryHookResult = ReturnType<typeof useNfcFeedLazyQuery>;
export type NfcFeedQueryResult = Apollo.QueryResult<
  NfcFeedQuery,
  NfcFeedQueryVariables
>;
export const GetTempTokensDocument = gql`
  query GetTempTokens($data: GetTempTokensInput) {
    getTempTokens(data: $data) {
      tokenAddress
      symbol
      streamerFeePercentage
      protocolFeePercentage
      ownerAddress
      name
      factoryAddress
      isAlwaysTradeable
      totalSupply
      highestTotalSupply
      hasRemainingFundsForCreator
      hasHitTotalSupplyThreshold
      creationBlockNumber
      endUnixTimestamp
      minBaseTokenPrice
      channelId
      chainId
      transferredLiquidityOnExpiration
      id
      createdAt
      channel {
        slug
        owner {
          address
          username
        }
      }
    }
  }
`;

/**
 * __useGetTempTokensQuery__
 *
 * To run a query within a React component, call `useGetTempTokensQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTempTokensQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTempTokensQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useGetTempTokensQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetTempTokensQuery,
    GetTempTokensQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetTempTokensQuery, GetTempTokensQueryVariables>(
    GetTempTokensDocument,
    options
  );
}
export function useGetTempTokensLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTempTokensQuery,
    GetTempTokensQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetTempTokensQuery, GetTempTokensQueryVariables>(
    GetTempTokensDocument,
    options
  );
}
export type GetTempTokensQueryHookResult = ReturnType<
  typeof useGetTempTokensQuery
>;
export type GetTempTokensLazyQueryHookResult = ReturnType<
  typeof useGetTempTokensLazyQuery
>;
export type GetTempTokensQueryResult = Apollo.QueryResult<
  GetTempTokensQuery,
  GetTempTokensQueryVariables
>;
export const GetBaseLeaderboardDocument = gql`
  query GetBaseLeaderboard {
    getBaseLeaderboard {
      id
      amount
      owner {
        address
        username
        FCImageUrl
        lensImageUrl
      }
    }
  }
`;

/**
 * __useGetBaseLeaderboardQuery__
 *
 * To run a query within a React component, call `useGetBaseLeaderboardQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBaseLeaderboardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBaseLeaderboardQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetBaseLeaderboardQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetBaseLeaderboardQuery,
    GetBaseLeaderboardQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetBaseLeaderboardQuery,
    GetBaseLeaderboardQueryVariables
  >(GetBaseLeaderboardDocument, options);
}
export function useGetBaseLeaderboardLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetBaseLeaderboardQuery,
    GetBaseLeaderboardQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetBaseLeaderboardQuery,
    GetBaseLeaderboardQueryVariables
  >(GetBaseLeaderboardDocument, options);
}
export type GetBaseLeaderboardQueryHookResult = ReturnType<
  typeof useGetBaseLeaderboardQuery
>;
export type GetBaseLeaderboardLazyQueryHookResult = ReturnType<
  typeof useGetBaseLeaderboardLazyQuery
>;
export type GetBaseLeaderboardQueryResult = Apollo.QueryResult<
  GetBaseLeaderboardQuery,
  GetBaseLeaderboardQueryVariables
>;
export const GetLivepeerStreamDataDocument = gql`
  query GetLivepeerStreamData($data: GetLivepeerStreamDataInput!) {
    getLivepeerStreamData(data: $data) {
      streamKey
      record
      playbackId
      isActive
    }
  }
`;

/**
 * __useGetLivepeerStreamDataQuery__
 *
 * To run a query within a React component, call `useGetLivepeerStreamDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLivepeerStreamDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLivepeerStreamDataQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useGetLivepeerStreamDataQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetLivepeerStreamDataQuery,
    GetLivepeerStreamDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetLivepeerStreamDataQuery,
    GetLivepeerStreamDataQueryVariables
  >(GetLivepeerStreamDataDocument, options);
}
export function useGetLivepeerStreamDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetLivepeerStreamDataQuery,
    GetLivepeerStreamDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetLivepeerStreamDataQuery,
    GetLivepeerStreamDataQueryVariables
  >(GetLivepeerStreamDataDocument, options);
}
export type GetLivepeerStreamDataQueryHookResult = ReturnType<
  typeof useGetLivepeerStreamDataQuery
>;
export type GetLivepeerStreamDataLazyQueryHookResult = ReturnType<
  typeof useGetLivepeerStreamDataLazyQuery
>;
export type GetLivepeerStreamDataQueryResult = Apollo.QueryResult<
  GetLivepeerStreamDataQuery,
  GetLivepeerStreamDataQueryVariables
>;
export const GetLivepeerStreamSessionsDataDocument = gql`
  query GetLivepeerStreamSessionsData(
    $data: IGetLivepeerStreamSessionsDataInput!
  ) {
    getLivepeerStreamSessionsData(data: $data) {
      mp4Url
      id
      createdAt
      duration
    }
  }
`;

/**
 * __useGetLivepeerStreamSessionsDataQuery__
 *
 * To run a query within a React component, call `useGetLivepeerStreamSessionsDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLivepeerStreamSessionsDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLivepeerStreamSessionsDataQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useGetLivepeerStreamSessionsDataQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetLivepeerStreamSessionsDataQuery,
    GetLivepeerStreamSessionsDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetLivepeerStreamSessionsDataQuery,
    GetLivepeerStreamSessionsDataQueryVariables
  >(GetLivepeerStreamSessionsDataDocument, options);
}
export function useGetLivepeerStreamSessionsDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetLivepeerStreamSessionsDataQuery,
    GetLivepeerStreamSessionsDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetLivepeerStreamSessionsDataQuery,
    GetLivepeerStreamSessionsDataQueryVariables
  >(GetLivepeerStreamSessionsDataDocument, options);
}
export type GetLivepeerStreamSessionsDataQueryHookResult = ReturnType<
  typeof useGetLivepeerStreamSessionsDataQuery
>;
export type GetLivepeerStreamSessionsDataLazyQueryHookResult = ReturnType<
  typeof useGetLivepeerStreamSessionsDataLazyQuery
>;
export type GetLivepeerStreamSessionsDataQueryResult = Apollo.QueryResult<
  GetLivepeerStreamSessionsDataQuery,
  GetLivepeerStreamSessionsDataQueryVariables
>;
export const GetLivepeerViewershipMetricsDocument = gql`
  query GetLivepeerViewershipMetrics(
    $data: IGetLivepeerViewershipMetricsInput!
  ) {
    getLivepeerViewershipMetrics(data: $data) {
      timestamp
      viewCount
      playtimeMins
      playbackId
    }
  }
`;

/**
 * __useGetLivepeerViewershipMetricsQuery__
 *
 * To run a query within a React component, call `useGetLivepeerViewershipMetricsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLivepeerViewershipMetricsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLivepeerViewershipMetricsQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useGetLivepeerViewershipMetricsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetLivepeerViewershipMetricsQuery,
    GetLivepeerViewershipMetricsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetLivepeerViewershipMetricsQuery,
    GetLivepeerViewershipMetricsQueryVariables
  >(GetLivepeerViewershipMetricsDocument, options);
}
export function useGetLivepeerViewershipMetricsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetLivepeerViewershipMetricsQuery,
    GetLivepeerViewershipMetricsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetLivepeerViewershipMetricsQuery,
    GetLivepeerViewershipMetricsQueryVariables
  >(GetLivepeerViewershipMetricsDocument, options);
}
export type GetLivepeerViewershipMetricsQueryHookResult = ReturnType<
  typeof useGetLivepeerViewershipMetricsQuery
>;
export type GetLivepeerViewershipMetricsLazyQueryHookResult = ReturnType<
  typeof useGetLivepeerViewershipMetricsLazyQuery
>;
export type GetLivepeerViewershipMetricsQueryResult = Apollo.QueryResult<
  GetLivepeerViewershipMetricsQuery,
  GetLivepeerViewershipMetricsQueryVariables
>;
export const GetChannelSearchResultsDocument = gql`
  query GetChannelSearchResults($data: ChannelSearchInput!) {
    getChannelSearchResults(data: $data) {
      id
      isLive
      name
      description
      slug
      owner {
        username
        address
        FCImageUrl
        lensImageUrl
      }
      thumbnailUrl
    }
  }
`;

/**
 * __useGetChannelSearchResultsQuery__
 *
 * To run a query within a React component, call `useGetChannelSearchResultsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetChannelSearchResultsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetChannelSearchResultsQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useGetChannelSearchResultsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetChannelSearchResultsQuery,
    GetChannelSearchResultsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetChannelSearchResultsQuery,
    GetChannelSearchResultsQueryVariables
  >(GetChannelSearchResultsDocument, options);
}
export function useGetChannelSearchResultsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetChannelSearchResultsQuery,
    GetChannelSearchResultsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetChannelSearchResultsQuery,
    GetChannelSearchResultsQueryVariables
  >(GetChannelSearchResultsDocument, options);
}
export type GetChannelSearchResultsQueryHookResult = ReturnType<
  typeof useGetChannelSearchResultsQuery
>;
export type GetChannelSearchResultsLazyQueryHookResult = ReturnType<
  typeof useGetChannelSearchResultsLazyQuery
>;
export type GetChannelSearchResultsQueryResult = Apollo.QueryResult<
  GetChannelSearchResultsQuery,
  GetChannelSearchResultsQueryVariables
>;
export const GetBadgeHoldersByChannelDocument = gql`
  query GetBadgeHoldersByChannel($data: GetBadgeHoldersByChannelInput!) {
    getBadgeHoldersByChannel(data: $data)
  }
`;

/**
 * __useGetBadgeHoldersByChannelQuery__
 *
 * To run a query within a React component, call `useGetBadgeHoldersByChannelQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBadgeHoldersByChannelQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBadgeHoldersByChannelQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useGetBadgeHoldersByChannelQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetBadgeHoldersByChannelQuery,
    GetBadgeHoldersByChannelQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetBadgeHoldersByChannelQuery,
    GetBadgeHoldersByChannelQueryVariables
  >(GetBadgeHoldersByChannelDocument, options);
}
export function useGetBadgeHoldersByChannelLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetBadgeHoldersByChannelQuery,
    GetBadgeHoldersByChannelQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetBadgeHoldersByChannelQuery,
    GetBadgeHoldersByChannelQueryVariables
  >(GetBadgeHoldersByChannelDocument, options);
}
export type GetBadgeHoldersByChannelQueryHookResult = ReturnType<
  typeof useGetBadgeHoldersByChannelQuery
>;
export type GetBadgeHoldersByChannelLazyQueryHookResult = ReturnType<
  typeof useGetBadgeHoldersByChannelLazyQuery
>;
export type GetBadgeHoldersByChannelQueryResult = Apollo.QueryResult<
  GetBadgeHoldersByChannelQuery,
  GetBadgeHoldersByChannelQueryVariables
>;
export const GetChannelsByOwnerAddressDocument = gql`
  query GetChannelsByOwnerAddress($ownerAddress: String!) {
    getChannelsByOwnerAddress(ownerAddress: $ownerAddress) {
      slug
      createdAt
      name
    }
  }
`;

/**
 * __useGetChannelsByOwnerAddressQuery__
 *
 * To run a query within a React component, call `useGetChannelsByOwnerAddressQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetChannelsByOwnerAddressQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetChannelsByOwnerAddressQuery({
 *   variables: {
 *      ownerAddress: // value for 'ownerAddress'
 *   },
 * });
 */
export function useGetChannelsByOwnerAddressQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetChannelsByOwnerAddressQuery,
    GetChannelsByOwnerAddressQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetChannelsByOwnerAddressQuery,
    GetChannelsByOwnerAddressQueryVariables
  >(GetChannelsByOwnerAddressDocument, options);
}
export function useGetChannelsByOwnerAddressLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetChannelsByOwnerAddressQuery,
    GetChannelsByOwnerAddressQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetChannelsByOwnerAddressQuery,
    GetChannelsByOwnerAddressQueryVariables
  >(GetChannelsByOwnerAddressDocument, options);
}
export type GetChannelsByOwnerAddressQueryHookResult = ReturnType<
  typeof useGetChannelsByOwnerAddressQuery
>;
export type GetChannelsByOwnerAddressLazyQueryHookResult = ReturnType<
  typeof useGetChannelsByOwnerAddressLazyQuery
>;
export type GetChannelsByOwnerAddressQueryResult = Apollo.QueryResult<
  GetChannelsByOwnerAddressQuery,
  GetChannelsByOwnerAddressQueryVariables
>;
export const GetChannelByIdDocument = gql`
  query GetChannelById($id: ID!) {
    getChannelById(id: $id) {
      awsId
      channelArn
      description
      customButtonPrice
      customButtonAction
      isLive
      id
      name
      slug
      allowNFCs
      livepeerPlaybackId
      sharesEvent {
        sharesSubjectQuestion
        sharesSubjectAddress
        chainId
        channelId
        options
        eventState
        createdAt
        id
        resultIndex
      }
      owner {
        FCImageUrl
        lensImageUrl
        username
        address
      }
      token {
        id
        name
        symbol
        address
      }
    }
  }
`;

/**
 * __useGetChannelByIdQuery__
 *
 * To run a query within a React component, call `useGetChannelByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetChannelByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetChannelByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetChannelByIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetChannelByIdQuery,
    GetChannelByIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetChannelByIdQuery, GetChannelByIdQueryVariables>(
    GetChannelByIdDocument,
    options
  );
}
export function useGetChannelByIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetChannelByIdQuery,
    GetChannelByIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetChannelByIdQuery, GetChannelByIdQueryVariables>(
    GetChannelByIdDocument,
    options
  );
}
export type GetChannelByIdQueryHookResult = ReturnType<
  typeof useGetChannelByIdQuery
>;
export type GetChannelByIdLazyQueryHookResult = ReturnType<
  typeof useGetChannelByIdLazyQuery
>;
export type GetChannelByIdQueryResult = Apollo.QueryResult<
  GetChannelByIdQuery,
  GetChannelByIdQueryVariables
>;
export const GetChannelsByNumberOfBadgeHoldersDocument = gql`
  query GetChannelsByNumberOfBadgeHolders {
    getChannelsByNumberOfBadgeHolders {
      channel {
        awsId
        channelArn
        description
        customButtonPrice
        customButtonAction
        isLive
        id
        name
        slug
        allowNFCs
        sharesEvent {
          sharesSubjectQuestion
          sharesSubjectAddress
          chainId
          channelId
          options
          eventState
          createdAt
          id
          resultIndex
        }
        owner {
          FCImageUrl
          lensImageUrl
          username
          address
        }
        token {
          id
          name
          symbol
          address
        }
      }
      holders
    }
  }
`;

/**
 * __useGetChannelsByNumberOfBadgeHoldersQuery__
 *
 * To run a query within a React component, call `useGetChannelsByNumberOfBadgeHoldersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetChannelsByNumberOfBadgeHoldersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetChannelsByNumberOfBadgeHoldersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetChannelsByNumberOfBadgeHoldersQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetChannelsByNumberOfBadgeHoldersQuery,
    GetChannelsByNumberOfBadgeHoldersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetChannelsByNumberOfBadgeHoldersQuery,
    GetChannelsByNumberOfBadgeHoldersQueryVariables
  >(GetChannelsByNumberOfBadgeHoldersDocument, options);
}
export function useGetChannelsByNumberOfBadgeHoldersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetChannelsByNumberOfBadgeHoldersQuery,
    GetChannelsByNumberOfBadgeHoldersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetChannelsByNumberOfBadgeHoldersQuery,
    GetChannelsByNumberOfBadgeHoldersQueryVariables
  >(GetChannelsByNumberOfBadgeHoldersDocument, options);
}
export type GetChannelsByNumberOfBadgeHoldersQueryHookResult = ReturnType<
  typeof useGetChannelsByNumberOfBadgeHoldersQuery
>;
export type GetChannelsByNumberOfBadgeHoldersLazyQueryHookResult = ReturnType<
  typeof useGetChannelsByNumberOfBadgeHoldersLazyQuery
>;
export type GetChannelsByNumberOfBadgeHoldersQueryResult = Apollo.QueryResult<
  GetChannelsByNumberOfBadgeHoldersQuery,
  GetChannelsByNumberOfBadgeHoldersQueryVariables
>;
export const CreateCreatorTokenDocument = gql`
  mutation CreateCreatorToken($data: CreateCreatorTokenInput!) {
    createCreatorToken(data: $data) {
      id
    }
  }
`;
export type CreateCreatorTokenMutationFn = Apollo.MutationFunction<
  CreateCreatorTokenMutation,
  CreateCreatorTokenMutationVariables
>;

/**
 * __useCreateCreatorTokenMutation__
 *
 * To run a mutation, you first call `useCreateCreatorTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCreatorTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCreatorTokenMutation, { data, loading, error }] = useCreateCreatorTokenMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateCreatorTokenMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateCreatorTokenMutation,
    CreateCreatorTokenMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateCreatorTokenMutation,
    CreateCreatorTokenMutationVariables
  >(CreateCreatorTokenDocument, options);
}
export type CreateCreatorTokenMutationHookResult = ReturnType<
  typeof useCreateCreatorTokenMutation
>;
export type CreateCreatorTokenMutationResult =
  Apollo.MutationResult<CreateCreatorTokenMutation>;
export type CreateCreatorTokenMutationOptions = Apollo.BaseMutationOptions<
  CreateCreatorTokenMutation,
  CreateCreatorTokenMutationVariables
>;
export const UpdateCreatorTokenPriceDocument = gql`
  mutation UpdateCreatorTokenPrice($data: UpdateCreatorTokenPriceInput!) {
    updateCreatorTokenPrice(data: $data) {
      address
      price
    }
  }
`;
export type UpdateCreatorTokenPriceMutationFn = Apollo.MutationFunction<
  UpdateCreatorTokenPriceMutation,
  UpdateCreatorTokenPriceMutationVariables
>;

/**
 * __useUpdateCreatorTokenPriceMutation__
 *
 * To run a mutation, you first call `useUpdateCreatorTokenPriceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCreatorTokenPriceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCreatorTokenPriceMutation, { data, loading, error }] = useUpdateCreatorTokenPriceMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateCreatorTokenPriceMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateCreatorTokenPriceMutation,
    UpdateCreatorTokenPriceMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateCreatorTokenPriceMutation,
    UpdateCreatorTokenPriceMutationVariables
  >(UpdateCreatorTokenPriceDocument, options);
}
export type UpdateCreatorTokenPriceMutationHookResult = ReturnType<
  typeof useUpdateCreatorTokenPriceMutation
>;
export type UpdateCreatorTokenPriceMutationResult =
  Apollo.MutationResult<UpdateCreatorTokenPriceMutation>;
export type UpdateCreatorTokenPriceMutationOptions = Apollo.BaseMutationOptions<
  UpdateCreatorTokenPriceMutation,
  UpdateCreatorTokenPriceMutationVariables
>;
export const UpdateUserCreatorTokenQuantityDocument = gql`
  mutation UpdateUserCreatorTokenQuantity(
    $data: UpdateUserCreatorTokenQuantityInput!
  ) {
    updateUserCreatorTokenQuantity(data: $data) {
      quantity
    }
  }
`;
export type UpdateUserCreatorTokenQuantityMutationFn = Apollo.MutationFunction<
  UpdateUserCreatorTokenQuantityMutation,
  UpdateUserCreatorTokenQuantityMutationVariables
>;

/**
 * __useUpdateUserCreatorTokenQuantityMutation__
 *
 * To run a mutation, you first call `useUpdateUserCreatorTokenQuantityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserCreatorTokenQuantityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserCreatorTokenQuantityMutation, { data, loading, error }] = useUpdateUserCreatorTokenQuantityMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateUserCreatorTokenQuantityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserCreatorTokenQuantityMutation,
    UpdateUserCreatorTokenQuantityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateUserCreatorTokenQuantityMutation,
    UpdateUserCreatorTokenQuantityMutationVariables
  >(UpdateUserCreatorTokenQuantityDocument, options);
}
export type UpdateUserCreatorTokenQuantityMutationHookResult = ReturnType<
  typeof useUpdateUserCreatorTokenQuantityMutation
>;
export type UpdateUserCreatorTokenQuantityMutationResult =
  Apollo.MutationResult<UpdateUserCreatorTokenQuantityMutation>;
export type UpdateUserCreatorTokenQuantityMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateUserCreatorTokenQuantityMutation,
    UpdateUserCreatorTokenQuantityMutationVariables
  >;
export const UpdateDeleteChatCommandsDocument = gql`
  mutation UpdateDeleteChatCommands($data: UpdateDeleteChatCommandInput!) {
    updateDeleteChatCommands(data: $data) {
      id
      chatCommands {
        command
        response
      }
    }
  }
`;
export type UpdateDeleteChatCommandsMutationFn = Apollo.MutationFunction<
  UpdateDeleteChatCommandsMutation,
  UpdateDeleteChatCommandsMutationVariables
>;

/**
 * __useUpdateDeleteChatCommandsMutation__
 *
 * To run a mutation, you first call `useUpdateDeleteChatCommandsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDeleteChatCommandsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDeleteChatCommandsMutation, { data, loading, error }] = useUpdateDeleteChatCommandsMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateDeleteChatCommandsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateDeleteChatCommandsMutation,
    UpdateDeleteChatCommandsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateDeleteChatCommandsMutation,
    UpdateDeleteChatCommandsMutationVariables
  >(UpdateDeleteChatCommandsDocument, options);
}
export type UpdateDeleteChatCommandsMutationHookResult = ReturnType<
  typeof useUpdateDeleteChatCommandsMutation
>;
export type UpdateDeleteChatCommandsMutationResult =
  Apollo.MutationResult<UpdateDeleteChatCommandsMutation>;
export type UpdateDeleteChatCommandsMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateDeleteChatCommandsMutation,
    UpdateDeleteChatCommandsMutationVariables
  >;
export const CloseSharesEventsDocument = gql`
  mutation CloseSharesEvents($data: PostCloseSharesEventsInput!) {
    closeSharesEvents(data: $data) {
      count
    }
  }
`;
export type CloseSharesEventsMutationFn = Apollo.MutationFunction<
  CloseSharesEventsMutation,
  CloseSharesEventsMutationVariables
>;

/**
 * __useCloseSharesEventsMutation__
 *
 * To run a mutation, you first call `useCloseSharesEventsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCloseSharesEventsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [closeSharesEventsMutation, { data, loading, error }] = useCloseSharesEventsMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCloseSharesEventsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CloseSharesEventsMutation,
    CloseSharesEventsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CloseSharesEventsMutation,
    CloseSharesEventsMutationVariables
  >(CloseSharesEventsDocument, options);
}
export type CloseSharesEventsMutationHookResult = ReturnType<
  typeof useCloseSharesEventsMutation
>;
export type CloseSharesEventsMutationResult =
  Apollo.MutationResult<CloseSharesEventsMutation>;
export type CloseSharesEventsMutationOptions = Apollo.BaseMutationOptions<
  CloseSharesEventsMutation,
  CloseSharesEventsMutationVariables
>;
export const ConcatenateOutroToTrimmedVideoDocument = gql`
  mutation ConcatenateOutroToTrimmedVideo(
    $data: ConcatenateOutroToTrimmedVideoInput!
  ) {
    concatenateOutroToTrimmedVideo(data: $data)
  }
`;
export type ConcatenateOutroToTrimmedVideoMutationFn = Apollo.MutationFunction<
  ConcatenateOutroToTrimmedVideoMutation,
  ConcatenateOutroToTrimmedVideoMutationVariables
>;

/**
 * __useConcatenateOutroToTrimmedVideoMutation__
 *
 * To run a mutation, you first call `useConcatenateOutroToTrimmedVideoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useConcatenateOutroToTrimmedVideoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [concatenateOutroToTrimmedVideoMutation, { data, loading, error }] = useConcatenateOutroToTrimmedVideoMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useConcatenateOutroToTrimmedVideoMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ConcatenateOutroToTrimmedVideoMutation,
    ConcatenateOutroToTrimmedVideoMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ConcatenateOutroToTrimmedVideoMutation,
    ConcatenateOutroToTrimmedVideoMutationVariables
  >(ConcatenateOutroToTrimmedVideoDocument, options);
}
export type ConcatenateOutroToTrimmedVideoMutationHookResult = ReturnType<
  typeof useConcatenateOutroToTrimmedVideoMutation
>;
export type ConcatenateOutroToTrimmedVideoMutationResult =
  Apollo.MutationResult<ConcatenateOutroToTrimmedVideoMutation>;
export type ConcatenateOutroToTrimmedVideoMutationOptions =
  Apollo.BaseMutationOptions<
    ConcatenateOutroToTrimmedVideoMutation,
    ConcatenateOutroToTrimmedVideoMutationVariables
  >;
export const CreateClipDocument = gql`
  mutation CreateClip($data: CreateClipInput!) {
    createClip(data: $data) {
      url
      thumbnail
      errorMessage
      id
    }
  }
`;
export type CreateClipMutationFn = Apollo.MutationFunction<
  CreateClipMutation,
  CreateClipMutationVariables
>;

/**
 * __useCreateClipMutation__
 *
 * To run a mutation, you first call `useCreateClipMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateClipMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createClipMutation, { data, loading, error }] = useCreateClipMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateClipMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateClipMutation,
    CreateClipMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateClipMutation, CreateClipMutationVariables>(
    CreateClipDocument,
    options
  );
}
export type CreateClipMutationHookResult = ReturnType<
  typeof useCreateClipMutation
>;
export type CreateClipMutationResult =
  Apollo.MutationResult<CreateClipMutation>;
export type CreateClipMutationOptions = Apollo.BaseMutationOptions<
  CreateClipMutation,
  CreateClipMutationVariables
>;
export const CreateLivepeerClipDocument = gql`
  mutation CreateLivepeerClip($data: CreateLivepeerClipInput!) {
    createLivepeerClip(data: $data) {
      url
      thumbnail
      errorMessage
      id
    }
  }
`;
export type CreateLivepeerClipMutationFn = Apollo.MutationFunction<
  CreateLivepeerClipMutation,
  CreateLivepeerClipMutationVariables
>;

/**
 * __useCreateLivepeerClipMutation__
 *
 * To run a mutation, you first call `useCreateLivepeerClipMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateLivepeerClipMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createLivepeerClipMutation, { data, loading, error }] = useCreateLivepeerClipMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateLivepeerClipMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateLivepeerClipMutation,
    CreateLivepeerClipMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateLivepeerClipMutation,
    CreateLivepeerClipMutationVariables
  >(CreateLivepeerClipDocument, options);
}
export type CreateLivepeerClipMutationHookResult = ReturnType<
  typeof useCreateLivepeerClipMutation
>;
export type CreateLivepeerClipMutationResult =
  Apollo.MutationResult<CreateLivepeerClipMutation>;
export type CreateLivepeerClipMutationOptions = Apollo.BaseMutationOptions<
  CreateLivepeerClipMutation,
  CreateLivepeerClipMutationVariables
>;
export const MigrateChannelToLivepeerDocument = gql`
  mutation MigrateChannelToLivepeer($data: MigrateChannelToLivepeerInput!) {
    migrateChannelToLivepeer(data: $data) {
      id
      streamKey
      livepeerPlaybackId
      livepeerStreamId
      slug
    }
  }
`;
export type MigrateChannelToLivepeerMutationFn = Apollo.MutationFunction<
  MigrateChannelToLivepeerMutation,
  MigrateChannelToLivepeerMutationVariables
>;

/**
 * __useMigrateChannelToLivepeerMutation__
 *
 * To run a mutation, you first call `useMigrateChannelToLivepeerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMigrateChannelToLivepeerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [migrateChannelToLivepeerMutation, { data, loading, error }] = useMigrateChannelToLivepeerMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useMigrateChannelToLivepeerMutation(
  baseOptions?: Apollo.MutationHookOptions<
    MigrateChannelToLivepeerMutation,
    MigrateChannelToLivepeerMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    MigrateChannelToLivepeerMutation,
    MigrateChannelToLivepeerMutationVariables
  >(MigrateChannelToLivepeerDocument, options);
}
export type MigrateChannelToLivepeerMutationHookResult = ReturnType<
  typeof useMigrateChannelToLivepeerMutation
>;
export type MigrateChannelToLivepeerMutationResult =
  Apollo.MutationResult<MigrateChannelToLivepeerMutation>;
export type MigrateChannelToLivepeerMutationOptions =
  Apollo.BaseMutationOptions<
    MigrateChannelToLivepeerMutation,
    MigrateChannelToLivepeerMutationVariables
  >;
export const PostChannelDocument = gql`
  mutation PostChannel($data: PostChannelInput!) {
    postChannel(data: $data) {
      id
      streamKey
      livepeerPlaybackId
      livepeerStreamId
      slug
      name
      description
    }
  }
`;
export type PostChannelMutationFn = Apollo.MutationFunction<
  PostChannelMutation,
  PostChannelMutationVariables
>;

/**
 * __usePostChannelMutation__
 *
 * To run a mutation, you first call `usePostChannelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostChannelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postChannelMutation, { data, loading, error }] = usePostChannelMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostChannelMutation(
  baseOptions?: Apollo.MutationHookOptions<
    PostChannelMutation,
    PostChannelMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<PostChannelMutation, PostChannelMutationVariables>(
    PostChannelDocument,
    options
  );
}
export type PostChannelMutationHookResult = ReturnType<
  typeof usePostChannelMutation
>;
export type PostChannelMutationResult =
  Apollo.MutationResult<PostChannelMutation>;
export type PostChannelMutationOptions = Apollo.BaseMutationOptions<
  PostChannelMutation,
  PostChannelMutationVariables
>;
export const PostSharesEventDocument = gql`
  mutation PostSharesEvent($data: PostSharesEventInput!) {
    postSharesEvent(data: $data) {
      id
    }
  }
`;
export type PostSharesEventMutationFn = Apollo.MutationFunction<
  PostSharesEventMutation,
  PostSharesEventMutationVariables
>;

/**
 * __usePostSharesEventMutation__
 *
 * To run a mutation, you first call `usePostSharesEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostSharesEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postSharesEventMutation, { data, loading, error }] = usePostSharesEventMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostSharesEventMutation(
  baseOptions?: Apollo.MutationHookOptions<
    PostSharesEventMutation,
    PostSharesEventMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    PostSharesEventMutation,
    PostSharesEventMutationVariables
  >(PostSharesEventDocument, options);
}
export type PostSharesEventMutationHookResult = ReturnType<
  typeof usePostSharesEventMutation
>;
export type PostSharesEventMutationResult =
  Apollo.MutationResult<PostSharesEventMutation>;
export type PostSharesEventMutationOptions = Apollo.BaseMutationOptions<
  PostSharesEventMutation,
  PostSharesEventMutationVariables
>;
export const PostUserRoleForChannelDocument = gql`
  mutation PostUserRoleForChannel($data: PostUserRoleForChannelInput!) {
    postUserRoleForChannel(data: $data) {
      id
      channelId
      userAddress
      role
    }
  }
`;
export type PostUserRoleForChannelMutationFn = Apollo.MutationFunction<
  PostUserRoleForChannelMutation,
  PostUserRoleForChannelMutationVariables
>;

/**
 * __usePostUserRoleForChannelMutation__
 *
 * To run a mutation, you first call `usePostUserRoleForChannelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostUserRoleForChannelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postUserRoleForChannelMutation, { data, loading, error }] = usePostUserRoleForChannelMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostUserRoleForChannelMutation(
  baseOptions?: Apollo.MutationHookOptions<
    PostUserRoleForChannelMutation,
    PostUserRoleForChannelMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    PostUserRoleForChannelMutation,
    PostUserRoleForChannelMutationVariables
  >(PostUserRoleForChannelDocument, options);
}
export type PostUserRoleForChannelMutationHookResult = ReturnType<
  typeof usePostUserRoleForChannelMutation
>;
export type PostUserRoleForChannelMutationResult =
  Apollo.MutationResult<PostUserRoleForChannelMutation>;
export type PostUserRoleForChannelMutationOptions = Apollo.BaseMutationOptions<
  PostUserRoleForChannelMutation,
  PostUserRoleForChannelMutationVariables
>;
export const RemoveChannelFromSubscriptionDocument = gql`
  mutation RemoveChannelFromSubscription(
    $data: MoveChannelAlongSubscriptionInput!
  ) {
    removeChannelFromSubscription(data: $data) {
      id
    }
  }
`;
export type RemoveChannelFromSubscriptionMutationFn = Apollo.MutationFunction<
  RemoveChannelFromSubscriptionMutation,
  RemoveChannelFromSubscriptionMutationVariables
>;

/**
 * __useRemoveChannelFromSubscriptionMutation__
 *
 * To run a mutation, you first call `useRemoveChannelFromSubscriptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveChannelFromSubscriptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeChannelFromSubscriptionMutation, { data, loading, error }] = useRemoveChannelFromSubscriptionMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useRemoveChannelFromSubscriptionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RemoveChannelFromSubscriptionMutation,
    RemoveChannelFromSubscriptionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    RemoveChannelFromSubscriptionMutation,
    RemoveChannelFromSubscriptionMutationVariables
  >(RemoveChannelFromSubscriptionDocument, options);
}
export type RemoveChannelFromSubscriptionMutationHookResult = ReturnType<
  typeof useRemoveChannelFromSubscriptionMutation
>;
export type RemoveChannelFromSubscriptionMutationResult =
  Apollo.MutationResult<RemoveChannelFromSubscriptionMutation>;
export type RemoveChannelFromSubscriptionMutationOptions =
  Apollo.BaseMutationOptions<
    RemoveChannelFromSubscriptionMutation,
    RemoveChannelFromSubscriptionMutationVariables
  >;
export const RequestUploadFromLivepeerDocument = gql`
  mutation RequestUploadFromLivepeer($data: RequestUploadFromLivepeerInput!) {
    requestUploadFromLivepeer(data: $data) {
      url
      tusEndpoint
      task {
        id
      }
      asset {
        userId
        status {
          updatedAt
          progress
          phase
          errorMessage
        }
      }
    }
  }
`;
export type RequestUploadFromLivepeerMutationFn = Apollo.MutationFunction<
  RequestUploadFromLivepeerMutation,
  RequestUploadFromLivepeerMutationVariables
>;

/**
 * __useRequestUploadFromLivepeerMutation__
 *
 * To run a mutation, you first call `useRequestUploadFromLivepeerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestUploadFromLivepeerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestUploadFromLivepeerMutation, { data, loading, error }] = useRequestUploadFromLivepeerMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useRequestUploadFromLivepeerMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RequestUploadFromLivepeerMutation,
    RequestUploadFromLivepeerMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    RequestUploadFromLivepeerMutation,
    RequestUploadFromLivepeerMutationVariables
  >(RequestUploadFromLivepeerDocument, options);
}
export type RequestUploadFromLivepeerMutationHookResult = ReturnType<
  typeof useRequestUploadFromLivepeerMutation
>;
export type RequestUploadFromLivepeerMutationResult =
  Apollo.MutationResult<RequestUploadFromLivepeerMutation>;
export type RequestUploadFromLivepeerMutationOptions =
  Apollo.BaseMutationOptions<
    RequestUploadFromLivepeerMutation,
    RequestUploadFromLivepeerMutationVariables
  >;
export const SoftDeleteChannelDocument = gql`
  mutation SoftDeleteChannel($data: SoftDeleteChannelInput!) {
    softDeleteChannel(data: $data) {
      id
      streamKey
      livepeerPlaybackId
      livepeerStreamId
      slug
      name
      description
      owner {
        FCImageUrl
        lensImageUrl
        username
        address
      }
    }
  }
`;
export type SoftDeleteChannelMutationFn = Apollo.MutationFunction<
  SoftDeleteChannelMutation,
  SoftDeleteChannelMutationVariables
>;

/**
 * __useSoftDeleteChannelMutation__
 *
 * To run a mutation, you first call `useSoftDeleteChannelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSoftDeleteChannelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [softDeleteChannelMutation, { data, loading, error }] = useSoftDeleteChannelMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useSoftDeleteChannelMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SoftDeleteChannelMutation,
    SoftDeleteChannelMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SoftDeleteChannelMutation,
    SoftDeleteChannelMutationVariables
  >(SoftDeleteChannelDocument, options);
}
export type SoftDeleteChannelMutationHookResult = ReturnType<
  typeof useSoftDeleteChannelMutation
>;
export type SoftDeleteChannelMutationResult =
  Apollo.MutationResult<SoftDeleteChannelMutation>;
export type SoftDeleteChannelMutationOptions = Apollo.BaseMutationOptions<
  SoftDeleteChannelMutation,
  SoftDeleteChannelMutationVariables
>;
export const ToggleSubscriptionDocument = gql`
  mutation ToggleSubscription($data: ToggleSubscriptionInput!) {
    toggleSubscription(data: $data) {
      id
    }
  }
`;
export type ToggleSubscriptionMutationFn = Apollo.MutationFunction<
  ToggleSubscriptionMutation,
  ToggleSubscriptionMutationVariables
>;

/**
 * __useToggleSubscriptionMutation__
 *
 * To run a mutation, you first call `useToggleSubscriptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useToggleSubscriptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [toggleSubscriptionMutation, { data, loading, error }] = useToggleSubscriptionMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useToggleSubscriptionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ToggleSubscriptionMutation,
    ToggleSubscriptionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ToggleSubscriptionMutation,
    ToggleSubscriptionMutationVariables
  >(ToggleSubscriptionDocument, options);
}
export type ToggleSubscriptionMutationHookResult = ReturnType<
  typeof useToggleSubscriptionMutation
>;
export type ToggleSubscriptionMutationResult =
  Apollo.MutationResult<ToggleSubscriptionMutation>;
export type ToggleSubscriptionMutationOptions = Apollo.BaseMutationOptions<
  ToggleSubscriptionMutation,
  ToggleSubscriptionMutationVariables
>;
export const TrimVideoDocument = gql`
  mutation TrimVideo($data: TrimVideoInput!) {
    trimVideo(data: $data)
  }
`;
export type TrimVideoMutationFn = Apollo.MutationFunction<
  TrimVideoMutation,
  TrimVideoMutationVariables
>;

/**
 * __useTrimVideoMutation__
 *
 * To run a mutation, you first call `useTrimVideoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTrimVideoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [trimVideoMutation, { data, loading, error }] = useTrimVideoMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useTrimVideoMutation(
  baseOptions?: Apollo.MutationHookOptions<
    TrimVideoMutation,
    TrimVideoMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<TrimVideoMutation, TrimVideoMutationVariables>(
    TrimVideoDocument,
    options
  );
}
export type TrimVideoMutationHookResult = ReturnType<
  typeof useTrimVideoMutation
>;
export type TrimVideoMutationResult = Apollo.MutationResult<TrimVideoMutation>;
export type TrimVideoMutationOptions = Apollo.BaseMutationOptions<
  TrimVideoMutation,
  TrimVideoMutationVariables
>;
export const UpdateChannelAllowNfcsDocument = gql`
  mutation UpdateChannelAllowNfcs($data: UpdateChannelAllowNfcsInput!) {
    updateChannelAllowNfcs(data: $data) {
      allowNFCs
      id
    }
  }
`;
export type UpdateChannelAllowNfcsMutationFn = Apollo.MutationFunction<
  UpdateChannelAllowNfcsMutation,
  UpdateChannelAllowNfcsMutationVariables
>;

/**
 * __useUpdateChannelAllowNfcsMutation__
 *
 * To run a mutation, you first call `useUpdateChannelAllowNfcsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateChannelAllowNfcsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateChannelAllowNfcsMutation, { data, loading, error }] = useUpdateChannelAllowNfcsMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateChannelAllowNfcsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateChannelAllowNfcsMutation,
    UpdateChannelAllowNfcsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateChannelAllowNfcsMutation,
    UpdateChannelAllowNfcsMutationVariables
  >(UpdateChannelAllowNfcsDocument, options);
}
export type UpdateChannelAllowNfcsMutationHookResult = ReturnType<
  typeof useUpdateChannelAllowNfcsMutation
>;
export type UpdateChannelAllowNfcsMutationResult =
  Apollo.MutationResult<UpdateChannelAllowNfcsMutation>;
export type UpdateChannelAllowNfcsMutationOptions = Apollo.BaseMutationOptions<
  UpdateChannelAllowNfcsMutation,
  UpdateChannelAllowNfcsMutationVariables
>;
export const UpdateChannelCustomButtonDocument = gql`
  mutation UpdateChannelCustomButton($data: UpdateChannelCustomButtonInput!) {
    updateChannelCustomButton(data: $data) {
      customButtonAction
      customButtonPrice
      id
    }
  }
`;
export type UpdateChannelCustomButtonMutationFn = Apollo.MutationFunction<
  UpdateChannelCustomButtonMutation,
  UpdateChannelCustomButtonMutationVariables
>;

/**
 * __useUpdateChannelCustomButtonMutation__
 *
 * To run a mutation, you first call `useUpdateChannelCustomButtonMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateChannelCustomButtonMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateChannelCustomButtonMutation, { data, loading, error }] = useUpdateChannelCustomButtonMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateChannelCustomButtonMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateChannelCustomButtonMutation,
    UpdateChannelCustomButtonMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateChannelCustomButtonMutation,
    UpdateChannelCustomButtonMutationVariables
  >(UpdateChannelCustomButtonDocument, options);
}
export type UpdateChannelCustomButtonMutationHookResult = ReturnType<
  typeof useUpdateChannelCustomButtonMutation
>;
export type UpdateChannelCustomButtonMutationResult =
  Apollo.MutationResult<UpdateChannelCustomButtonMutation>;
export type UpdateChannelCustomButtonMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateChannelCustomButtonMutation,
    UpdateChannelCustomButtonMutationVariables
  >;
export const UpdateChannelTextDocument = gql`
  mutation UpdateChannelText($data: UpdateChannelTextInput!) {
    updateChannelText(data: $data) {
      id
      name
      description
    }
  }
`;
export type UpdateChannelTextMutationFn = Apollo.MutationFunction<
  UpdateChannelTextMutation,
  UpdateChannelTextMutationVariables
>;

/**
 * __useUpdateChannelTextMutation__
 *
 * To run a mutation, you first call `useUpdateChannelTextMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateChannelTextMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateChannelTextMutation, { data, loading, error }] = useUpdateChannelTextMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateChannelTextMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateChannelTextMutation,
    UpdateChannelTextMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateChannelTextMutation,
    UpdateChannelTextMutationVariables
  >(UpdateChannelTextDocument, options);
}
export type UpdateChannelTextMutationHookResult = ReturnType<
  typeof useUpdateChannelTextMutation
>;
export type UpdateChannelTextMutationResult =
  Apollo.MutationResult<UpdateChannelTextMutation>;
export type UpdateChannelTextMutationOptions = Apollo.BaseMutationOptions<
  UpdateChannelTextMutation,
  UpdateChannelTextMutationVariables
>;
export const UpdateChannelVibesTokenPriceRangeDocument = gql`
  mutation UpdateChannelVibesTokenPriceRange(
    $data: UpdateChannelVibesTokenPriceRangeInput!
  ) {
    updateChannelVibesTokenPriceRange(data: $data) {
      vibesTokenPriceRange
      id
    }
  }
`;
export type UpdateChannelVibesTokenPriceRangeMutationFn =
  Apollo.MutationFunction<
    UpdateChannelVibesTokenPriceRangeMutation,
    UpdateChannelVibesTokenPriceRangeMutationVariables
  >;

/**
 * __useUpdateChannelVibesTokenPriceRangeMutation__
 *
 * To run a mutation, you first call `useUpdateChannelVibesTokenPriceRangeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateChannelVibesTokenPriceRangeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateChannelVibesTokenPriceRangeMutation, { data, loading, error }] = useUpdateChannelVibesTokenPriceRangeMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateChannelVibesTokenPriceRangeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateChannelVibesTokenPriceRangeMutation,
    UpdateChannelVibesTokenPriceRangeMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateChannelVibesTokenPriceRangeMutation,
    UpdateChannelVibesTokenPriceRangeMutationVariables
  >(UpdateChannelVibesTokenPriceRangeDocument, options);
}
export type UpdateChannelVibesTokenPriceRangeMutationHookResult = ReturnType<
  typeof useUpdateChannelVibesTokenPriceRangeMutation
>;
export type UpdateChannelVibesTokenPriceRangeMutationResult =
  Apollo.MutationResult<UpdateChannelVibesTokenPriceRangeMutation>;
export type UpdateChannelVibesTokenPriceRangeMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateChannelVibesTokenPriceRangeMutation,
    UpdateChannelVibesTokenPriceRangeMutationVariables
  >;
export const UpdateLivepeerStreamDataDocument = gql`
  mutation UpdateLivepeerStreamData($data: UpdateLivepeerStreamDataInput!) {
    updateLivepeerStreamData(data: $data) {
      streamKey
      record
      playbackId
      isActive
    }
  }
`;
export type UpdateLivepeerStreamDataMutationFn = Apollo.MutationFunction<
  UpdateLivepeerStreamDataMutation,
  UpdateLivepeerStreamDataMutationVariables
>;

/**
 * __useUpdateLivepeerStreamDataMutation__
 *
 * To run a mutation, you first call `useUpdateLivepeerStreamDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateLivepeerStreamDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateLivepeerStreamDataMutation, { data, loading, error }] = useUpdateLivepeerStreamDataMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateLivepeerStreamDataMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateLivepeerStreamDataMutation,
    UpdateLivepeerStreamDataMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateLivepeerStreamDataMutation,
    UpdateLivepeerStreamDataMutationVariables
  >(UpdateLivepeerStreamDataDocument, options);
}
export type UpdateLivepeerStreamDataMutationHookResult = ReturnType<
  typeof useUpdateLivepeerStreamDataMutation
>;
export type UpdateLivepeerStreamDataMutationResult =
  Apollo.MutationResult<UpdateLivepeerStreamDataMutation>;
export type UpdateLivepeerStreamDataMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateLivepeerStreamDataMutation,
    UpdateLivepeerStreamDataMutationVariables
  >;
export const UpdatePinnedChatMessagesDocument = gql`
  mutation UpdatePinnedChatMessages($data: UpdatePinnedChatMessagesInput!) {
    updatePinnedChatMessages(data: $data) {
      pinnedChatMessages
    }
  }
`;
export type UpdatePinnedChatMessagesMutationFn = Apollo.MutationFunction<
  UpdatePinnedChatMessagesMutation,
  UpdatePinnedChatMessagesMutationVariables
>;

/**
 * __useUpdatePinnedChatMessagesMutation__
 *
 * To run a mutation, you first call `useUpdatePinnedChatMessagesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePinnedChatMessagesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePinnedChatMessagesMutation, { data, loading, error }] = useUpdatePinnedChatMessagesMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdatePinnedChatMessagesMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdatePinnedChatMessagesMutation,
    UpdatePinnedChatMessagesMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdatePinnedChatMessagesMutation,
    UpdatePinnedChatMessagesMutationVariables
  >(UpdatePinnedChatMessagesDocument, options);
}
export type UpdatePinnedChatMessagesMutationHookResult = ReturnType<
  typeof useUpdatePinnedChatMessagesMutation
>;
export type UpdatePinnedChatMessagesMutationResult =
  Apollo.MutationResult<UpdatePinnedChatMessagesMutation>;
export type UpdatePinnedChatMessagesMutationOptions =
  Apollo.BaseMutationOptions<
    UpdatePinnedChatMessagesMutation,
    UpdatePinnedChatMessagesMutationVariables
  >;
export const UpdateSharesEventDocument = gql`
  mutation UpdateSharesEvent($data: UpdateSharesEventInput!) {
    updateSharesEvent(data: $data) {
      id
    }
  }
`;
export type UpdateSharesEventMutationFn = Apollo.MutationFunction<
  UpdateSharesEventMutation,
  UpdateSharesEventMutationVariables
>;

/**
 * __useUpdateSharesEventMutation__
 *
 * To run a mutation, you first call `useUpdateSharesEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSharesEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSharesEventMutation, { data, loading, error }] = useUpdateSharesEventMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateSharesEventMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateSharesEventMutation,
    UpdateSharesEventMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateSharesEventMutation,
    UpdateSharesEventMutationVariables
  >(UpdateSharesEventDocument, options);
}
export type UpdateSharesEventMutationHookResult = ReturnType<
  typeof useUpdateSharesEventMutation
>;
export type UpdateSharesEventMutationResult =
  Apollo.MutationResult<UpdateSharesEventMutation>;
export type UpdateSharesEventMutationOptions = Apollo.BaseMutationOptions<
  UpdateSharesEventMutation,
  UpdateSharesEventMutationVariables
>;
export const UpdateUserChannelContract1155MappingDocument = gql`
  mutation UpdateUserChannelContract1155Mapping(
    $data: UpdateUserChannelContract1155MappingInput!
  ) {
    updateUserChannelContract1155Mapping(data: $data) {
      address
      username
      channelContract1155Mapping
    }
  }
`;
export type UpdateUserChannelContract1155MappingMutationFn =
  Apollo.MutationFunction<
    UpdateUserChannelContract1155MappingMutation,
    UpdateUserChannelContract1155MappingMutationVariables
  >;

/**
 * __useUpdateUserChannelContract1155MappingMutation__
 *
 * To run a mutation, you first call `useUpdateUserChannelContract1155MappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserChannelContract1155MappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserChannelContract1155MappingMutation, { data, loading, error }] = useUpdateUserChannelContract1155MappingMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateUserChannelContract1155MappingMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserChannelContract1155MappingMutation,
    UpdateUserChannelContract1155MappingMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateUserChannelContract1155MappingMutation,
    UpdateUserChannelContract1155MappingMutationVariables
  >(UpdateUserChannelContract1155MappingDocument, options);
}
export type UpdateUserChannelContract1155MappingMutationHookResult = ReturnType<
  typeof useUpdateUserChannelContract1155MappingMutation
>;
export type UpdateUserChannelContract1155MappingMutationResult =
  Apollo.MutationResult<UpdateUserChannelContract1155MappingMutation>;
export type UpdateUserChannelContract1155MappingMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateUserChannelContract1155MappingMutation,
    UpdateUserChannelContract1155MappingMutationVariables
  >;
export const PostBadgeTradeDocument = gql`
  mutation PostBadgeTrade($data: PostBadgeTradeInput!) {
    postBadgeTrade(data: $data) {
      id
    }
  }
`;
export type PostBadgeTradeMutationFn = Apollo.MutationFunction<
  PostBadgeTradeMutation,
  PostBadgeTradeMutationVariables
>;

/**
 * __usePostBadgeTradeMutation__
 *
 * To run a mutation, you first call `usePostBadgeTradeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostBadgeTradeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postBadgeTradeMutation, { data, loading, error }] = usePostBadgeTradeMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostBadgeTradeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    PostBadgeTradeMutation,
    PostBadgeTradeMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    PostBadgeTradeMutation,
    PostBadgeTradeMutationVariables
  >(PostBadgeTradeDocument, options);
}
export type PostBadgeTradeMutationHookResult = ReturnType<
  typeof usePostBadgeTradeMutation
>;
export type PostBadgeTradeMutationResult =
  Apollo.MutationResult<PostBadgeTradeMutation>;
export type PostBadgeTradeMutationOptions = Apollo.BaseMutationOptions<
  PostBadgeTradeMutation,
  PostBadgeTradeMutationVariables
>;
export const PostBetDocument = gql`
  mutation PostBet($data: PostBetInput!) {
    postBet(data: $data) {
      id
    }
  }
`;
export type PostBetMutationFn = Apollo.MutationFunction<
  PostBetMutation,
  PostBetMutationVariables
>;

/**
 * __usePostBetMutation__
 *
 * To run a mutation, you first call `usePostBetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostBetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postBetMutation, { data, loading, error }] = usePostBetMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostBetMutation(
  baseOptions?: Apollo.MutationHookOptions<
    PostBetMutation,
    PostBetMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<PostBetMutation, PostBetMutationVariables>(
    PostBetDocument,
    options
  );
}
export type PostBetMutationHookResult = ReturnType<typeof usePostBetMutation>;
export type PostBetMutationResult = Apollo.MutationResult<PostBetMutation>;
export type PostBetMutationOptions = Apollo.BaseMutationOptions<
  PostBetMutation,
  PostBetMutationVariables
>;
export const PostBetTradeDocument = gql`
  mutation PostBetTrade($data: PostBetTradeInput!) {
    postBetTrade(data: $data) {
      id
    }
  }
`;
export type PostBetTradeMutationFn = Apollo.MutationFunction<
  PostBetTradeMutation,
  PostBetTradeMutationVariables
>;

/**
 * __usePostBetTradeMutation__
 *
 * To run a mutation, you first call `usePostBetTradeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostBetTradeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postBetTradeMutation, { data, loading, error }] = usePostBetTradeMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostBetTradeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    PostBetTradeMutation,
    PostBetTradeMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    PostBetTradeMutation,
    PostBetTradeMutationVariables
  >(PostBetTradeDocument, options);
}
export type PostBetTradeMutationHookResult = ReturnType<
  typeof usePostBetTradeMutation
>;
export type PostBetTradeMutationResult =
  Apollo.MutationResult<PostBetTradeMutation>;
export type PostBetTradeMutationOptions = Apollo.BaseMutationOptions<
  PostBetTradeMutation,
  PostBetTradeMutationVariables
>;
export const PostTempTokenDocument = gql`
  mutation PostTempToken($data: PostTempTokenInput!) {
    postTempToken(data: $data) {
      tokenAddress
      symbol
      streamerFeePercentage
      protocolFeePercentage
      creationBlockNumber
      factoryAddress
      ownerAddress
      id
      name
      highestTotalSupply
      endUnixTimestamp
      minBaseTokenPrice
      channelId
      chainId
    }
  }
`;
export type PostTempTokenMutationFn = Apollo.MutationFunction<
  PostTempTokenMutation,
  PostTempTokenMutationVariables
>;

/**
 * __usePostTempTokenMutation__
 *
 * To run a mutation, you first call `usePostTempTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostTempTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postTempTokenMutation, { data, loading, error }] = usePostTempTokenMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostTempTokenMutation(
  baseOptions?: Apollo.MutationHookOptions<
    PostTempTokenMutation,
    PostTempTokenMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    PostTempTokenMutation,
    PostTempTokenMutationVariables
  >(PostTempTokenDocument, options);
}
export type PostTempTokenMutationHookResult = ReturnType<
  typeof usePostTempTokenMutation
>;
export type PostTempTokenMutationResult =
  Apollo.MutationResult<PostTempTokenMutation>;
export type PostTempTokenMutationOptions = Apollo.BaseMutationOptions<
  PostTempTokenMutation,
  PostTempTokenMutationVariables
>;
export const UpdateEndTimestampForTokensDocument = gql`
  mutation UpdateEndTimestampForTokens(
    $data: UpdateEndTimestampForTokensInput!
  ) {
    updateEndTimestampForTokens(data: $data) {
      tokenAddress
      endUnixTimestamp
      channelId
      chainId
    }
  }
`;
export type UpdateEndTimestampForTokensMutationFn = Apollo.MutationFunction<
  UpdateEndTimestampForTokensMutation,
  UpdateEndTimestampForTokensMutationVariables
>;

/**
 * __useUpdateEndTimestampForTokensMutation__
 *
 * To run a mutation, you first call `useUpdateEndTimestampForTokensMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateEndTimestampForTokensMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateEndTimestampForTokensMutation, { data, loading, error }] = useUpdateEndTimestampForTokensMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateEndTimestampForTokensMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateEndTimestampForTokensMutation,
    UpdateEndTimestampForTokensMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateEndTimestampForTokensMutation,
    UpdateEndTimestampForTokensMutationVariables
  >(UpdateEndTimestampForTokensDocument, options);
}
export type UpdateEndTimestampForTokensMutationHookResult = ReturnType<
  typeof useUpdateEndTimestampForTokensMutation
>;
export type UpdateEndTimestampForTokensMutationResult =
  Apollo.MutationResult<UpdateEndTimestampForTokensMutation>;
export type UpdateEndTimestampForTokensMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateEndTimestampForTokensMutation,
    UpdateEndTimestampForTokensMutationVariables
  >;
export const UpdateTempTokenHasHitTotalSupplyThresholdDocument = gql`
  mutation UpdateTempTokenHasHitTotalSupplyThreshold(
    $data: UpdateTempTokenHasHitTotalSupplyThresholdInput!
  ) {
    updateTempTokenHasHitTotalSupplyThreshold(data: $data)
  }
`;
export type UpdateTempTokenHasHitTotalSupplyThresholdMutationFn =
  Apollo.MutationFunction<
    UpdateTempTokenHasHitTotalSupplyThresholdMutation,
    UpdateTempTokenHasHitTotalSupplyThresholdMutationVariables
  >;

/**
 * __useUpdateTempTokenHasHitTotalSupplyThresholdMutation__
 *
 * To run a mutation, you first call `useUpdateTempTokenHasHitTotalSupplyThresholdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTempTokenHasHitTotalSupplyThresholdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTempTokenHasHitTotalSupplyThresholdMutation, { data, loading, error }] = useUpdateTempTokenHasHitTotalSupplyThresholdMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateTempTokenHasHitTotalSupplyThresholdMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateTempTokenHasHitTotalSupplyThresholdMutation,
    UpdateTempTokenHasHitTotalSupplyThresholdMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateTempTokenHasHitTotalSupplyThresholdMutation,
    UpdateTempTokenHasHitTotalSupplyThresholdMutationVariables
  >(UpdateTempTokenHasHitTotalSupplyThresholdDocument, options);
}
export type UpdateTempTokenHasHitTotalSupplyThresholdMutationHookResult =
  ReturnType<typeof useUpdateTempTokenHasHitTotalSupplyThresholdMutation>;
export type UpdateTempTokenHasHitTotalSupplyThresholdMutationResult =
  Apollo.MutationResult<UpdateTempTokenHasHitTotalSupplyThresholdMutation>;
export type UpdateTempTokenHasHitTotalSupplyThresholdMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateTempTokenHasHitTotalSupplyThresholdMutation,
    UpdateTempTokenHasHitTotalSupplyThresholdMutationVariables
  >;
export const UpdateTempTokenHasRemainingFundsForCreatorDocument = gql`
  mutation UpdateTempTokenHasRemainingFundsForCreator(
    $data: UpdateTempTokenHasRemainingFundsForCreatorInput!
  ) {
    updateTempTokenHasRemainingFundsForCreator(data: $data) {
      tokenAddress
      hasRemainingFundsForCreator
      channelId
      chainId
      balance
      isAlwaysTradeable
      symbol
    }
  }
`;
export type UpdateTempTokenHasRemainingFundsForCreatorMutationFn =
  Apollo.MutationFunction<
    UpdateTempTokenHasRemainingFundsForCreatorMutation,
    UpdateTempTokenHasRemainingFundsForCreatorMutationVariables
  >;

/**
 * __useUpdateTempTokenHasRemainingFundsForCreatorMutation__
 *
 * To run a mutation, you first call `useUpdateTempTokenHasRemainingFundsForCreatorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTempTokenHasRemainingFundsForCreatorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTempTokenHasRemainingFundsForCreatorMutation, { data, loading, error }] = useUpdateTempTokenHasRemainingFundsForCreatorMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateTempTokenHasRemainingFundsForCreatorMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateTempTokenHasRemainingFundsForCreatorMutation,
    UpdateTempTokenHasRemainingFundsForCreatorMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateTempTokenHasRemainingFundsForCreatorMutation,
    UpdateTempTokenHasRemainingFundsForCreatorMutationVariables
  >(UpdateTempTokenHasRemainingFundsForCreatorDocument, options);
}
export type UpdateTempTokenHasRemainingFundsForCreatorMutationHookResult =
  ReturnType<typeof useUpdateTempTokenHasRemainingFundsForCreatorMutation>;
export type UpdateTempTokenHasRemainingFundsForCreatorMutationResult =
  Apollo.MutationResult<UpdateTempTokenHasRemainingFundsForCreatorMutation>;
export type UpdateTempTokenHasRemainingFundsForCreatorMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateTempTokenHasRemainingFundsForCreatorMutation,
    UpdateTempTokenHasRemainingFundsForCreatorMutationVariables
  >;
export const UpdateTempTokenHighestTotalSupplyDocument = gql`
  mutation UpdateTempTokenHighestTotalSupply(
    $data: UpdateTempTokenHighestTotalSupplyInput!
  ) {
    updateTempTokenHighestTotalSupply(data: $data) {
      tokenAddress
      symbol
      ownerAddress
      name
      highestTotalSupply
      hasHitTotalSupplyThreshold
      channelId
      endUnixTimestamp
      chainId
    }
  }
`;
export type UpdateTempTokenHighestTotalSupplyMutationFn =
  Apollo.MutationFunction<
    UpdateTempTokenHighestTotalSupplyMutation,
    UpdateTempTokenHighestTotalSupplyMutationVariables
  >;

/**
 * __useUpdateTempTokenHighestTotalSupplyMutation__
 *
 * To run a mutation, you first call `useUpdateTempTokenHighestTotalSupplyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTempTokenHighestTotalSupplyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTempTokenHighestTotalSupplyMutation, { data, loading, error }] = useUpdateTempTokenHighestTotalSupplyMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateTempTokenHighestTotalSupplyMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateTempTokenHighestTotalSupplyMutation,
    UpdateTempTokenHighestTotalSupplyMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateTempTokenHighestTotalSupplyMutation,
    UpdateTempTokenHighestTotalSupplyMutationVariables
  >(UpdateTempTokenHighestTotalSupplyDocument, options);
}
export type UpdateTempTokenHighestTotalSupplyMutationHookResult = ReturnType<
  typeof useUpdateTempTokenHighestTotalSupplyMutation
>;
export type UpdateTempTokenHighestTotalSupplyMutationResult =
  Apollo.MutationResult<UpdateTempTokenHighestTotalSupplyMutation>;
export type UpdateTempTokenHighestTotalSupplyMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateTempTokenHighestTotalSupplyMutation,
    UpdateTempTokenHighestTotalSupplyMutationVariables
  >;
export const UpdateTempTokenIsAlwaysTradeableDocument = gql`
  mutation UpdateTempTokenIsAlwaysTradeable(
    $data: UpdateTempTokenIsAlwaysTradeableInput!
  ) {
    updateTempTokenIsAlwaysTradeable(data: $data)
  }
`;
export type UpdateTempTokenIsAlwaysTradeableMutationFn =
  Apollo.MutationFunction<
    UpdateTempTokenIsAlwaysTradeableMutation,
    UpdateTempTokenIsAlwaysTradeableMutationVariables
  >;

/**
 * __useUpdateTempTokenIsAlwaysTradeableMutation__
 *
 * To run a mutation, you first call `useUpdateTempTokenIsAlwaysTradeableMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTempTokenIsAlwaysTradeableMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTempTokenIsAlwaysTradeableMutation, { data, loading, error }] = useUpdateTempTokenIsAlwaysTradeableMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateTempTokenIsAlwaysTradeableMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateTempTokenIsAlwaysTradeableMutation,
    UpdateTempTokenIsAlwaysTradeableMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateTempTokenIsAlwaysTradeableMutation,
    UpdateTempTokenIsAlwaysTradeableMutationVariables
  >(UpdateTempTokenIsAlwaysTradeableDocument, options);
}
export type UpdateTempTokenIsAlwaysTradeableMutationHookResult = ReturnType<
  typeof useUpdateTempTokenIsAlwaysTradeableMutation
>;
export type UpdateTempTokenIsAlwaysTradeableMutationResult =
  Apollo.MutationResult<UpdateTempTokenIsAlwaysTradeableMutation>;
export type UpdateTempTokenIsAlwaysTradeableMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateTempTokenIsAlwaysTradeableMutation,
    UpdateTempTokenIsAlwaysTradeableMutationVariables
  >;
export const UpdateTempTokenTransferredLiquidityOnExpirationDocument = gql`
  mutation UpdateTempTokenTransferredLiquidityOnExpiration(
    $data: UpdateTempTokenTransferredLiquidityOnExpirationInput!
  ) {
    updateTempTokenTransferredLiquidityOnExpiration(data: $data) {
      transferredLiquidityOnExpiration
      tokenAddress
      symbol
      streamerFeePercentage
      protocolFeePercentage
      ownerAddress
      name
      isAlwaysTradeable
      id
      highestTotalSupply
      factoryAddress
      hasHitTotalSupplyThreshold
      hasRemainingFundsForCreator
      endUnixTimestamp
      creationBlockNumber
      chainId
      channelId
    }
  }
`;
export type UpdateTempTokenTransferredLiquidityOnExpirationMutationFn =
  Apollo.MutationFunction<
    UpdateTempTokenTransferredLiquidityOnExpirationMutation,
    UpdateTempTokenTransferredLiquidityOnExpirationMutationVariables
  >;

/**
 * __useUpdateTempTokenTransferredLiquidityOnExpirationMutation__
 *
 * To run a mutation, you first call `useUpdateTempTokenTransferredLiquidityOnExpirationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTempTokenTransferredLiquidityOnExpirationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTempTokenTransferredLiquidityOnExpirationMutation, { data, loading, error }] = useUpdateTempTokenTransferredLiquidityOnExpirationMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateTempTokenTransferredLiquidityOnExpirationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateTempTokenTransferredLiquidityOnExpirationMutation,
    UpdateTempTokenTransferredLiquidityOnExpirationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateTempTokenTransferredLiquidityOnExpirationMutation,
    UpdateTempTokenTransferredLiquidityOnExpirationMutationVariables
  >(UpdateTempTokenTransferredLiquidityOnExpirationDocument, options);
}
export type UpdateTempTokenTransferredLiquidityOnExpirationMutationHookResult =
  ReturnType<typeof useUpdateTempTokenTransferredLiquidityOnExpirationMutation>;
export type UpdateTempTokenTransferredLiquidityOnExpirationMutationResult =
  Apollo.MutationResult<UpdateTempTokenTransferredLiquidityOnExpirationMutation>;
export type UpdateTempTokenTransferredLiquidityOnExpirationMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateTempTokenTransferredLiquidityOnExpirationMutation,
    UpdateTempTokenTransferredLiquidityOnExpirationMutationVariables
  >;
export const AddChannelToSubscriptionDocument = gql`
  mutation AddChannelToSubscription($data: MoveChannelAlongSubscriptionInput!) {
    addChannelToSubscription(data: $data) {
      id
    }
  }
`;
export type AddChannelToSubscriptionMutationFn = Apollo.MutationFunction<
  AddChannelToSubscriptionMutation,
  AddChannelToSubscriptionMutationVariables
>;

/**
 * __useAddChannelToSubscriptionMutation__
 *
 * To run a mutation, you first call `useAddChannelToSubscriptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddChannelToSubscriptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addChannelToSubscriptionMutation, { data, loading, error }] = useAddChannelToSubscriptionMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useAddChannelToSubscriptionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddChannelToSubscriptionMutation,
    AddChannelToSubscriptionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    AddChannelToSubscriptionMutation,
    AddChannelToSubscriptionMutationVariables
  >(AddChannelToSubscriptionDocument, options);
}
export type AddChannelToSubscriptionMutationHookResult = ReturnType<
  typeof useAddChannelToSubscriptionMutation
>;
export type AddChannelToSubscriptionMutationResult =
  Apollo.MutationResult<AddChannelToSubscriptionMutation>;
export type AddChannelToSubscriptionMutationOptions =
  Apollo.BaseMutationOptions<
    AddChannelToSubscriptionMutation,
    AddChannelToSubscriptionMutationVariables
  >;
export const LikeDocument = gql`
  mutation Like($data: HandleLikeInput!) {
    handleLike(data: $data) {
      id
      score
      liked
      disliked
    }
  }
`;
export type LikeMutationFn = Apollo.MutationFunction<
  LikeMutation,
  LikeMutationVariables
>;

/**
 * __useLikeMutation__
 *
 * To run a mutation, you first call `useLikeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLikeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [likeMutation, { data, loading, error }] = useLikeMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useLikeMutation(
  baseOptions?: Apollo.MutationHookOptions<LikeMutation, LikeMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<LikeMutation, LikeMutationVariables>(
    LikeDocument,
    options
  );
}
export type LikeMutationHookResult = ReturnType<typeof useLikeMutation>;
export type LikeMutationResult = Apollo.MutationResult<LikeMutation>;
export type LikeMutationOptions = Apollo.BaseMutationOptions<
  LikeMutation,
  LikeMutationVariables
>;
export const PostBaseLeaderboardDocument = gql`
  mutation PostBaseLeaderboard($data: PostBaseLeaderboardInput!) {
    postBaseLeaderboard(data: $data) {
      id
    }
  }
`;
export type PostBaseLeaderboardMutationFn = Apollo.MutationFunction<
  PostBaseLeaderboardMutation,
  PostBaseLeaderboardMutationVariables
>;

/**
 * __usePostBaseLeaderboardMutation__
 *
 * To run a mutation, you first call `usePostBaseLeaderboardMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostBaseLeaderboardMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postBaseLeaderboardMutation, { data, loading, error }] = usePostBaseLeaderboardMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostBaseLeaderboardMutation(
  baseOptions?: Apollo.MutationHookOptions<
    PostBaseLeaderboardMutation,
    PostBaseLeaderboardMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    PostBaseLeaderboardMutation,
    PostBaseLeaderboardMutationVariables
  >(PostBaseLeaderboardDocument, options);
}
export type PostBaseLeaderboardMutationHookResult = ReturnType<
  typeof usePostBaseLeaderboardMutation
>;
export type PostBaseLeaderboardMutationResult =
  Apollo.MutationResult<PostBaseLeaderboardMutation>;
export type PostBaseLeaderboardMutationOptions = Apollo.BaseMutationOptions<
  PostBaseLeaderboardMutation,
  PostBaseLeaderboardMutationVariables
>;
export const PostChatByAwsIdDocument = gql`
  mutation PostChatByAwsId($data: PostChatByAwsIdInput!) {
    postChatByAwsId(data: $data) {
      id
    }
  }
`;
export type PostChatByAwsIdMutationFn = Apollo.MutationFunction<
  PostChatByAwsIdMutation,
  PostChatByAwsIdMutationVariables
>;

/**
 * __usePostChatByAwsIdMutation__
 *
 * To run a mutation, you first call `usePostChatByAwsIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostChatByAwsIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postChatByAwsIdMutation, { data, loading, error }] = usePostChatByAwsIdMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostChatByAwsIdMutation(
  baseOptions?: Apollo.MutationHookOptions<
    PostChatByAwsIdMutation,
    PostChatByAwsIdMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    PostChatByAwsIdMutation,
    PostChatByAwsIdMutationVariables
  >(PostChatByAwsIdDocument, options);
}
export type PostChatByAwsIdMutationHookResult = ReturnType<
  typeof usePostChatByAwsIdMutation
>;
export type PostChatByAwsIdMutationResult =
  Apollo.MutationResult<PostChatByAwsIdMutation>;
export type PostChatByAwsIdMutationOptions = Apollo.BaseMutationOptions<
  PostChatByAwsIdMutation,
  PostChatByAwsIdMutationVariables
>;
export const PostClaimPayoutDocument = gql`
  mutation PostClaimPayout($data: PostClaimPayoutInput!) {
    postClaimPayout(data: $data) {
      id
    }
  }
`;
export type PostClaimPayoutMutationFn = Apollo.MutationFunction<
  PostClaimPayoutMutation,
  PostClaimPayoutMutationVariables
>;

/**
 * __usePostClaimPayoutMutation__
 *
 * To run a mutation, you first call `usePostClaimPayoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostClaimPayoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postClaimPayoutMutation, { data, loading, error }] = usePostClaimPayoutMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostClaimPayoutMutation(
  baseOptions?: Apollo.MutationHookOptions<
    PostClaimPayoutMutation,
    PostClaimPayoutMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    PostClaimPayoutMutation,
    PostClaimPayoutMutationVariables
  >(PostClaimPayoutDocument, options);
}
export type PostClaimPayoutMutationHookResult = ReturnType<
  typeof usePostClaimPayoutMutation
>;
export type PostClaimPayoutMutationResult =
  Apollo.MutationResult<PostClaimPayoutMutation>;
export type PostClaimPayoutMutationOptions = Apollo.BaseMutationOptions<
  PostClaimPayoutMutation,
  PostClaimPayoutMutationVariables
>;
export const PostFirstChatDocument = gql`
  mutation PostFirstChat($data: PostChatInput!) {
    postFirstChat(data: $data) {
      id
    }
  }
`;
export type PostFirstChatMutationFn = Apollo.MutationFunction<
  PostFirstChatMutation,
  PostFirstChatMutationVariables
>;

/**
 * __usePostFirstChatMutation__
 *
 * To run a mutation, you first call `usePostFirstChatMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostFirstChatMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postFirstChatMutation, { data, loading, error }] = usePostFirstChatMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostFirstChatMutation(
  baseOptions?: Apollo.MutationHookOptions<
    PostFirstChatMutation,
    PostFirstChatMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    PostFirstChatMutation,
    PostFirstChatMutationVariables
  >(PostFirstChatDocument, options);
}
export type PostFirstChatMutationHookResult = ReturnType<
  typeof usePostFirstChatMutation
>;
export type PostFirstChatMutationResult =
  Apollo.MutationResult<PostFirstChatMutation>;
export type PostFirstChatMutationOptions = Apollo.BaseMutationOptions<
  PostFirstChatMutation,
  PostFirstChatMutationVariables
>;
export const PostNfcDocument = gql`
  mutation PostNFC($data: PostNFCInput!) {
    postNFC(data: $data) {
      id
    }
  }
`;
export type PostNfcMutationFn = Apollo.MutationFunction<
  PostNfcMutation,
  PostNfcMutationVariables
>;

/**
 * __usePostNfcMutation__
 *
 * To run a mutation, you first call `usePostNfcMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostNfcMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postNfcMutation, { data, loading, error }] = usePostNfcMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostNfcMutation(
  baseOptions?: Apollo.MutationHookOptions<
    PostNfcMutation,
    PostNfcMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<PostNfcMutation, PostNfcMutationVariables>(
    PostNfcDocument,
    options
  );
}
export type PostNfcMutationHookResult = ReturnType<typeof usePostNfcMutation>;
export type PostNfcMutationResult = Apollo.MutationResult<PostNfcMutation>;
export type PostNfcMutationOptions = Apollo.BaseMutationOptions<
  PostNfcMutation,
  PostNfcMutationVariables
>;
export const PostStreamInteractionDocument = gql`
  mutation PostStreamInteraction($data: PostStreamInteractionInput!) {
    postStreamInteraction(data: $data) {
      id
    }
  }
`;
export type PostStreamInteractionMutationFn = Apollo.MutationFunction<
  PostStreamInteractionMutation,
  PostStreamInteractionMutationVariables
>;

/**
 * __usePostStreamInteractionMutation__
 *
 * To run a mutation, you first call `usePostStreamInteractionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostStreamInteractionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postStreamInteractionMutation, { data, loading, error }] = usePostStreamInteractionMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostStreamInteractionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    PostStreamInteractionMutation,
    PostStreamInteractionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    PostStreamInteractionMutation,
    PostStreamInteractionMutationVariables
  >(PostStreamInteractionDocument, options);
}
export type PostStreamInteractionMutationHookResult = ReturnType<
  typeof usePostStreamInteractionMutation
>;
export type PostStreamInteractionMutationResult =
  Apollo.MutationResult<PostStreamInteractionMutation>;
export type PostStreamInteractionMutationOptions = Apollo.BaseMutationOptions<
  PostStreamInteractionMutation,
  PostStreamInteractionMutationVariables
>;
export const PostSubscriptionDocument = gql`
  mutation PostSubscription($data: PostSubscriptionInput!) {
    postSubscription(data: $data) {
      id
    }
  }
`;
export type PostSubscriptionMutationFn = Apollo.MutationFunction<
  PostSubscriptionMutation,
  PostSubscriptionMutationVariables
>;

/**
 * __usePostSubscriptionMutation__
 *
 * To run a mutation, you first call `usePostSubscriptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostSubscriptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postSubscriptionMutation, { data, loading, error }] = usePostSubscriptionMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostSubscriptionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    PostSubscriptionMutation,
    PostSubscriptionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    PostSubscriptionMutation,
    PostSubscriptionMutationVariables
  >(PostSubscriptionDocument, options);
}
export type PostSubscriptionMutationHookResult = ReturnType<
  typeof usePostSubscriptionMutation
>;
export type PostSubscriptionMutationResult =
  Apollo.MutationResult<PostSubscriptionMutation>;
export type PostSubscriptionMutationOptions = Apollo.BaseMutationOptions<
  PostSubscriptionMutation,
  PostSubscriptionMutationVariables
>;
export const PostTaskDocument = gql`
  mutation PostTask($data: PostTaskInput!) {
    postTask(data: $data) {
      id
    }
  }
`;
export type PostTaskMutationFn = Apollo.MutationFunction<
  PostTaskMutation,
  PostTaskMutationVariables
>;

/**
 * __usePostTaskMutation__
 *
 * To run a mutation, you first call `usePostTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postTaskMutation, { data, loading, error }] = usePostTaskMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostTaskMutation(
  baseOptions?: Apollo.MutationHookOptions<
    PostTaskMutation,
    PostTaskMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<PostTaskMutation, PostTaskMutationVariables>(
    PostTaskDocument,
    options
  );
}
export type PostTaskMutationHookResult = ReturnType<typeof usePostTaskMutation>;
export type PostTaskMutationResult = Apollo.MutationResult<PostTaskMutation>;
export type PostTaskMutationOptions = Apollo.BaseMutationOptions<
  PostTaskMutation,
  PostTaskMutationVariables
>;
export const PostVideoDocument = gql`
  mutation PostVideo($data: PostVideoInput!) {
    postVideo(data: $data) {
      id
    }
  }
`;
export type PostVideoMutationFn = Apollo.MutationFunction<
  PostVideoMutation,
  PostVideoMutationVariables
>;

/**
 * __usePostVideoMutation__
 *
 * To run a mutation, you first call `usePostVideoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePostVideoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [postVideoMutation, { data, loading, error }] = usePostVideoMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePostVideoMutation(
  baseOptions?: Apollo.MutationHookOptions<
    PostVideoMutation,
    PostVideoMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<PostVideoMutation, PostVideoMutationVariables>(
    PostVideoDocument,
    options
  );
}
export type PostVideoMutationHookResult = ReturnType<
  typeof usePostVideoMutation
>;
export type PostVideoMutationResult = Apollo.MutationResult<PostVideoMutation>;
export type PostVideoMutationOptions = Apollo.BaseMutationOptions<
  PostVideoMutation,
  PostVideoMutationVariables
>;
export const UpdateNfcDocument = gql`
  mutation UpdateNFC($data: UpdateNFCInput!) {
    updateNFC(data: $data) {
      id
    }
  }
`;
export type UpdateNfcMutationFn = Apollo.MutationFunction<
  UpdateNfcMutation,
  UpdateNfcMutationVariables
>;

/**
 * __useUpdateNfcMutation__
 *
 * To run a mutation, you first call `useUpdateNfcMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateNfcMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateNfcMutation, { data, loading, error }] = useUpdateNfcMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateNfcMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateNfcMutation,
    UpdateNfcMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateNfcMutation, UpdateNfcMutationVariables>(
    UpdateNfcDocument,
    options
  );
}
export type UpdateNfcMutationHookResult = ReturnType<
  typeof useUpdateNfcMutation
>;
export type UpdateNfcMutationResult = Apollo.MutationResult<UpdateNfcMutation>;
export type UpdateNfcMutationOptions = Apollo.BaseMutationOptions<
  UpdateNfcMutation,
  UpdateNfcMutationVariables
>;
export const UpdateUserDocument = gql`
  mutation UpdateUser($data: UpdateUserInput!) {
    updateUser(data: $data) {
      address
      lensHandle
      FCImageUrl
      username
    }
  }
`;
export type UpdateUserMutationFn = Apollo.MutationFunction<
  UpdateUserMutation,
  UpdateUserMutationVariables
>;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserMutation,
    UpdateUserMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(
    UpdateUserDocument,
    options
  );
}
export type UpdateUserMutationHookResult = ReturnType<
  typeof useUpdateUserMutation
>;
export type UpdateUserMutationResult =
  Apollo.MutationResult<UpdateUserMutation>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<
  UpdateUserMutation,
  UpdateUserMutationVariables
>;
export const UpdateUserNotificationsDocument = gql`
  mutation updateUserNotifications($data: UpdateUserNotificationsInput!) {
    updateUserNotifications(data: $data) {
      notificationsTokens
      notificationsLive
      notificationsNFCs
    }
  }
`;
export type UpdateUserNotificationsMutationFn = Apollo.MutationFunction<
  UpdateUserNotificationsMutation,
  UpdateUserNotificationsMutationVariables
>;

/**
 * __useUpdateUserNotificationsMutation__
 *
 * To run a mutation, you first call `useUpdateUserNotificationsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserNotificationsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserNotificationsMutation, { data, loading, error }] = useUpdateUserNotificationsMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateUserNotificationsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserNotificationsMutation,
    UpdateUserNotificationsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateUserNotificationsMutation,
    UpdateUserNotificationsMutationVariables
  >(UpdateUserNotificationsDocument, options);
}
export type UpdateUserNotificationsMutationHookResult = ReturnType<
  typeof useUpdateUserNotificationsMutation
>;
export type UpdateUserNotificationsMutationResult =
  Apollo.MutationResult<UpdateUserNotificationsMutation>;
export type UpdateUserNotificationsMutationOptions = Apollo.BaseMutationOptions<
  UpdateUserNotificationsMutation,
  UpdateUserNotificationsMutationVariables
>;
export const UpdateChannelFidSubscriptionDocument = gql`
  mutation UpdateChannelFidSubscription(
    $data: UpdateChannelFidSubscriptionInput!
  ) {
    updateChannelFidSubscription(data: $data)
  }
`;
export type UpdateChannelFidSubscriptionMutationFn = Apollo.MutationFunction<
  UpdateChannelFidSubscriptionMutation,
  UpdateChannelFidSubscriptionMutationVariables
>;

/**
 * __useUpdateChannelFidSubscriptionMutation__
 *
 * To run a mutation, you first call `useUpdateChannelFidSubscriptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateChannelFidSubscriptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateChannelFidSubscriptionMutation, { data, loading, error }] = useUpdateChannelFidSubscriptionMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateChannelFidSubscriptionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateChannelFidSubscriptionMutation,
    UpdateChannelFidSubscriptionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateChannelFidSubscriptionMutation,
    UpdateChannelFidSubscriptionMutationVariables
  >(UpdateChannelFidSubscriptionDocument, options);
}
export type UpdateChannelFidSubscriptionMutationHookResult = ReturnType<
  typeof useUpdateChannelFidSubscriptionMutation
>;
export type UpdateChannelFidSubscriptionMutationResult =
  Apollo.MutationResult<UpdateChannelFidSubscriptionMutation>;
export type UpdateChannelFidSubscriptionMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateChannelFidSubscriptionMutation,
    UpdateChannelFidSubscriptionMutationVariables
  >;
export const NfcDetailDocument = gql`
  query NFCDetail($id: ID!) {
    getNFC(id: $id) {
      id
      title
      videoLink
      openseaLink
      videoThumbnail
      score
      liked
      updatedAt
      owner {
        address
        FCImageUrl
        username
      }
    }
  }
`;

/**
 * __useNfcDetailQuery__
 *
 * To run a query within a React component, call `useNfcDetailQuery` and pass it any options that fit your needs.
 * When your component renders, `useNfcDetailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNfcDetailQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useNfcDetailQuery(
  baseOptions: Apollo.QueryHookOptions<NfcDetailQuery, NfcDetailQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<NfcDetailQuery, NfcDetailQueryVariables>(
    NfcDetailDocument,
    options
  );
}
export function useNfcDetailLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    NfcDetailQuery,
    NfcDetailQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<NfcDetailQuery, NfcDetailQueryVariables>(
    NfcDetailDocument,
    options
  );
}
export type NfcDetailQueryHookResult = ReturnType<typeof useNfcDetailQuery>;
export type NfcDetailLazyQueryHookResult = ReturnType<
  typeof useNfcDetailLazyQuery
>;
export type NfcDetailQueryResult = Apollo.QueryResult<
  NfcDetailQuery,
  NfcDetailQueryVariables
>;
export const NfcRecommendationsDocument = gql`
  query NFCRecommendations($data: NFCFeedInput!) {
    getNFCFeed(data: $data) {
      createdAt
      id
      videoLink
      videoThumbnail
      openseaLink
      score
      liked
      owner {
        username
        address
        FCImageUrl
        powerUserLvl
        videoSavantLvl
      }
      title
    }
  }
`;

/**
 * __useNfcRecommendationsQuery__
 *
 * To run a query within a React component, call `useNfcRecommendationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useNfcRecommendationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNfcRecommendationsQuery({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useNfcRecommendationsQuery(
  baseOptions: Apollo.QueryHookOptions<
    NfcRecommendationsQuery,
    NfcRecommendationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    NfcRecommendationsQuery,
    NfcRecommendationsQueryVariables
  >(NfcRecommendationsDocument, options);
}
export function useNfcRecommendationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    NfcRecommendationsQuery,
    NfcRecommendationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    NfcRecommendationsQuery,
    NfcRecommendationsQueryVariables
  >(NfcRecommendationsDocument, options);
}
export type NfcRecommendationsQueryHookResult = ReturnType<
  typeof useNfcRecommendationsQuery
>;
export type NfcRecommendationsLazyQueryHookResult = ReturnType<
  typeof useNfcRecommendationsLazyQuery
>;
export type NfcRecommendationsQueryResult = Apollo.QueryResult<
  NfcRecommendationsQuery,
  NfcRecommendationsQueryVariables
>;
export const FetchAuthMessageDocument = gql`
  query FetchAuthMessage {
    currentUserAuthMessage
  }
`;

/**
 * __useFetchAuthMessageQuery__
 *
 * To run a query within a React component, call `useFetchAuthMessageQuery` and pass it any options that fit your needs.
 * When your component renders, `useFetchAuthMessageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFetchAuthMessageQuery({
 *   variables: {
 *   },
 * });
 */
export function useFetchAuthMessageQuery(
  baseOptions?: Apollo.QueryHookOptions<
    FetchAuthMessageQuery,
    FetchAuthMessageQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<FetchAuthMessageQuery, FetchAuthMessageQueryVariables>(
    FetchAuthMessageDocument,
    options
  );
}
export function useFetchAuthMessageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    FetchAuthMessageQuery,
    FetchAuthMessageQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    FetchAuthMessageQuery,
    FetchAuthMessageQueryVariables
  >(FetchAuthMessageDocument, options);
}
export type FetchAuthMessageQueryHookResult = ReturnType<
  typeof useFetchAuthMessageQuery
>;
export type FetchAuthMessageLazyQueryHookResult = ReturnType<
  typeof useFetchAuthMessageLazyQuery
>;
export type FetchAuthMessageQueryResult = Apollo.QueryResult<
  FetchAuthMessageQuery,
  FetchAuthMessageQueryVariables
>;
export const FetchCurrentUserDocument = gql`
  query FetchCurrentUser {
    currentUser {
      signature
      sigTimestamp
    }
  }
`;

/**
 * __useFetchCurrentUserQuery__
 *
 * To run a query within a React component, call `useFetchCurrentUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useFetchCurrentUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFetchCurrentUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useFetchCurrentUserQuery(
  baseOptions?: Apollo.QueryHookOptions<
    FetchCurrentUserQuery,
    FetchCurrentUserQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<FetchCurrentUserQuery, FetchCurrentUserQueryVariables>(
    FetchCurrentUserDocument,
    options
  );
}
export function useFetchCurrentUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    FetchCurrentUserQuery,
    FetchCurrentUserQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    FetchCurrentUserQuery,
    FetchCurrentUserQueryVariables
  >(FetchCurrentUserDocument, options);
}
export type FetchCurrentUserQueryHookResult = ReturnType<
  typeof useFetchCurrentUserQuery
>;
export type FetchCurrentUserLazyQueryHookResult = ReturnType<
  typeof useFetchCurrentUserLazyQuery
>;
export type FetchCurrentUserQueryResult = Apollo.QueryResult<
  FetchCurrentUserQuery,
  FetchCurrentUserQueryVariables
>;
