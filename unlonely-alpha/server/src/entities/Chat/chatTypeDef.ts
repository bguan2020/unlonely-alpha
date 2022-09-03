import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Chat {
    id: ID!
    text: String!
    owner: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input PostChatInput {
    text: String!
  }

  input GetChatInput {
    address: String
  }

  extend type Query {
    firstChatExists: Boolean
  }

  extend type Mutation {
    postFirstChat(data: PostChatInput!): Chat
  }
`;
