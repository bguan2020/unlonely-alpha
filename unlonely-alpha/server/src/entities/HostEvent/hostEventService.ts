import { User } from "@prisma/client";

import { Context } from "../../context";

export interface IPostChallengeInput {
  originalHostEventId: number;
  hostDate: Date;
  title: string;
  description: string;
}

export const postChallenge = (data: IPostChallengeInput, ctx: Context) => {
  // update the original host event to have a challenger
  return ctx.prisma.hostEvent.update({
    where: {
      id: data.originalHostEventId,
    },
    data: {
      challenger: {
        create: {
          hostDate: data.hostDate,
          title: data.title,
          description: data.description,
          score: 0,
          owner: {
            connect: {
              address: ctx.user?.address,
            },
          },
          isChallenger: true,
        },
      },
    },
  });
};

export interface IGetHostEventFeedInput {
  limit: number;
  orderBy: "asc" | "desc";
}

export const getHostEventFeed = (
  data: IGetHostEventFeedInput,
  ctx: Context
) => {
  // only return host events where hostevent.hostdate less than 24 hours ago

  return ctx.prisma.hostEvent.findMany({
    where: {
      isChallenger: false,
      hostDate: {
        gte: new Date(Date.now() - 4 * 72 * 60 * 60 * 1000),
      },
    },
    take: data.limit || undefined,
    orderBy: [
      {
        hostDate: "asc",
      },
    ],
  });
};

export const getNextHostEvent = (ctx: Context) => {
  return ctx.prisma.hostEvent.findFirst({
    where: {
      isChallenger: false,
      hostDate: {
        gt: new Date(),
      },
    },
    orderBy: [
      {
        hostDate: "asc",
      },
    ],
  });
};

export const getOwner = (
  { ownerAddr }: { ownerAddr: string },
  ctx: Context
) => {
  return ctx.prisma.user.findUnique({ where: { address: ownerAddr } });
};

export const getChallenger = (
  { challengerId }: { challengerId: number },
  ctx: Context
) => {
  return ctx.prisma.hostEvent.findUnique({ where: { id: challengerId } });
};
