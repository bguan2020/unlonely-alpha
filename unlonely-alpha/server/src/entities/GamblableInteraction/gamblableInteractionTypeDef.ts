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
    userAddress: String!
    isYay: Boolean!
    isBuying: Boolean!
    fees: Float!
  }

  input PostBadgeTradeInput {
    channelId: ID!
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

  extend type Query {
    getBadgeHoldersByChannel(data: GetBadgeHoldersByChannelInput): [String]!
    getChannelsByNumberOfBadgeHolders: [NumberOfHolders]!
    getBetsByChannel(data: GetBetsByChannelInput): [GamblableInteraction]!
    getBetsByUser(data: GetBetsByUserInput): [GamblableInteraction]!
  }

  extend type Mutation {
    postBet(data: PostBetInput!): GamblableInteraction!
    postBetTrade(data: PostBetTradeInput!): GamblableInteraction!
    postBadgeTrade(data: PostBadgeTradeInput!): GamblableInteraction!
  }
`;
