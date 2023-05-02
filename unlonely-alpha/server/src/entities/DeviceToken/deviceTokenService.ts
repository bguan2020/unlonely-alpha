import { User } from "@prisma/client";

import { Context } from "../../context";

export interface IPostDeviceTokenInput {
  token: string;
  notificationsLive?: boolean;
  notificationsNFCs?: boolean;
  address?: string;
}

export const postDeviceToken = (data: IPostDeviceTokenInput, ctx: Context) => {
  return ctx.prisma.deviceToken.create({
    data: {
      token: data.token,
      notificationsLive: data.notificationsLive,
      notificationsNFCs: data.notificationsNFCs,
      address: data.address,
    },
  });
};

export interface IGetDeviceByTokenInput {
  token: string;
}

export const getDeviceByToken = (
  data: IGetDeviceByTokenInput,
  ctx: Context
) => {
  return ctx.prisma.deviceToken.findUnique({
    where: {
      token: data.token,
    },
  });
};

export interface IUpdateDeviceTokenInput {
  token: string;
  notificationsLive: boolean;
  notificationsNFCs: boolean;
}

export const updateDeviceToken = (
  data: IUpdateDeviceTokenInput,
  user: User,
  ctx: Context
) => {
  if (user) {
    return ctx.prisma.deviceToken.update({
      where: {
        token: data.token,
      },
      data: {
        address: user.address,
        notificationsLive: data.notificationsLive,
        notificationsNFCs: data.notificationsNFCs,
      },
    });
  }
  return ctx.prisma.deviceToken.update({
    where: {
      token: data.token,
    },
    data: {
      notificationsLive: data.notificationsLive,
      notificationsNFCs: data.notificationsNFCs,
    },
  });
};

export const getAllDevices = (ctx: Context) => {
  return ctx.prisma.deviceToken.findMany();
};
