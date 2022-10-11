import { gql } from "apollo-server-express";

export const typeDef = gql`
  type User {
    id: ID!
    address: String!
    authedAsMe: Boolean!
    username: String
    bio: String
    powerUserLvl: Int!
    videoSavantLvl: Int!
    reputation: Int
    isFCUser: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    signature: String
    sigTimestamp: BigInt
    FCImageUrl: String
  }

  input GetUserInput {
    address: String
  }

  extend type Query {
    currentUser: User
    currentUserAuthMessage: String
    getUser(data: GetUserInput!): User
    getLeaderboard: [User]
  }
`;
