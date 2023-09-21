import { User } from "@prisma/client";

import { Context } from "../../context";

export interface IPostBaseLeaderboardInput {
  amount: number;
}

export const postBaseLeaderboard = (
  data: IPostBaseLeaderboardInput,
  user: User,
  ctx: Context
) => {
  return ctx.prisma.baseLeaderboard.create({
    data: {
      amount: data.amount,
      user: {
        connect: {
          address: user.address,
        }
      },
    }
  });
};

export const getBaseLeaderboard = (
  ctx: Context
) => {
  // get all base leaderboard entries, order by amount descending
  return ctx.prisma.baseLeaderboard.findMany({
    orderBy: {
      amount: "desc",
    },
  });
};