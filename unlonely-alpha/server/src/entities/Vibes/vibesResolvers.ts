import { Context } from "../../context";
import * as vibesService from "./vibesService";

export const resolvers = {
  Query: {
    getStreamerVibesStat: async (
      _: any,
      { data }: { data: vibesService.IGetStreamerVibesStatInput },
      ctx: Context
    ) => {
      return await vibesService.getStreamerVibesStat(data);
    },
    getVibesTransactions: async (
      _: any,
      { data }: { data: vibesService.IGetVibesTransactionsInput },
      ctx: Context
    ) => {
      return await vibesService.getVibesTransactions(data);
    },
  },
  Mutation: {
    postVibesTrades: async (
      _: any,
      { data }: { data: vibesService.IPostVibesTradesInput },
      ctx: Context
    ) => {
      return await vibesService.postVibesTrades(data);
    },
  },
};
