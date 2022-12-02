import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as NFCService from "./NFCService";
import * as likeService from "../Like/likeService";

export const resolvers = {
  Query: {
    getNFCFeed(_: any, data: NFCService.IGetNFCFeedInput, ctx: Context) {
      return NFCService.getNFCFeed(data, ctx);
    },
    getNFC(_: any, { id }: { id: number }, ctx: Context) {
      return NFCService.getNFC({ id }, ctx);
    },
  },
  Mutation: {
    handleNFC: (
      _: any,
      { data }: { data: NFCService.IHandleNFCInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return NFCService.handleNFC(data, ctx, ctx.user);
    },
  },
  NFC: {
    owner: ({ ownerAddr }: { ownerAddr: string }, _: any, ctx: Context) => {
      return NFCService.getOwner({ ownerAddr }, ctx);
    },
    liked: async ({ id }: { id: number }, _: any, ctx: Context) => {
      if (!ctx.user) {
        return null;
      }

      return likeService.isLiked(id, ctx.user.address, ctx);
    },
    disliked: async ({ id }: { id: number }, _: any, ctx: Context) => {
      if (!ctx.user) {
        return null;
      }

      return likeService.isDisliked(id, ctx.user.address, ctx);
    },
  },
};
