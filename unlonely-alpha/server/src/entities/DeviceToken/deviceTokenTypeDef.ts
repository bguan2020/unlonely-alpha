import { gql } from "apollo-server-express";

export const typeDef = gql`
  type DeviceToken {
    id: ID!
    token: String!
    address: String
    notificationsLive: Boolean!
    notificationsNFCs: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input PostDeviceTokenInput {
    token: String!
    notificationsLive: Boolean
    notificationsNFCs: Boolean
    address: String
  }

  input UpdateDeviceInput {
    token: String!
    notificationsLive: Boolean!
    notificationsNFCs: Boolean!
  }

  input GetDeviceByTokenInput {
    token: String!
  }

  extend type Query {
    getDeviceByToken(data: GetDeviceByTokenInput!): DeviceToken
    getAllDevices: [DeviceToken]
    chatBot: [Chat]
  }

  extend type Mutation {
    postDeviceToken(data: PostDeviceTokenInput!): DeviceToken
    updateDeviceToken(data: UpdateDeviceInput!): DeviceToken
  }
`;
