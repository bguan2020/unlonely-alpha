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

  input GetTokenHoldersInput {
    limit: Int
    offset: Int
    channelId: ID!
  }

  input UpdateUserCreatorTokenQuantityInput {
    tokenAddress: String!
    purchasedAmount: Int!
  }

  input UpdateCreatorTokenPriceInput {
    tokenAddress: String!
    price: Float!
  }

  extend type Query {
    getTokenHoldersByChannel(data: GetTokenHoldersInput): [UserCreatorToken!]!
  }

  extend type Mutation {
    createCreatorToken(data: CreateCreatorTokenInput!): CreatorToken!
    updateCreatorTokenPrice(data: UpdateCreatorTokenPriceInput!): CreatorToken!
    updateUserCreatorTokenQuantity(
      data: UpdateUserCreatorTokenQuantityInput!
    ): UserCreatorToken!
  }
`;
