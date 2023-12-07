import { gql } from "apollo-server-express";

export const typeDef = gql`
  type SideBet {
    id: ID!
    wagerDescription: String
    creatorAddress: String
    opponentAddress: String
    chainId: Int
    softDelete: Boolean
    createdAt: DateTime!
    result: Boolean
  }

  input PostSideBetInput {
    channelId: ID!
    chainId: Int!
    wagerDescription: String
    creatorAddress: String
    opponentAddress: String
  }

  input UpdateSideBetInput {
    id: ID!
    wagerDescription: String
    creatorAddress: String
    opponentAddress: String
  }

  input CloseSideBetInput {
    id: ID!
  }

  extend type Query {
    getSideBetById(id: ID!): SideBet
    getSideBetByUser(userAddress: String!): SideBet
    getSideBetByChannelId(id: ID!): SideBet
  }

  extend type Mutation {
    postSideBet(data: PostSideBetInput!): SideBet
    updateSideBet(data: UpdateSideBetInput!): SideBet
    closeSideBet(data: CloseSideBetInput!): SideBet
  }
`;
