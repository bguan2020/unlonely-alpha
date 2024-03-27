import { PrismaClient } from "@prisma/client";
import { createPublicClient, http as viemHttp } from "viem";
import { base } from "viem/chains";
import TempTokenAbi from "../utils/abi/TempTokenV1.json";

const prisma = new PrismaClient();

/**
 * This server function is scheduled to run every X amount of time. It performs two main checks on tokens:
 * 1. Identifies all tokens whose `endTimestamp` is greater than the current time. These tokens are
 *    considered active, and their status or related information may be updated accordingly.
 * 2. Identifies all tokens that might have "expired" between the current and the last execution of this function.
 *    An expired token is one whose `endTimestamp` was less than the current time at some point between
 *    two consecutive function calls but has been renewed or increased directly through contract interactions.
 * 
 * The purpose is to ensure our system accurately reflects the real-time status of each token, including those
 * that may have been extended in the interim, thus avoiding overlooking tokens that continue to be active due to
 * their `endTimestamp` being extended beyond the original expiration.
 *
 * Note: This function relies on the assumption that `endTimestamp` extensions are done through contract interactions,
 * which may not immediately be reflected in our database until this function executes. Therefore, it's crucial for 
 * maintaining the integrity of token tracking, especially for consumer-facing features that depend on the
 * accuracy of token expiration data.
 *  */
export const fetchForNewTempTokenEndtimestamps = async () => {
    /**
     * This is the offset in milliseconds that should match the interval of the scheduler
     * We will use this to include the temp tokens whose endTimestamps 
     */
    const OFFSET_IN_MILLISECONDS = 1000 * 60 * 10;

    try {
        const qualifiedTokens = await prisma.tempToken.findMany({
            where: {
                endUnixTimestamp: {
                    gt: Date.now() - OFFSET_IN_MILLISECONDS
                },
                isAlwaysTradeable: false
            }
        });

        console.log("fetchForNewTempTokenEndtimestamps", qualifiedTokens.length)

        if (!qualifiedTokens.length) {
            return [];
        }

        const publicClient = createPublicClient({
            chain: base as any,
            transport: viemHttp(
                `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_BASE_API_KEY}`
            ),
        });

        const endTimestamps = await Promise.all(qualifiedTokens.map(async (token) => {
            return (publicClient as any).readContract({
                address: token.tokenAddress  as `0x${string}`,
                abi: TempTokenAbi,
                functionName: "endTimestamp"
            })
        }));

        const updates = endTimestamps.map((endTimestamp, index) => {
            return prisma.tempToken.update({
                where: {
                    id: qualifiedTokens[index].id
                },
                data: {
                    endUnixTimestamp: endTimestamp
                }
            });
        });

        const res = await prisma.$transaction(updates);
        console.log("fetchForNewTempTokenEndtimestamps", res.length)
        return res;
    } catch (e) {
        console.error("fetchForNewTempTokenEndtimestamps error", e);
        return [];
    }
}