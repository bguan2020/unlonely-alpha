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
    nfcRank: Int!
    reputation: Int
    isFCUser: Boolean!
    FCImageUrl: String
    isLensUser: Boolean!
    lensHandle: String
    lensImageUrl: String
    createdAt: DateTime!
    updatedAt: DateTime!
    signature: String
    sigTimestamp: BigInt
    notificationsTokens: String
    notificationsLive: Boolean
    notificationsNFCs: Boolean
    channel: [Channel]
  }

  input GetUserInput {
    address: String
  }

  input UpdateUserInput {
    address: String
  }

  input GetUserTokenHoldingInput {
    userAddress: String
    tokenAddress: String
  }

  input UpdateUserNotificationsInput {
    notificationsTokens: String
    notificationsLive: Boolean
    notificationsNFCs: Boolean
  }

  extend type Query {
    currentUser: User
    currentUserAuthMessage: String
    getUser(data: GetUserInput!): User
    getLeaderboard: [User]
    getAllUsers: [User]
    updateAllUsers: [User]
    getAllUsersWithChannel: [User]
    getAllUsersWithNotificationsToken: [User]
    getUserTokenHolding(data: GetUserTokenHoldingInput!): Int
  }

  extend type Mutation {
    updateUserNotifications(data: UpdateUserNotificationsInput!): User
    updateUser(data: UpdateUserInput!): User
  }
`;
