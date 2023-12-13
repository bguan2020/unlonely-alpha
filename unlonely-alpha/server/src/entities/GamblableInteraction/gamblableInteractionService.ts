import { Channel, SharesEventState } from "@prisma/client";

import { Context } from "../../context";

enum EventType {
  YAY_NAY_VOTE = "YAY_NAY_VOTE",
  VIP_BADGE = "VIP_BADGE",
  SIDE_BET = "SIDE_BET",
}

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
  eventId: number;
  eventType: EventType;
}

export interface IPostBetTradeInput {
  channelId: string;
  chainId: number;
  userAddress: string;
  eventId: number;
  eventType: EventType;
  type: GamblableEvent;
  fees: number;
}

export interface IPostBadgeTradeInput {
  channelId: string;
  chainId: number;
  userAddress: string;
  eventId: number;
  isBuying: boolean;
  fees: number;
}

export interface IPostClaimPayoutInput {
  channelId: string;
  userAddress: string;
  eventId: number;
  eventType: EventType;
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
      eventId: Number(data.eventId),
      eventType: data.eventType,
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
      eventId: data.eventId,
      eventType: data.eventType,
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
      eventId: data.eventId,
      eventType: EventType.VIP_BADGE,
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
        eventId: data.eventId,
        eventType: EventType.VIP_BADGE,
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
      eventId: data.eventId,
      eventType: data.eventType,
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
  // STEP 1: fetch for all ongoing shares events, if data.channelId is provided, filter by channelId, then get each event's id
  const sharesQuery = {
    where: {
      ...(data.channelId
        ? { channelId: Number(data.channelId), chainId: Number(data.chainId) }
        : { chainId: Number(data.chainId) }),
      eventState: {
        in: [SharesEventState.PAYOUT, SharesEventState.PAYOUT_PREVIOUS],
      },
      softDelete: false,
    },
    orderBy: { createdAt: "desc" as const },
  };

  const ongoingSharesEvents = await ctx.prisma.sharesEvent.findMany(
    sharesQuery
  );
  const eventIds = ongoingSharesEvents.map((event) => event.id);

  /* STEP 2: fetch for all gamblable interactions that match the userAddress, eventIds returned above, the eventType, and gamblableEvent types
              this is us basically asking "give me all the buy and claim interactions that this user made for each of these ongoing events"
  */
  const userInteractions = await ctx.prisma.gamblableInteraction.findMany({
    where: {
      eventId: { in: eventIds },
      eventType: EventType.YAY_NAY_VOTE,
      userAddress: data.userAddress,
      type: {
        in: [
          GamblableEvent.BET_YES_BUY,
          GamblableEvent.BET_NO_BUY,
          GamblableEvent.BET_CLAIM_PAYOUT,
        ],
      },
      softDelete: false,
    },
  });

  // STEP 3: we filter out the events that have already been claimed by the user, thus returning only the events the user had not claimed for
  const unclaimedEvents = ongoingSharesEvents.filter((event) => {
    // STEP 3a: we get the buy interactions for this event
    const buys = userInteractions.filter(
      (interaction) =>
        interaction.eventId === event.id &&
        (interaction.type === GamblableEvent.BET_YES_BUY ||
          interaction.type === GamblableEvent.BET_NO_BUY)
    );

    // STEP 3b: we check if the user has already claimed the payout for this event
    const hasClaimed = userInteractions.some(
      (interaction) =>
        interaction.eventId === event.id &&
        interaction.type === GamblableEvent.BET_CLAIM_PAYOUT
    );

    // STEP 3c: if the user has made buys and has not claimed the payout for this event, we return true, else, return false
    return buys.length > 0 && !hasClaimed;
  });

  return unclaimedEvents;
};
