import { gql } from "apollo-server-express";

export const typeDef = gql`

    type TempToken {
        id: ID!
        tokenAddress: String!
        chainId: Int!
        channelId: Int!
        ownerAddress: String!
        name: String!
        symbol: String!
        endUnixTimestamp: BigInt!
        protocolFeePercentage: BigInt!
        streamerFeePercentage: BigInt!
    }

    input GetTempTokensInput {
        tokenAddress: String
        ownerAddress: String
        chainId: Int
        channelId: String
        onlyActiveTokens: Boolean
    }

    input UpdateTempTokenHighestTotalSupplyInput {
        tokenAddress: String!
        endUnixTimestamp: String!
        chainId: Int!
        currentTotalSupply: String!
    }

    input PostTempTokenInput {
        tokenAddress: String!
        chainId: Int!
        channelId: Int!
        ownerAddress: String!
        name: String!
        symbol: String!
        endUnixTimestamp: String!
        protocolFeePercentage: String!
        streamerFeePercentage: String!
    }

    extend type Query {
        getTempTokens(data: GetTempTokensInput): [TempToken]
    }

    extend type Mutation {
        updateTempTokenHighestTotalSupply(data: UpdateTempTokenHighestTotalSupplyInput!): TempToken
        postTempToken(data: PostTempTokenInput!): TempToken
    }
`;