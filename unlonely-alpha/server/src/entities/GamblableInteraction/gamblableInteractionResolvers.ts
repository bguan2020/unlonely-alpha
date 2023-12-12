import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as gamblableInteractionService from "./gamblableInteractionService";

export const resolvers = {
  Query: {
    getGamblableEventLeaderboardByChannelId: (
      _: any,
      {
        data,
      }: {
        data: gamblableInteractionService.IGetGamblableEventLeaderboardByChannelInput;
      },
      ctx: Context
    ) => {
      return gamblableInteractionService.getGamblableEventLeaderboardByChannel(
        data,
        ctx
      );
    },
    getGamblableEventUserRank: (
      _: any,
      {
        data,
      }: {
        data: gamblableInteractionService.IGetGamblableEventUserRankInput;
      },
      ctx: Context
    ) => {
      return gamblableInteractionService.getGamblableEventUserRank(data, ctx);
    },
    getBadgeHoldersByChannel: (
      _: any,
      {
        data,
      }: { data: gamblableInteractionService.IGetBadgeHoldersByChannelInput },
      ctx: Context
    ) => {
      return gamblableInteractionService.getBadgeHoldersByChannel(data, ctx);
    },
    getChannelsByNumberOfBadgeHolders: (_: any, _args: any, ctx: Context) => {
      return gamblableInteractionService.getChannelsByNumberOfBadgeHolders(ctx);
    },
    getBetsByChannel: (
      _: any,
      { data }: { data: gamblableInteractionService.IGetBetsByChannelInput },
      ctx: Context
    ) => {
      return gamblableInteractionService.getBetsByChannel(data, ctx);
    },
    getBetsByUser: (
      _: any,
      { data }: { data: gamblableInteractionService.IGetBetsByUserInput },
      ctx: Context
    ) => {
      return gamblableInteractionService.getBetsByUser(data, ctx);
    },
    getUnclaimedEvents: (
      _: any,
      { data }: { data: gamblableInteractionService.IGetUnclaimedEvents },
      ctx: Context
    ) => {
      return gamblableInteractionService.getUnclaimedEvents(data, ctx);
    },
  },
  Mutation: {
    postBet: (
      _: any,
      { data }: { data: gamblableInteractionService.IPostBetInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return gamblableInteractionService.postBet(data, ctx);
    },
    postBetTrade: (
      _: any,
      { data }: { data: gamblableInteractionService.IPostBetTradeInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return gamblableInteractionService.postBetTrade(data, ctx);
    },
    postBadgeTrade: (
      _: any,
      { data }: { data: gamblableInteractionService.IPostBadgeTradeInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return gamblableInteractionService.postBadgeTrade(data, ctx);
    },
    postClaimPayout: (
      _: any,
      { data }: { data: gamblableInteractionService.IPostClaimPayoutInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return gamblableInteractionService.postClaimPayout(data, ctx);
    },
  },
};
