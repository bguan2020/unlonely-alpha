import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as sideBetService from "./sideBetService";

export const resolvers = {
  Query: {
    getSideBetById: (
      _: any,
      {
        data,
      }: {
        data: sideBetService.IGetSideBetByIdInput;
      },
      ctx: Context
    ) => {
      return sideBetService.getSideBetById(data, ctx);
    },
    getSideBetByUser: (
      _: any,
      {
        data,
      }: {
        data: sideBetService.IGetSideBetByUserInput;
      },
      ctx: Context
    ) => {
      return sideBetService.getSideBetByUser(data, ctx);
    },
    getSideBetByChannelId: (
      _: any,
      {
        data,
      }: {
        data: sideBetService.IGetSideBetByChannelIdInput;
      },
      ctx: Context
    ) => {
      return sideBetService.getSideBetByChannelId(data, ctx);
    },
  },
  Mutation: {
    postSideBet: (
      _: any,
      {
        data,
      }: {
        data: sideBetService.IPostSideBetInput;
      },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return sideBetService.postSideBet(data, ctx);
    },
    updateSideBet: (
      _: any,
      {
        data,
      }: {
        data: sideBetService.IUpdateSideBetInput;
      },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return sideBetService.updateSideBet(data, ctx);
    },
    closeSideBet: (
      _: any,
      {
        data,
      }: {
        data: sideBetService.ICloseSideBetInput;
      },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return sideBetService.closeSideBet(data, ctx);
    },
  },
};
