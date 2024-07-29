import { User } from "@prisma/client";
import * as AWS from "aws-sdk";
import axios from "axios";
import * as tus from "tus-js-client"

import { Context } from "../../context";
import { getLivepeerThumbnail } from "../Channel/channelService";
import opensea from "./opensea.json";
import {v4 as uuidv4} from "uuid";
import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const livepeerHeaders = {
  Authorization: `Bearer ${process.env.STUDIO_API_KEY}`,
  "Content-Type": "application/json",
};

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

interface RequestUploadResponse {
  url: string;
  tusEndpoint: string;
  task: {
    id: string;
  };
  asset: {
    name: string;
    id: string;
    playbackId: string;
    userId: string
    createdAt: number;
    status: {
      phase: string;
      updatedAt: number;
      progress?: number;
      errorMessage?: string;
    }
  }
}

export interface IPostNFCInput {
  channelId: string;
  title: string;
  videoLink: string;
  videoThumbnail: string;
  openseaLink: string;
  contract1155Address?: string
  tokenId?: number
  zoraLink?: string
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
  noDatabasePush?: boolean;
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
      contract1155Address: data.contract1155Address,
      tokenId: data.tokenId,
      zoraLink: data.zoraLink,
      owner: {
        connect: {
          address: user.address,
        },
      },
      channel: {
        connect: {
          id: Number(data.channelId),
        },
      }
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
  const startTime = endTime - 80000; // 80 seconds before the endTime in milliseconds
  const clipData: ClipData = {
    startTime,
    endTime,
    playbackId: data.livepeerPlaybackId,
    name: data.title,
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
        headers: livepeerHeaders,
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
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const poll = await fetch(
        `https://livepeer.studio/api/asset/${responseData.asset.id}`,
        {
          method: "GET",
          headers: livepeerHeaders,
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
      { headers: livepeerHeaders }
    ).then((res) => res.json());

    const playBackUrl = playbackData.meta.source[0].url;

    const thumbNailUrl = await getLivepeerThumbnail(asset.playbackId);

    if (data.noDatabasePush) {
      return { 
        id: "0" ,
        title: data.title,
        videoLink: playBackUrl,
        videoThumbnail: thumbNailUrl,
        openseaLink: "",
        score: 0,
        liked: false,
        disliked: false,
        owner: user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        url: playBackUrl, 
        thumbnail: thumbNailUrl,
        errorMessage: "",
      };
    }
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

export interface ITrimVideoInput {
  startTime: number;
  endTime: number;
  videoLink: string;
  name: string;
  channelId: string;
}

export const trimVideo = async (data: ITrimVideoInput, ctx: Context) => {

  const videoId = uuidv4();
  const inputPath = path.join(__dirname, `${videoId}-input.mp4`);
  const outputPath = path.join(__dirname, `${videoId}-output.mp4`);
  const outroPath = path.join(__dirname, `${videoId}-outro.mp4`);
  const finalPath = path.join(__dirname, `${videoId}-final.mp4`);

  try {
    const downloadResponse = await axios({
      url: data.videoLink,
      method: "GET",
      responseType: "stream",
    });

    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(inputPath); // A write stream is created to write the video to be downloaded to a file at the path specified by inputPath
      downloadResponse.data.pipe(writer); // data being downloaded is directly written to the file as it is received
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log("downloaded video");

    // Trim the video using FFmpeg
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(data.startTime)
        .setDuration(data.endTime - data.startTime)
        .output(outputPath)
        .on("end", resolve)
        .on("error", (err) => {
          console.error("Error processing video:", err);
          reject(err);
          // Clean up temporary files
          fs.unlinkSync(inputPath);
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
          }
        })
        .run();
    });

    console.log("trimmed video");

    const requestResForFinal = await requestUploadFromLivepeer({ name: data.name });

    // Create an outro video with the watermark image
    const watermarkImage = path.join(__dirname, "../../../assets", "unlonely-watermark.png");
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(watermarkImage)
        .inputOptions([
          "-t", "4"
        ])
        .complexFilter([
          "color=black:1280x720:d=3[bg]", // Create a 3-second black background
          "[0:v]scale=320:-1[wm]; [bg][wm]overlay=(W-w)/2:(H-h)/2" // Overlay watermark with padding
        ])
        .outputOptions([
          "-c:v libx264",
          "-pix_fmt yuv420p",
          "-c:a aac"
        ])
        .output(outroPath)
        .on("end", resolve)
        .on("error", (err) => {
          console.error("Error creating outro video:", err);
          reject(err);
          // Clean up temporary files
          if (fs.existsSync(outroPath)) {
            fs.unlinkSync(outroPath);
          }
        })
        .run();
    });

    console.log("created outro video");

    // Concatenate the trimmed video with the outro
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(outputPath)
        .input(outroPath)
        .complexFilter([
          "[0:v]fps=30,scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2[v1]",
          "[1:v]fps=30,scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2[v2]",
          "[v1][v2]concat=n=2:v=1[outv]"
        ])
        .outputOptions([
          "-map [outv]",
          "-map 0:a?",
          "-c:v libx264",
          "-c:a aac",
          "-strict experimental",
          "-shortest"
        ])
        .output(finalPath)
        .on("end", resolve)
        .on("error", (err) => {
          console.error("Error concatenating videos:", err);
          reject(err);
          // Clean up temporary files
          fs.unlinkSync(outputPath);
          fs.unlinkSync(outroPath);
          if (fs.existsSync(finalPath)) {
            fs.unlinkSync(finalPath);
          }
        })
        .run();
    });

    console.log("concatenated videos");

    // Upload the final video using tus-js-client
    const finalFileSize = fs.statSync(finalPath).size;
    const finalFileStream = fs.createReadStream(finalPath);

    new Promise<string>((resolve, reject) => {
      const upload = new tus.Upload(finalFileStream, {
        endpoint: requestResForFinal.tusEndpoint,
        retryDelays: [0, 1000, 3000, 5000],
        metadata: {
          filename: `${data.name}.mp4`,
          filetype: "video/mp4",
        },
        uploadSize: finalFileSize,
        onError: (error: any) => {
          console.error("Failed because: ", error);
          reject(error);
        },
        onProgress: (bytesUploaded: number, bytesTotal: number) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          console.log(`Upload progress: ${percentage}%`);
        },
        onSuccess: () => {
          console.log(`Upload finished: ${upload.url}`);
          resolve(upload.url!);
          // Clean up temporary files
          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);
          fs.unlinkSync(outroPath);
          fs.unlinkSync(finalPath);
        },
      });

      upload.findPreviousUploads().then((previousUploads) => {
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        upload.start();
      });
    });

    console.log("uploaded final video");

    let finalAsset = null;
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const poll = await fetch(
        `https://livepeer.studio/api/asset/${requestResForFinal.asset.id}`,
        {
          method: "GET",
          headers: livepeerHeaders,
        }
      );
      const res = await poll.json();
      console.log("polling every 2 secs", res);
      if (res.status.phase === "ready") {
        finalAsset = res;
        break;
      }
      if (res.status.phase === "failed") {
        console.log("createLivepeerClip failed");
        throw new Error("createLivepeerClip Error livepeer could not create clip");
      }
    }
    const finalPlaybackData: any = await fetch(
      `https://livepeer.studio/api/playback/${finalAsset.playbackId}`,
      { headers: livepeerHeaders }
    ).then((res) => res.json());

    const finalPlayBackUrl = finalPlaybackData.meta.source[0].url;

    const thumbNailUrl = await getLivepeerThumbnail(finalAsset.playbackId);
    console.log("nfc ready")
    return {
      videoLink: finalPlayBackUrl,
      videoThumbnail: thumbNailUrl,
    }
  } catch (e) {
    console.error("Error:", e);
    // Clean up temporary files
    if (fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    if (fs.existsSync(outroPath)) {
      fs.unlinkSync(outroPath);
    }
    if (fs.existsSync(finalPath)) {
      fs.unlinkSync(finalPath);
    }
    throw e;
  }
}

export interface IRequestUploadFromLivepeerInput {
  name: string;
}

export const requestUploadFromLivepeer = async (data: IRequestUploadFromLivepeerInput): Promise<RequestUploadResponse> => {
  const headers = {
    Authorization: `Bearer ${process.env.STUDIO_API_KEY}`,
    "Content-Type": "application/json",
  };
  const bodyData = {
    name: data.name,
  };
  const response = await axios.post(
    "https://livepeer.studio/api/asset/request-upload",
    bodyData,
    {
      headers,
    }
  );
  const returnData: RequestUploadResponse = {
    url: response.data.url,
    tusEndpoint: response.data.tusEndpoint,
    task: response.data.task,
    asset: {
      ...response.data.asset,
      createdAt: String(response.data.asset.createdAt),
      status: {
        ...response.data.asset.status,
        updatedAt: String(response.data.asset.status.updatedAt),
      }
    }
  };
  return returnData;
}

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
