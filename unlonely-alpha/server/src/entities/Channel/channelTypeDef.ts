import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Channel {
    id: ID!
    awsId: String!
    channelArn: String
    name: String
    description: String
    playbackUrl: String
    isLive: Boolean
    allowNFCs: Boolean
    thumbnailUrl: String
    owner: User!
    token: CreatorToken
    slug: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input ChannelFeedInput {
    limit: Int
    offset: Int
    orderBy: SortBy
  }

  input UpdateChannelTextInput {
    id: ID!
    name: String!
    description: String!
  }

  extend type Query {
    getChannelFeed(data: ChannelFeedInput): [Channel]
    getChannelWithTokenById(id: ID!): Channel
    getChannelById(id: ID!): Channel
    getChannelBySlug(slug: String!): Channel
  }

  extend type Mutation {
    updateChannelText(data: UpdateChannelTextInput!): Channel
  }
`;
