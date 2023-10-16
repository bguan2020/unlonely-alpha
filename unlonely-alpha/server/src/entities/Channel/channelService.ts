import { Lambda } from "aws-sdk";
import { Channel as PrismaChannel } from "@prisma/client";
import * as AWS from "aws-sdk";

import { Context } from "../../context";

export interface IPostChannelTextInput {
  id: number;
  name: string;
  description: string;
}

interface Channel extends PrismaChannel {
  thumbnailUrl?: string | null;
}

enum SharesEventState {
  LIVE = "LIVE",
  LOCK = "LOCK",
  PAYOUT = "PAYOUT",
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
  id: number;
  sharesSubjectQuestion: string;
  sharesSubjectAddress: string;
  eventState?: SharesEventState;
}

export const postSharesEvent = async (
  data: IPostSharesEventInput,
  ctx: Context
) => {
  const existingSharesEvent = await ctx.prisma.sharesEvent.findMany({
    // where softDelete is false
    where: { channelId: Number(data.id), softDelete: false },
    // order by createdAt w latest first
    orderBy: { createdAt: "desc" },
  });
  if (existingSharesEvent.length > 0) {
    return ctx.prisma.sharesEvent.update({
      where: { id: existingSharesEvent[0].id },
      data: {
        sharesSubjectQuestion: data.sharesSubjectQuestion,
        sharesSubjectAddress: data.sharesSubjectAddress,
        eventState: data.eventState,
      },
    });
  }
  return ctx.prisma.sharesEvent.create({
    data: {
      sharesSubjectQuestion: data.sharesSubjectQuestion,
      sharesSubjectAddress: data.sharesSubjectAddress,
      eventState: data.eventState,
      softDelete: false,
      channel: {
        connect: {
          id: Number(data.id),
        },
      },
    },
  });
};

export interface IPostCloseSharesEventInput {
  id: number;
}

export const closeSharesEvent = async (
  data: IPostCloseSharesEventInput,
  ctx: Context
) => {
  const sharesEvent = await ctx.prisma.sharesEvent.findFirst({
    where: { channelId: Number(data.id), softDelete: false },
  });

  if (!sharesEvent) {
    throw new Error("Shares event not found");
  }

  return await ctx.prisma.sharesEvent.update({
    where: { id: sharesEvent.id },
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
  // aws-sdk to find out whos currently live
  AWS.config.update({
    region: "us-west-2",
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
  const ivs = new AWS.IVS();
  try {
    const liveStreams = await ivs.listStreams().promise();

    if (liveStreams.streams.length === 0) {
      // Update isLive field for all channels to false
      await ctx.prisma.channel.updateMany({
        where: { isLive: true },
        data: { isLive: false },
      });

      // Update the allChannels array with the updated isLive values
      const updatedChannels = await ctx.prisma.channel.findMany();
      return typeof data.isLive === "boolean"
        ? updatedChannels.filter((channel) => channel.isLive === data.isLive)
        : updatedChannels;
    }

    const liveChannelArns = liveStreams.streams.map(
      (stream) => stream.channelArn
    );

    const allChannels: Channel[] = await ctx.prisma.channel.findMany();

    // Update isLive field for all channels
    await Promise.all(
      allChannels.map(async (channel) => {
        const isLive = liveChannelArns.includes(channel.channelArn);
        if (channel.isLive !== isLive) {
          await ctx.prisma.channel.update({
            where: { id: channel.id },
            data: { isLive },
          });
        }
      })
    );

    // Refetch all channels after updating isLive field
    const updatedChannels: Channel[] = await ctx.prisma.channel.findMany({
      include: { moderators: true },
    });

    const sortedChannels = updatedChannels.sort((a, b) => {
      if (
        liveChannelArns.includes(a.channelArn) &&
        liveChannelArns.includes(b.channelArn)
      ) {
        return 0; // both channels are live, maintain their original order
      } else if (liveChannelArns.includes(a.channelArn)) {
        return -1; // a is live, put it before b
      } else {
        return 1; // a is not live, put it after b
      }
    });

    // Add getThumbnailUrl function call for live channels
    await Promise.all(
      sortedChannels.map(async (channel) => {
        if (liveChannelArns.includes(channel.channelArn)) {
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

export const getChannelById = ({ id }: { id: number }, ctx: Context) => {
  return ctx.prisma.channel.findUnique({
    where: { id: Number(id) },
    include: { moderators: true },
  });
};

export const getChannelBySlug = ({ slug }: { slug: string }, ctx: Context) => {
  return ctx.prisma.channel.findUnique({
    where: { slug: slug },
    include: { moderators: true },
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

// aws lambda function
interface ThumbnailEvent {
  detail: {
    "channel-arn": string;
    "recording-config-arn": string;
  };
}

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

export interface IToggleUserAddressToChannelInput {
  channelId: number;
  userAddress: string;
}

export const toggleModeratorToChannel = async (
  data: IToggleUserAddressToChannelInput,
  ctx: Context
) => {
  // get moderator arrray from channel, check if userAddress is in array
  const channel = await ctx.prisma.channel.findUnique({
    where: { id: Number(data.channelId) },
    include: { moderators: true },
  });

  if (!channel) {
    throw new Error("Channel not found");
  }

  const isModerator = channel.moderators.some(
    (moderator) => moderator.address === data.userAddress
  );

  if (!isModerator) {
    // If user is not already a moderator, add them
    return ctx.prisma.channel.update({
      where: { id: Number(data.channelId) },
      data: {
        moderators: {
          connect: { address: data.userAddress },
        },
      },
    });
  } else {
    // If user is already a moderator, remove them
    return ctx.prisma.channel.update({
      where: { id: Number(data.channelId) },
      data: {
        moderators: {
          disconnect: { address: data.userAddress },
        },
      },
    });
  }
};

export const toggleBannedUserToChannel = async (
  data: IToggleUserAddressToChannelInput,
  ctx: Context
) => {
  // get bannedUSer arrray from channel, check if userAddress is in array
  const channel = await ctx.prisma.channel.findUnique({
    where: { id: Number(data.channelId) },
  });

  if (!channel) {
    throw new Error("Channel not found");
  }

  const bannedUsers = channel.bannedUsers || [];

  const userIndex = bannedUsers.indexOf(data.userAddress);

  if (userIndex === -1) {
    // user is not banned, add to bannedUsers array
    bannedUsers.push(data.userAddress);
  } else {
    // user is banned, remove from bannedUsers array
    bannedUsers.splice(userIndex, 1);
  }

  return ctx.prisma.channel.update({
    where: { id: Number(data.channelId) },
    data: { bannedUsers },
  });
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

export const getChannelSharesEvent = async (
  { id }: { id: number },
  ctx: Context
) => {
  return ctx.prisma.sharesEvent.findMany({
    // where softDelete is false
    where: { channelId: Number(id), softDelete: false },
    // order by createdAt w latest first
    orderBy: { createdAt: "desc" },
  });
};
