import { Context } from "../../context";

export interface IPostBaseLeaderboardInput {
  amount: number;
  userAddress: string;
}

export const postBaseLeaderboard = (
  data: IPostBaseLeaderboardInput,
  ctx: Context
) => {
  return ctx.prisma.baseLeaderboard.create({
    data: {
      amount: Number(data.amount),
      owner: {
        connect: {
          address: data.userAddress,
        },
      },
    },
  });
};

export const getBaseLeaderboard = (ctx: Context) => {
  // get all base leaderboard entries, order by amount descending
  return ctx.prisma.baseLeaderboard.findMany({
    orderBy: {
      amount: "desc",
    },
  });
};

export const getOwner = (
  { ownerAddr }: { ownerAddr: string },
  ctx: Context
) => {
  return ctx.prisma.user.findUnique({ where: { address: ownerAddr } });
};
