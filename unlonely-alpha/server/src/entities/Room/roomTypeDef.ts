import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Room {
    roomName: String!
    inUse: Boolean!
    availablePackages: [String!]!
    createdAt: String!
    updatedAt: String!
  }

  input UpdateRoomsInput {
    roomNameToUse: String!
  }

  extend type Query {
    getRooms: [Room!]!
  }

  extend type Mutation {
    updateRooms(data: UpdateRoomsInput!): Room!
  }
`;
