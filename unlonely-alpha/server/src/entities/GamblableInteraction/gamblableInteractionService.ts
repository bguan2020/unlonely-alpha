import { Channel, SharesEventState } from "@prisma/client";

import { Context } from "../../context";

enum GamblableEvent {
  BET_CREATE = "BET_CREATE",
  BET_YES_BUY = "BET_YES_BUY",
  BET_NO_BUY = "BET_NO_BUY",
  BET_YES_SELL = "BET_YES_SELL",
  BET_NO_SELL = "BET_NO_SELL",
  BET_CLAIM_PAYOUT = "BET_CLAIM_PAYOUT",
  BADGE_CLAIM_PAYOUT = "BADGE_CLAIM_PAYOUT",
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
  sharesEventId: number;
}

export interface IPostBetTradeInput {
  channelId: string;
  chainId: number;
  userAddress: string;
  sharesEventId: number;
  type: GamblableEvent;
  fees: number;
}

export interface IPostBadgeTradeInput {
  channelId: string;
  chainId: number;
  userAddress: string;
  sharesEventId: number;
  isBuying: boolean;
  fees: number;
}

export interface IPostClaimPayoutInput {
  channelId: string;
  userAddress: string;
  sharesEventId: number;
  type: GamblableEvent;
}

export interface IGetBetsByChannelInput {
  channelId: string;
}

export interface IGetBetsByUserInput {
  userAddress: string;
}

export interface IGetUnclaimedEvents {
  channelId?: string;
  userAddress?: string;
  chainId: number;
}

export interface IGetGamblableEventLeaderboardByChannelInput {
  channelId: string;
  chainId: number;
}

export interface IGetGamblableEventUserRankInput {
  channelId: string;
  chainId: number;
  userAddress: string;
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

export const getGamblableEventUserRank = async (
  data: IGetGamblableEventUserRankInput,
  ctx: Context
) => {
  const leaderboard = await ctx.prisma.gamblableEventLeaderboard.findMany({
    where: {
      channelId: Number(data.channelId),
      chainId: data.chainId,
    },
    orderBy: {
      totalFees: "desc",
    },
  });

  // Find the index of the user in the sorted list of token holdings
  const userRanking = leaderboard.findIndex(
    (entry) => entry.userAddress === data.userAddress
  );

  // The 'findIndex' function returns -1 if it does not find the user in the list,
  // so we need to account for this
  return userRanking;
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
      sharesEvent: {
        connect: {
          id: data.sharesEventId,
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
      sharesEvent: {
        connect: {
          id: data.sharesEventId,
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
      sharesEventId: data.sharesEventId,
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
        sharesEvent: {
          connect: {
            id: Number(data.sharesEventId),
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

export const postClaimPayout = async (
  data: IPostClaimPayoutInput,
  ctx: Context
) => {
  // Find an existing gamblable interaction that matches channelId, userAddress, sharesEventId, and type
  return await ctx.prisma.gamblableInteraction.create({
    data: {
      channel: {
        connect: {
          id: Number(data.channelId),
        },
      },
      sharesEvent: {
        connect: {
          id: Number(data.sharesEventId),
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
          GamblableEvent.BET_CLAIM_PAYOUT,
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
          GamblableEvent.BET_CLAIM_PAYOUT,
        ],
      },
    },
    include: {
      channel: true,
    },
  });

  return bets;
};

export const getUnclaimedEvents = async (
  data: IGetUnclaimedEvents,
  ctx: Context
) => {
  // Step 1: Fetch ongoing SharesEvents
  let sharesQuery = {};

  if (data.channelId) {
    sharesQuery = {
      where: {
        channelId: Number(data.channelId),
        eventState: SharesEventState.PAYOUT,
        chainId: Number(data.chainId),
        softDelete: false,
      },
      orderBy: { createdAt: "desc" },
    };
  } else {
    sharesQuery = {
      where: {
        eventState: SharesEventState.PAYOUT,
        softDelete: false,
      },
      orderBy: { createdAt: "desc" },
    };
  }

  const ongoingSharesEvents = await ctx.prisma.sharesEvent.findMany(
    sharesQuery
  );

  const unclaimedEvents = [];

  // Step 2: Fetch all GamblableInteractions that are either BET_YES_BUY or BET_NO_BUY,
  // then fetch the first GamblableInteraction that is a claim, if found, that is a closed transaction,
  // else, add it to the returning array
  for (const event of ongoingSharesEvents) {
    let userBuysQuery = {};

    if (data.userAddress) {
      userBuysQuery = {
        where: {
          sharesEventId: event.id,
          userAddress: data.userAddress,
          type: {
            in: [GamblableEvent.BET_YES_BUY, GamblableEvent.BET_NO_BUY],
          },
          softDelete: false,
        },
      };
    } else {
      userBuysQuery = {
        where: {
          sharesEventId: event.id,
          type: {
            in: [GamblableEvent.BET_YES_BUY, GamblableEvent.BET_NO_BUY],
          },
          softDelete: false,
        },
      };
    }

    const userBuys = await ctx.prisma.gamblableInteraction.findMany(
      userBuysQuery
    );

    let hasClaimedQuery = {};

    if (data.userAddress) {
      hasClaimedQuery = {
        where: {
          sharesEventId: event.id,
          userAddress: data.userAddress,
          type: {
            in: [GamblableEvent.BET_CLAIM_PAYOUT],
          },
          softDelete: false,
        },
      };
    } else {
      hasClaimedQuery = {
        where: {
          sharesEventId: event.id,
          type: {
            in: [GamblableEvent.BET_CLAIM_PAYOUT],
          },
          softDelete: false,
        },
      };
    }

    const hasClaimed = await ctx.prisma.gamblableInteraction.findFirst(
      hasClaimedQuery
    );

    // Step 3: Determine if the event is unclaimed
    if (userBuys.length > 0 && !hasClaimed) {
      unclaimedEvents.push(event);
    }
  }

  return unclaimedEvents;
};
