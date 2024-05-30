import { Lambda } from "aws-sdk";
import { Channel as PrismaChannel, User } from "@prisma/client";
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
    console.log("createLivepeerStream response", creationResponse.data);
    return {
      playbackId: creationResponse.data.playbackId,
      streamKey: creationResponse.data.streamKey,
      id: creationResponse.data.id,
    };
  } catch (error: any) {
    console.log("createLivepeerStream error", error);
    return {
      playbackId: null,
      streamKey: null,
      id: null,
    };
  }
};

/**
 * pull all channels that have livepeerPlaybackId but don't have streamKey
 * pull all livestreams from livepeer
 * for each channel, use its livepeerPlaybackId to look up streamKey and streamId from the livestreams
 * update the channel with the streamKey and streamId
 * @returns
 */
export const bulkLivepeerStreamIdMigration = async (
  data: any,
  ctx: Context
) => {
  const headers = {
    Authorization: `Bearer ${process.env.STUDIO_API_KEY}`,
    "Content-Type": "application/json",
  };
  try {
    const allStreamsResponse = await axios.get(
      "https://livepeer.studio/api/stream?streamsonly=1",
      { headers }
    );
    console.log(
      "bulkLivepeerStreamIdMigration response",
      allStreamsResponse.data
    );
    const allChannels = await ctx.prisma.channel.findMany();
    console.log("bulkLivepeerStreamIdMigration allChannels", allChannels);
    const allChannelsToUpdate = await ctx.prisma.channel.findMany({
      where: {
        livepeerPlaybackId: { not: "" },
      },
    });
    console.log(
      "bulkLivepeerStreamIdMigration allChannelsToUpdate",
      allChannelsToUpdate
    );
    const updatedChannels = allChannelsToUpdate.map(async (channel) => {
      const stream = allStreamsResponse.data.find(
        (stream: any) => stream.playbackId === channel.livepeerPlaybackId
      );
      if (stream) {
        return ctx.prisma.channel.update({
          where: { id: channel.id },
          data: {
            streamKey:
              (channel.streamKey?.length ?? 0) > 0
                ? channel.streamKey
                : stream.streamKey,
            livepeerStreamId:
              (channel.livepeerStreamId?.length ?? 0) > 0
                ? channel.livepeerStreamId
                : stream.id,
          },
        });
      }
    });
    console.log(
      "bulkLivepeerStreamIdMigration updatedChannels",
      updatedChannels
    );
    return updatedChannels;
  } catch (error: any) {
    console.log("bulkLivepeerStreamIdMigration error", error);
  }
};

export interface IPostChannelInput {
  slug: string;
  name?: string;
  description?: string;
  canRecord?: boolean;
  allowNfcs?: boolean;
}

export const postChannel = async (
  data: IPostChannelInput,
  user: User,
  ctx: Context
) => {
  try {
    const existingChannel = await ctx.prisma.channel.findUnique({
      where: {
        slug: data.slug,
      },
    });

    if (existingChannel) {
      if (existingChannel.slug === data.slug) {
        throw new Error("Channel with this slug already exists");
      }
    }

    const { playbackId, streamKey, id } = await createLivepeerStream(
      data.slug.concat(process.env.DEVELOPMENT ? "-test" : ""),
      data.canRecord
    );

    if (playbackId === null || playbackId === undefined || playbackId === "") {
      throw new Error("Failed to create livepeer stream");
    }

    return await ctx.prisma.channel.create({
      data: {
        slug: data.slug.toLowerCase(),
        name: data.name ?? "",
        description: data.description ?? "",
        allowNFCs: data.allowNfcs,
        channelArn: data.slug.concat("-", new Date(Date.now()).toDateString()),
        playbackUrl: data.slug.concat("-", new Date(Date.now()).toDateString()),
        ownerAddr: user.address,
        awsId: data.slug.concat("-", new Date(Date.now()).toDateString()),
        livepeerPlaybackId: playbackId,
        livepeerStreamId: id,
        streamKey,
      },
    });
  } catch (error: any) {
    console.log("postChannel error", error);
    throw new Error(error);
  }
};

export interface ISoftDeleteChannelInput {
  slug: string;
}

export const softDeleteChannel = async (
  data: ISoftDeleteChannelInput,
  ctx: Context
) => {
  try {
    const existingChannel = await ctx.prisma.channel.findFirst({
      where: {
        slug: data.slug,
      },
    });

    if (!existingChannel) {
      throw new Error("Channel not found");
    }
    return await ctx.prisma.channel.update({
      where: { id: existingChannel.id },
      data: {
        softDelete: true,
      },
    });
  } catch (error: any) {
    console.log("deleteChannel error", error);
    throw new Error(error);
  }
};

export interface IMigrateChannelToLivepeerInput {
  slug: string;
  canRecord?: boolean;
}

export const migrateChannelToLivepeer = async (
  data: IMigrateChannelToLivepeerInput,
  ctx: Context
) => {
  try {
    const existingChannel = await ctx.prisma.channel.findFirst({
      where: {
        slug: data.slug,
        softDelete: false,
      },
    });

    if (!existingChannel) {
      throw new Error("Channel not found");
    }

    if (existingChannel.livepeerPlaybackId) {
      throw new Error("Channel already using Livepeer");
    }

    const { playbackId, streamKey, id } = await createLivepeerStream(
      data.slug.concat(process.env.DEVELOPMENT ? "-test" : ""),
      true
    );

    if (playbackId === null || playbackId === undefined || playbackId === "") {
      throw new Error("Failed to create livepeer stream");
    }

    return await ctx.prisma.channel.update({
      where: { id: existingChannel.id },
      data: {
        livepeerPlaybackId: playbackId,
        streamKey,
        livepeerStreamId: id,
      },
    });
  } catch (error: any) {
    console.log("migrateChannelToLivepeer error", error);
    throw new Error(error);
  }
};

export interface IUpdateChannelAllowNfcsInput {
  id: number;
  allowNfcs: boolean;
}

export const updateChannelAllowNfcs = async (
  data: IUpdateChannelAllowNfcsInput,
  ctx: Context
) => {
  const existingChannel = await ctx.prisma.channel.findFirst({
    where: { id: Number(data.id), softDelete: false },
  });

  if (!existingChannel) {
    throw new Error("Channel not found");
  }

  return await ctx.prisma.channel.update({
    where: { id: Number(data.id) },
    data: {
      allowNFCs: data.allowNfcs,
    },
  });
};

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

export interface IGetChannelSearchResultsInput {
  query: string;
  skip?: number;
  take?: number;
  containsSlug?: boolean;
  slugOnly?: boolean;
  includeSoftDeletedChannels?: boolean;
}

export const getChannelSearchResults = async (
  data: IGetChannelSearchResultsInput,
  ctx: Context
) => {
  const softDeleteCondition = data.includeSoftDeletedChannels
    ? {}
    : { softDelete: false };

  if (data.slugOnly) {
    const uniqueResult = await ctx.prisma.channel.findFirst({
      where: {
        slug: data.query,
        ...softDeleteCondition,
      },
    });
    // Ensure the result is always an array
    return uniqueResult ? [uniqueResult] : [];
  }

  if (data.containsSlug)
    return await ctx.prisma.channel.findMany({
      where: {
        slug: { contains: data.query },
        ...softDeleteCondition,
      },
      skip: data.skip,
      take: data.take,
    });

  return await ctx.prisma.channel.findMany({
    where: {
      AND: [
        {
          OR: [
            { slug: { contains: data.query } },
            { name: { contains: data.query } },
            { description: { contains: data.query } },
          ],
        },
        softDeleteCondition,
      ],
    },
    skip: data.skip,
    take: data.take,
  });
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

export interface IUpdatePinnedChatMessagesInput {
  id: number;
  pinnedChatMessages: string[];
}

export const updatePinnedChatMessages = async (
  data: IUpdatePinnedChatMessagesInput,
  ctx: Context
) => {
  return ctx.prisma.channel.update({
    where: { id: Number(data.id) },
    data: {
      pinnedChatMessages: data.pinnedChatMessages,
    },
  });
};

export const getChannelById = ({ id }: { id: number }, ctx: Context) => {
  return ctx.prisma.channel.findFirst({
    where: { id: Number(id), softDelete: false },
  });
};

export const getChannelBySlug = ({ slug }: { slug: string }, ctx: Context) => {
  return ctx.prisma.channel.findFirst({
    where: { slug: slug, softDelete: false },
  });
};

export const getChannelByAwsId = (
  { awsId }: { awsId: string },
  ctx: Context
) => {
  return ctx.prisma.channel.findFirst({
    where: { awsId: awsId, softDelete: false },
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

export interface IGetLivepeerStreamDataInput {
  streamId: string;
}

export const getLivepeerStreamData = async (
  data: IGetLivepeerStreamDataInput
) => {
  try {
    const response = await axios.get(
      `https://livepeer.studio/api/stream/${data.streamId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STUDIO_API_KEY}`,
        },
      }
    );
    return {
      playbackId: response.data.playbackId,
      streamKey: response.data.streamKey,
      record: response.data.record,
      isActive: response.data.isActive,
    };
  } catch (error: any) {
    console.log("getLivepeerLivestreamData error", error);
    throw error;
  }
};

export interface IGetLivepeerStreamSessionsDataInput {
  streamId: string;
  limit: number;
  skip: number;
}

export const getLivepeerStreamSessionsData = async (
  data: IGetLivepeerStreamSessionsDataInput
) => {
  try {
    const response = await axios.get("https://livepeer.studio/api/session", {
      headers: {
        Authorization: `Bearer ${process.env.STUDIO_API_KEY}`,
      },
      params: {
        limit: data.limit,
        parentId: data.streamId,
        cursor: `skip${data.skip}`,
        count: true,
      },
    });
    const recordings = response.data.map((recording: any) => {
      return {
        id: recording.id as string,
        createdAt: recording.createdAt as number,
        mp4Url: recording.mp4Url ?? ("" as string),
        duration: recording.sourceSegmentsDuration as number,
      };
    });
    return recordings;
  } catch (error: any) {
    console.log("getLivepeerStreamRecordings error", error);
    throw error;
  }
};

export interface IGetLivepeerViewershipMetricsInput {
  playbackId?: string;
  fromTimestampInMilliseconds: string;
  toTimestampInMilliseconds: string;
  timeStep: string;
}

export const getLivepeerViewershipMetrics = async (
  data: IGetLivepeerViewershipMetricsInput
) => {
  const playbackParam = data.playbackId ? { playbackId: data.playbackId } : {};

  const params = {
    ...playbackParam,
    from: data.fromTimestampInMilliseconds,
    to: data.toTimestampInMilliseconds,
    timeStep: data.timeStep.toString(),
    "breakdownBy[]": "playbackId",
  };

  try {
    const response = await axios.get(
      "https://livepeer.studio/api/data/views/query",
      {
        headers: {
          Authorization: `Bearer ${process.env.STUDIO_API_KEY}`,
        },
        params,
      }
    );
    const metrics = response.data.map((metric: any) => {
      return {
        timestamp: metric.timestamp.toString(),
        viewCount: metric.viewCount.toString(),
        playtimeMins: metric.playtimeMins.toString(),
        playbackId: metric.playbackId.toString(),
      };
    });
    return metrics;
  } catch (e) {
    console.log("getLivepeerViewershipMetrics error", e);
    throw e;
  }
};

export interface IUpdateLivepeerStreamDataInput {
  streamId: string;
  canRecord: boolean;
}

export const updateLivepeerStreamData = async (
  data: IUpdateLivepeerStreamDataInput
) => {
  try {
    await axios.patch(
      `https://livepeer.studio/api/stream/${data.streamId}`,
      {
        record: data.canRecord,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.STUDIO_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return await getLivepeerStreamData({ streamId: data.streamId });
  } catch (error) {
    console.log("updateLivepeerLivestreamData error", error);
    throw error;
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

export const getChannelNfcs = async ({ id }: { id: number }, ctx: Context) => {
  return ctx.prisma.nFC.findMany({
    where: { channelId: Number(id) },
  });
};

export const getChannelsByOwnerAddress = async (
  { ownerAddress }: { ownerAddress: string },
  ctx: Context
) => {
  return ctx.prisma.channel.findMany({
    where: { ownerAddr: ownerAddress, softDelete: false },
  });
};
