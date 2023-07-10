import { gql } from "apollo-server-express";

export const typeDef = gql`
  type ChatCommand {
    command: String!
    response: String!
  }

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
    customButtonAction: String
    customButtonPrice: Int
    createdAt: DateTime!
    updatedAt: DateTime!
    chatCommands: [ChatCommand]
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

  input UpdateChannelCustomButtonInput {
    id: ID!
    customButtonAction: String!
    customButtonPrice: Int!
  }

  extend type Query {
    getChannelFeed(data: ChannelFeedInput): [Channel]
    getChannelWithTokenById(id: ID!): Channel
    getChannelById(id: ID!): Channel
    getChannelBySlug(slug: String!): Channel
  }

  extend type Mutation {
    updateChannelText(data: UpdateChannelTextInput!): Channel
    updateChannelCustomButton(data: UpdateChannelCustomButtonInput!): Channel
  }
`;
