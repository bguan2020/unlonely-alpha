import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as roomService from "./roomService";

export const resolvers = {
  Query: {
    getRooms: (_: any, __: any, ctx: any) => {
      return roomService.getRooms(ctx);
    },
  },
  Mutation: {
    updateRooms: (
      _: any,
      { data }: { data: roomService.IUpdateRoomsInput },
      ctx: Context
    ) => {
      if (!ctx.user) {
        throw new AuthenticationError("User is not authenticated");
      }
      return roomService.updateRooms(data, ctx);
    },
  },
};
