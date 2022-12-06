import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as videoService from "./videoService";

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
  },
  Video: {
    owner: ({ ownerAddr }: { ownerAddr: string }, _: any, ctx: Context) => {
      return videoService.getOwner({ ownerAddr }, ctx);
    },
  },
};
