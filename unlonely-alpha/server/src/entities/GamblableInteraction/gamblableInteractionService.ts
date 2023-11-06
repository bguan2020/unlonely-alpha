import { Channel } from "@prisma/client";

import { Context } from "../../context";

enum GamblableEvent {
  BET_CREATE = "BET_CREATE",
  BET_YES_BUY = "BET_YES_BUY",
  BET_NO_BUY = "BET_NO_BUY",
  BET_YES_SELL = "BET_YES_SELL",
  BET_NO_SELL = "BET_NO_SELL",
  BADGE_BUY = "BADGE_BUY",
  BADGE_SELL = "BADGE_SELL",
}

type NumberOfHolders = {
  channel: Channel;
  holders: number;
};

export interface IGetBadgeHoldersByChannelInput {
  channelId: string;
}

export interface IPostBetInput {
  channelId: string;
  userAddress: string;
}

export interface IPostBetTradeInput {
  channelId: string;
  chainId: number;
  userAddress: string;
  type: GamblableEvent;
  fees: number;
}

export interface IPostBadgeTradeInput {
  channelId: string;
  chainId: number;
  userAddress: string;
  isBuying: boolean;
  fees: number;
}

export interface IGetBetsByChannelInput {
  channelId: string;
}

export interface IGetBetsByUserInput {
  userAddress: string;
}

export interface IGetGamblableEventLeaderboardByChannelInput {
  channelId: string;
  chainId: number;
}

const handleExistingLeaderboardEntry = async (
  channelId: number,
  userAddress: string,
  chainId: number,
  ctx: Context,
  fees: number
) => {
  const existingLeaderboardEntry =
    await ctx.prisma.gamblableEventLeaderboard.findFirst({
      where: {
        channelId: channelId,
        userAddress: userAddress,
        chainId: chainId,
      },
    });

  if (!existingLeaderboardEntry) {
    await ctx.prisma.gamblableEventLeaderboard.create({
      data: {
        channel: {
          connect: {
            id: channelId,
          },
        },
        chainId: chainId,
        user: {
          connect: {
            address: userAddress,
          },
        },
        totalFees: fees,
      },
    });
  } else {
    await ctx.prisma.gamblableEventLeaderboard.update({
      where: {
        id: existingLeaderboardEntry.id,
      },
      data: {
        totalFees: existingLeaderboardEntry.totalFees + fees,
      },
    });
  }
};

export const getGamblableEventLeaderboardByChannel = (
  data: IGetGamblableEventLeaderboardByChannelInput,
  ctx: Context
) => {
  return ctx.prisma.gamblableEventLeaderboard.findMany({
    where: {
      channelId: Number(data.channelId),
      chainId: data.chainId,
    },
    include: {
      user: true,
    },
    orderBy: {
      totalFees: "desc",
    },
  });
};

export const postBet = (data: IPostBetInput, ctx: Context) => {
  return ctx.prisma.gamblableInteraction.create({
    data: {
      channel: {
        connect: {
          id: Number(data.channelId),
        },
      },
      type: GamblableEvent.BET_CREATE,
      user: {
        connect: {
          address: data.userAddress,
        },
      },
    },
  });
};

export const postBetTrade = async (data: IPostBetTradeInput, ctx: Context) => {
  await handleExistingLeaderboardEntry(
    Number(data.channelId),
    data.userAddress,
    data.chainId,
    ctx,
    data.fees
  );

  return ctx.prisma.gamblableInteraction.create({
    data: {
      channel: {
        connect: {
          id: Number(data.channelId),
        },
      },
      type: data.type,
      user: {
        connect: {
          address: data.userAddress,
        },
      },
    },
  });
};

export const postBadgeTrade = async (
  data: IPostBadgeTradeInput,
  ctx: Context
) => {
  // Find an existing trade with a matching channelId, userAddress, and the type being either BADGE_BUY or BADGE_SELL
  const existingBadgeTrade = await ctx.prisma.gamblableInteraction.findFirst({
    where: {
      channelId: Number(data.channelId),
      userAddress: data.userAddress,
      type: {
        in: [GamblableEvent.BADGE_BUY, GamblableEvent.BADGE_SELL],
      },
    },
  });

  await handleExistingLeaderboardEntry(
    Number(data.channelId),
    data.userAddress,
    data.chainId,
    ctx,
    data.fees
  );

  if (existingBadgeTrade) {
    // If found, update the existing trade while retaining the same channelId and userAddress
    // and update the type based on the input
    return ctx.prisma.gamblableInteraction.update({
      where: {
        id: existingBadgeTrade.id,
      },
      data: {
        type: data.isBuying
          ? GamblableEvent.BADGE_BUY
          : GamblableEvent.BADGE_SELL,
        softDelete: !data.isBuying,
      },
    });
  } else {
    // If not found, create a new record with the given details
    return ctx.prisma.gamblableInteraction.create({
      data: {
        channel: {
          connect: {
            id: Number(data.channelId),
          },
        },
        type: data.isBuying
          ? GamblableEvent.BADGE_BUY
          : GamblableEvent.BADGE_SELL,
        softDelete: !data.isBuying,
        user: {
          connect: {
            address: data.userAddress,
          },
        },
      },
    });
  }
};

export const getBadgeHoldersByChannel = async (
  data: IGetBadgeHoldersByChannelInput,
  ctx: Context
) => {
  const badgeBuys = await ctx.prisma.gamblableInteraction.findMany({
    where: {
      channelId: Number(data.channelId),
      type: GamblableEvent.BADGE_BUY,
      softDelete: false,
    },
    include: {
      user: true,
    },
  });

  const uniqueUserAddressesMap = new Map();
  badgeBuys.forEach((item) => {
    if (!uniqueUserAddressesMap.has(item.userAddress)) {
      uniqueUserAddressesMap.set(item.userAddress, item);
    }
  });
  const uniqueHolders: string[] = [...uniqueUserAddressesMap.keys()];
  return uniqueHolders;
};

export const getChannelsByNumberOfBadgeHolders = async (
  ctx: Context
): Promise<NumberOfHolders[]> => {
  // return array of { channelId, number of holders } in descending order
  const badgeBuys = await ctx.prisma.gamblableInteraction.findMany({
    where: {
      type: GamblableEvent.BADGE_BUY,
      softDelete: false,
    },
    include: {
      user: true,
      channel: true,
    },
  });

  const uniqueChannelTradesMap = new Map();
  badgeBuys.forEach((item) => {
    if (!uniqueChannelTradesMap.has(item.channel.id)) {
      uniqueChannelTradesMap.set(item.channel.id, [item]);
    } else {
      const existingTrades = uniqueChannelTradesMap.get(item.channel.id);
      uniqueChannelTradesMap.set(item.channel.id, [...existingTrades, item]);
    }
  });

  const result = Array.from(uniqueChannelTradesMap.entries()).map(
    ([channelId, interactions]) => ({
      channel: interactions[0].channel,
      holders: interactions.length,
    })
  );

  return result;
};

export const getBetsByChannel = async (
  data: IGetBetsByChannelInput,
  ctx: Context
) => {
  const bets = await ctx.prisma.gamblableInteraction.findMany({
    where: {
      channelId: Number(data.channelId),
      type: {
        in: [
          GamblableEvent.BET_YES_BUY,
          GamblableEvent.BET_NO_BUY,
          GamblableEvent.BET_YES_SELL,
          GamblableEvent.BET_NO_SELL,
        ],
      },
    },
    include: {
      user: true,
    },
  });

  return bets;
};

export const getBetsByUser = async (
  data: IGetBetsByUserInput,
  ctx: Context
) => {
  const bets = await ctx.prisma.gamblableInteraction.findMany({
    where: {
      userAddress: data.userAddress,
      type: {
        in: [
          GamblableEvent.BET_YES_BUY,
          GamblableEvent.BET_NO_BUY,
          GamblableEvent.BET_YES_SELL,
          GamblableEvent.BET_NO_SELL,
        ],
      },
    },
    include: {
      channel: true,
    },
  });

  return bets;
};
