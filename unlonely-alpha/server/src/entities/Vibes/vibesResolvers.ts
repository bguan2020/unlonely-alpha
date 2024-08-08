import { Context } from "../../context";
import * as vibesService from "./vibesService";

export const resolvers = {
  Query: {
    getStreamerVibesStat: async (
      _: any,
      { data }: { data: vibesService.IGetStreamerVibesStatInput },
      ctx: Context
    ) => {
      return await vibesService.getStreamerVibesStat(data, ctx);
    },
    getVibesTransactions: async (
      _: any,
      { data }: { data: vibesService.IGetVibesTransactionsInput },
      ctx: Context
    ) => {
      return await vibesService.getVibesTransactions(data, ctx);
    },
  },
  Mutation: {
    postVibesTrades: async (
      _: any,
      { data }: { data: vibesService.IPostVibesTradesInput },
      ctx: Context
    ) => {
      return await vibesService.postVibesTrades(data, ctx);
    },
  },
};
