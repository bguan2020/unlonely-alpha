import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as gamblableInteractionService from "./gamblableInteractionService";

export const resolvers = {
  Query: {
    getBadgeHoldersByChannel: (
      _: any,
      {
        data,
      }: { data: gamblableInteractionService.IGetBadgeHoldersByChannelInput },
      ctx: Context
    ) => {
      return gamblableInteractionService.getBadgeHoldersByChannel(data, ctx);
    },
    getChannelsByNumberOfBadgeHolders: (_: any, ctx: Context) => {
      return gamblableInteractionService.getChannelsByNumberOfBadgeHolders(ctx);
    },
  },
  Mutation: {
    createBet: (
      _: any,
      { data }: { data: gamblableInteractionService.ICreateBetInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return gamblableInteractionService.createBet(data, ctx);
    },
    recordBetBuy: (
      _: any,
      { data }: { data: gamblableInteractionService.IRecordBetBuyInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return gamblableInteractionService.recordBetBuy(data, ctx);
    },
    recordBadgeTrade: (
      _: any,
      { data }: { data: gamblableInteractionService.IRecordBadgeTradeInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return gamblableInteractionService.recordBadgeTrade(data, ctx);
    },
  },
};
