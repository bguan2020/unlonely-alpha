import { Context } from "../../context";
import * as deviceTokenService from "./deviceTokenService";

export const resolvers = {
  Query: {
    getDeviceByToken: (
      _: any,
      { data }: { data: deviceTokenService.IGetDeviceByTokenInput },
      ctx: Context
    ) => {
      return deviceTokenService.getDeviceByToken(data, ctx);
    },
    getAllDevices: (_: any, _args: any, ctx: Context) => {
      return deviceTokenService.getAllDevices(ctx);
    },
  },
  Mutation: {
    postDeviceToken: (
      _: any,
      { data }: { data: deviceTokenService.IPostDeviceTokenInput },
      ctx: Context
    ) => {
      return deviceTokenService.postDeviceToken(data, ctx);
    },
    updateDeviceToken: (
      _: any,
      { data }: { data: deviceTokenService.IUpdateDeviceTokenInput },
      ctx: Context
    ) => {
      if (ctx.user) {
        return deviceTokenService.updateDeviceToken(data, ctx.user, ctx);
      }
      return deviceTokenService.updateDeviceToken(data, null, ctx);
    },
  },
};
