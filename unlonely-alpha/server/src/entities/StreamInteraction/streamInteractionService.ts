import { User } from "@prisma/client";
import { Context } from "../../context";

export enum InteractionType {
  TTS_INTERACTION = "tts_interaction",
}

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
  console.log("postStreamInteraction", data, user);
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
        },
      },
    },
  });
};

export interface IUpdateStreamInteractionInput {
  interactionId: string;
  softDeleted: boolean;
}

  export const updateStreamInteraction = (
    data: IUpdateStreamInteractionInput,
    ctx: Context
  ) => {
    return ctx.prisma.streamInteraction.update({
      where: {
        id: Number(data.interactionId),
      },
      data: {
        softDelete: data.softDeleted,
      },
    });
  }

export interface IGetStreamInteractionsInput {
  channelId: string;
  interactionType?: InteractionType;
  orderBy: "asc" | "desc";
  softDeleted?: boolean;
}

// getStreamInteractions but only ones that were created less than 5 min ago
export const getStreamInteractions = (
  data: IGetStreamInteractionsInput,
  ctx: Context
) => {
  const whereClause = {
    channel: {
      id: Number(data.channelId),
    },
    ...(data.interactionType && { interactionType: data.interactionType }),
    ...(data.softDeleted !== undefined && { softDelete: data.softDeleted }),
  };

  return ctx.prisma.streamInteraction.findMany({
    where: whereClause,
    orderBy: {
      createdAt: data.orderBy,
    },
  });
};

export const getOwner = (
  { ownerAddr }: { ownerAddr: string },
  ctx: Context
) => {
  return ctx.prisma.user.findUnique({ where: { address: ownerAddr } });
};
