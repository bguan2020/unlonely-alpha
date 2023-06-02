import { User } from "@prisma/client";
import { Context } from "../../context";
export interface IPostStreamInteractionInput {
  interactionType: string;
  channelId: number;
}

export const postStreamInteraction = (
  data: IPostStreamInteractionInput,
  user: User,
  ctx: Context
) => {
  return ctx.prisma.streamInteraction.create({
    data: {
      interactionType: data.interactionType,
      owner: {
        connect: {
          address: user.address,
        },
      },
      channel: {
        connect: {
          id: data.channelId,
        },
      },
    },
  });
};

export const getOwner = (
  { ownerAddr }: { ownerAddr: string },
  ctx: Context
) => {
  return ctx.prisma.user.findUnique({ where: { address: ownerAddr } });
};
