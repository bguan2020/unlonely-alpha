import { AuthenticationError } from "apollo-server";

import { Context } from "../../context";
import * as taskService from "./taskService";

export const resolvers = {
  Query: {
    getTaskFeed(_: any, data: taskService.IGetTaskFeedInput, ctx: Context) {
      return taskService.getTaskFeed(data, ctx);
    },
  },
  Mutation: {
    postTask: (
      _: any,
      { data }: { data: taskService.IPostTaskInput },
      ctx: Context
    ) => {
      if (!ctx.user || !ctx.userIsAuthed) {
        throw new AuthenticationError("User is not authenticated");
      }

      return taskService.postTask(data, ctx.user, ctx);
    },
  },
  Task: {
    owner: ({ ownerAddr }: { ownerAddr: string }, _: any, ctx: Context) => {
      return taskService.getOwner({ ownerAddr }, ctx);
    },
  },
};
