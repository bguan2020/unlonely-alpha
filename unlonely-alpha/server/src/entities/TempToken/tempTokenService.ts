import { TempToken, User } from "@prisma/client";
import { Context } from "../../context";

import { createPublicClient, http as viemHttp } from "viem";
import { base } from "viem/chains";
import TempTokenV1 from "../../utils/abi/TempTokenV1.json";
export interface IPostTempTokenInput {
    tokenAddress: string;
    chainId: number;
    channelId: number;
    name: string;
    symbol: string;
    endUnixTimestamp: string;
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
            uniqueTempTokenId: `${data.tokenAddress}-${String(data.chainId)}-${String(data.endUnixTimestamp)}`,
            tokenAddress: data.tokenAddress,
            chainId: data.chainId,
            ownerAddress: user.address,
            name: data.name,
            symbol: data.symbol,
            endUnixTimestamp: BigInt(data.endUnixTimestamp),
            protocolFeePercentage: BigInt(data.protocolFeePercentage),
            streamerFeePercentage: BigInt(data.streamerFeePercentage),
            highestTotalSupply: BigInt(0),
            channel: {
                connect: {
                    id: data.channelId,
                },
            },
        }
    });
}

export interface IUpdateTempTokenHighestTotalSupplyInput {
    tokenAddress: string;
    endUnixTimestamp: string;
    chainId: number;
    currentTotalSupply: string;
}

export const updateTempTokenHighestTotalSupply = async (
    data: IUpdateTempTokenHighestTotalSupplyInput,
    ctx: Context
) => {

    const existingTempToken = await ctx.prisma.tempToken.findUnique({
        where: {
            uniqueTempTokenId: `${data.tokenAddress}-${String(data.chainId)}-${String(data.endUnixTimestamp)}`
        }
    });

    if (!existingTempToken) {
        throw new Error("Temp token not found");
    }

    // Ensure currentTotalSupply and highestTotalSupply are BigInt for comparison
    const newTotalSupplyBigInt = BigInt(data.currentTotalSupply);
    const existingHighestTotalSupplyBigInt = BigInt(existingTempToken.highestTotalSupply);

    // Update only if newTotalSupplyBigInt is greater
    if (newTotalSupplyBigInt > existingHighestTotalSupplyBigInt) {
        return await ctx.prisma.tempToken.update({
            where: {
                id: existingTempToken.id
            },
            data: {
                highestTotalSupply: newTotalSupplyBigInt
            }
        });
    } else {
        return existingTempToken;
    }
}

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

    switch(data.chainId) {
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
    const existingInactiveTempTokensWithRemainingFunds = await ctx.prisma.tempToken.findMany({
        where: {
            chainId: data.chainId,
            channel: {
                is: {
                    id: data.channelId
                }
            },
            endUnixTimestamp: {
                lt: Math.floor(Date.now() / 1000)
            },
            hasRemainingFundsForCreator: true
        }
    });

    // Get balances for each temp token
    const promises = existingInactiveTempTokensWithRemainingFunds.map(async (tempToken) => {
            return publicClient.readContract({
                address: tempToken.tokenAddress,
                abi: TempTokenV1,
                functionName: "getBalance",
            });
        })

    const balances: bigint[] = await Promise.all(promises);

    const tempTokensWithZeroBalances: TempToken[] = [];
    const tempTokensWithNonZeroBalances: TempToken[] = [];
    
    existingInactiveTempTokensWithRemainingFunds.forEach((tempToken, index) => {
        if (balances[index] === BigInt(0)) {
            tempTokensWithZeroBalances.push(tempToken);
        } else {
            tempTokensWithNonZeroBalances.push(tempToken);
        }
    });

    await ctx.prisma.tempToken.updateMany({
        where: {
            id: {
                in: tempTokensWithZeroBalances.map((tempToken) => tempToken.id)
            }
        },
        data: {
            hasRemainingFundsForCreator: false
        }
    });

    return tempTokensWithNonZeroBalances;
}

export interface IGetTempTokensInput {
    tokenAddress?: string,
    ownerAddress?: string,
    channelId?: number,
    chainId?: string
    onlyActiveTokens?: boolean;
}

export const getTempTokens = async (
    data: IGetTempTokensInput,
    ctx: Context
) => {

    let endTimestampClause: any = {};

    if (data.onlyActiveTokens === true) {
        endTimestampClause = {
            endUnixTimestamp: {
                gt: Math.floor(Date.now() / 1000)
            }
        }
    }

    if (data.onlyActiveTokens === false) {
        endTimestampClause = {
            endUnixTimestamp: {
                lt: Math.floor(Date.now() / 1000)
            }
        }
    }

    return await ctx.prisma.tempToken.findMany({
        where: {
            ownerAddress: data.ownerAddress,
            channel: data.channelId ? {
                is: {
                    id: Number(data.channelId)
                },
            } : undefined,
            chainId: data.chainId,
            tokenAddress: data.tokenAddress,
            ...endTimestampClause
        },
        orderBy: { createdAt: "desc" },
    });
}