import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as channelService from "./channelService";

export const resolvers = {
  Query: {
    getChannelFeed(
      _: any,
      { data }: { data: channelService.IGetChannelFeedInput },
      ctx: Context
    ) {
      return channelService.getChannelFeed(data, ctx);
    },
    getChannelById(_: any, { id }: { id: number }, ctx: Context) {
      return channelService.getChannelById({ id }, ctx);
    },
    getChannelBySlug(_: any, { slug }: { slug: string }, ctx: Context) {
      return channelService.getChannelBySlug({ slug }, ctx);
    },
  },
  Mutation: {
    updateChannelText: (
      _: any,
      { data }: { data: channelService.IPostChannelTextInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return channelService.updateChannelText(data, ctx);
    },
  },
  Channel: {
    owner: ({ ownerAddr }: { ownerAddr: string }, _: any, ctx: Context) => {
      return channelService.getOwner({ ownerAddr }, ctx);
    },
  },
};
