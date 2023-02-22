import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as NFCService from "./NFCService";
import * as likeService from "../Like/likeService";

export const resolvers = {
  Query: {
    getNFCFeed(
      _: any,
      { data }: { data: NFCService.IGetNFCFeedInput },
      ctx: Context
    ) {
      return NFCService.getNFCFeed(data, ctx);
    },
    getNFC(_: any, { id }: { id: number }, ctx: Context) {
      return NFCService.getNFC({ id }, ctx);
    },
  },
  Mutation: {
    postNFC: (
      _: any,
      { data }: { data: NFCService.IPostNFCInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return NFCService.postNFC(data, ctx, ctx.user);
    },
    createClip: (
      _: any,
      { data }: { data: NFCService.ICreateClipInput },
      ctx: Context
    ) => {
      return NFCService.createClip(data);
    },
    openseaNFCScript: async (_: any, __: any, ctx: Context) => {
      return NFCService.openseaNFCScript(ctx);
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

      return likeService.isLiked(
        likeService.LikeObj.NFC,
        id,
        ctx.user.address,
        ctx
      );
    },
  },
};
