import { TempToken, User } from "@prisma/client";
import { Context } from "../../context";

import { createPublicClient, http as viemHttp } from "viem";
import { base } from "viem/chains";
import TempTokenV1 from "../../utils/abi/TempTokenV1.json";

type TempTokenWithBalance = TempToken & { balance: bigint };
export interface IPostTempTokenInput {
  tokenAddress: string;
  chainId: number;
  channelId: number;
  name: string;
  symbol: string;
  endUnixTimestamp: string;
  factoryAddress: string;
  creationBlockNumber: string;
  protocolFeePercentage: string;
  streamerFeePercentage: string;
}

export const postTempToken = async (
  data: IPostTempTokenInput,
  user: User,
  ctx: Context
) => {
  return await ctx.prisma.tempToken.create({
    data: {
      uniqueTempTokenId: `${data.tokenAddress}-${String(data.chainId)}`,
      tokenAddress: data.tokenAddress,
      chainId: data.chainId,
      ownerAddress: user.address,
      factoryAddress: data.factoryAddress,
      name: data.name,
      symbol: data.symbol,
      endUnixTimestamp: BigInt(data.endUnixTimestamp),
      protocolFeePercentage: BigInt(data.protocolFeePercentage),
      streamerFeePercentage: BigInt(data.streamerFeePercentage),
      highestTotalSupply: BigInt(0),
      creationBlockNumber: BigInt(data.creationBlockNumber),
      channel: {
        connect: {
          id: data.channelId,
        },
      },
    },
  });
};

export interface IUpdateTempTokenHighestTotalSupplyInput {
  tokenAddresses: string[];
  chainId: number;
  newTotalSupplies: string[];
}

export const updateTempTokenHighestTotalSupply = async (
  data: IUpdateTempTokenHighestTotalSupplyInput,
  ctx: Context
) => {
  if (data.tokenAddresses.length === 0 || data.newTotalSupplies.length === 0)
    return [];
  if (data.tokenAddresses.length !== data.newTotalSupplies.length)
    throw new Error(
      "tokenAddresses and newTotalSupplies must be the same length"
    );
  const updatePromises = data.tokenAddresses.map((tokenAddress, index) => {
    return ctx.prisma.tempToken.update({
      where: {
        uniqueTempTokenId: `${tokenAddress}-${String(data.chainId)}`,
      },
      data: {
        highestTotalSupply: BigInt(data.newTotalSupplies[index]),
      },
    });
  });

  try {
    return await ctx.prisma.$transaction(updatePromises);
  } catch (error) {
    console.error("updateTempTokenHighestTotalSupply error:", error);
    throw error; // Or handle error as needed
  }
};

export interface IUpdateTempTokenHasRemainingFundsForCreatorInput {
  chainId: number;
  channelId: number;
}

export const updateTempTokenHasRemainingFundsForCreator = async (
  data: IUpdateTempTokenHasRemainingFundsForCreatorInput,
  ctx: Context
) => {
  // Create public client based on chainId
  let publicClient: any;

  switch (data.chainId) {
    case 8453:
      publicClient = createPublicClient({
        chain: base as any,
        transport: viemHttp(
          `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_BASE_API_KEY}`
        ),
      });
      break;
    default:
      throw new Error("Chain not supported");
  }

  // Get all existing inactive temp tokens with remaining funds for chainId and channelId
  const existingInactiveTempTokensWithRemainingFunds =
    await ctx.prisma.tempToken.findMany({
      where: {
        chainId: data.chainId,
        channel: {
          is: {
            id: data.channelId,
          },
        },
        endUnixTimestamp: {
          lt: Math.floor(Date.now() / 1000),
        },
        hasRemainingFundsForCreator: true,
      },
    });

  // Get balances for each temp token
  const promises = existingInactiveTempTokensWithRemainingFunds.map(
    async (tempToken) => {
      return publicClient.readContract({
        address: tempToken.tokenAddress,
        abi: TempTokenV1,
        functionName: "getBalance",
      });
    }
  );

  const balances: bigint[] = await Promise.all(promises);

  const tempTokensWithZeroBalances: TempTokenWithBalance[] = [];
  const tempTokensWithNonZeroBalances: TempTokenWithBalance[] = [];

  existingInactiveTempTokensWithRemainingFunds.forEach((tempToken, index) => {
    if (balances[index] === BigInt(0)) {
      tempTokensWithZeroBalances.push({
        ...tempToken,
        balance: balances[index],
      });
    } else {
      tempTokensWithNonZeroBalances.push({
        ...tempToken,
        balance: balances[index],
      });
    }
  });

  await ctx.prisma.tempToken.updateMany({
    where: {
      id: {
        in: tempTokensWithZeroBalances.map((tempToken) => tempToken.id),
      },
    },
    data: {
      hasRemainingFundsForCreator: false,
    },
  });

  return tempTokensWithNonZeroBalances;
};

export interface IUpdateEndTimestampForTokensInput {
  chainId: number;
  additionalDurationInSeconds: number;
  tokenAddresses: string[];
}

export const updateEndTimestampForTokens = async (
  data: IUpdateEndTimestampForTokensInput,
  ctx: Context
) => {
  if (data.tokenAddresses.length === 0) return [];
  const updatePromises = data.tokenAddresses.map((tokenAddress) => {
    const uniqueTempTokenId = `${tokenAddress}-${String(data.chainId)}`;
    return ctx.prisma.tempToken.update({
      where: {
        uniqueTempTokenId: uniqueTempTokenId,
      },
      data: {
        endUnixTimestamp: {
          increment: data.additionalDurationInSeconds,
        },
      },
    });
  });

  try {
    return await ctx.prisma.$transaction(updatePromises);
  } catch (error) {
    console.error("updateEndTimestampForTokens error:", error);
    throw error; // Or handle error as needed
  }
};

export interface IUpdateTempTokenIsAlwaysTradeableInput {
  tokenAddressesSetTrue: string[];
  tokenAddressesSetFalse: string[];
  chainId: number;
}

export const updateTempTokenIsAlwaysTradeable = async (
  data: IUpdateTempTokenIsAlwaysTradeableInput,
  ctx: Context
) => {
  try {
    const updateTruePromise = ctx.prisma.tempToken.updateMany({
      where: {
        tokenAddress: { in: data.tokenAddressesSetTrue },
        chainId: Number(data.chainId),
      },
      data: { isAlwaysTradeable: true },
    });

    const updateFalsePromise = ctx.prisma.tempToken.updateMany({
      where: {
        tokenAddress: { in: data.tokenAddressesSetFalse },
        chainId: Number(data.chainId),
      },
      data: { isAlwaysTradeable: false },
    });

    await Promise.all([updateTruePromise, updateFalsePromise]);

    return true;
  } catch (error) {
    console.error("updateTempTokenIsAlwaysTradeable error:", error);
    throw error; // Or handle error as needed
  }
};

export interface IUpdateTempTokenHasHitTotalSupplyThresholdInput {
  tokenAddressesSetTrue: string[];
  tokenAddressesSetFalse: string[];
  chainId: number;
}

export const updateTempTokenHasHitTotalSupplyThreshold = async (
  data: IUpdateTempTokenHasHitTotalSupplyThresholdInput,
  ctx: Context
) => {
  try {
    const updateTruePromise = ctx.prisma.tempToken.updateMany({
      where: {
        tokenAddress: { in: data.tokenAddressesSetTrue },
        chainId: data.chainId,
      },
      data: { hasHitTotalSupplyThreshold: true },
    });

    const updateFalsePromise = ctx.prisma.tempToken.updateMany({
      where: {
        tokenAddress: { in: data.tokenAddressesSetFalse },
        chainId: data.chainId,
      },
      data: { hasHitTotalSupplyThreshold: false },
    });

    await Promise.all([updateTruePromise, updateFalsePromise]);

    return true;
  } catch (error) {
    console.error("updateTempTokenHasHitTotalSupplyThreshold error:", error);
    throw error; // Or handle error as needed
  }
};

export interface IUpdateTempTokenTransferredLiquidityOnExpirationInput {
  losingTokenAddress: string;
  chainId: number;
  finalLiquidityInWei: string;
}

export const updateTempTokenTransferredLiquidityOnExpiration = async (
  data: IUpdateTempTokenTransferredLiquidityOnExpirationInput,
  ctx: Context
) => {
  try {
    return await ctx.prisma.tempToken.update({
      where: {
        uniqueTempTokenId: `${data.losingTokenAddress}-${String(data.chainId)}`,
      },
      data: {
        transferredLiquidityOnExpiration: BigInt(data.finalLiquidityInWei),
      },
    });
  } catch (error) {
    console.error(
      "updateTempTokenTransferredLiquidityOnExpiration error:",
      error
    );
    throw error; // Or handle error as needed
  }
}

export interface IGetTempTokensInput {
  tokenAddress?: string;
  ownerAddress?: string;
  channelId?: number;
  chainId?: number;
  onlyActiveTokens?: boolean;
  hasHitTotalSupplyThreshold?: boolean;
  isAlwaysTradeable?: boolean;
  factoryAddress?: string;
  fulfillAllNotAnyConditions: boolean;
}

export const getTempTokens = async (
  data: IGetTempTokensInput,
  ctx: Context
) => {
  let endTimestampClause: any = {};
  try {
    if (data.onlyActiveTokens === true) {
      endTimestampClause = {
        endUnixTimestamp: {
          gt: Math.floor(Date.now() / 1000),
        },
      };
    }

    if (data.onlyActiveTokens === false) {
      endTimestampClause = {
        endUnixTimestamp: {
          lt: Math.floor(Date.now() / 1000),
        },
      };
    }

    if (data.fulfillAllNotAnyConditions) {
      return await ctx.prisma.tempToken.findMany({
        where: {
          ownerAddress: data.ownerAddress,
          channel: data.channelId
            ? {
                is: {
                  id: Number(data.channelId),
                },
              }
            : undefined,
          chainId: data.chainId,
          tokenAddress: data.tokenAddress,
          factoryAddress: data.factoryAddress,
          hasHitTotalSupplyThreshold: data.hasHitTotalSupplyThreshold,
          isAlwaysTradeable: data.isAlwaysTradeable,
          ...endTimestampClause,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return await ctx.prisma.tempToken.findMany({
      where: {
        OR: [
          { ownerAddress: data.ownerAddress },
          ...(data.channelId
            ? [{ channel: { is: { id: data.channelId } } }]
            : []),
          { chainId: data.chainId },
          { tokenAddress: data.tokenAddress },
          { factoryAddress: data.factoryAddress },
          { hasHitTotalSupplyThreshold: data.hasHitTotalSupplyThreshold },
          { isAlwaysTradeable: data.isAlwaysTradeable },
          // Assuming endTimestampClause is an object with a comparison operation
          ...Object.entries(endTimestampClause).map(([key, value]) => ({
            [key]: value,
          })),
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("getTempTokens error:", error);
    throw error; // Or handle error as needed
  }
};

export const getChannel = (
  { channelId }: { channelId: string },
  ctx: Context
) => {
  return ctx.prisma.channel.findUnique({ where: { id: Number(channelId) } });
};
