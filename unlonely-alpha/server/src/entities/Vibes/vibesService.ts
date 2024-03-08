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
const vibesTokenContractAddress = "0xEAB1fF15f26da850315b15AFebf12F0d42dE5421"

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
    const latestTransaction = await prisma.vibesTransaction.findFirst({
        where: {
            chainId: data.chainId,
        },
        orderBy: {
            blockNumber: "desc",
        },
    });

    const publicClient = createPublicClient({
        chain: base,
        transport: viemHttp(
            `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_BASE_API_KEY}`
          ),
      });

    const fromBlock = latestTransaction ? latestTransaction.blockNumber + BigInt(1) : CREATION_BLOCK;

    const [mintLogs, burnLogs, streamerFeePercentage, protocolFeePercentage] = await Promise.all([
        publicClient.getLogs({
          address: data.tokenAddress as `0x${string}`,
          event: parseAbiItem(
            "event Mint(address indexed account, uint256 amount, address indexed streamerAddress, uint256 indexed totalSupply)"
          ),
          fromBlock,
        }),
        publicClient.getLogs({
          address: data.tokenAddress as `0x${string}`,
          event: parseAbiItem(
            "event Burn(address indexed account, uint256 amount, address indexed streamerAddress, uint256 indexed totalSupply)"
          ),
          fromBlock,
        }),
        publicClient.readContract({
            address: vibesTokenContractAddress,
            abi: VibesTokenAbi,
            functionName: "protocolFeePercent",
          }),
        publicClient.readContract({
          address: vibesTokenContractAddress,
          abi: VibesTokenAbi,
          functionName: "streamerFeePercent",
        }),
    ]);
    const logs = [...mintLogs, ...burnLogs];
    if (logs.length === 0) return [];
    logs.sort((a, b) => {
      if (a.blockNumber === null || b.blockNumber === null) return 0;
      if (a.blockNumber < b.blockNumber) return -1;
      if (a.blockNumber > b.blockNumber) return 1;
      return 0;
    });
    const uniqueStreamerAddressesToAmounts = new Map<string, streamerStoreType>();      
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
          chainId: data.chainId,
          blockNumber: log.blockNumber as bigint,
          transactionHash: log.transactionHash,
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
    const creationPromises = Array.from(uniqueStreamerAddressesToAmounts.entries()).map(async ([address, stats]) => {
        const existingStat = await prisma.streamerVibesStat.findFirst({
            where: { streamerAddress: address, chainId: data.chainId, },
        });
        
        if (existingStat) {
            return null
        } else {
            uniqueStreamerAddressesToAmounts.delete(address)
            return prisma.streamerVibesStat.create({
            data: {
                streamerAddress: address,
                chainId: data.chainId,
                allTimeTotalVibesVolume: stats.newTotalVibesVolume,
                allTimeTotalWeiVolume: stats.newTotalWeiVolume,
                allTimeTotalProtocolWeiFees: stats.newTotalProtocolWeiFees,
                allTimeTotalStreamerWeiFees: stats.newTotalStreamerWeiFees,
            },
            });
        }
    });
    await Promise.all(creationPromises);
    const updatePromises = Array.from(uniqueStreamerAddressesToAmounts.entries()).map(async ([address, stats]) => {
        const existingStat = await prisma.streamerVibesStat.findFirst({
            where: { streamerAddress: address, chainId: data.chainId, },
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
    return await prisma.vibesTransaction.createMany({
      data: formattedTransactions,
      skipDuplicates: true,
    });
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