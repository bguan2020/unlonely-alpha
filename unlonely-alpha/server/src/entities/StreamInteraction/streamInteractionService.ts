import { User } from "@prisma/client";
import { Context } from "../../context";
export interface IPostStreamInteractionInput {
  interactionType: string;
  text?: string;
  channelId: string;
}

export const postStreamInteraction = (
  data: IPostStreamInteractionInput,
  user: User,
  ctx: Context
) => {
  return ctx.prisma.streamInteraction.create({
    data: {
      interactionType: data.interactionType,
      text: data.text,
      owner: {
        connect: {
          address: user.address,
        },
      },
      channel: {
        connect: {
          id: Number(data.channelId),
        }
      }
    },
  });
};

export interface IGetRecentStreamInteractionsByChannelInput {
  channelId: string;
}

// getStreamInteractionsByChannel but only ones that were created less than 5 min ago
export const getRecentStreamInteractionsByChannel = (
  data: IGetRecentStreamInteractionsByChannelInput,
  ctx: Context
) => {
  return ctx.prisma.streamInteraction.findMany({
    where: {
      channel: {
        id: Number(data.channelId),
      },
      createdAt: {
        gt: new Date(Date.now() - 5 * 60 * 1000),
      },
      interactionType: "control-text",
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const getOwner = (
  { ownerAddr }: { ownerAddr: string },
  ctx: Context
) => {
  return ctx.prisma.user.findUnique({ where: { address: ownerAddr } });
};
