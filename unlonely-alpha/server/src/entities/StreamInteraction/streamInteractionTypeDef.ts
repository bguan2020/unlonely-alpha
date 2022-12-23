import { gql } from "apollo-server-express";

export const typeDef = gql`
  type StreamInteraction {
    id: ID!
    interactionType: String!
    owner: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input PostStreamInteractionInput {
    interactionType: String!
  }

  extend type Mutation {
    postStreamInteraction(data: PostStreamInteractionInput!): StreamInteraction
  }
`;
