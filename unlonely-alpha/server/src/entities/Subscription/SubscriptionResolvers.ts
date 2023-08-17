import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as SubscriptionService from "./SubscriptionService";

export const resolvers = {
  Query: {
    getAllActiveSubscriptions: async (_: any, __: any, ctx: Context) => {
      return SubscriptionService.getAllActiveSubscriptions(ctx);
    },
    sendAllNotifications: async (_: any, __: any, ctx: Context) => {
      return SubscriptionService.sendAllNotifications(ctx);
    }
  },
  Mutation: {
    postSubscription: (
      _: any,
      { data }: { data: SubscriptionService.IPostSubscriptionInput },
      ctx: Context
    ) => {
      return SubscriptionService.postSubscription(data, ctx);
    },
    softDeleteSubscription: (
      _: any,
      { data }: { data: SubscriptionService.ISoftDeleteSubscriptionInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return SubscriptionService.softDeleteSubscription(data, ctx);
    }
  },
};
