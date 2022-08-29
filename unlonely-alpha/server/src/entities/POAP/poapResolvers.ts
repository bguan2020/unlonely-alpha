import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as poapService from "./poapService";

export const resolvers = {
  Query: {
    getPoap(
      _: any,
      { data }: { data: poapService.IGetPoapInput },
      ctx: Context
    ) {
      return poapService.getPoap(data, ctx);
    },
  },
};
