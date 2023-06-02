import { gql } from "apollo-server-express";

export const typeDef = gql`
  type StreamInteraction {
    id: ID!
    interactionType: String!
    owner: User!
    channel: Channel!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input PostStreamInteractionInput {
    interactionType: String!
    channelId: Int!
  }

  extend type Mutation {
    postStreamInteraction(data: PostStreamInteractionInput!): StreamInteraction
  }
`;
