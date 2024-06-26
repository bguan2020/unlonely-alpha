import { AuthenticationError } from "apollo-server-express";

import { Context } from "../../context";
import { authMessage } from "../../utils/auth";
import * as userService from "./userService";

export const resolvers = {
  User: {
    authedAsMe: (
      { address }: { address: string },
      _args: any,
      ctx: Context
    ) => {
      return ctx.user && ctx.user.address === address && ctx.userIsAuthed;
    },
  },
  Query: {
    currentUser: (_: any, _args: any, ctx: Context) => {
      return ctx.user;
    },
    currentUserAuthMessage: (_: any, _args: any, ctx: Context) => {
      if (!ctx.user) {
        return null;
      }

      return authMessage({
        address: ctx.user.address,
        sigTimestamp: ctx.user.sigTimestamp,
      });
    },
    getLeaderboard: (_: any, _args: any, ctx: Context) => {
      return userService.getLeaderboard(ctx);
    },
    getUser: (
      _: any,
      { data }: { data: userService.IGetUserInput },
      ctx: Context
    ) => {
      return userService.getUser(data, ctx);
    },
    getAllUsers: (_: any, _args: any, ctx: Context) => {
      return userService.getAllUsers(ctx);
    },
    getAllUsersWithChannel: (_: any, _args: any, ctx: Context) => {
      return userService.getAllUsersWithChannel(ctx);
    },
    getAllUsersWithNotificationsToken: (_: any, _args: any, ctx: Context) => {
      return userService.migrateAllUsersWithNotificationsToken(ctx);
    },
    // updateAllUsers: (_: any, _args: any, ctx: Context) => {
    //   return userService.updateAllUsers(ctx);
    // },
    getUserTokenHolding: (
      _: any,
      { data }: { data: userService.IGetUserTokenHoldingInput },
      ctx: Context
    ) => {
      return userService.getUserTokenHolding(data, ctx);
    },
  },
  Mutation: {
    updateUserNotifications: (
      _: any,
      { data }: { data: userService.IUpdateUserNotificationsInput },
      ctx: Context
    ) => {
      if (!ctx.user) {
        throw new AuthenticationError("Not authenticated");
      }

      return userService.updateUserNotifications(data, ctx.user, ctx);
    },
    updateUser: (
      _: any,
      { data }: { data: userService.IUpdateUserInput },
      ctx: Context
    ) => {
      if (!ctx.user) {
        throw new AuthenticationError("Not authenticated");
      }

      return userService.updateUser(data, ctx);
    },
  },
};
