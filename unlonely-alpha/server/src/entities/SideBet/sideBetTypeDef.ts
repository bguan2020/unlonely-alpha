import { gql } from "apollo-server-express";

export const typeDef = gql`
  type SideBet {
    id: ID!
    question: String
    creatorAddress: String
    opponentAddress: String
    chainId: Int
    softDelete: Boolean
    createdAt: DateTime!
  }

  input PostSideBetInput {
    channelId: ID!
    chainId: Int!
    question: String
    creatorAddress: String
    opponentAddress: String
  }

  input UpdateSideBetInput {
    id: ID!
    question: String
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
