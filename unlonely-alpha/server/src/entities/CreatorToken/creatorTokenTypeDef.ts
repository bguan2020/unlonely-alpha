import { gql } from "apollo-server-express";

export const typeDef = gql`
  type CreatorToken {
    id: ID!
    address: String!
    symbol: String!
    name: String!
    price: Float!
    channel: Channel!
    users: [UserCreatorToken!]!
  }

  type UserCreatorToken {
    userId: String!
    tokenId: ID!
    quantity: Int!
    user: User!
    token: CreatorToken!
  }

  input CreateCreatorTokenInput {
    address: String!
    symbol: String!
    name: String!
    price: Float!
    channelId: ID!
  }

  input UpdateUserCreatorTokenQuantityInput {
    tokenAddress: String!
    purchasedAmount: Int!
  }

  extend type Query {
    getTokenHoldersByChannel(tokenId: ID!): [UserCreatorToken!]!
  }

  extend type Mutation {
    createCreatorToken(data: CreateCreatorTokenInput!): CreatorToken!
    updateUserCreatorTokenQuantity(data: UpdateUserCreatorTokenQuantityInput!): UserCreatorToken!
  }
`;
