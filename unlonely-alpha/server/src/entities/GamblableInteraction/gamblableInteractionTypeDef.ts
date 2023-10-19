import { gql } from "apollo-server-express";

export const typeDef = gql`
  enum GamblableEvent {
    BET_CREATE
    BET_YES
    BET_NO
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

  input PostBetBuyInput {
    channelId: ID!
    userAddress: String!
    isYay: Boolean!
  }

  input PostBadgeTradeInput {
    channelId: ID!
    userAddress: String!
    isBuying: Boolean!
  }

  extend type Query {
    getBadgeHoldersByChannel(data: GetBadgeHoldersByChannelInput): [String]!
    getChannelsByNumberOfBadgeHolders: [NumberOfHolders]!
  }

  extend type Mutation {
    postBet(data: PostBetInput!): GamblableInteraction!
    postBetBuy(data: PostBetBuyInput!): GamblableInteraction!
    postBadgeTrade(data: PostBadgeTradeInput!): GamblableInteraction!
  }
`;
