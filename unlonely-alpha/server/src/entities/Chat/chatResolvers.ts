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
    // chatBot(_: any, _args: any, ctx: Context) {
    //   return chatService.chatbot(ctx);
    // },
    getRecentChats: (
      _: any,
      { data }: { data: chatService.IGetChatInput },
      ctx: Context
    ) => {
      return chatService.getRecentChats(data, ctx);
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
  Chat: {
    owner: ({ ownerAddr }: { ownerAddr: string }, _: any, ctx: Context) => {
      return chatService.getOwner({ ownerAddr }, ctx);
    },
  },
};
