import { User } from "@prisma/client";

import { Context } from "../../context";

export interface ICreateCreatorTokenInput {
  address: string;
  symbol: string;
  name: string;
  price: number | string;
  channelId: string;
}

export const createCreatorToken = (
  data: ICreateCreatorTokenInput,
  ctx: Context
) => {
  return ctx.prisma.creatorToken.create({
    data: {
      address: data.address,
      symbol: data.symbol,
      name: data.name,
      price: Number(data.price),
      channel: {
        connect: {
          id: Number(data.channelId),
        },
      },
    },
  });
};

// update the price of a token
export interface IUpdateCreatorTokenPriceInput {
  tokenAddress: string;
  price: number | string;
}

export const updateCreatorTokenPrice = (
  data: IUpdateCreatorTokenPriceInput,
  ctx: Context
) => {
  return ctx.prisma.creatorToken.update({
    where: {
      address: data.tokenAddress,
    },
    data: {
      price: Number(data.price),
    },
  });
};

export interface IUpdateUserCreatorTokenQuantityInput {
  tokenAddress: string;
  purchasedAmount: number;
}

export const updateUserCreatorTokenQuantity = async (
  data: IUpdateUserCreatorTokenQuantityInput,
  user: User,
  ctx: Context
) => {
  // first check if the user already has a quantity of this token
  const existingUserToken = await ctx.prisma.userCreatorToken.findUnique({
    where: {
      userAddress_tokenAddress: {
        userAddress: user.address,
        tokenAddress: data.tokenAddress,
      },
    },
  });

  if (existingUserToken) {
    // if so, update the quantity
    return ctx.prisma.userCreatorToken.update({
      where: {
        userAddress_tokenAddress: {
          userAddress: user.address,
          tokenAddress: data.tokenAddress,
        },
      },
      data: {
        quantity: existingUserToken.quantity + data.purchasedAmount,
      },
    });
  } else {
    // if not, create a new entry
    return ctx.prisma.userCreatorToken.create({
      data: {
        user: {
          connect: {
            address: user.address,
          },
        },
        token: {
          connect: {
            address: data.tokenAddress,
          },
        },
        quantity: data.purchasedAmount,
      },
    });
  }
};

export interface IGetTokenHoldersByChannelInput {
  limit?: number;
  offset?: number;
  channelId: string;
}

export const getTokenHoldersByChannel = (
  data: IGetTokenHoldersByChannelInput,
  ctx: Context
) => {
  // add limit and offset pagination, set to top 10 default if empty
  // order by qunatity descending
  const limit = data.limit || 10;
  const offset = data.offset || 0;

  return ctx.prisma.userCreatorToken.findMany({
    where: {
      token: {
        channel: {
          id: Number(data.channelId),
        },
      },
    },
    include: {
      user: true,
    },
    take: limit,
    skip: offset,
    orderBy: {
      quantity: "desc",
    },
  });
};

export const getOwner = (
  { ownerAddr }: { ownerAddr: string },
  ctx: Context
) => {
  return ctx.prisma.user.findUnique({
    where: {
      address: ownerAddr,
    },
  });
};
