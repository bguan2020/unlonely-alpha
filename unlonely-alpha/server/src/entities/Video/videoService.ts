import { Context } from "../../context";

export interface IGetVideoInput {
  youtubeId: string;
}

export const getVideo = ({ id }: { id: number }, ctx: Context) => {
  return ctx.prisma.video.findUnique({
    where: { id: Number(id) },
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
    orderBy: {
      createdAt: data.orderBy || undefined,
    },
  });
};

export const getOwner = (
  { ownerAddr }: { ownerAddr: string },
  ctx: Context
) => {
  return ctx.prisma.user.findUnique({ where: { address: ownerAddr } });
};
