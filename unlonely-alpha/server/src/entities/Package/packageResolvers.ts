import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as packageService from "./packageService";

export const resolvers = {
  Query: {
    getPackages: (_: any, __: any, ctx: any) => {
      return packageService.getPackages(ctx);
    },
  },
  Mutation: {
    updatePackage: (
      _: any,
      { data }: { data: packageService.IUpdatePackageInput },
      ctx: Context
    ) => {
      if (!ctx.user) {
        throw new AuthenticationError("User is not authenticated");
      }
      return packageService.updatePackage(data, ctx);
    },
  },
};
