import { User } from "@prisma/client";

import { Context } from "../../context";
import opensea from "./opensea.json";

export interface IHandleNFCInput {
  title: string;
}

export const handleNFC = async (
  data: IHandleNFCInput,
  ctx: Context,
  user: User
) => {
  const numNFCsAllowed = user.powerUserLvl * 2 + 1;
  if (numNFCsAllowed === 0) {
    throw new Error("User is not allowed to post NFCs");
  }

  // check how many NFCs user has posted today starting at 12am PST
  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));

  const numNFCsPostedToday = await ctx.prisma.nFC.count({
    where: {
      ownerAddr: user.address,
      createdAt: {
        gte: startOfToday,
      },
    },
  });

  if (numNFCsPostedToday >= 1) return -1;

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

  const remainingNFCs = 0;
  return remainingNFCs;
};

export interface IGetNFCFeedInput {
  offset: number;
  limit: number;
  orderBy: "createdAt" | "score";
}

export const getNFCFeed = (data: IGetNFCFeedInput, ctx: Context) => {
  if (data.orderBy === "createdAt") {
    return ctx.prisma.nFC.findMany({
      take: data.limit,
      skip: data.offset,
      // where videoLink is not empty
      where: {
        videoLink: {
          not: "",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } else if (data.orderBy === "score") {
    return ctx.prisma.nFC.findMany({
      take: data.limit,
      skip: data.offset,
      where: {
        videoLink: {
          not: "",
        },
      },
      orderBy: {
        score: "desc",
      },
    });
  }
};

export const getNFC = ({ id }: { id: number }, ctx: Context) => {
  return ctx.prisma.nFC.findUnique({
    where: { id: Number(id) },
  });
};

export const getOwner = (
  { ownerAddr }: { ownerAddr: string },
  ctx: Context
) => {
  return ctx.prisma.user.findUnique({ where: { address: ownerAddr } });
};

export const openseaNFCScript = async (ctx: Context) => {
  // where videoThumbnail is empty
  const nfc = await ctx.prisma.nFC.findMany({
    where: {
      openseaLink: {
        equals: "",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const assets = opensea.assets;
  console.log("num of NFCs ", assets.length);

  // compare each nfc to each opensea asset where nfc.title === asset.name and update nfc.videoLink and nfc.videoThumbnail
  try {
    for (let i = 0; i < nfc.length; i++) {
      for (let j = 0; j < assets.length; j++) {
        if (nfc[i].title?.trim() === assets[j].name?.trim()) {
          console.log("match found", nfc[i].title, assets[j].name);
          await ctx.prisma.nFC.update({
            where: {
              id: nfc[i].id,
            },
            data: {
              videoLink: assets[j].animation_url,
              videoThumbnail: assets[j].image_thumbnail_url,
              openseaLink: assets[j].permalink,
            },
          });
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};
