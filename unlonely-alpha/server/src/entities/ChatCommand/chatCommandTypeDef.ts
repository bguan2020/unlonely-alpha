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

  type ChatCommand {
    command: String!
    response: String!
  }

  input UpdateDeleteChatCommandInput {
    id: ID!
    commandArray: [ChatCommand]
  }

  extend type Mutation {
    updateDeleteChannelChatCommands(data: UpdateDeleteChatCommandInput!): Channel
  }
`;
