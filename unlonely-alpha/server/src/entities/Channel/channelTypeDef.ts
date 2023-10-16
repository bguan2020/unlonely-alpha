import { gql } from "apollo-server-express";

export const typeDef = gql`
  enum SharesEventState {
    LIVE
    LOCK
    PAYOUT
  }

  type ChatCommand {
    command: String!
    response: String!
  }

  type SharesEvent {
    sharesSubjectQuestion: String
    sharesSubjectAddress: String
    eventState: SharesEventState
    softDelete: Boolean
    createdAt: DateTime!
  }

  type Channel {
    id: ID!
    awsId: String!
    channelArn: String
    name: String
    description: String
    playbackUrl: String
    isLive: Boolean
    allowNFCs: Boolean
    bannedUsers: [String]
    moderators: [User]
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
    id: ID!
    sharesSubjectQuestion: String
    sharesSubjectAddress: String
    eventState: SharesEventState
  }

  input PostCloseSharesEventInput {
    id: ID!
  }

  input ToggleUserAddressToChannelInput {
    channelId: ID!
    userAddress: String!
  }

  extend type Query {
    getChannelFeed(data: ChannelFeedInput): [Channel]
    getChannelWithTokenById(id: ID!): Channel
    getChannelById(id: ID!): Channel
    getChannelBySlug(slug: String!): Channel
    getChannelByAwsId(awsId: String!): Channel
  }

  extend type Mutation {
    closeSharesEvent(data: PostCloseSharesEventInput!): Channel
    postSharesEvent(data: PostSharesEventInput!): Channel
    updateChannelText(data: UpdateChannelTextInput!): Channel
    updateChannelCustomButton(data: UpdateChannelCustomButtonInput!): Channel
    toggleBannedUserToChannel(data: ToggleUserAddressToChannelInput): Channel
    toggleModeratorToChannel(data: ToggleUserAddressToChannelInput): Channel
  }
`;
