import { User } from "@prisma/client";

import { Context } from "../../context";

export interface IPostSubscriptionInput {
  userId: number;
  endpoint: string;
  expirationTime?: Date;
  p256dh: string;
  auth: string;
}

export interface ISoftDeleteSubscriptionInput {
  id: number;
}

export const postSubscription = async (
  data: IPostSubscriptionInput,
  ctx: Context,
  user: User
) => {
  return await ctx.prisma.subscription.create({
    data: {
      user: {
        connect: {
          address: user.address,
        },
      },
      endpoint: data.endpoint,
      expirationTime: data.expirationTime,
      p256dh: data.p256dh,
      auth: data.auth,
    },
  });
};

export const softDeleteSubscription = async (
  data: ISoftDeleteSubscriptionInput,
  ctx: Context
) => {
  return await ctx.prisma.subscription.update({
    where: {
      id: data.id,
    },
    data: {
      softDelete: true,
    },
  });
};

export const getAllActiveSubscriptions = async (ctx: Context) => {
  return await ctx.prisma.subscription.findMany({
    where: {
      softDelete: false,
    },
  });
};

export const getOwner = (
  { ownerAddr }: { ownerAddr: string },
  ctx: Context
) => {
  return ctx.prisma.user.findUnique({ where: { address: ownerAddr } });
};