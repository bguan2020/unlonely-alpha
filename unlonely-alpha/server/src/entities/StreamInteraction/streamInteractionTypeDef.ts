import { gql } from "apollo-server-express";

export const typeDef = gql`
  enum StreamInteractionType {
    tts_interaction
    package_interaction
  }

  type StreamInteraction {
    id: ID!
    interactionType: String!
    text: String
    owner: User!
    channel: Channel!
    createdAt: DateTime!
    updatedAt: DateTime!
    softDelete: Boolean!
  }

  input PostStreamInteractionInput {
    streamInteractionType: StreamInteractionType!
    text: String
    channelId: ID!
  }

  input UpdateStreamInteractionInput {
    interactionId: ID!
    softDeleted: Boolean!
  }

  input GetStreamInteractionsInput {
    channelId: ID!
    streamInteractionType: StreamInteractionType
    orderBy: SortOrder!
    softDeleted: Boolean
  }

  extend type Mutation {
    updateStreamInteraction(data: UpdateStreamInteractionInput!): StreamInteraction
    postStreamInteraction(data: PostStreamInteractionInput!): StreamInteraction
  }

  extend type Query {
    getStreamInteractions(
      data: GetStreamInteractionsInput
    ): [StreamInteraction]
  }
`;
