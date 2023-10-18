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
    channelId: ID!
    holders: Int!
  }

  input GetBadgeHoldersByChannelInput {
    channelId: ID!
  }

  input CreateBetInput {
    channelId: ID!
    userAddress: String!
  }

  input RecordBetBuyInput {
    channelId: ID!
    userAddress: String!
    isYay: Boolean!
  }

  input RecordBadgeTradeInput {
    channelId: ID!
    userAddress: String!
    isBuying: Boolean!
  }

  extend type Query {
    getBadgeHoldersByChannel(
      data: GetBadgeHoldersByChannelInput
    ): [GamblableInteraction!]!
    getChannelsByNumberOfBadgeHolders: [NumberOfHolders]!
  }

  extend type Mutation {
    createBet(data: CreateBetInput!): GamblableInteraction!
    recordBetBuy(data: RecordBetBuyInput!): GamblableInteraction!
    recordBadgeTrade(data: RecordBadgeTradeInput!): GamblableInteraction!
  }
`;
