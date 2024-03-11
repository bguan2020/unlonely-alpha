import { createPublicClient, http as viemHttp } from "viem";
import { base } from "viem/chains";
import { postVibesTrades } from "../entities/Vibes/vibesService";

const vibesTokenContractAddress = "0xEAB1fF15f26da850315b15AFebf12F0d42dE5421"

export const watchBlocks = () => {
    const publicClient = createPublicClient({
        chain: base as any,
        transport: viemHttp(
          `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_BASE_API_KEY}`
        ),
      });
      (publicClient as any).watchBlocks(
        { onBlock: async() => {
          await postVibesTrades({ chainId: 8453, tokenAddress: vibesTokenContractAddress})
        } }
      );
}