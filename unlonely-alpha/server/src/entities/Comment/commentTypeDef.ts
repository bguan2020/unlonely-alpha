import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Comment implements Likable {
    id: ID!
    text: String!
    score: Int!
    location_x: Int!
    location_y: Int!
    color: String!
    owner: User!
    liked: Boolean
    videoId: Int!
    videoTimestamp: Float!
    video: Video!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input PostCommentInput {
    text: String!
    videoId: Int!
    videoTimestamp: Float!
    location_x: Int!
    location_y: Int!
  }

  extend type Mutation {
    postComment(data: PostCommentInput!): Comment
  }
`;
