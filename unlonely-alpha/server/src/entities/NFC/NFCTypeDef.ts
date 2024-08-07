import { gql } from "apollo-server-express";

export const typeDef = gql`
  type NFC implements Likable {
    id: ID!
    title: String
    videoLink: String
    videoThumbnail: String
    openseaLink: String
    contract1155ChainId: Int
    contract1155Address: String
    score: Int!
    liked: Boolean
    disliked: Boolean
    owner: User!
    createdAt: DateTime!
    updatedAt: DateTime!
    channel: Channel
    channelId: ID
    zoraLink: String
    totalMints: Int
    tokenId: Int
  }

  type AssetTask {
    id: String!
  }

  type Asset {
    name: String!
    id: String!
    playbackId: String!
    status: AssetStatus!
    createdAt: String!
    userId: String!
  }

  type AssetStatus {
    phase: String!
    updatedAt: String!
    progress: Float
    errorMessage: String
  }

  type RequestUploadResponse {
    url: String!
    tusEndpoint: String!
    task: AssetTask!
    asset: Asset!
  }

  type UniqueContract1155AddressesResponse {
    contract1155Address: String!
    contract1155ChainId: Int
  }

  type LivepeerClipDataResponse {
    videoLink: String!
    videoThumbnail: String!
    errorMessage: String!
    error: Boolean!
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
    channelId: Int
    ownerAddress: String
  }

  input PostNFCInput {
    channelId: ID!
    title: String!
    videoLink: String!
    videoThumbnail: String!
    openseaLink: String!
    contract1155Address: String
    tokenId: Int
    zoraLink: String
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
    noDatabasePush: Boolean
  }

  input RequestUploadFromLivepeerInput {
    name: String!
  }

  input GetLivepeerClipDataInput {
    assetId: String!
  }

  input TrimVideoInput {
    startTime: Float!
    endTime: Float!
    videoLink: String!
    name: String!
  }

  input GetNFCByTokenDataInput {
    contract1155Address: String!
    contract1155ChainId: Int!
    tokenId: Int!
  }

  input ConcatenateOutroToTrimmedVideoInput {
    trimmedVideoFileName: String!
    name: String!
  }

  input GetUniqueContract1155AddressesInput {
    offset: Int
    limit: Int
  }

  extend type Query {
    getNFCFeed(data: NFCFeedInput): [NFC]
    getNFC(id: ID!): NFC
    getNFCByTokenData(data: GetNFCByTokenDataInput): NFC
    getLivepeerClipData(
      data: GetLivepeerClipDataInput
    ): LivepeerClipDataResponse
    getUniqueContract1155Addresses(
      data: GetUniqueContract1155AddressesInput
    ): [UniqueContract1155AddressesResponse]
  }

  extend type Mutation {
    createLivepeerClip(data: CreateLivepeerClipInput): ClipNFCOutput
    createClip(data: CreateClipInput): ClipNFCOutput
    postNFC(data: PostNFCInput!): NFC
    updateNFC(data: UpdateNFCInput!): NFC
    openseaNFCScript: String
    updateOpenseaLink: NFC
    requestUploadFromLivepeer(
      data: RequestUploadFromLivepeerInput!
    ): RequestUploadResponse
    trimVideo(data: TrimVideoInput!): String
    concatenateOutroToTrimmedVideo(
      data: ConcatenateOutroToTrimmedVideoInput!
    ): String
  }
`;
