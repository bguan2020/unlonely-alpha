import { User } from "@prisma/client";

import { Context } from "../../context";

export interface IGetVideoInput {
  youtubeId: string;
}

export const getVideo = ({ id }: { id: number }, ctx: Context) => {
  return ctx.prisma.video.findUnique({
    where: { id: Number(id) },
  });
};

export const softDeleteVideo = ({ id }: { id: number }, ctx: Context) => {
  return ctx.prisma.video.update({
    where: { id: Number(id) },
    data: { isDeleted: true },
  });
};

export const updateCurrentVideo = ({ id }: { id: number }, ctx: Context) => {
  return ctx.prisma.video.update({
    where: { id: Number(id) },
    data: { currentVideo: true },
  });
};

export interface IPostVideoInput {
  youtubeId: string;
  title: string;
  thumbnail: string;
  description: string;
}

export const postVideo = (data: IPostVideoInput, user: User, ctx: Context) => {
  return ctx.prisma.video.create({
    data: {
      youtubeId: data.youtubeId,
      title: data.title,
      thumbnail: data.thumbnail,
      description: data.description,
      owner: {
        connect: { address: user.address },
      },
    },
  });
};

export interface IGetVideoFeedInput {
  searchString: string;
  skip: number;
  limit: number;
  orderBy: "asc" | "desc";
}

export const getVideoFeed = (data: IGetVideoFeedInput, ctx: Context) => {
  return ctx.prisma.video.findMany({
    take: data.limit || undefined,
    skip: data.skip || undefined,
    where: { isDeleted: false },
    orderBy: [{
      score: "desc",
    },
    {
      createdAt: "asc",
    }],
  });
};

export const getOwner = (
  { ownerAddr }: { ownerAddr: string },
  ctx: Context
) => {
  return ctx.prisma.user.findUnique({ where: { address: ownerAddr } });
};
