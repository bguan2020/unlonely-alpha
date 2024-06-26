import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Video {
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
    duration: Int!
    owner: User!
    createdAt: DateTime!
    updatedAt: DateTime!
    isDeleted: Boolean!
    currentVideo: Boolean!
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
    duration: Int
  }

  extend type Query {
    getVideo(id: ID!): Video
    getVideoFeed(data: VideoFeedInput): [Video]
  }

  extend type Mutation {
    postVideo(data: PostVideoInput!): Video
    softDeleteVideo(id: ID!): Boolean
  }
`;
