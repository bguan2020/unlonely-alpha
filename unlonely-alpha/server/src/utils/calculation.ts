import { VibesTransactionType } from "../entities/Vibes/vibesService";

const BIG_INT_ETHER = BigInt(10) ** BigInt(18);

export const calculateEthFromVibesAmount = (buyOrSell: VibesTransactionType, vibesAmount: bigint, totalVibesSupplyAfterTrade: bigint, protocolFeePercentage: bigint, streamerFeePercentage: bigint) => {
    let protocolFee: bigint;
    let streamerFee: bigint;
    let weiAmount: bigint;

    if (buyOrSell === VibesTransactionType.BUY) {
        const totalVibesSupplyBeforeBuy = totalVibesSupplyAfterTrade - vibesAmount;
        const calculatedMintCost = mintCost(vibesAmount, totalVibesSupplyBeforeBuy)
        protocolFee = calculatedMintCost * protocolFeePercentage / BIG_INT_ETHER;
        streamerFee = calculatedMintCost * streamerFeePercentage / BIG_INT_ETHER;
        weiAmount = calculatedMintCost;
    } else {
        const totalVibesSupplyBeforeSell = totalVibesSupplyAfterTrade + vibesAmount;
        const calculatedBurnProceeds = burnProceeds(vibesAmount, totalVibesSupplyBeforeSell);
        protocolFee = calculatedBurnProceeds * protocolFeePercentage / BIG_INT_ETHER;
        streamerFee = calculatedBurnProceeds * streamerFeePercentage / BIG_INT_ETHER;
        weiAmount = calculatedBurnProceeds - protocolFee - streamerFee;
    }

    return { protocolFee, streamerFee, weiAmount }
}

export const mintCost = (amount: bigint, totalSupplyBeforeBuy: bigint) => 
    sumOfPriceToNTokens(totalSupplyBeforeBuy + amount) - sumOfPriceToNTokens(totalSupplyBeforeBuy);

export const burnProceeds = (amount: bigint, totalSupplyBeforeSell: bigint) =>
    sumOfPriceToNTokens(totalSupplyBeforeSell) - sumOfPriceToNTokens(totalSupplyBeforeSell - amount);

const sumOfPriceToNTokens = (n: bigint) => n * (n + BigInt(1)) * (BigInt(2) * n + BigInt(1)) / BigInt(6)
