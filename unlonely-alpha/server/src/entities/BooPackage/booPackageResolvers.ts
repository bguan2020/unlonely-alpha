// import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as booPackageService from "./booPackageService";

export const resolvers = {
    Query: {
        getBooPackages: (_: any, __: any, ctx: any) => {
            return booPackageService.getBooPackages(ctx);
        },
    },
    Mutation: {
        updateBooPackage: (
            _: any,
            { data }: { data: booPackageService.IUpdateBooPackageInput },
            ctx: Context
        ) => {
            // if (!ctx.user) {
            //     throw new AuthenticationError("User is not authenticated");
            // }
            return booPackageService.updateBooPackage(data, ctx);
        },
    },
}