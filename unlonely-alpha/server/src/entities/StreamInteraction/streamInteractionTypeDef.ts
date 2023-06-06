import { gql } from "apollo-server-express";

export const typeDef = gql`
  type StreamInteraction {
    id: ID!
    interactionType: String!
    text: String
    owner: User!
    channel: Channel!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input PostStreamInteractionInput {
    interactionType: String!
    text: String
    channelId: ID!
  }

  input GetRecentStreamInteractionsByChannelInput {
    channelId: ID!
  }

  extend type Mutation {
    postStreamInteraction(data: PostStreamInteractionInput!): StreamInteraction
  }

  extend type Query {
    getRecentStreamInteractionsByChannel(data: GetRecentStreamInteractionsByChannelInput): [StreamInteraction]
  }
`;
