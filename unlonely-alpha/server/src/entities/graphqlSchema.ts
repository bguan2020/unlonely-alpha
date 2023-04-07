import { makeExecutableSchema } from "@graphql-tools/schema";
import { gql } from "apollo-server-express";
import {
  typeDefs as scalarTypeDefs,
  resolvers as scalarResolvers,
} from "graphql-scalars";
import { merge } from "lodash";

import { typeDef as userTypeDef } from "./User/userTypeDef";
import { typeDef as likeTypeDef } from "./Like/likeTypeDef";
import { typeDef as videoTypeDef } from "./Video/videoTypeDef";
import { typeDef as taskTypeDef } from "./Task/taskTypeDef";
import { typeDef as poapTypeDef } from "./POAP/poapTypeDef";
import { typeDef as chatTypeDef } from "./Chat/chatTypeDef";
import { typeDef as nfcTypeDef } from "./NFC/NFCTypeDef";
import { typeDef as hostEventTypeDef } from "./HostEvent/hostEventTypeDef";
import { typeDef as streamInteractionTypeDef } from "./StreamInteraction/streamInteractionTypeDef";
import { typeDef as channelTypeDef } from "./Channel/channelTypeDef";
import { resolvers as likeResolvers } from "./Like/likeResolvers";
import { resolvers as userResolvers } from "./User/userResolvers";
import { resolvers as videoResolvers } from "./Video/videoResolvers";
import { resolvers as taskResolvers } from "./Task/taskResolvers";
import { resolvers as poapResolvers } from "./POAP/poapResolvers";
import { resolvers as chatResolvers } from "./Chat/chatResolvers";
import { resolvers as hostEventResolvers } from "./HostEvent/hostEventResolvers";
import { resolvers as nfcResolvers } from "./NFC/NFCResolvers";
import { resolvers as streamInteractionResolvers } from "./StreamInteraction/streamInteractionResolvers";
import { resolvers as channelResolvers } from "./Channel/channelResolvers";

const Query = gql`
  enum SortOrder {
    asc
    desc
  }

  enum SortBy {
    score
    createdAt
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
    likeTypeDef,
    videoTypeDef,
    taskTypeDef,
    poapTypeDef,
    chatTypeDef,
    hostEventTypeDef,
    nfcTypeDef,
    streamInteractionTypeDef,
    channelTypeDef,
  ],
  resolvers: merge(
    resolvers,
    userResolvers,
    likeResolvers,
    videoResolvers,
    taskResolvers,
    poapResolvers,
    chatResolvers,
    hostEventResolvers,
    nfcResolvers,
    streamInteractionResolvers,
    channelResolvers
  ),
});
