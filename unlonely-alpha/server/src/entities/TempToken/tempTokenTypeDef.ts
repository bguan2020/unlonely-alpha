import { gql } from "apollo-server-express";

export const typeDef = gql`
  enum TempTokenType {
    SINGLE_MODE
    VERSUS_MODE
  }

  type TempToken {
    id: ID!
    tokenAddress: String!
    chainId: Int!
    channelId: Int!
    ownerAddress: String!
    name: String!
    symbol: String!
    endUnixTimestamp: BigInt!
    factoryAddress: String!
    creationBlockNumber: BigInt!
    protocolFeePercentage: BigInt!
    streamerFeePercentage: BigInt!
    highestTotalSupply: BigInt!
    hasRemainingFundsForCreator: Boolean!
    isAlwaysTradeable: Boolean!
    hasHitTotalSupplyThreshold: Boolean!
    channel: Channel!
    transferredLiquidityOnExpiration: BigInt
    tokenType: TempTokenType
  }

  type TempTokenWithBalance {
    id: ID!
    tokenAddress: String!
    chainId: Int!
    channelId: Int!
    ownerAddress: String!
    name: String!
    symbol: String!
    endUnixTimestamp: BigInt!
    creationBlockNumber: BigInt!
    protocolFeePercentage: BigInt!
    streamerFeePercentage: BigInt!
    highestTotalSupply: BigInt!
    hasRemainingFundsForCreator: Boolean!
    isAlwaysTradeable: Boolean!
    hasHitTotalSupplyThreshold: Boolean!
    balance: BigInt!
    tokenType: TempTokenType
  }

  input GetTempTokensInput {
    tokenAddress: String
    ownerAddress: String
    chainId: Int
    channelId: Int
    onlyActiveTokens: Boolean
    onlyTradeableTokens: Boolean
    hasHitTotalSupplyThreshold: Boolean
    isAlwaysTradeable: Boolean
    factoryAddress: String
    tokenType: TempTokenType
    fulfillAllNotAnyConditions: Boolean!
  }

  input UpdateTempTokenHasRemainingFundsForCreatorInput {
    chainId: Int!
    channelId: Int!
    tokenType: TempTokenType!
    factoryAddress: String
  }

  input UpdateTempTokenHighestTotalSupplyInput {
    tokenAddresses: [String]
    chainId: Int!
    newTotalSupplies: [String]
  }

  input PostTempTokenInput {
    tokenAddress: String!
    chainId: Int!
    channelId: Int!
    ownerAddress: String!
    name: String!
    symbol: String!
    endUnixTimestamp: String!
    factoryAddress: String!
    creationBlockNumber: String!
    protocolFeePercentage: String!
    streamerFeePercentage: String!
    tokenType: TempTokenType!
  }

  input UpdateEndTimestampForTokensInput {
    tokenAddresses: [String]
    additionalDurationInSeconds: Int!
    chainId: Int!
  }

  input UpdateTempTokenIsAlwaysTradeableInput {
    tokenAddressesSetTrue: [String]
    tokenAddressesSetFalse: [String]
    chainId: Int!
  }

  input UpdateTempTokenHasHitTotalSupplyThresholdInput {
    tokenAddressesSetTrue: [String]
    tokenAddressesSetFalse: [String]
    chainId: Int!
  }

  input UpdateTempTokenTransferredLiquidityOnExpirationInput {
    losingTokenAddress: String!
    chainId: Int!
    finalLiquidityInWei: String!
  }

  extend type Query {
    getTempTokens(data: GetTempTokensInput): [TempToken]
  }

  extend type Mutation {
    updateTempTokenHighestTotalSupply(
      data: UpdateTempTokenHighestTotalSupplyInput!
    ): [TempToken]
    updateEndTimestampForTokens(
      data: UpdateEndTimestampForTokensInput!
    ): [TempToken]
    updateTempTokenHasRemainingFundsForCreator(
      data: UpdateTempTokenHasRemainingFundsForCreatorInput!
    ): [TempTokenWithBalance]
    updateTempTokenIsAlwaysTradeable(
      data: UpdateTempTokenIsAlwaysTradeableInput!
    ): Boolean!
    updateTempTokenHasHitTotalSupplyThreshold(
      data: UpdateTempTokenHasHitTotalSupplyThresholdInput!
    ): Boolean!
    updateTempTokenTransferredLiquidityOnExpiration(
      data: UpdateTempTokenTransferredLiquidityOnExpirationInput!
    ): TempToken
    postTempToken(data: PostTempTokenInput!): TempToken
  }
`;
