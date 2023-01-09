import { User } from "@prisma/client";
import axios from "axios";

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
    },
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

  // const { assets } = await fetch(
  //   "https://api.opensea.io/api/v1/assets?asset_contract_address=0x55d78c09a0a8f0136392eb493a9aecc9c0ded225"
  // ).then((res) => res.json());
  // write opensea api request using axios
  // const response = await axios.get(
  //   "https://api.opensea.io/api/v1/assets?asset_contract_address=0x55d78c09a0a8f0136392eb493a9aecc9c0ded225&limit=200"
  // );
  // console.log(response);
  const assets = opensea.assets;

  // compare each nfc to each opensea asset where nfc.title === asset.name and update nfc.videoLink and nfc.videoThumbnail
  try {
    for (let i = 0; i < nfc.length; i++) {
      console.log("hit this");
      for (let j = 0; j < assets.length; j++) {
        console.log("hit this");
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
