import { User } from "@prisma/client";
import { Context } from "../../context";

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
            channel: {
                connect: {
                    id: data.channelId,
                },
            },
        }
    });
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