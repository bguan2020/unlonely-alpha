import { gql } from "apollo-server-express";

export const typeDef = gql`
  type BaseLeaderboard {
    id: ID!
    amount: Float!
    owner: User
  }

  input PostBaseLeaderboardInput {
    amount: Float!
    userAddress: String!
  }

  extend type Query {
    getBaseLeaderboard: [BaseLeaderboard!]!
  }

  extend type Mutation {
    postBaseLeaderboard(data: PostBaseLeaderboardInput!): BaseLeaderboard!
  }
`;
