/**
 * Each token has its own minimum base token price. The variable is added to later versions 
 * and may be changed down the line. All tokens, so long as they are tradeable, 
 * are still accessible and must remain functional despite changes on the contract level.
 * Since that variable is a constant,  we will be storing them here instead of fetching for 
 * them onchain.
 * 
 * id format is {lowercasedFactoryAddress}:{chainId}
 * 
 * // todo whenever the factory contract is redeployed from now on, 
 * we need to update this list, you can find the needed minimum base token price on
 * the associating token contract file.
 */

export const tempTokenMinBaseTokenPrices: {[id: string]: bigint} = {
    "0xb86a4405f7329280bbbf5197ceca68c659bec3c5:8453": BigInt(2 * 10**13) // test
}