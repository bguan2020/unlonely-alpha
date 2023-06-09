import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as streamInteractionService from "./streamInteractionService";

export const resolvers = {
  Query: {
    getRecentStreamInteractionsByChannel: (
      _: any,
      {
        data,
      }: {
        data: streamInteractionService.IGetRecentStreamInteractionsByChannelInput;
      },
      ctx: Context
    ) => {
      return streamInteractionService.getRecentStreamInteractionsByChannel(
        data,
        ctx
      );
    },
  },
  Mutation: {
    postStreamInteraction: (
      _: any,
      { data }: { data: streamInteractionService.IPostStreamInteractionInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return streamInteractionService.postStreamInteraction(
        data,
        ctx.user,
        ctx
      );
    },
  },
};
