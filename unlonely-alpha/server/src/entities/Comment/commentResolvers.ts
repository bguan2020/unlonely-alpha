import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as commentService from "./commentService";
import * as likeService from "../Like/likeService";
import * as videoService from "../Video/videoService";

export const resolvers = {
  Mutation: {
    postComment: (
      _: any,
      { data }: { data: commentService.IPostCommentInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return commentService.postComment(data, ctx.user, ctx);
    },
  },
  Comment: {
    owner: ({ ownerAddr }: { ownerAddr: string }, _: any, ctx: Context) => {
      return commentService.getOwner({ ownerAddr }, ctx);
    },
    liked: async ({ id }: { id: number }, _: any, ctx: Context) => {
      if (!ctx.user) {
        return null;
      }

      return likeService.isLiked(id, ctx.user.address, ctx);
    },
    video: ({ videoId }: { videoId: number }, _: any, ctx: Context) => {
      return videoService.getVideo({ id: videoId }, ctx);
    },
  },
};
