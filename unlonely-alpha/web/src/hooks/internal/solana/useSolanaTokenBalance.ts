import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import Decimal from "decimal.js";
import { PublicKey, Connection } from "@solana/web3.js";
import { useState, useEffect, useCallback } from "react";
import { FIXED_SOLANA_MINT, SOLANA_RPC_URL } from "../../../constants";
import { useUser } from "../../context/useUser";

export const useSolanaTokenBalance = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const { solanaAddress, activeWallet } = useUser();

  useEffect(() => {
    if (solanaAddress) {
      fetchTokenBalance();
    } else {
      setBalance(null);
    }
  }, [solanaAddress, activeWallet]);

  const fetchTokenBalance = useCallback(async () => {
    if (!solanaAddress || loading) {
      return;
    }

    console.log("Fetching token balance for:", solanaAddress);

    setLoading(true);

    try {
      const connection = new Connection(SOLANA_RPC_URL, "confirmed");
      const tokenMint = new PublicKey(FIXED_SOLANA_MINT.mintAddress);

      const tokenAccountAddress = await getAssociatedTokenAddress(
        tokenMint,
        new PublicKey(solanaAddress)
      );

      const tokenAccount = await getAccount(connection, tokenAccountAddress);

      const amount = new Decimal(tokenAccount.amount.toString());

      const decimals = FIXED_SOLANA_MINT.decimals;
      const balance = amount.div(new Decimal(10).pow(decimals)).toString();

      console.log(
        `Token balance of ${FIXED_SOLANA_MINT.mintAddress} for ${solanaAddress} on Solana:`,
        balance
      );
      setBalance(Number(balance));
    } catch (error) {
      console.error("Error fetching token balance:", error);
    } finally {
      setLoading(false);
    }
  }, [solanaAddress, loading]);

  return {
    balance,
    loading,
    fetchTokenBalance,
  };
};
