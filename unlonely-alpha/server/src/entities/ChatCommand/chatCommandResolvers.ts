import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as channelService from "./chatCommandService";

export const resolvers = {
  Mutation: {
    updateDeleteChannelChatCommands: (
      _: any,
      { data }: { data: channelService.IUpdateDeleteChatCommandInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return channelService.updateDeleteChannelChatCommands(data, ctx);
    },
  }
};
