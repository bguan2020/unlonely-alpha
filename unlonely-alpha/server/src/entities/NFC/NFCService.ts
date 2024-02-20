import { User } from "@prisma/client";
import * as AWS from "aws-sdk";
import axios from "axios";

import { Context } from "../../context";
import { getLivepeerThumbnail } from "../Channel/channelService";
import opensea from "./opensea.json";

interface ClipData {
  startTime: number;
  endTime: number;
  playbackId: string;
  name?: string;
}

interface ClipResponse {
  task: {
    id: string;
  };
  asset: {
    id: string;
    playbackId: string;
    userId: string;
    createdAt: number;
    status: {
      phase: string;
      updatedAt: number;
    };
    name: string;
    source: {
      type: string;
      sessionId: string;
    };
    objectStoreId: string;
  };
}

export interface IPostNFCInput {
  channelId: string;
  title: string;
  videoLink: string;
  videoThumbnail: string;
  openseaLink: string;
}

export interface IUpdateNFCInput {
  id: number;
  title: string;
  videoLink: string;
  videoThumbnail: string;
  openseaLink: string;
}

export interface ICreateClipInput {
  title: string;
  channelId: string;
  channelArn: string;
}

export interface ICreateLivepeerClipInput {
  title: string;
  channelId: string;
  livepeerPlaybackId: string;
}

export const postNFC = async (
  data: IPostNFCInput,
  ctx: Context,
  user: User
) => {
  return await ctx.prisma.nFC.create({
    data: {
      title: data.title,
      videoLink: data.videoLink,
      videoThumbnail: data.videoThumbnail,
      openseaLink: data.openseaLink,
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

export const updateNFC = async (data: IUpdateNFCInput, ctx: Context) => {
  return await ctx.prisma.nFC.update({
    where: {
      id: Number(data.id),
    },
    data: {
      title: data.title,
      videoLink: data.videoLink,
      videoThumbnail: data.videoThumbnail,
      openseaLink: data.openseaLink,
    },
  });
};

// function that gets all NFCS where nfc.openseaLink starts with "https://opensea.io/assets/0xC7E230CE8d67B2ad116208c69d616dD6bFC96a8d" and updates it to "https://opensea.io/assets/ethereum/0xC7E230CE8d67B2ad116208c69d616dD6bFC96a8d/41"
export const updateOpenseaLink = async (ctx: Context) => {
  const nFCs = await ctx.prisma.nFC.findMany({
    where: {
      openseaLink: {
        startsWith:
          "https://opensea.io/assets/0xC7E230CE8d67B2ad116208c69d616dD6bFC96a8d",
      },
    },
  });
  for (const nFC of nFCs) {
    const tokenId = nFC.openseaLink?.split("/")[5];
    console.log(tokenId, nFC.id, nFC.openseaLink);
    const newOpenseaLink = `https://opensea.io/assets/ethereum/0xC7E230CE8d67B2ad116208c69d616dD6bFC96a8d/${tokenId}`;
    await ctx.prisma.nFC.update({
      where: {
        id: nFC.id,
      },
      data: {
        openseaLink: newOpenseaLink,
      },
    });
    console.log("updated  ", nFC.id, " to ", newOpenseaLink);
  }
};

export const createClip = async (
  data: ICreateClipInput,
  ctx: Context,
  user: User
) => {
  const recordingConfigArn =
    "arn:aws:ivs:us-west-2:500434899882:recording-configuration/vQ227qqHmVtp";
  // first call lambda
  const lambda = new AWS.Lambda({
    region: "us-west-2",
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  const params = {
    FunctionName: "sendClipToMediaConvert",
    Payload: JSON.stringify({
      detail: {
        "channel-arn": data.channelArn,
        "recording-config-arn": recordingConfigArn,
      },
    }),
  };

  let lambdaResponse: any;
  const id = Date.now();
  console.log(
    "createClip calling lambda at time",
    new Date(Date.now()).toISOString(),
    `id:${id}`
  );
  try {
    lambdaResponse = await lambda.invoke(params).promise();
    console.log(
      "createClip lambda response at time,",
      new Date(Date.now()).toISOString(),
      `id:${id}`,
      `${(Date.now() - id) / 1000}s`,
      lambdaResponse.Payload
    );
    const response = JSON.parse(lambdaResponse.Payload);
    // if response contains "errorMessage" field, then there was an error and return message
    if (response.errorMessage) {
      console.log(
        `createClip lambda function error encountered:, id:${id}`,
        response.errorMessage
      );
      return { errorMessage: response.errorMessage };
    }
    const url = response.body.url;
    const thumbnail = response.body.thumbnail;
    const res = await postNFC(
      {
        title: data.title,
        videoLink: url,
        videoThumbnail: thumbnail,
        openseaLink: "",
        channelId: data.channelId,
      },
      ctx,
      user
    );
    return { url, thumbnail, ...res };
  } catch (e) {
    console.log(`createClip Error invoking lambda, id:${id}`, e);
    return { errorMessage: "Error invoking lambda" };
  }
};

export const createLivepeerClip = async (
  data: ICreateLivepeerClipInput,
  ctx: Context,
  user: User
) => {
  const endTime = Date.now();
  const startTime = endTime - 30000; // 30 seconds before the endTime in milliseconds
  const clipData: ClipData = {
    startTime,
    endTime,
    playbackId: data.livepeerPlaybackId,
    name: data.title,
  };
  const headers = {
    Authorization: `Bearer ${process.env.STUDIO_API_KEY}`,
    "Content-Type": "application/json",
  };
  console.log(
    "createLivepeerClip calling livepeer at time",
    new Date(Date.now()).toISOString(),
    `id:${endTime}`
  );
  try {
    const response = await axios.post(
      "https://livepeer.studio/api/clip",
      clipData,
      {
        headers,
      }
    );
    console.log(
      "createLivepeerClip livepeer response at time,",
      new Date(Date.now()).toISOString(),
      `id:${endTime}`,
      `${(Date.now() - endTime) / 1000}s`,
      response
    );
    const responseData: ClipResponse = response.data;
    let asset = null;
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      const poll = await fetch(
        `https://livepeer.studio/api/asset/${responseData.asset.id}`,
        {
          method: "GET",
          headers,
        }
      );
      const res = await poll.json();
      if (res.status.phase === "ready") {
        asset = res;
        break;
      }
      if (res.status.phase === "failed") {
        return {
          errorMessage:
            "createLivepeerClip Error livepeer could not create clip",
        };
      }
    }
    console.log(
      "createLivepeerClip fetching playback,",
      new Date(Date.now()).toISOString(),
      `id:${endTime}`
    );
    const playbackData: any = await fetch(
      `https://livepeer.studio/api/playback/${asset.playbackId}`,
      { headers }
    ).then((res) => res.json());

    const playBackUrl = playbackData.meta.source[0].url;

    const thumbNailUrl = await getLivepeerThumbnail(asset.playbackId);

    const res = await postNFC(
      {
        title: data.title,
        videoLink: playBackUrl,
        videoThumbnail: thumbNailUrl,
        openseaLink: "",
        channelId: data.channelId,
      },
      ctx,
      user
    );
    return { url: playBackUrl, thumbnail: thumbNailUrl, ...res };
  } catch (e) {
    console.log(`createLivepeerClip Error invoking livepeer, id:${endTime}`, e);
    return { errorMessage: "Error invoking livepeer" };
  }
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
