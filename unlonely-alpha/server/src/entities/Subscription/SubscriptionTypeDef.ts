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

  extend type Query {
    getAllActiveSubscriptions: [Subscription]
    sendAllNotifications: Boolean
  }

  extend type Mutation {
    postSubscription(data: PostSubscriptionInput!): Subscription
    softDeleteSubscription(data: SoftDeleteSubscriptionInput!): Subscription
  }
`;
