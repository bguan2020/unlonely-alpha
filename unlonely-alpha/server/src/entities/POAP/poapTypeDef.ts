import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Poap {
    id: ID!
    date: String!
    link: String
    isUsed: Boolean!
    owner: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input GetPoapInput {
    date: String!
  }

  extend type Query {
    getPoap(data: GetPoapInput): Poap
  }
`;
