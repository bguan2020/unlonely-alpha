import { Lambda } from "aws-sdk";
import { Context } from "../../context";
import { Channel as PrismaChannel } from "@prisma/client";
import * as AWS from "aws-sdk";

export interface IPostChannelTextInput {
  id: number;
  name: string;
  description: string;
}

interface Channel extends PrismaChannel {
  thumbnailUrl?: string | null;
}

export const updateChannelText = (
  data: IPostChannelTextInput,
  ctx: Context
) => {
  return ctx.prisma.channel.update({
    where: { id: data.id },
    data: {
      name: data.name,
      description: data.description,
    },
  });
};

export interface IGetChannelFeedInput {
  offset: number;
  limit: number;
  orderBy: "createdAt";
}

export const getChannelFeed = async (
  data: IGetChannelFeedInput,
  ctx: Context
) => {
  console.log("hit this")
  const allChannels: Channel[] = await ctx.prisma.channel.findMany();

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
      return updatedChannels;
    }

    const liveChannelArns = liveStreams.streams.map(
      (stream) => stream.channelArn
    );

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
    const updatedChannels: Channel[] = await ctx.prisma.channel.findMany();

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

    return sortedChannels;
  } catch (error: any) {
    console.log(`Error: ${error.message}`);
    throw error;
  }
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
    console.log(`Error invoking Lambda function: ${error.message}`);
    return null;
  }
};
