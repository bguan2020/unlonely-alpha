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
    getChannelSearchResults(
      _: any,
      { data }: { data: channelService.IGetChannelSearchResultsInput },
      ctx: Context
    ) {
      return channelService.getChannelSearchResults(data, ctx);
    },
    getChannelsByOwnerAddress(
      _: any,
      { ownerAddress }: { ownerAddress: string },
      ctx: Context
    ) {
      return channelService.getChannelsByOwnerAddress({ ownerAddress }, ctx);
    },
    getLivepeerStreamData(
      _: any,
      { data }: { data: channelService.IGetLivepeerStreamDataInput }
    ) {
      return channelService.getLivepeerStreamData(data);
    },
    getLivepeerStreamSessionsData(
      _: any,
      { data }: { data: channelService.IGetLivepeerStreamSessionsDataInput }
    ) {
      return channelService.getLivepeerStreamSessionsData(data);
    },
    getLivepeerViewershipMetrics(
      _: any,
      { data }: { data: channelService.IGetLivepeerViewershipMetricsInput }
    ) {
      return channelService.getLivepeerViewershipMetrics(data);
    },
  },
  Mutation: {
    postChannel: (
      _: any,
      { data }: { data: channelService.IPostChannelInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return channelService.postChannel(data, ctx.user, ctx);
    },
    softDeleteChannel: (
      _: any,
      { data }: { data: channelService.ISoftDeleteChannelInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return channelService.softDeleteChannel(data, ctx);
    },
    migrateChannelToLivepeer: (
      _: any,
      { data }: { data: channelService.IMigrateChannelToLivepeerInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return channelService.migrateChannelToLivepeer(data, ctx);
    },
    closeSharesEvents: (
      _: any,
      { data }: { data: channelService.IPostCloseSharesEventsInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
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
    updateChannelAllowNfcs: (
      _: any,
      { data }: { data: channelService.IUpdateChannelAllowNfcsInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return channelService.updateChannelAllowNfcs(data, ctx);
    },
    updateLivepeerStreamData: (
      _: any,
      { data }: { data: channelService.IUpdateLivepeerStreamDataInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return channelService.updateLivepeerStreamData(data);
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
    updateChannelVibesTokenPriceRange: (
      _: any,
      {
        data,
      }: { data: channelService.IUpdateChannelVibesTokenPriceRangeInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return channelService.updateChannelVibesTokenPriceRange(data, ctx);
    },
    updatePinnedChatMessages: (
      _: any,
      { data }: { data: channelService.IUpdatePinnedChatMessagesInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return channelService.updatePinnedChatMessages(data, ctx);
    },
    bulkLivepeerStreamIdMigration: (_: any, data: any, ctx: Context) => {
      // if (!ctx.user || !ctx.userIsAuthed) {
      //   throw new AuthenticationError("User is not authenticated");
      // }

      return channelService.bulkLivepeerStreamIdMigration(data, ctx);
    },
    updateChannelFidSubscription: (
      _: any,
      { data }: { data: channelService.IUpdateChannelFidSubscriptionInput },
      ctx: Context
    ) => {
      return channelService.updateChannelFidSubscription(data, ctx);
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
    nfcs: ({ id }: { id: number }, _: any, ctx: Context) => {
      return channelService.getChannelNfcs({ id }, ctx);
    },
  },
};
