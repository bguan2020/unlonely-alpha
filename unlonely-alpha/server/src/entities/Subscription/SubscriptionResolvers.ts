import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as SubscriptionService from "./SubscriptionService";

export const resolvers = {
  Query: {
    getAllActiveSubscriptions: async (_: any, __: any, ctx: Context) => {
      return SubscriptionService.getAllActiveSubscriptions(ctx);
    },
    sendAllNotifications: async (
      _: any,
      { data }: { data: SubscriptionService.ISendAllNotificationsInput },
      ctx: Context
    ) => {
      if (!ctx.user) {
        throw new AuthenticationError("You must be logged in");
      }
      return SubscriptionService.sendAllNotifications(ctx, data);
    },
    checkSubscriptionByEndpoint: async (
      _: any,
      { data }: { data: SubscriptionService.IToggleSubscriptionInput },
      ctx: Context
    ) => {
      return SubscriptionService.checkSubscriptionByEndpoint(data, ctx);
    },
  },
  Mutation: {
    addChannelToSubscription: (
      _: any,
      { data }: { data: SubscriptionService.IAddChannelToSubscriptionInput },
      ctx: Context
    ) => {
      return SubscriptionService.addChannelToSubscription(data, ctx);
    },
    removeChannelFromSubscription: (
      _: any,
      {
        data,
      }: { data: SubscriptionService.IRemoveChannelFromSubscriptionInput },
      ctx: Context
    ) => {
      return SubscriptionService.removeChannelFromSubscription(data, ctx);
    },
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
      return SubscriptionService.softDeleteSubscription(data, ctx);
    },
    toggleSubscription: async (
      _: any,
      { data }: { data: SubscriptionService.IToggleSubscriptionInput },
      ctx: Context
    ) => {
      return SubscriptionService.toggleSubscription(data, ctx);
    },
  },
};
