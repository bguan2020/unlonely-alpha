import { FIXED_SOLANA_MINT } from "../../../constants";

export const useJupiterQuoteSwap = () => {
    const quoteSwap = async (tokenAmountIn: number) => {
        const quoteResponse = await (
            await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${FIXED_SOLANA_MINT.address}&amount=${tokenAmountIn * 10 ** 9}&slippageBps=50&swapMode=ExactIn&asLegacyTransaction=false&maxAccounts=64&experimentalDexes=Jupiter%20LO`
            )  
        ).json();
        console.log(quoteResponse);
    }

    return { quoteSwap };
}