import { Context } from "../../context";

export const getEventLeaderboardByChannel = (
  { channelId }: { channelId: number },
  ctx: Context
) => {
  return ctx.prisma.eventLeaderboard.findMany({
    where: {
      channelId,
    },
    orderBy: {
      totalFees: "desc",
    },
  });
};
