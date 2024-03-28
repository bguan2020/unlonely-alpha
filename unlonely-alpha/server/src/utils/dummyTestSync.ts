import { PrismaClient } from "@prisma/client";
import { createPublicClient, http as viemHttp } from "viem";
import { base } from "viem/chains";
import TempTokenAbi from "../utils/abi/TempTokenV1.json";

const prisma = new PrismaClient();


export const dummyTestSync = async () => {
    try {
        const qualifiedTokens = await prisma.tempToken.findMany({
            where: {
                isAlwaysTradeable: false
            }
        });

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
        console.log("dummyTestSync success,", res.length, "changed")
        return res;
    } catch (e) {
        console.error("dummyTestSync error", e);
        return [];
    }
}