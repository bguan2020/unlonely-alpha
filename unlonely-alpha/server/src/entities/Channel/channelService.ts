import { Context } from "../../context";
import * as AWS from "aws-sdk";

export interface IPostChannelTextInput {
  id: number;
  name: string;
  description: string;
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
  const allChannels = await ctx.prisma.channel.findMany();

  // aws-sdk to find out whos currently live
  AWS.config.update({ region: "us-west-2" });
  const ivs = new AWS.IVS();
  try {
    const liveStreams = await ivs.listStreams().promise();
    if (liveStreams.streams.length === 0) {
      return allChannels;
    }

    const liveChannelArns = liveStreams.streams.map(
      (stream) => stream.channelArn
    );

    const sortedChannels = allChannels.sort((a, b) => {
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
