import { gql } from "apollo-server-express";

export const typeDef = gql`
  interface Likable {
    id: ID!
    score: Int!
    liked: Boolean
    disliked: Boolean
  }

  type Like {
    id: ID!
    liked: Boolean!
    disliked: Boolean!
    liker: User!
    hostEvent: HostEvent
  }

  input HandleLikeInput {
    hostEventId: ID!
    value: Int!
  }

  extend type Mutation {
    handleLike(data: HandleLikeInput!): Likable
  }
`;
