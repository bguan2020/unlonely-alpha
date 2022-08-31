import { User } from "@prisma/client";

import { Context } from "../../context";

export interface IPostTaskInput {
  taskType: string;
  youtubeId: string;
  title: string;
  thumbnail: string;
  description: string;
  link: string;
}

export const postTask = (data: IPostTaskInput, user: User, ctx: Context) => {
  return ctx.prisma.task.create({
    data: {
      taskType: data.taskType,
      youtubeId: data.youtubeId,
      title: data.title,
      thumbnail: data.thumbnail,
      description: data.description,
      link: data.link,
      owner: {
        connect: { address: user.address },
      },
    },
  });
};

export interface IGetTaskFeedInput {
  searchString: string;
  skip: number;
  limit: number;
  orderBy: "asc" | "desc";
}

export const getTaskFeed = (data: IGetTaskFeedInput, ctx: Context) => {
  return ctx.prisma.task.findMany({
    take: data.limit || undefined,
    skip: data.skip || undefined,
    where: { isDeleted: false },
    orderBy: [
      {
        createdAt: "desc",
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
