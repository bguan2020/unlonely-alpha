import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as videoService from "./videoService";
import * as commentService from "../Comment/commentService";

export const resolvers = {
  Query: {
    getVideo: (_: any, { id }: { id: number }, ctx: Context) => {
      return videoService.getVideo({ id: Number(id) }, ctx);
    },
    getVideoFeed(_: any, data: videoService.IGetVideoFeedInput, ctx: Context) {
      return videoService.getVideoFeed(data, ctx);
    },
  },
  Video: {
    comments: (_: any, { id }: { id: number }, ctx: Context) => {
      return commentService.getCommentsByVideoId({ id }, ctx);
    },
  },
};
