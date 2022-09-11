import { makeExecutableSchema } from "@graphql-tools/schema";
import { gql } from "apollo-server-express";
import {
  typeDefs as scalarTypeDefs,
  resolvers as scalarResolvers,
} from "graphql-scalars";
import { merge } from "lodash";

import { typeDef as userTypeDef } from "./User/userTypeDef";
import { typeDef as postTypeDef } from "./Comment/commentTypeDef";
import { typeDef as likeTypeDef } from "./Like/likeTypeDef";
import { typeDef as videoTypeDef } from "./Video/videoTypeDef";
import { typeDef as taskTypeDef } from "./Task/taskTypeDef";
import { typeDef as poapTypeDef } from "./POAP/poapTypeDef";
import { typeDef as chatTypeDef } from "./Chat/chatTypeDef";
import { resolvers as likeResolvers } from "./Like/likeResolvers";
import { resolvers as userResolvers } from "./User/userResolvers";
import { resolvers as postResolvers } from "./Comment/commentResolvers";
import { resolvers as videoResolvers } from "./Video/videoResolvers";
import { resolvers as taskResolvers } from "./Task/taskResolvers";
import { resolvers as poapResolvers } from "./POAP/poapResolvers";
import { resolvers as chatResolvers } from "./Chat/chatResolvers";

const Query = gql`
  enum SortOrder {
    asc
    desc
  }

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

const resolvers = {
  ...scalarResolvers,
};

export default makeExecutableSchema({
  typeDefs: [
    Query,
    ...scalarTypeDefs,
    userTypeDef,
    postTypeDef,
    likeTypeDef,
    videoTypeDef,
    taskTypeDef,
    poapTypeDef,
    chatTypeDef,
  ],
  resolvers: merge(
    resolvers,
    userResolvers,
    postResolvers,
    likeResolvers,
    videoResolvers,
    taskResolvers,
    poapResolvers,
    chatResolvers
  ),
});
