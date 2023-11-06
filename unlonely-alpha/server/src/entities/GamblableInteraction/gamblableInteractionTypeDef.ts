import { gql } from "apollo-server-express";

export const typeDef = gql`
  enum GamblableEvent {
    BET_CREATE
    BET_YES_BUY
    BET_NO_BUY
    BET_YES_SELL
    BET_NO_SELL
    BADGE_BUY
    BADGE_SELL
  }

  type GamblableInteraction {
    id: ID!
    channel: Channel!
    type: GamblableEvent!
    user: User!
    createdAt: DateTime!
    softDelete: Boolean
  }

  type GamblableEventLeaderboard {
    id: ID!
    channelId: Int!
    user: User!
    totalFees: Float!
    chainId: Int!
  }

  type NumberOfHolders {
    channel: Channel!
    holders: Int!
  }

  input GetBadgeHoldersByChannelInput {
    channelId: ID!
  }

  input PostBetInput {
    channelId: ID!
    userAddress: String!
  }

  input PostBetTradeInput {
    channelId: ID!
    chainId: Int!
    userAddress: String!
    type: GamblableEvent!
    fees: Float!
  }

  input PostBadgeTradeInput {
    channelId: ID!
    chainId: Int!
    userAddress: String!
    isBuying: Boolean!
    fees: Float!
  }

  input GetBetsByChannelInput {
    channelId: ID!
  }

  input GetBetsByUserInput {
    userAddress: String!
  }

  input GetGamblableEventLeaderboardByChannelIdInput {
    channelId: ID!
    chainId: Int!
  }

  extend type Query {
    getBadgeHoldersByChannel(data: GetBadgeHoldersByChannelInput): [String]!
    getChannelsByNumberOfBadgeHolders: [NumberOfHolders]!
    getBetsByChannel(data: GetBetsByChannelInput): [GamblableInteraction]!
    getBetsByUser(data: GetBetsByUserInput): [GamblableInteraction]!
    getGamblableEventLeaderboardByChannelId(
      data: GetGamblableEventLeaderboardByChannelIdInput
    ): [GamblableEventLeaderboard!]!
  }

  extend type Mutation {
    postBet(data: PostBetInput!): GamblableInteraction!
    postBetTrade(data: PostBetTradeInput!): GamblableInteraction!
    postBadgeTrade(data: PostBadgeTradeInput!): GamblableInteraction!
  }
`;
