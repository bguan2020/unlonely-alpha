import * as eventLeaderboardService from "./eventLeaderboardService";
import { Context } from "../../context";

export const resolvers = {
  Query: {
    getEventLeaderboardByChannelId: (
      _: any,
      { channelId }: { channelId: number },
      ctx: Context
    ) => {
      return eventLeaderboardService.getEventLeaderboardByChannel(
        { channelId },
        ctx
      );
    },
  },
};
