import { PrismaClient } from "@prisma/client";
import { calculateEthFromVibesAmount } from "../../utils/calculation";
import { createPublicClient, http as viemHttp, parseAbiItem } from "viem";
import { base } from "viem/chains";
import VibesTokenAbi from "../../utils/abi/VibesTokenV1.json";

const prisma = new PrismaClient();

export enum VibesTransactionType {
    BUY = "BUY",
    SELL = "SELL",
  }

export const CREATION_BLOCK = BigInt(9018023);

type streamerStoreType = {
    newTotalVibesVolume: string,
    newTotalWeiVolume: string,
    newTotalProtocolWeiFees: string,
    newTotalStreamerWeiFees: string,
}

export interface IPostVibesTradesInput {
    chainId: number;
    tokenAddress: string;
}

export const postVibesTrades = async (data: IPostVibesTradesInput) => {

    try {
    // Get the latest transaction in database
    const latestTransaction = await prisma.vibesTransaction.findFirst({
        where: {
            chainId: data.chainId,
        },
        orderBy: {
            blockNumber: "desc",
        },
    });

    const publicClient = createPublicClient({
        chain: base as any,
        transport: viemHttp(
            `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_BASE_API_KEY}`
          ),
      });

    // start with the block after the latest transaction in the database
    const fromBlock = latestTransaction ? latestTransaction.blockNumber + BigInt(1) : CREATION_BLOCK;

    const [mintLogs, burnLogs] = await Promise.all([
        (publicClient as any).getLogs({
          address: data.tokenAddress as `0x${string}`,
          event: parseAbiItem(
            "event Mint(address indexed account, uint256 amount, address indexed streamerAddress, uint256 indexed totalSupply)"
          ),
          fromBlock,
        }),
        (publicClient as any).getLogs({
          address: data.tokenAddress as `0x${string}`,
          event: parseAbiItem(
            "event Burn(address indexed account, uint256 amount, address indexed streamerAddress, uint256 indexed totalSupply)"
          ),
          fromBlock,
        })
    ]);

    const logs = [...mintLogs, ...burnLogs]

    // If there are no logs, return an empty array
    if (logs.length === 0) return [];

    // Get the streamer and protocol fee percentages on this block
    const [streamerFeePercentage, protocolFeePercentage] = await Promise.all([
        (publicClient as any).readContract({
          address: data.tokenAddress as `0x${string}`,
          abi: VibesTokenAbi,
          functionName: "streamerFeePercent",
        }),
        (publicClient as any).readContract({
          address: data.tokenAddress as `0x${string}`,
          abi: VibesTokenAbi,
          functionName: "protocolFeePercent",
        }),
    ]);

    // Sort the logs by block number
    logs.sort((a, b) => {
      if (a.blockNumber === null || b.blockNumber === null) return 0;
      if (a.blockNumber < b.blockNumber) return -1;
      if (a.blockNumber > b.blockNumber) return 1;
      return 0;
    });

    // Create a map of unique streamer addresses to their stats
    const uniqueStreamerAddressesToAmounts = new Map<string, streamerStoreType>();
    
    // Format the logs into the database schema
    const formattedTransactions = logs.map((log) => {
      const transactionType = log.eventName === "Mint" ? VibesTransactionType.BUY : VibesTransactionType.SELL;
      const totalVibesSupplyAfterTrade = log.args.totalSupply as bigint
      const vibesAmount = log.args.amount as bigint
      const streamerAddress = log.args.streamerAddress as string;

      const { protocolFee, streamerFee, weiAmount } = calculateEthFromVibesAmount(
          transactionType,
          vibesAmount,
          totalVibesSupplyAfterTrade,
          protocolFeePercentage as bigint,
          streamerFeePercentage as bigint,
      );

      const existingStreamerStore = uniqueStreamerAddressesToAmounts.get(streamerAddress) || {
          newTotalVibesVolume: "0",
          newTotalWeiVolume: "0",
          newTotalProtocolWeiFees: "0",
          newTotalStreamerWeiFees: "0",
      };
      uniqueStreamerAddressesToAmounts.set(streamerAddress, {
          newTotalVibesVolume: String(BigInt(existingStreamerStore.newTotalVibesVolume) + vibesAmount),
          newTotalWeiVolume: String(BigInt(existingStreamerStore.newTotalWeiVolume) + weiAmount),
          newTotalProtocolWeiFees: String(BigInt(existingStreamerStore.newTotalProtocolWeiFees) + protocolFee),
          newTotalStreamerWeiFees: String(BigInt(existingStreamerStore.newTotalStreamerWeiFees) + streamerFee),
      });

      return {
          uniqueTransactionId: `${log.transactionHash as string}-${String(data.chainId)}-${String(log.blockNumber)}`,
          chainId: data.chainId,
          blockNumber: log.blockNumber as bigint,
          transactionHash: log.transactionHash as string,
          transactionType,
          traderAddress: log.args.account as string,
          streamerAddress,
          totalVibesSupplyAfterTrade: String(totalVibesSupplyAfterTrade),
          vibesAmount: String(vibesAmount),
          protocolWeiFees: String(protocolFee),
          streamerWeiFees: String(streamerFee),
          weiAmount: String(weiAmount),
      }
    })

    // create a streamer's stat if not exist yet
    const creationPromises = Array.from(uniqueStreamerAddressesToAmounts.entries()).map(async ([address, stats]) => {
        const existingStat = await prisma.streamerVibesStat.findFirst({
            where: { uniqueStatId: `${address}-${String(data.chainId)}` },
        });
        
        if (existingStat) {
            return null
        } else {
            await prisma.streamerVibesStat.create({
                data: {
                    uniqueStatId: `${address}-${String(data.chainId)}`,
                    streamerAddress: address,
                    chainId: data.chainId,
                    allTimeTotalVibesVolume: stats.newTotalVibesVolume,
                    allTimeTotalWeiVolume: stats.newTotalWeiVolume,
                    allTimeTotalProtocolWeiFees: stats.newTotalProtocolWeiFees,
                    allTimeTotalStreamerWeiFees: stats.newTotalStreamerWeiFees,
                },
            });
            return address
        }
    });

    const addressesCreatedFor = await Promise.all(creationPromises);
    addressesCreatedFor.forEach(address => {
        if (address) uniqueStreamerAddressesToAmounts.delete(address)
    });

    // update a streamer's stat if already exist
    const updatePromises = Array.from(uniqueStreamerAddressesToAmounts.entries()).map(async ([address, stats]) => {
        const existingStat = await prisma.streamerVibesStat.findFirst({
            where: { uniqueStatId: `${address}-${String(data.chainId)}` },
        });
        
        if (existingStat) {
            return prisma.streamerVibesStat.update({
            where: { id: existingStat.id },
            data: {
                allTimeTotalVibesVolume: String(BigInt(existingStat.allTimeTotalVibesVolume) + BigInt(stats.newTotalVibesVolume)),
                allTimeTotalWeiVolume: String(BigInt(existingStat.allTimeTotalWeiVolume) + BigInt(stats.newTotalWeiVolume)),
                allTimeTotalProtocolWeiFees: String(BigInt(existingStat.allTimeTotalProtocolWeiFees) + BigInt(stats.newTotalProtocolWeiFees)),
                allTimeTotalStreamerWeiFees: String(BigInt(existingStat.allTimeTotalStreamerWeiFees) + BigInt(stats.newTotalStreamerWeiFees)),
            },
            });
        } else {
            return null
        }
    });
    await Promise.all(updatePromises);

    // Create the transactions in the database
    return await prisma.vibesTransaction.createMany({
      data: formattedTransactions,
      skipDuplicates: true,
    });
} catch (error) {
    console.error("Error in postVibesTrades", error);
    return [];
}
}

export interface IGetStreamerVibesStatInput {
    streamerAddress: string;
}

export const getStreamerVibesStat = async (data: IGetStreamerVibesStatInput) => {
    return await prisma.streamerVibesStat.findMany({
        where: {
            streamerAddress: data.streamerAddress,
        },
    });
}

export interface IGetVibesTransactionsInput {
    chainId: number;
    streamerAddress: string;
    dateRange?: {
        start?: Date;
        end?: Date;
    };
    take?: number;
    skip?: number;
}

export const getVibesTransactions = async (data: IGetVibesTransactionsInput) => {

    const where: {
        streamerAddress: string;
        chainId: number;
        createdAt?: {
            gte?: Date;
            lte?: Date;
        };
    } = {
        chainId: data.chainId,
        streamerAddress: data.streamerAddress,
    }

    if (data.dateRange) {
        const createdAt: {
            gte?: Date;
            lte?: Date;
        } = {}
        if (data.dateRange.start) {
            createdAt["gte"] = data.dateRange.start;
        }
        if (data.dateRange.end) {
            createdAt["lte"] = data.dateRange.end;
        }
        where["createdAt"] = createdAt;
    }

    return await prisma.vibesTransaction.findMany({
        where,
        take: data.take,
        skip: data.skip,
        orderBy: {
            createdAt: "desc",
        },
    });
}