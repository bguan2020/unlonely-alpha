import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Video {
    id: ID!
    youtubeId: String!
    comments: [Comment!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input VideoFeedInput {
    searchString: String
    skip: Int
    limit: Int
    orderBy: SortOrder
  }

  extend type Query {
    getVideo(id: ID!): Video
    getVideoFeed(data: VideoFeedInput): [Video]
  }
`;
