import { Comment, HostEvent, NFC } from "@prisma/client";
import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as likeService from "./likeService";

export const resolvers = {
  Mutation: {
    handleLike: (
      _: any,
      { data }: { data: likeService.IHandleLikeInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return likeService.handleLike(data, ctx.user, ctx);
    },
  },
  Likable: {
    __resolveType: (obj: Comment | NFC, _ctx: Context) => {
      // if ("hostDate" in obj) {
      //   return "HostEvent";
      // }

      if ("videoLink" in obj) {
        return "NFC";
      }

      throw new Error("Unknown votable type returned");
    },
  },
};
