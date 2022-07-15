import { gql } from "apollo-server-express";

export const typeDef = gql`
  interface Likable {
    id: ID!
    score: Int!
    liked: Boolean
    skipped: Boolean
  }

  type Like {
    id: ID!
    liked: Boolean!
    skipped: Boolean!
    liker: User!
    video: Video
  }

  input HandleLikeInput {
    videoId: ID!
    value: Int!
  }

  extend type Mutation {
    handleLike(data: HandleLikeInput!): Likable
  }
`;
