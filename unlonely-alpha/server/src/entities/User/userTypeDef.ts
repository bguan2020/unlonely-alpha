import { gql } from "apollo-server-express";

export const typeDef = gql`
  type User {
    id: ID!
    address: String!
    authedAsMe: Boolean!
    username: String
    bio: String
    reputation: Int
    isFCUser: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    signature: String
    sigTimestamp: BigInt
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
