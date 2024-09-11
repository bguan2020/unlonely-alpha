import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import Decimal from "decimal.js";
import { PublicKey, Connection } from "@solana/web3.js";
import { useState, useEffect } from "react";
import { FIXED_SOLANA_MINT } from "../../../components/transactions/solana/SolanaJupiterTerminal";
import { useWallet } from "@solana/wallet-adapter-react";

export const useSolanaTokenBalance = (rpcUrl: string) => {
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const { publicKey, connected } = useWallet();

    useEffect(() => {
      if (connected && publicKey) {
        fetchTokenBalance();
      }
    }, [connected, publicKey]);
  
    const fetchTokenBalance = async () => {
      if (!publicKey) {
        console.error("No wallet connected");
        return;
      }
  
      setLoading(true);
  
      try {
        const connection = new Connection(rpcUrl, "confirmed");
        const tokenMint = new PublicKey(FIXED_SOLANA_MINT);
  
        const tokenAccountAddress = await getAssociatedTokenAddress(
          tokenMint,
          publicKey
        );
  
        const tokenAccount = await getAccount(connection, tokenAccountAddress);
  
        const amount = new Decimal(tokenAccount.amount.toString());
  
        const decimals = 9;
        const balance = amount.div(new Decimal(10).pow(decimals)).toString();
  
        console.log(`Token balance of ${FIXED_SOLANA_MINT} for ${publicKey} on Solana:`, balance);
        setBalance(Number(balance));
      } catch (error) {
        console.error("Error fetching token balance:", error);
      } finally {
        setLoading(false);
      }
    };

    return {
        balance,
        loading,
        fetchTokenBalance
    };
}