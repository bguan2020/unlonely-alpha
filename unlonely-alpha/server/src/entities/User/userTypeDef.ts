import { gql } from "apollo-server-express";

export const typeDef = gql`
  type ChannelContract1155Mapping {
    contract1155Address: String!
    contract1155ChainId: Int!
  }

  type PackageCooldownMapping {
    lastUsedAt: String!
  }

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
    FCHandle: String
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
    channelContract1155Mapping: JSON
    packageCooldownMapping: JSON
  }

  type UpdateUserResponse {
    newUserData: User
    newSocialDataString: String
    rawDataString: String
    error: String
  }

  input GetUserInput {
    address: String
  }

  input UpdateUserInput {
    address: String
  }

  input UpdateUsersInput {
    addresses: [String]
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

  input UpdateUserChannelContract1155MappingInput {
    channelId: ID!
    contract1155ChainId: Int!
    contract1155Address: String!
    userAddress: String!
  }

  input GetDoesUserAddressMatchInput {
    address: String!
  }

  type GetDoesUserAddressMatchResponse {
    doesMatch: Boolean
    user: User
    contextUser: User
  }

  input UpdateUserPackageCooldownMappingInput {
    userAddress: String!
    packageName: String!
    lastUsedAt: String!
    emptyOtherCooldowns: Boolean!
  }

  input UpdateUsernameInput {
    address: String!
    username: String!
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
    getUserChannelContract1155Mapping(data: GetUserInput!): JSON
    getUserPackageCooldownMapping(data: GetUserInput!): JSON
    getUserTokenHolding(data: GetUserTokenHoldingInput!): Int
    getDoesUserAddressMatch(data: GetDoesUserAddressMatchInput!): GetDoesUserAddressMatchResponse
  }

  extend type Mutation {
    updateUserNotifications(data: UpdateUserNotificationsInput!): User
    updateUserChannelContract1155Mapping(
      data: UpdateUserChannelContract1155MappingInput!
    ): User
    updateUserPackageCooldownMapping(
      data: UpdateUserPackageCooldownMappingInput!
    ): User
    updateUser(data: UpdateUserInput!): UpdateUserResponse
    updateUsername(data: UpdateUsernameInput!): User
    updateUsers(data: UpdateUsersInput!): [User]
  }
`;
