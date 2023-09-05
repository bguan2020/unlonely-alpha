import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Subscription {
    id: ID!
    endpoint: String!
    expirationTime: String
    p256dh: String!
    auth: String!
    softDelete: Boolean!
    createdAt: DateTime!
    allowedChannels: [ID!]
  }

  input PostSubscriptionInput {
    endpoint: String!
    expirationTime: String
    p256dh: String!
    auth: String!
  }

  input SoftDeleteSubscriptionInput {
    id: ID!
  }

  input ToggleSubscriptionInput {
    endpoint: String!
  }

  input AddChannelToSubscriptionInput {
    channelId: ID!
    endpoint: String!
  }

  input RemoveChannelFromSubscriptionInput {
    channelId: ID!
    endpoint: String!
  }

  input SendAllNotificationsInput {
    title: String!
    body: String!
    channelId: ID!
  }

  extend type Query {
    getAllActiveSubscriptions: [Subscription]
    sendAllNotifications(data: SendAllNotificationsInput!): Boolean
    checkSubscriptionByEndpoint(data: ToggleSubscriptionInput!): Boolean
  }

  extend type Mutation {
    addChannelToSubscription(data: AddChannelToSubscriptionInput!): Subscription
    removeChannelFromSubscription(
      data: RemoveChannelFromSubscriptionInput!
    ): Subscription
    postSubscription(data: PostSubscriptionInput!): Subscription
    softDeleteSubscription(data: SoftDeleteSubscriptionInput!): Subscription
    toggleSubscription(data: ToggleSubscriptionInput!): Subscription
  }
`;
