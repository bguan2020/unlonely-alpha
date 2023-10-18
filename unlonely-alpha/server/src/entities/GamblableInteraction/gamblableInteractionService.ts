import { Context } from "../../context";

enum GamblableEvent {
  BET_CREATE = "BET_CREATE",
  BET_YES = "BET_YES",
  BET_NO = "BET_NO",
  BADGE_BUY = "BADGE_BUY",
  BADGE_SELL = "BADGE_SELL",
}

type NumberOfHolders = {
  channelId: string;
  holders: number;
};

export interface IGetBadgeHoldersByChannelInput {
  channelId: string;
}

export interface ICreateBetInput {
  channelId: string;
  userAddress: string;
}

export interface IRecordBetBuyInput {
  channelId: string;
  userAddress: string;
  isYay: boolean;
}

export interface IRecordBadgeTradeInput {
  channelId: string;
  userAddress: string;
  isBuying: boolean;
}

export const createBet = (data: ICreateBetInput, ctx: Context) => {
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

export const recordBetBuy = (data: IRecordBetBuyInput, ctx: Context) => {
  return ctx.prisma.gamblableInteraction.create({
    data: {
      channel: {
        connect: {
          id: Number(data.channelId),
        },
      },
      type: data.isYay ? GamblableEvent.BET_YES : GamblableEvent.BET_NO,
      user: {
        connect: {
          address: data.userAddress,
        },
      },
    },
  });
};

export const recordBadgeTrade = async (
  data: IRecordBadgeTradeInput,
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
        softDelete: data.isBuying,
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
        softDelete: data.isBuying,
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
  const uniqueHolders = [...uniqueUserAddressesMap.keys()];
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
    },
  });

  /*

    channel1: [...]
    channel2: [...]
    ...
  */
  const uniqueChannelTradesMap = new Map();
  badgeBuys.forEach((item) => {
    if (!uniqueChannelTradesMap.has(item.channelId)) {
      uniqueChannelTradesMap.set(item.channelId, [item]);
    } else {
      const existingTrades = uniqueChannelTradesMap.get(item.channelId);
      uniqueChannelTradesMap.set(item.channelId, [...existingTrades, item]);
    }
  });

  const result = Array.from(uniqueChannelTradesMap.entries())
    .map(([key, arr]) => ({ channelId: key, holders: arr.length }))
    .sort((a, b) => b.holders - a.holders);

  return result;
};
