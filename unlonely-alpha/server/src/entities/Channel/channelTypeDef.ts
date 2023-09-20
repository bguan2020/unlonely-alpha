import { gql } from "apollo-server-express";

export const typeDef = gql`
  enum SharesEventState {
    LIVE
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
    thumbnailUrl: String
    owner: User!
    token: CreatorToken
    slug: String!
    customButtonAction: String
    customButtonPrice: Int
    createdAt: DateTime!
    updatedAt: DateTime!
    chatCommands: [ChatCommand]
    sharesEvent: SharesEvent
  }

  input ChannelFeedInput {
    limit: Int
    offset: Int
    orderBy: SortBy
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

  input UpdateSharesEventInput {
    id: ID!
    sharesSubjectQuestion: String
    sharesSubjectAddress: String
    eventState: SharesEventState
  }

  input ToggleBannedUserToChannelInput {
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
    updateSharesEvent(data: UpdateSharesEventInput!): Channel
    updateChannelText(data: UpdateChannelTextInput!): Channel
    updateChannelCustomButton(data: UpdateChannelCustomButtonInput!): Channel
    toggleBannedUserToChannel(data: ToggleBannedUserToChannelInput): Channel
  }
`;
