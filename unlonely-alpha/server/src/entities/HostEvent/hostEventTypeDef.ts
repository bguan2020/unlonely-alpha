import { gql } from "apollo-server-express";

export const typeDef = gql`
  type HostEvent implements Likable {
    id: ID!
    hostDate: DateTime!
    title: String!
    description: String
    score: Int!
    liked: Boolean
    disliked: Boolean
    isChallenger: Boolean!
    challenge: HostEvent
    owner: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input HostEventFeedInput {
    limit: Int
    orderBy: SortOrder
  }

  input PostChallengeInput {
    originalHostEventId: Int!
    hostDate: DateTime!
    title: String!
    description: String
  }

  extend type Query {
    getHostEventFeed(data: HostEventFeedInput): [HostEvent]
  }

  extend type Mutation {
    postChallenge(data: PostChallengeInput!): HostEvent
  }
`;
