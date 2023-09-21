import { gql } from "apollo-server-express";

export const typeDef = gql`
  type BaseLeaderboard {
    id: ID!
    amount: Int!
    user: User
  }

  input PostBaseLeaderboardInput {
    amount: Int!
  }

  extend type Query {
    getBaseLeaderboard: [BaseLeaderboard!]!
  }

  extend type Mutation {
    postBaseLeaderboard(data: PostBaseLeaderboardInput!): BaseLeaderboard!
  }
`;
