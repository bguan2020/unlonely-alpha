import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import Decimal from "decimal.js";
import { PublicKey, Connection } from "@solana/web3.js";
import { useState, useEffect } from "react";
import { FIXED_SOLANA_MINT } from "../../../constants";
import { useUser } from "../../context/useUser";

export const useSolanaTokenBalance = (rpcUrl: string) => {
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    
    const {solanaAddress, activeWallet} = useUser();

    useEffect(() => {
      if (solanaAddress){
        fetchTokenBalance();
      } else {
        setBalance(null);
      }
    }, [solanaAddress, activeWallet]);
  
    const fetchTokenBalance = async () => {
      if (!solanaAddress) {
        console.error("No address");
        return;
      }
  
      setLoading(true);
  
      try {
        const connection = new Connection(rpcUrl, "confirmed");
        const tokenMint = new PublicKey(FIXED_SOLANA_MINT.address);
  
        const tokenAccountAddress = await getAssociatedTokenAddress(
          tokenMint,
          new PublicKey(solanaAddress)
        );
  
        const tokenAccount = await getAccount(connection, tokenAccountAddress);
  
        const amount = new Decimal(tokenAccount.amount.toString());
  
        const decimals = FIXED_SOLANA_MINT.decimals;
        const balance = amount.div(new Decimal(10).pow(decimals)).toString();
  
        console.log(`Token balance of ${FIXED_SOLANA_MINT.address} for ${solanaAddress} on Solana:`, balance);
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