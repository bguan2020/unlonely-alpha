import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as baseLeaderboardService from "./baseLeaderboardService";

export const resolvers = {
  Query: {
    getBaseLeaderboard: (_: any, __: any, ctx: Context) => {
      return baseLeaderboardService.getBaseLeaderboard(ctx);
    },
  },
  Mutation: {
    postBaseLeaderboard: (
      _: any,
      { data }: { data: baseLeaderboardService.IPostBaseLeaderboardInput },
      ctx: Context
    ) => {
      if (!ctx.user) {
        throw new AuthenticationError("User is not authenticated");
      }
      return baseLeaderboardService.postBaseLeaderboard(data, ctx);
    },
  },
  BaseLeaderboard: {
    owner: ({ ownerAddr }: { ownerAddr: string }, _: any, ctx: Context) => {
      return baseLeaderboardService.getOwner({ ownerAddr }, ctx);
    },
  },
};
