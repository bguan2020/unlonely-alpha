import { gql } from "apollo-server-express";

export const typeDef = gql`
  enum LikeObj {
    HOSTEVENT
    NFC
  }
  interface Likable {
    id: ID!
    score: Int!
    liked: Boolean
    disliked: Boolean
  }

  type Like {
    id: ID!
    liked: Boolean!
    disliked: Boolean!
    liker: User!
    # hostEvent: HostEvent
    nFC: NFC
  }

  input HandleLikeInput {
    likedObj: LikeObj!
    likableId: ID!
    value: Int!
  }

  extend type Mutation {
    handleLike(data: HandleLikeInput!): Likable
  }
`;
