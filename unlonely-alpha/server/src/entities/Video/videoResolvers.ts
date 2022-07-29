import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as videoService from "./videoService";
import * as commentService from "../Comment/commentService";
import * as likeService from "../Like/likeService";

export const resolvers = {
  Query: {
    getVideo: (_: any, { id }: { id: number }, ctx: Context) => {
      return videoService.getVideo({ id: Number(id) }, ctx);
    },
    getVideoFeed(_: any, data: videoService.IGetVideoFeedInput, ctx: Context) {
      return videoService.getVideoFeed(data, ctx);
    },
  },
  Mutation: {
    postVideo: (
      _: any,
      { data }: { data: videoService.IPostVideoInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return videoService.postVideo(data, ctx.user, ctx);
    },
    softDeleteVideo: (_: any, { id }: { id: number }, ctx: Context) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return videoService.softDeleteVideo({ id: Number(id) }, ctx);
    },
    updateCurrentVideo: (_: any, { id }: { id: number }, ctx: Context) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return videoService.updateCurrentVideo({ id: Number(id) }, ctx);
    },
  },
  Video: {
    owner: ({ ownerAddr }: { ownerAddr: string }, _: any, ctx: Context) => {
      return videoService.getOwner({ ownerAddr }, ctx);
    },
    liked: async ({ id }: { id: number }, _: any, ctx: Context) => {
      if (!ctx.user) {
        return null;
      }

      return likeService.isLiked(id, ctx.user.address, ctx);
    },
    skipped: async ({ id }: { id: number }, _: any, ctx: Context) => {
      if (!ctx.user) {
        return null;
      }

      return likeService.isSkipped(id, ctx.user.address, ctx);
    },
    comments: (_: any, { id }: { id: number }, ctx: Context) => {
      return commentService.getCommentsByVideoId({ id }, ctx);
    },
  },
};
