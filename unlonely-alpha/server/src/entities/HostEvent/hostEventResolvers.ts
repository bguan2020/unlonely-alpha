import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as hostEventService from "./hostEventService";
import * as likeService from "../Like/likeService";

export const resolvers = {
  Query: {
    getHostEventFeed(
      _: any,
      data: hostEventService.IGetHostEventFeedInput,
      ctx: Context
    ) {
      return hostEventService.getHostEventFeed(data, ctx);
    },
    getNextHostEvent(_: any, __: any, ctx: Context) {
      return hostEventService.getNextHostEvent(ctx);
    }
  },
  Mutation: {
    postChallenge: (
      _: any,
      { data }: { data: hostEventService.IPostChallengeInput },
      ctx: Context
    ) => {
      // if (!ctx.user || !ctx.userIsAuthed) {
      //   throw new AuthenticationError("User is not authenticated");
      // }

      return hostEventService.postChallenge(data, ctx);
    },
  },
  HostEvent: {
    owner: ({ ownerAddr }: { ownerAddr: string }, _: any, ctx: Context) => {
      return hostEventService.getOwner({ ownerAddr }, ctx);
    },
    challenge: (
      { challengerId }: { challengerId: number },
      _: any,
      ctx: Context
    ) => {
      if (!challengerId) {
        return null;
      }
      return hostEventService.getChallenger({ challengerId }, ctx);
    },
    liked: async ({ id }: { id: number }, _: any, ctx: Context) => {
      if (!ctx.user) {
        return null;
      }

      return likeService.isLiked(
        likeService.LikeObj.HOSTEVENT,
        id,
        ctx.user.address,
        ctx
      );
    },
    disliked: async ({ id }: { id: number }, _: any, ctx: Context) => {
      if (!ctx.user) {
        return null;
      }

      return likeService.isDisliked(id, ctx.user.address, ctx);
    },
  },
};
