import { gql } from "apollo-server-express";

export const typeDef = gql`
  type EventLeaderboard {
    id: ID!
    channelId: Int!
    userAddress: String!
    totalFees: Float!
  }
  extend type Query {
    getEventLeaderboardByChannelId(channelId: Int!): [EventLeaderboard!]!
  }
`;
