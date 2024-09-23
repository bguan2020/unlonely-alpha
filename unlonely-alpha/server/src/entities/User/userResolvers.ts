import { AuthenticationError } from "apollo-server-express";

import { Context } from "../../context";
import { authMessage } from "../../utils/auth";
import * as userService from "./userService";
// import { JSONResolver } from "graphql-scalars";

export const resolvers = {
  // JSON: JSONResolver,
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
    getUserChannelContract1155Mapping: (
      _: any,
      { data }: { data: userService.IGetUserInput },
      ctx: Context
    ) => {
      return userService.getUserChannelContract1155Mapping(data, ctx);
    },
    getUserPackageCooldownMapping: (
      _: any,
      { data }: { data: userService.IGetUserInput },
      ctx: Context
    ) => {
      return userService.getUserPackageCooldownMapping(data, ctx);
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
    getDoesUserAddressMatch: (
      _: any,
      { data }: { data: userService.IGetDoesUserAddressMatchInput },
      ctx: Context
    ) => {
      return userService.getDoesUserAddressMatch(data, ctx);
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
      // if (!ctx.user) {
      //   throw new AuthenticationError("Not authenticated");
      // }

      return userService.updateUser(data, ctx);
    },
    updateUsers: (
      _: any,
      { data }: { data: userService.IUpdateUsersInput },
      ctx: Context
    ) => {
      return userService.updateUsers(data, ctx);
    },
    updateUserChannelContract1155Mapping: (
      _: any,
      {
        data,
      }: { data: userService.IUpdateUserChannelContract1155MappingInput },
      ctx: Context
    ) => {
      if (!ctx.user) {
        throw new AuthenticationError("Not authenticated");
      }

      return userService.updateUserChannelContract1155Mapping(data, ctx);
    },
    updateUserPackageCooldownMapping: (
      _: any,
      {
        data,
      }: { data: userService.IUpdateUserPackageCooldownMappingInput },
      ctx: Context
    ) => {
      if (!ctx.user) {
        throw new AuthenticationError("Not authenticated");
      }

      return userService.updateUserPackageCooldownMapping(data, ctx);
    }
  },
};
