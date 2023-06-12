import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as creatorTokenService from "./creatorTokenService";

export const resolvers = {
  Query: {
    getTokenHoldersByChannel: (
      _: any,
      { data }: { data: creatorTokenService.IGetTokenHoldersByChannelInput },
      ctx: Context
    ) => {
      return creatorTokenService.getTokenHoldersByChannel(data, ctx);
    }
  },
  Mutation: {
    createCreatorToken: (
      _: any,
      { data }: { data: creatorTokenService.ICreateCreatorTokenInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return creatorTokenService.createCreatorToken(data, ctx);
    },
    updateCreatorTokenPrice: (
      _: any,
      { data }: { data: creatorTokenService.IUpdateCreatorTokenPriceInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return creatorTokenService.updateCreatorTokenPrice(data, ctx);
    },
    updateUserCreatorTokenQuantity: (
      _: any,
      {
        data,
      }: { data: creatorTokenService.IUpdateUserCreatorTokenQuantityInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return creatorTokenService.updateUserCreatorTokenQuantity(
        data,
        ctx.user,
        ctx
      );
    },
  },
};
