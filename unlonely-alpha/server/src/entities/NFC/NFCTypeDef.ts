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
    channel: Channel!
  }

  type Channel {
    id: ID!
    name: String
    description: String
    owner: User!
    slug: String!
  }

  type ClipOutput {
    url: String
    thumbnail: String
    errorMessage: String
  }

  type ClipNFCOutput implements Likable {
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
    url: String
    thumbnail: String
    errorMessage: String
  }

  input NFCFeedInput {
    limit: Int
    offset: Int
    orderBy: SortBy
  }

  input PostNFCInput {
    channelId: ID!
    title: String!
    videoLink: String!
    videoThumbnail: String!
    openseaLink: String!
  }

  input UpdateNFCInput {
    id: ID!
    title: String!
    videoLink: String!
    videoThumbnail: String!
    openseaLink: String!
  }

  input CreateClipInput {
    title: String!
    channelId: ID!
    channelArn: String!
  }

  input CreateLivepeerClipInput {
    title: String!
    channelId: ID!
    livepeerPlaybackId: String!
  }

  extend type Query {
    getNFCFeed(data: NFCFeedInput): [NFC]
    getNFC(id: ID!): NFC
  }

  extend type Mutation {
    createLivepeerClip(data: CreateLivepeerClipInput): ClipNFCOutput
    createClip(data: CreateClipInput): ClipNFCOutput
    postNFC(data: PostNFCInput!): NFC
    updateNFC(data: UpdateNFCInput!): NFC
    openseaNFCScript: String
    updateOpenseaLink: NFC
  }
`;
