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

  type SideBet {
    id: ID!
    wagerDescription: String
    creatorAddress: String
    opponentAddress: String
    chainId: Int
    softDelete: Boolean
    createdAt: DateTime!
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
    name: String
    description: String
    playbackUrl: String
    isLive: Boolean
    allowNFCs: Boolean
    thumbnailUrl: String
    owner: User!
    token: CreatorToken
    slug: String!
    customButtonAction: String
    customButtonPrice: Int
    createdAt: DateTime!
    updatedAt: DateTime!
    chatCommands: [ChatCommand]
    sharesEvent: [SharesEvent]
    roles: [ChannelUserRole]
    sideBets: [SideBet]
  }

  type UpdateManyResponse {
    count: Int!
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

  extend type Query {
    getChannelFeed(data: ChannelFeedInput): [Channel]
    getChannelWithTokenById(id: ID!): Channel
    getChannelById(id: ID!): Channel
    getChannelBySlug(slug: String!): Channel
    getChannelByAwsId(awsId: String!): Channel
  }

  extend type Mutation {
    closeSharesEvents(data: PostCloseSharesEventsInput!): UpdateManyResponse
    postSharesEvent(data: PostSharesEventInput!): Channel
    updateSharesEvent(data: UpdateSharesEventInput!): Channel
    updateChannelText(data: UpdateChannelTextInput!): Channel
    updateChannelCustomButton(data: UpdateChannelCustomButtonInput!): Channel
    postUserRoleForChannel(data: PostUserRoleForChannelInput): ChannelUserRole
  }
`;
