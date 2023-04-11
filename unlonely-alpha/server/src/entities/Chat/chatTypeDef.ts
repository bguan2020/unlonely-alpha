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

  input PostChatInput {
    channelId: Int!
    text: String!
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
