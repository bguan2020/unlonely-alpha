import { AuthenticationError } from "apollo-server-express";
import { Context } from "../../context";

import * as tempTokenService from "./tempTokenService";

export const resolvers = {
  Query: {
    getTempTokens: (
      _: any,
      { data }: { data: tempTokenService.IGetTempTokensInput },
      ctx: Context
    ) => {
      return tempTokenService.getTempTokens(data, ctx);
    },
  },
  Mutation: {
    updateEndTimestampForTokens: (
      _: any,
      { data }: { data: tempTokenService.IUpdateEndTimestampForTokensInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }
      return tempTokenService.updateEndTimestampForTokens(data, ctx);
    },
    updateTempTokenHasRemainingFundsForCreator: (
      _: any,
      {
        data,
      }: {
        data: tempTokenService.IUpdateTempTokenHasRemainingFundsForCreatorInput;
      },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return tempTokenService.updateTempTokenHasRemainingFundsForCreator(
        data,
        ctx
      );
    },
    updateTempTokenIsAlwaysTradeable: (
      _: any,
      {
        data,
      }: { data: tempTokenService.IUpdateTempTokenIsAlwaysTradeableInput },
      ctx: Context
    ) => {
      return tempTokenService.updateTempTokenIsAlwaysTradeable(data, ctx);
    },
    updateTempTokenHasHitTotalSupplyThreshold: (
      _: any,
      {
        data,
      }: {
        data: tempTokenService.IUpdateTempTokenHasHitTotalSupplyThresholdInput;
      },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return tempTokenService.updateTempTokenHasHitTotalSupplyThreshold(
        data,
        ctx
      );
    },
    updateTempTokenHighestTotalSupply: (
      _: any,
      {
        data,
      }: { data: tempTokenService.IUpdateTempTokenHighestTotalSupplyInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return tempTokenService.updateTempTokenHighestTotalSupply(data, ctx);
    },
    updateTempTokenTransferredLiquidityOnExpiration: (
      _: any,
      {
        data,
      }: {
        data: tempTokenService.IUpdateTempTokenTransferredLiquidityOnExpirationInput;
      },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return tempTokenService.updateTempTokenTransferredLiquidityOnExpiration(
        data,
        ctx
      );
    },
    postTempToken: (
      _: any,
      { data }: { data: tempTokenService.IPostTempTokenInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return tempTokenService.postTempToken(data, ctx);
    },
  },
  TempToken: {
    channel: ({ channelId }: { channelId: string }, _: any, ctx: Context) => {
      return tempTokenService.getChannel({ channelId }, ctx);
    },
  },
};
