import { User } from "@prisma/client";

import { Context } from "../../context";

export interface IHandleNFCInput {
  title: string;
}

export const handleNFC = async (data: IHandleNFCInput, ctx: Context, user: User) => {
  const numNFCsAllowed = user.powerUserLvl;
  if (numNFCsAllowed === 0) {
    throw new Error("User is not allowed to post NFCs");
  }

  //get date of most recent Monday at 12am
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  // check how many NFCs user has posted this week starting at 12am on Monday
  const numNFCsPostedThisWeek = await ctx.prisma.nFC.count({
    where: {
      ownerAddr: user.address,
      createdAt: {
        gte: monday,
      },
    }
  });

  if (numNFCsPostedThisWeek >= numNFCsAllowed) return -1;

  await ctx.prisma.nFC.create({
    data: {
      title: data.title,
      owner: {
        connect: {
          address: user.address,
        },
      },
    },
  });

  const remainingNFCs = numNFCsAllowed - numNFCsPostedThisWeek - 1;
  return remainingNFCs;
};


export interface IGetNFCFeedInput {
  limit: number;
  orderBy: "createdAt" | "score";
}

export const getNFCFeed = (
  data: IGetNFCFeedInput,
  ctx: Context
) => {
  if (data.orderBy = "createdAt") {
    return ctx.prisma.nFC.findMany({
      take: data.limit,
      orderBy: {
        createdAt: "desc",
      },
    });
  } else if (data.orderBy = "score") {
    return ctx.prisma.nFC.findMany({
      take: data.limit,
      orderBy: {
        score: "desc",
      },
    });
  }
};

export const getOwner = (
  { ownerAddr }: { ownerAddr: string },
  ctx: Context
) => {
  return ctx.prisma.user.findUnique({ where: { address: ownerAddr } });
};