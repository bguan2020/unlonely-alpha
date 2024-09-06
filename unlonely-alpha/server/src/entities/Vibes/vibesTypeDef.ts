import { gql } from "apollo-server-express";

export const typeDef = gql`
  enum VibesTransactionType {
    BUY
    SELL
  }

  type VibesTransaction {
    id: ID!
    uniqueTransactionId: String!
    chainId: Int!
    transactionHash: String!
    blockNumber: BigInt
    transactionType: VibesTransactionType
    traderAddress: String
    streamerAddress: String
    totalVibesSupplyAfterTrade: String
    vibesAmount: String
    weiAmount: String
    protocolWeiFees: String
    streamerWeiFees: String
    createdAt: DateTime!
  }

  input DateRange {
    start: DateTime
    end: DateTime
  }

  input GetVibesTransactionsInput {
    chainId: Int!
    streamerAddress: String!
    dateRange: DateRange
    take: Int
    skip: Int
  }

  input PostVibesTradesInput {
    chainId: Int!
    tokenAddress: String!
  }

  extend type Query {
    getVibesTransactions(data: GetVibesTransactionsInput!): [VibesTransaction]
  }

  extend type Mutation {
    postVibesTrades(data: PostVibesTradesInput!): [VibesTransaction]
  }
`;
