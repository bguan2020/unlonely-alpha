import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Package {
    id: ID!
    packageName: String!
    tokenHoldingPrice: String
    cooldownInSeconds: Int!
  }

  input UpdatePackageInput {
    packageName: String!
    cooldownInSeconds: Int!
    tokenHoldingPrice: String!
  }

  extend type Query {
    getPackages: [Package!]!
  }

  extend type Mutation {
    updatePackage(data: UpdatePackageInput!): Package!
  }
`;
