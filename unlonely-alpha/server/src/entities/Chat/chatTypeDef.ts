import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Chat {
    id: ID!
    text: String!
    owner: User!
    createdAt: DateTime!
    updatedAt: DateTime!
    channel: Channel!
  }

  input Emoji {
    emojiType: String!
    count: Int!
  }

  input PostChatInput {
    channelId: Int!
    text: String!
    isGif: Boolean
    initializeEmojis: [Emoji!]!
    chatColor: String
  }

  input GetChatInput {
    channelId: Int!
    limit: Int!
  }

  extend type Query {
    getRecentChats(data: GetChatInput!): [Chat]
    firstChatExists: Boolean
    chatBot: [Chat]
  }

  extend type Mutation {
    postFirstChat(data: PostChatInput!): Chat
  }
`;
