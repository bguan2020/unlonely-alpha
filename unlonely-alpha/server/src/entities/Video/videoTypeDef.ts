import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Video implements Likable {
    id: ID!
    youtubeId: String!
    title: String!
    thumbnail: String!
    description: String!
    score: Int!
    skip: Int
    pause: Int
    liked: Boolean
    skipped: Boolean
    comments: [Comment!]!
    owner: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input VideoFeedInput {
    searchString: String
    skip: Int
    limit: Int
    orderBy: SortOrder
  }

  input PostVideoInput {
    youtubeId: String
    title: String
    thumbnail: String
    description: String
  }

  extend type Query {
    getVideo(id: ID!): Video
    getVideoFeed(data: VideoFeedInput): [Video]
  }

  extend type Mutation {
    postVideo(data: PostVideoInput!): Video
  }
`;
