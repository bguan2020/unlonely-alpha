import { Context } from "../../context";
import * as vibesService from "./vibesService";

export const resolvers = {
  Query: {
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
