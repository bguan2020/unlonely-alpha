import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Subscription {
    id: ID!
    userId: Int!
    endpoint: String!
    expirationTime: String
    p256dh: String!
    auth: String!
    softDelete: Boolean!
  }
  
  input PostSubscriptionInput {
    userId: Int!
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
  }

  extend type Mutation {
    postSubscription(data: PostSubscriptionInput!): Subscription
    softDeleteSubscription(data: SoftDeleteSubscriptionInput!): Subscription
  }
`;
