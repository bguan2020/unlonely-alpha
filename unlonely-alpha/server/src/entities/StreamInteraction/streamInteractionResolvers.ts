import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as streamInteractionService from "./streamInteractionService";

export const resolvers = {
  Mutation: {
    postStreamInteraction: (
      _: any,
      { data }: { data: streamInteractionService.IPostStreamInteractionInput },
      ctx: Context
    ) => {
      // if (!ctx.user || !ctx.userIsAuthed) {
      //   throw new AuthenticationError("User is not authenticated");
      // }

      return streamInteractionService.postStreamInteraction(data, ctx); // add ctx.user
    },
  },*s
