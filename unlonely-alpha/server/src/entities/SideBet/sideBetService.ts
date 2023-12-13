import { Context } from "../../context";

export type IGetSideBetByIdInput = {
  id: string;
};

export type IGetSideBetByUserInput = {
  userAddress: string;
};

export type IGetSideBetByChannelIdInput = {
  id: string;
};

export type IPostSideBetInput = {
  channelId: string;
  chainId: number;
  wagerDescription: string;
  creatorAddress: string;
  opponentAddress: string;
};

export type IUpdateSideBetInput = {
  id: string;
  wagerDescription: string;
  creatorAddress: string;
  opponentAddress: string;
};

export type ICloseSideBetInput = {
  id: string;
};

export const getSideBetById = async (
  data: IGetSideBetByIdInput,
  ctx: Context
) => {
  return await ctx.prisma.sideBet.findUnique({
    where: {
      id: Number(data.id),
    },
  });
};

export const getSideBetByUser = async (
  data: IGetSideBetByUserInput,
  ctx: Context
) => {
  return await ctx.prisma.sideBet.findMany({
    where: {
      OR: [
        {
          creatorAddress: data.userAddress,
        },
        {
          opponentAddress: data.userAddress,
        },
      ],
    },
  });
};

export const getSideBetByChannelId = async (
  data: IGetSideBetByChannelIdInput,
  ctx: Context
) => {
  return await ctx.prisma.sideBet.findMany({
    where: {
      channelId: Number(data.id),
    },
  });
};

export const postSideBet = async (data: IPostSideBetInput, ctx: Context) => {
  return await ctx.prisma.sideBet.create({
    data: {
      channel: {
        connect: {
          id: Number(data.channelId),
        },
      },
      chainId: data.chainId,
      creatorAddress: data.creatorAddress,
      opponentAddress: data.opponentAddress,
      wagerDescription: data.wagerDescription,
    },
  });
};

export const updateSideBet = async (
  data: IUpdateSideBetInput,
  ctx: Context
) => {
  return await ctx.prisma.sideBet.update({
    where: {
      id: Number(data.id),
    },
    data: {
      wagerDescription: data.wagerDescription,
      creatorAddress: data.creatorAddress,
      opponentAddress: data.opponentAddress,
    },
  });
};

export const closeSideBet = async (data: ICloseSideBetInput, ctx: Context) => {
  return await ctx.prisma.sideBet.update({
    where: {
      id: Number(data.id),
    },
    data: {
      softDelete: true,
    },
  });
};
