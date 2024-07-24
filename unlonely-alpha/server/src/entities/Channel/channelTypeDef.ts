import { gql } from "apollo-server-express";

export const typeDef = gql`
  enum SharesEventState {
    PENDING
    LIVE
    LOCK
    PAYOUT
    PAYOUT_PREVIOUS
  }

  type ChatCommand {
    command: String!
    response: String!
  }

  type NFC implements Likable {
    id: ID!
    title: String
    videoLink: String
    videoThumbnail: String
    openseaLink: String
    score: Int!
    liked: Boolean
    disliked: Boolean
    owner: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type SharesEvent {
    id: ID!
    sharesSubjectQuestion: String
    sharesSubjectAddress: String
    options: [String]
    chainId: Int
    channelId: ID
    eventState: SharesEventState
    resultIndex: Int
    softDelete: Boolean
    createdAt: DateTime!
  }

  type ChannelUserRole {
    id: Int!
    userAddress: String!
    role: Int!
    channelId: Int!
    updatedAt: String!
    createdAt: String!
  }

  type Channel {
    id: ID!
    awsId: String!
    channelArn: String
    livepeerPlaybackId: String
    streamKey: String
    livepeerStreamId: String
    name: String
    description: String
    playbackUrl: String
    isLive: Boolean
    allowNFCs: Boolean
    thumbnailUrl: String
    owner: User!
    token: CreatorToken
    slug: String!
    softDelete: Boolean
    customButtonAction: String
    customButtonPrice: Int
    createdAt: DateTime!
    updatedAt: DateTime!
    lastNotificationAt: DateTime!
    chatCommands: [ChatCommand]
    sharesEvent: [SharesEvent]
    roles: [ChannelUserRole]
    nfcs: [NFC]
    vibesTokenPriceRange: [String]
    pinnedChatMessages: [String]
    contract1155chainId: Int
    contract1155address: String
  }

  type LivepeerStreamData {
    streamKey: String
    playbackId: String
    isActive: Boolean
    record: Boolean
  }

  type LivepeerStreamSessionsData {
    id: String!
    createdAt: BigInt!
    mp4Url: String!
    duration: Float!
  }

  type LivepeerViewershipMetrics {
    timestamp: String!
    viewCount: String!
    playtimeMins: String!
    playbackId: String!
  }

  type UpdateManyResponse {
    count: Int!
  }

  input PostChannelInput {
    slug: String!
    name: String
    description: String
    canRecord: Boolean
    allowNfcs: Boolean
  }

  input SoftDeleteChannelInput {
    slug: String!
  }

  input MigrateChannelToLivepeerInput {
    slug: String!
    canRecord: Boolean
  }

  input ChannelFeedInput {
    limit: Int
    offset: Int
    orderBy: SortBy
    isLive: Boolean
  }

  input UpdateChannelTextInput {
    id: ID!
    name: String!
    description: String!
  }

  input UpdateChannelCustomButtonInput {
    id: ID!
    customButtonAction: String!
    customButtonPrice: Int!
  }

  input PostSharesEventInput {
    channelId: ID!
    chainId: Int!
    sharesSubjectQuestion: String
    sharesSubjectAddress: String
    options: [String]
  }

  input UpdateSharesEventInput {
    id: ID!
    sharesSubjectQuestion: String
    sharesSubjectAddress: String
    eventState: SharesEventState
    resultIndex: Int
  }

  input PostCloseSharesEventsInput {
    channelId: ID!
    chainId: Int!
    sharesEventIds: [ID!]!
  }

  input PostUserRoleForChannelInput {
    channelId: ID!
    userAddress: String!
    role: Int!
  }

  input UpdateChannelVibesTokenPriceRangeInput {
    id: ID!
    vibesTokenPriceRange: [String]!
  }

  input UpdatePinnedChatMessagesInput {
    id: ID!
    pinnedChatMessages: [String]!
  }

  input ChannelSearchInput {
    query: String
    skip: Int
    limit: Int
    containsSlug: Boolean
    slugOnly: Boolean
    includeSoftDeletedChannels: Boolean
  }

  input UpdateChannelAllowNfcsInput {
    id: ID!
    allowNfcs: Boolean
  }

  input GetLivepeerStreamDataInput {
    streamId: String
  }

  input IGetLivepeerViewershipMetricsInput {
    playbackId: String
    fromTimestampInMilliseconds: String!
    toTimestampInMilliseconds: String!
    timeStep: String!
  }

  input IGetLivepeerStreamSessionsDataInput {
    streamId: String!
    limit: Int!
    skip: Int!
  }

  input UpdateLivepeerStreamDataInput {
    streamId: String
    canRecord: Boolean
  }

  input UpdateChannelFidSubscriptionInput {
    fid: Int!
    channelId: Int!
    isAddingSubscriber: Boolean!
  }

  extend type Query {
    getChannelSearchResults(data: ChannelSearchInput!): [Channel]
    getChannelFeed(data: ChannelFeedInput): [Channel]
    getChannelWithTokenById(id: ID!): Channel
    getChannelById(id: ID!): Channel
    getChannelBySlug(slug: String!): Channel
    getChannelByAwsId(awsId: String!): Channel
    getChannelsByOwnerAddress(ownerAddress: String!): [Channel]
    getLivepeerStreamData(data: GetLivepeerStreamDataInput!): LivepeerStreamData
    getLivepeerStreamSessionsData(
      data: IGetLivepeerStreamSessionsDataInput!
    ): [LivepeerStreamSessionsData]
    getLivepeerViewershipMetrics(
      data: IGetLivepeerViewershipMetricsInput!
    ): [LivepeerViewershipMetrics]
  }

  extend type Mutation {
    updateLivepeerStreamData(
      data: UpdateLivepeerStreamDataInput!
    ): LivepeerStreamData
    postChannel(data: PostChannelInput!): Channel
    softDeleteChannel(data: SoftDeleteChannelInput!): Channel
    migrateChannelToLivepeer(data: MigrateChannelToLivepeerInput!): Channel
    closeSharesEvents(data: PostCloseSharesEventsInput!): UpdateManyResponse
    postSharesEvent(data: PostSharesEventInput!): Channel
    updateChannelAllowNfcs(data: UpdateChannelAllowNfcsInput!): Channel
    updateSharesEvent(data: UpdateSharesEventInput!): Channel
    updateChannelText(data: UpdateChannelTextInput!): Channel
    updateChannelCustomButton(data: UpdateChannelCustomButtonInput!): Channel
    postUserRoleForChannel(data: PostUserRoleForChannelInput): ChannelUserRole
    updateChannelVibesTokenPriceRange(
      data: UpdateChannelVibesTokenPriceRangeInput!
    ): Channel
    updatePinnedChatMessages(data: UpdatePinnedChatMessagesInput!): Channel
    bulkLivepeerStreamIdMigration: UpdateManyResponse
    resetLastNotificationAtMigration: Boolean
    updateChannelFidSubscription(
      data: UpdateChannelFidSubscriptionInput!
    ): String
  }
`;
