import { Lambda } from "aws-sdk";
import { Channel as PrismaChannel } from "@prisma/client";
import * as AWS from "aws-sdk";
import axios from "axios";

import { Context } from "../../context";

export interface IPostChannelTextInput {
  id: number;
  name: string;
  description: string;
}

interface Channel extends PrismaChannel {
  thumbnailUrl?: string | null;
}

type Source = {
  hrn: string;
  url: string;
  type: string;
};

enum SharesEventState {
  PENDING = "PENDING",
  LIVE = "LIVE",
  LOCK = "LOCK",
  PAYOUT = "PAYOUT",
  PAYOUT_PREVIOUS = "PAYOUT_PREVIOUS",
}

const createLivepeerStream = async (name: string, canRecord?: boolean) => {
  const headers = {
    Authorization: `Bearer ${process.env.STUDIO_API_KEY}`,
    "Content-Type": "application/json",
  };
  try {
    const creationResponse = await axios.post(
      "https://livepeer.studio/api/stream",
      {
        name,
        record: canRecord,
      },
      { headers }
    );
    return creationResponse.data.playbackId;
  } catch (error: any) {
    console.log("createLivepeerStream error", error);
    return null;
  }
}

export interface IPostChannelInput {
  slug: string;
  ownerAddress: string;
  name?: string;
  description?: string;
  canRecord?: boolean;
  allowNfcs?: boolean;
}

export const postChannel = async (
  data: IPostChannelInput,
  ctx: Context
) => {
  try {
  const existingChannel = await ctx.prisma.channel.findFirst({
    where: {
      OR: [
        { slug: data.slug },
        { ownerAddr: data.ownerAddress },
      ],
    },
  });

  if (existingChannel) {
    if (existingChannel.slug === data.slug) {
      throw new Error("Channel with this slug already exists");
    }
  }

  const livepeerPlaybackId = await createLivepeerStream(data.slug, data.canRecord);

  if (livepeerPlaybackId === null || livepeerPlaybackId === undefined || livepeerPlaybackId === "") {
    throw new Error("Failed to create livepeer stream");
  }

  return ctx.prisma.channel.create({
    data: {
      slug: data.slug,
      name: data.name ?? "",
      description: data.description ?? "",
      allowNFCs: data.allowNfcs,
      channelArn: "",
      playbackUrl: "",
      ownerAddr: data.ownerAddress,
      awsId: data.slug,
      livepeerPlaybackId,
    },
  });
  } catch (error: any) {
  console.log("postChannel error", error);
  throw error;
  }
};

export interface IMigrateChannelToLivepeerInput {
  slug: string;
  ownerAddress: string;
  canRecord?: boolean;
}

export const migrateChannelToLivepeer = async (data: IMigrateChannelToLivepeerInput, ctx: Context) => {
  const existingChannel = await ctx.prisma.channel.findFirst({
    where: {
      OR: [
        { slug: data.slug },
        { ownerAddr: data.ownerAddress },
      ],
    },
  });

  if (!existingChannel) {
    throw new Error("Channel not found");
  }

  const livepeerPlaybackId = await createLivepeerStream(data.slug);

  if (livepeerPlaybackId === null || livepeerPlaybackId === undefined || livepeerPlaybackId === "") {
    throw new Error("Failed to create livepeer stream");
  }

  return ctx.prisma.channel.update({
    where: { id: existingChannel.id },
    data: {
      livepeerPlaybackId,
    },
  });
}

export const updateChannelText = (
  data: IPostChannelTextInput,
  ctx: Context
) => {
  return ctx.prisma.channel.update({
    where: { id: Number(data.id) },
    data: {
      name: data.name,
      description: data.description,
    },
  });
};

export interface IPostChannelCustomButtonInput {
  id: number;
  customButtonAction: string;
  customButtonPrice: number;
}

export const updateChannelCustomButton = (
  data: IPostChannelCustomButtonInput,
  ctx: Context
) => {
  return ctx.prisma.channel.update({
    where: { id: Number(data.id) },
    data: {
      customButtonAction: data.customButtonAction,
      customButtonPrice: data.customButtonPrice,
    },
  });
};

export interface IPostSharesEventInput {
  channelId: number;
  chainId: number;
  sharesSubjectQuestion: string;
  sharesSubjectAddress: string;
  options: string[];
}

export interface IUpdateSharesEventInput {
  id: number;
  sharesSubjectQuestion: string;
  sharesSubjectAddress: string;
  eventState?: SharesEventState;
  resultIndex?: number;
}

export const postSharesEvent = async (
  data: IPostSharesEventInput,
  ctx: Context
) => {
  return ctx.prisma.sharesEvent.create({
    data: {
      sharesSubjectQuestion: data.sharesSubjectQuestion,
      sharesSubjectAddress: data.sharesSubjectAddress,
      eventState: SharesEventState.PENDING,
      chainId: Number(data.chainId),
      options: data.options,
      softDelete: false,
      channel: {
        connect: {
          id: Number(data.channelId),
        },
      },
    },
  });
};

export const updateSharesEvent = async (
  data: IUpdateSharesEventInput,
  ctx: Context
) => {
  // find latest shares event
  const sharesEvent = await ctx.prisma.sharesEvent.findFirst({
    where: { id: Number(data.id), softDelete: false },
  });

  if (!sharesEvent) {
    throw new Error("No shares event found");
  }

  return ctx.prisma.sharesEvent.update({
    where: { id: sharesEvent.id },
    data: {
      sharesSubjectQuestion: data.sharesSubjectQuestion,
      sharesSubjectAddress: data.sharesSubjectAddress,
      eventState: data.eventState,
      resultIndex: data.resultIndex,
    },
  });
};

export interface IPostCloseSharesEventsInput {
  channelId: number;
  chainId: number;
  sharesEventIds: number[];
}

export const closeSharesEvents = async (
  data: IPostCloseSharesEventsInput,
  ctx: Context
) => {
  return await ctx.prisma.sharesEvent.updateMany({
    where: {
      channelId: Number(data.channelId),
      chainId: Number(data.chainId),
      id: {
        in: data.sharesEventIds.map((id) => Number(id)),
      },
      softDelete: false,
    },
    data: {
      softDelete: true,
    },
  });
};

export interface IGetChannelFeedInput {
  offset: number;
  limit: number;
  orderBy: "createdAt";
  isLive?: boolean;
}

export const getChannelFeed = async (
  data: IGetChannelFeedInput,
  ctx: Context
) => {
  const allChannels: Channel[] = await ctx.prisma.channel.findMany({
    where: { softDelete: false },
  });

  // aws-sdk to find out whos currently live
  AWS.config.update({
    region: "us-west-2",
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
  const ivs = new AWS.IVS();
  try {
    const liveStreams = await ivs.listStreams().promise();

    const headers = {
      Authorization: `Bearer ${process.env.STUDIO_API_KEY}`,
      "Content-Type": "application/json",
    };
    const livePlaybackIds = await axios
      .get(
        'https://livepeer.studio/api/stream?streamsonly=1&filters=[{"id": "isActive", "value": true}]',
        { headers }
      )
      .then((res) => {
        return res.data.map((stream: any) => stream.playbackId);
      })
      .catch((err) => {
        console.log("getChannelFeed from livepeer error", err);
        return [];
      });

    if (liveStreams.streams.length === 0 && livePlaybackIds.length === 0) {
      // no live channels, return all channels as not live, and if data.isLive is true, return empty array
      if (typeof data.isLive === "boolean" && data.isLive) return [];
      return allChannels.map((channel) => {
        return {
          ...channel,
          isLive: false,
        };
      });
    }

    const liveChannelArns = liveStreams.streams.map(
      (stream) => stream.channelArn
    );

    // Add isLive property to all channels, then sort by isLive
    const sortedChannels = allChannels
      .map((channel) => {
        return {
          ...channel,
          isLive:
            liveChannelArns.includes(channel.channelArn) ||
            livePlaybackIds.includes(channel.livepeerPlaybackId),
        };
      })
      .sort((a, b) => {
        if (a.isLive && b.isLive) {
          return 0; // both channels are live, maintain their original order
        } else if (a.isLive) {
          return -1; // a is live, put it before b
        } else {
          return 1; // a is not live, put it after b
        }
      });

    // Add getThumbnailUrl function call for live channels
    await Promise.all(
      sortedChannels.map(async (channel) => {
        if (
          channel.livepeerPlaybackId &&
          livePlaybackIds.includes(channel.livepeerPlaybackId)
        ) {
          channel.thumbnailUrl = await getLivepeerThumbnail(
            channel.livepeerPlaybackId
          );
        } else if (liveChannelArns.includes(channel.channelArn)) {
          channel.thumbnailUrl = await getThumbnailUrl(channel.channelArn);
        }
      })
    );

    return typeof data.isLive === "boolean"
      ? sortedChannels.filter((channel) => channel.isLive === data.isLive)
      : sortedChannels;
  } catch (error: any) {
    console.log(`getChannelFeed Error: ${error.message}`);
    throw error;
  }
};

export interface IUpdateChannelVibesTokenPriceRangeInput {
  id: number;
  vibesTokenPriceRange: string[];
}

export const updateChannelVibesTokenPriceRange = async (
  data: IUpdateChannelVibesTokenPriceRangeInput,
  ctx: Context
) => {
  return ctx.prisma.channel.update({
    where: { id: Number(data.id) },
    data: {
      vibesTokenPriceRange: data.vibesTokenPriceRange,
    },
  });
};

export const getChannelById = ({ id }: { id: number }, ctx: Context) => {
  return ctx.prisma.channel.findUnique({
    where: { id: Number(id) },
  });
};

export const getChannelBySlug = ({ slug }: { slug: string }, ctx: Context) => {
  return ctx.prisma.channel.findUnique({
    where: { slug: slug },
  });
};

export const getChannelByAwsId = (
  { awsId }: { awsId: string },
  ctx: Context
) => {
  return ctx.prisma.channel.findUnique({
    where: { awsId: awsId },
  });
};

// get channel CreatorToken based on channel id
export const getChannelCreatorToken = (
  { id }: { id: number },
  ctx: Context
) => {
  return ctx.prisma.creatorToken.findFirst({
    where: { channelId: Number(id) },
  });
};

export const getOwner = (
  { ownerAddr }: { ownerAddr: string },
  ctx: Context
) => {
  return ctx.prisma.user.findUnique({ where: { address: ownerAddr } });
};

const getThumbnailUrl = async (channelArn: string): Promise<string | null> => {
  const recordingConfigArn =
    "arn:aws:ivs:us-west-2:500434899882:recording-configuration/vQ227qqHmVtp";
  const lambda = new Lambda({
    region: "us-west-2",
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  const params: Lambda.Types.InvocationRequest = {
    FunctionName: "getChannelThumbnail",
    Payload: JSON.stringify({
      detail: {
        "channel-arn": channelArn,
        "recording-config-arn": recordingConfigArn,
      },
    }),
  };

  try {
    const response = await lambda.invoke(params).promise();
    const responseBody = JSON.parse(response.Payload as string);
    return responseBody.body.thumbnail;
  } catch (error: any) {
    console.log(
      `getThumbnailUrl Error invoking Lambda function: ${error.message}`
    );
    return null;
  }
};

export const getLivepeerThumbnail = async (livepeerPlaybackId: string) => {
  try {
    const response = await axios.get(
      `https://livepeer.studio/api/playback/${livepeerPlaybackId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STUDIO_API_KEY}`,
        },
      }
    );

    const thumbnail = response.data.meta.source.find(
      (source: Source) => source.hrn === "Thumbnail (JPEG)"
    );

    const thumbnails = response.data.meta.source.find(
      (source: Source) => source.hrn === "Thumbnails"
    );

    if (thumbnail) return thumbnail.url;
    if (thumbnails)
      return thumbnails.url
        .split("/")
        .slice(0, -1)
        .concat("keyframes_0.jpg")
        .join("/");
    return null;
  } catch (error: any) {
    console.log("getLivepeerThumbnail error", error);
    return null;
  }
};

export interface IPostUserRoleForChannelInput {
  channelId: number;
  userAddress: string;
  role: number;
}

export const postUserRoleForChannel = async (
  data: IPostUserRoleForChannelInput,
  ctx: Context
) => {
  const existingRole = await ctx.prisma.channelUserRole.findFirst({
    where: {
      channelId: Number(data.channelId),
      userAddress: data.userAddress,
    },
  });

  if (!existingRole) {
    // If the role doesn't exist, create a new one.
    return ctx.prisma.channelUserRole.create({
      data: {
        userAddress: data.userAddress,
        role: data.role,
        channelId: Number(data.channelId),
      },
    });
  } else {
    // If the role exists, update it.
    return ctx.prisma.channelUserRole.update({
      where: { id: existingRole.id },
      data: { role: data.role },
    });
  }
};

export const getChannelChatCommands = async (
  { id }: { id: number },
  ctx: Context
) => {
  return ctx.prisma.chatCommand.findMany({
    // where softDelete is false
    where: { channelId: Number(id), softDelete: false },
  });
};

export const getChannelSharesEvents = async (
  { id }: { id: number },
  ctx: Context
) => {
  try {
    return ctx.prisma.sharesEvent.findMany({
      where: { channelId: Number(id), softDelete: false },
      // order by createdAt w latest first
      orderBy: { createdAt: "desc" },
    });
  } catch (error: any) {
    console.log("getChannelSharesEvents error", error);
    return [];
  }
};

export const getChannelUserRolesByChannel = async (
  { id }: { id: number },
  ctx: Context
) => {
  // Fetch all roles for the given channelId
  return await ctx.prisma.channelUserRole.findMany({
    where: {
      channelId: Number(id),
    },
  });
};

export const getChannelNfcs = async (
  { id }: { id: number },
  ctx: Context
) => {
  return ctx.prisma.nFC.findMany({
    where: { channelId: Number(id) },
  });
}

export const getChannelSideBets = async (
  { id }: { id: number },
  ctx: Context
) => {
  try {
    return ctx.prisma.sideBet.findMany({
      where: { channelId: Number(id), softDelete: false },
      // order by createdAt w latest first
      orderBy: { createdAt: "desc" },
    });
  } catch (error: any) {
    console.log("getChannelSideBets error", error);
    return [];
  }
};
