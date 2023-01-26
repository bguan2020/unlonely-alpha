import { gql } from "apollo-server-express";

export const typeDef = gql`
  type NFC implements Likable {
    id: ID!
    title: String
    videoLink: String
    videoThumbnail: String
    openseaLink: String
    score: Int!
    liked: Boolean
    disliked: Boolean
    owner: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input NFCFeedInput {
    limit: Int
    offset: Int
    orderBy: SortBy
  }

  input PostNFCInput {
    title: String!
    videoLink: String!
  }

  extend type Query {
    getNFCFeed(data: NFCFeedInput): [NFC]
    getNFC(id: ID!): NFC
  }

  extend type Mutation {
    createClip: String
    postNFC(data: PostNFCInput!): NFC
    openseaNFCScript: String
  }
`;
