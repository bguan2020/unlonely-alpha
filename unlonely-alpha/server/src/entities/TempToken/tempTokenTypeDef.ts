import { gql } from "apollo-server-express";

export const typeDef = gql`

    type TempToken {
        id: ID!
        tokenAddress: String!
        chainId: Int!
        channelId: Int!
        streamerAddress: String!
        name: String!
        symbol: String!
        endUnixTimestamp: BigInt!
        protocolFeePercentage: BigInt!
        streamerFeePercentage: BigInt!
    }

    input GetTempTokensInput {
        tokenAddress: String
        streamerAddress: String
        chainId: Int
        channelId: String
        onlyActiveTokens: Boolean
    }

    input PostTempTokenInput {
        tokenAddress: String!
        chainId: Int!
        channelId: Int!
        streamerAddress: String!
        name: String!
        symbol: String!
        endUnixTimestamp: BigInt!
        protocolFeePercentage: BigInt!
        streamerFeePercentage: BigInt!
    }

    extend type Query {
        getTempTokens(data: GetTempTokensInput): [TempToken]
    }

    extend type Mutation {
        postTempToken(data: PostTempTokenInput!): TempToken
    }
`;