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
    getNFCByTokenData(
      _: any,
      { data }: { data: NFCService.IGetNFCByTokenDataInput },
      ctx: Context
    ) {
      return NFCService.getNFCByTokenData(data, ctx);
    },
    getLivepeerClipData(
      _: any,
      { data }: { data: NFCService.IGetLivepeerClipDataInput }
    ) {
      return NFCService.getLivepeerClipData(data);
    },
    getUniqueContract1155Addresses(
      _: any,
      { data }: { data: NFCService.IGetUniqueContract1155AddressesInput },
      ctx: Context
    ) {
      return NFCService.getUniqueContract1155Addresses(data, ctx);
    },
  },
  Mutation: {
    postNFC(
      _: any,
      { data }: { data: NFCService.IPostNFCInput },
      ctx: Context
    ) {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return NFCService.postNFC(data, ctx, ctx.user);
    },
    createClip(
      _: any,
      { data }: { data: NFCService.ICreateClipInput },
      ctx: Context
    ) {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return NFCService.createClip(data, ctx, ctx.user);
    },
    createLivepeerClip(
      _: any,
      { data }: { data: NFCService.ICreateLivepeerClipInput },
      ctx: Context
    ) {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return NFCService.createLivepeerClip(data, ctx, ctx.user);
    },
    requestUploadFromLivepeer(
      _: any,
      { data }: { data: NFCService.IRequestUploadFromLivepeerInput }
    ) {
      return NFCService.requestUploadFromLivepeer(data);
    },
    trimVideo(_: any, { data }: { data: NFCService.ITrimVideoInput }) {
      return NFCService.trimVideo(data);
    },
    concatenateOutroToTrimmedVideo(
      _: any,
      { data }: { data: NFCService.IConcatenateOutroToTrimmedVideoInput }
    ) {
      return NFCService.concatenateOutroToTrimmedVideo(data);
    },
    openseaNFCScript: async (_: any, __: any, ctx: Context) => {
      return NFCService.openseaNFCScript(ctx);
    },
    // updateOpenseaLink: async (
    //   _: any,
    //   __: any,
    //   ctx: Context
    // ) => {
    //   return NFCService.updateOpenseaLink(ctx);
    // }
    updateNFC(
      _: any,
      { data }: { data: NFCService.IUpdateNFCInput },
      ctx: Context
    ) {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return NFCService.updateNFC(data, ctx);
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
