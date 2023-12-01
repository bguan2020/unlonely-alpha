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
    getChannelByAwsId(_: any, { awsId }: { awsId: string }, ctx: Context) {
      return channelService.getChannelByAwsId({ awsId }, ctx);
    },
  },
  Mutation: {
    closeSharesEvents: (
      _: any,
      { data }: { data: channelService.IPostCloseSharesEventsInput },
      ctx: Context
    ) => {
      // if (!ctx.user || !ctx.userIsAuthed) {
      //   throw new AuthenticationError("User is not authenticated");
      // }
      return channelService.closeSharesEvents(data, ctx);
    },
    postSharesEvent: (
      _: any,
      { data }: { data: channelService.IPostSharesEventInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return channelService.postSharesEvent(data, ctx);
    },
    updateSharesEvent: (
      _: any,
      { data }: { data: channelService.IUpdateSharesEventInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return channelService.updateSharesEvent(data, ctx);
    },
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
    updateChannelCustomButton: (
      _: any,
      { data }: { data: channelService.IPostChannelCustomButtonInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return channelService.updateChannelCustomButton(data, ctx);
    },
    postUserRoleForChannel: (
      _: any,
      { data }: { data: channelService.IPostUserRoleForChannelInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return channelService.postUserRoleForChannel(data, ctx);
    },
  },
  Channel: {
    token: ({ id }: { id: number }, _: any, ctx: Context) => {
      return channelService.getChannelCreatorToken({ id }, ctx);
    },
    owner: ({ ownerAddr }: { ownerAddr: string }, _: any, ctx: Context) => {
      return channelService.getOwner({ ownerAddr }, ctx);
    },
    chatCommands: ({ id }: { id: number }, _: any, ctx: Context) => {
      return channelService.getChannelChatCommands({ id }, ctx);
    },
    sharesEvent: ({ id }: { id: number }, _: any, ctx: Context) => {
      return channelService.getChannelSharesEvents({ id }, ctx);
    },
    roles: ({ id }: { id: number }, _: any, ctx: Context) => {
      return channelService.getChannelUserRolesByChannel({ id }, ctx);
    },
  },
};
