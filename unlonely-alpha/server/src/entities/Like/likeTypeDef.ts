import { gql } from "apollo-server-express";

export const typeDef = gql`
  interface Likable {
    id: ID!
    score: Int!
    liked: Boolean
  }

  type Like {
    id: ID!
    liked: Boolean!
    liker: User!
    comment: Comment!
  }

  input HandleLikeInput {
    commentId: ID!
  }

  extend type Mutation {
    handleLike(data: HandleLikeInput!): Likable
  }
`;
