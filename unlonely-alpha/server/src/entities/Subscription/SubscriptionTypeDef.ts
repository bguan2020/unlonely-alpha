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

  input MoveChannelAlongSubscriptionInput {
    channelId: ID!
    endpoint: String!
  }

  input SendAllNotificationsInput {
    title: String!
    body: String!
    pathname: String
    channelId: ID
  }

  input GetSubscriptionsByChannelIdInput {
    channelId: ID!
  }

  input AddSuggestedChannelsToSubscriptionsInput {
    channelIds: [ID!]!
  }

  extend type Query {
    getAllActiveSubscriptions: [Subscription]
    getSubscriptionsByChannelId(
      data: GetSubscriptionsByChannelIdInput!
    ): [Subscription]
    sendAllNotifications(data: SendAllNotificationsInput!): Boolean
    checkSubscriptionByEndpoint(data: ToggleSubscriptionInput!): Boolean
    getSubscriptionByEndpoint(data: ToggleSubscriptionInput!): Subscription
  }

  extend type Mutation {
    addSuggestedChannelsToSubscriptions(
      data: AddSuggestedChannelsToSubscriptionsInput!
    ): [Subscription]
    addChannelToSubscription(
      data: MoveChannelAlongSubscriptionInput!
    ): Subscription
    removeChannelFromSubscription(
      data: MoveChannelAlongSubscriptionInput!
    ): Subscription
    postSubscription(data: PostSubscriptionInput!): Subscription
    softDeleteSubscription(data: SoftDeleteSubscriptionInput!): Subscription
    toggleSubscription(data: ToggleSubscriptionInput!): Subscription
  }
`;
