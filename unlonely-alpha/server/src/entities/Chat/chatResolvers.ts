import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as chatService from "./chatService";

export const resolvers = {
  Query: {
    firstChatExists(_: any, _args: any, ctx: Context) {
      if (!ctx.user) {
        return null;
      }
      return chatService.firstChatExists(ctx.user, ctx);
    },
  },
  Mutation: {
    postFirstChat: (
      _: any,
      { data }: { data: chatService.IPostChatInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return chatService.postFirstChat(data, ctx.user, ctx);
    },
  },
};
