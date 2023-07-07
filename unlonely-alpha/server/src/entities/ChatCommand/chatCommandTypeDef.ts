import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Channel {
    id: ID!
    command: String!
    response: String!
    channel: Channel!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input ChatCommandInput {
    command: String!
    response: String!
  }

  input UpdateDeleteChatCommandInput {
    id: ID!
    chatCommands: [ChatCommandInput]!
  }

  extend type Mutation {
    updateDeleteChatCommands(data: UpdateDeleteChatCommandInput!): Channel
  }
`;
