import centerEllipses from "./centerEllipses";

export const getSortedLeaderboard = (
  leaderboard: {
    user: {
      username?: string | null | undefined;
      address: string;
    };
    totalFees: number;
  }[]
) => {
  return leaderboard
    .map((entry: any) => {
      return {
        name: entry.user.username ?? centerEllipses(entry.user.address, 10),
        totalFees: entry.totalFees,
      };
    })
    .sort((a: any, b: any) => b.totalFees - a.totalFees)
    .slice(0, 10);
};
