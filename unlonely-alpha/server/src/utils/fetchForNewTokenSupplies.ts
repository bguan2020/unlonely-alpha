import { PrismaClient } from "@prisma/client";
import { createPublicClient, http as viemHttp } from "viem";
import { base } from "viem/chains";
import TempTokenAbi from "../utils/abi/TempTokenV1.json";

const prisma = new PrismaClient();

export const fetchForNewTokenSupplies = async () => {
  try {
    const qualifiedTokens = await prisma.tempToken.findMany({
      where: {
        OR: [
          {
            endUnixTimestamp: {
              gt: Math.floor(Date.now() / 1000),
            },
          },
          {
            isAlwaysTradeable: true,
          },
        ],
      },
    });

    console.log("fetchForNewTokenSupplies", qualifiedTokens.length);

    if (!qualifiedTokens.length) {
      return [];
    }

    const publicClient = createPublicClient({
      chain: base as any,
      transport: viemHttp(
        `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_BASE_API_KEY}`
      ),
    });

    const totalSupplies = await Promise.all(
      qualifiedTokens.map(async (token) => {
        return (publicClient as any).readContract({
          address: token.tokenAddress as `0x${string}`,
          abi: TempTokenAbi,
          functionName: "totalSupply",
        });
      })
    );

    const updates = [];

    for (let i = 0; i < totalSupplies.length; i++) {
      if (BigInt(totalSupplies[i]) === BigInt(qualifiedTokens[i].totalSupply))
        continue;
      updates.push(
        prisma.tempToken.update({
          where: {
            id: qualifiedTokens[i].id,
          },
          data: {
            totalSupply: totalSupplies[i],
          },
        })
      );
    }

    const res = await prisma.$transaction(updates);
    console.log("fetchForNewTokenSupplies", res.length);
    return res;
  } catch (e) {
    console.error("fetchForNewTokenSupplies error", e);
    return [];
  }
};
