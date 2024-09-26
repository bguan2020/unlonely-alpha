import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as streamInteractionService from "./streamInteractionService";

export const resolvers = {
  Query: {
    getStreamInteractions: (
      _: any,
      {
        data,
      }: {
        data: streamInteractionService.IGetStreamInteractionsInput;
      },
      ctx: Context
    ) => {
      return streamInteractionService.getStreamInteractions(
        data,
        ctx
      );
    },
    sendTts: (
      _: any,
      { data }: { data: streamInteractionService.ISendTtsInput },
      ctx: Context
    ) => {
      return streamInteractionService.sendTts(data);
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
    updateStreamInteraction: (
      _: any,
      {
        data,
      }: {
        data: streamInteractionService.IUpdateStreamInteractionInput;
      },
      ctx: Context
    ) => {
      return streamInteractionService.updateStreamInteraction(data, ctx);
    }
  },
  StreamInteraction: {
    owner: ({ ownerAddr }: { ownerAddr: string }, _: any, ctx: Context) => {
      return streamInteractionService.getOwner({ ownerAddr }, ctx);
    },
  },
};
