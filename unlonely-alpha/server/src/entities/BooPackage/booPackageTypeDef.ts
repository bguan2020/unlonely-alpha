import { gql } from "apollo-server-express";

export const typeDef = gql`
    type BooPackage {
        id: ID!
        packageName: String!
        priceMultiplier: String
        cooldownInSeconds: Int!
    }
    
    input UpdateBooPackageInput {
        packageName: String!
        cooldownInSeconds: Int!
        priceMultiplier: String!
    }
    
    extend type Query {
        getBooPackages: [BooPackage!]!
    }
    
    extend type Mutation {
        updateBooPackage(data: UpdateBooPackageInput!): BooPackage!
    }
    `;