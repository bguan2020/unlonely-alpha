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
        updateTempTokenHasRemainingFundsForCreator: (
        _: any,
        { data }: { data: tempTokenService.IUpdateTempTokenHasRemainingFundsForCreatorInput },
        ctx: Context
        ) => {
            if (!ctx.user || !ctx.userIsAuthed) {
                throw new AuthenticationError("User is not authenticated");
            }
        
            return tempTokenService.updateTempTokenHasRemainingFundsForCreator(data, ctx);
        },
        updateTempTokenHighestTotalSupply: (
        _: any,
        { data }: { data: tempTokenService.IUpdateTempTokenHighestTotalSupplyInput },
        ctx: Context
        ) => {
            if (!ctx.user || !ctx.userIsAuthed) {
                throw new AuthenticationError("User is not authenticated");
            }
        
            return tempTokenService.updateTempTokenHighestTotalSupply(data, ctx);
        },
        postTempToken: (
        _: any,
        { data }: { data: tempTokenService.IPostTempTokenInput },
        ctx: Context
        ) => {
            if (!ctx.user || !ctx.userIsAuthed) {
                throw new AuthenticationError("User is not authenticated");
            }
        
            return tempTokenService.postTempToken(data, ctx.user, ctx);
        },
    },
};