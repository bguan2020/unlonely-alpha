import { User } from "@prisma/client";
import { Context } from "../../context";

export interface IPostTempTokenInput {
    tokenAddress: string;
    chainId: number;
    channelId: string;
    name: string;
    symbol: string;
    endUnixTimestamp: bigint;
    protocolFeePercentage: bigint;
    streamerFeePercentage: bigint;
}

export const postTempToken = (
    data: IPostTempTokenInput,
    user: User,
    ctx: Context
    ) => {
    return ctx.prisma.tempToken.create({
        data: {
            uniqueTempTokenId: `${data.tokenAddress}-${String(data.chainId)}-${String(data.endUnixTimestamp)}`,
            tokenAddress: data.tokenAddress,
            chainId: data.chainId,
            streamerAddress: user.address,
            name: data.name,
            symbol: data.symbol,
            endUnixTimestamp: data.endUnixTimestamp,
            protocolFeePercentage: data.protocolFeePercentage,
            streamerFeePercentage: data.streamerFeePercentage,
            channel: {
                connect: {
                    id: Number(data.channelId),
                },
            },
        }
    });
}

export interface IGetTempTokensInput {
    tokenAddress?: string,
    streamerAddress?: string,
    channelId?: number,
    chainId?: string
    onlyActiveTokens?: boolean;
}

export const getTempTokens = (
    data: IGetTempTokensInput,
    ctx: Context
) => {

    let endTimestampClause: any = {};

    if (data.onlyActiveTokens) {
        endTimestampClause = {
            endUnixTimestamp: {
                gt: Math.floor(Date.now() / 1000)
            }
        }
    }

    return ctx.prisma.tempToken.findMany({
        where: {
            streamerAddress: data.streamerAddress,
            channel: data.channelId ? {
                id: data.channelId,
            } : undefined,
            chainId: data.chainId,
            tokenAddress: data.tokenAddress,
            ...endTimestampClause
        }
    });
}