import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import Decimal from "decimal.js";
import { PublicKey, Connection } from "@solana/web3.js";
import { useState, useEffect, useCallback } from "react";
import { FIXED_SOLANA_MINT, SOLANA_RPC_URL } from "../../../constants";
import { useUser } from "../../context/useUser";
import { isValidAddress } from "../../../utils/validation/wallet";

export const useSolanaTokenBalance = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const { solanaAddress, user } = useUser();

  useEffect(() => {
    if (solanaAddress || isValidAddress(user?.address) === "solana") {
      fetchTokenBalance();
    } else {
      setBalance(null);
    }
  }, [solanaAddress, user]);

  const fetchTokenBalance = useCallback(async () => {
    if (!solanaAddress || loading) {
      return;
    }

    console.log("Fetching token balance for:", solanaAddress);

    setLoading(true);

    let resBalance = undefined;
    try {
      const connection = new Connection(SOLANA_RPC_URL, "confirmed");
      const tokenMint = new PublicKey(FIXED_SOLANA_MINT.mintAddress);

      console.log("Token mint address:", tokenMint.toString());

      const tokenAccountAddress = await getAssociatedTokenAddress(
        tokenMint,
        new PublicKey(solanaAddress)
      );

      console.log("Token account address:", tokenAccountAddress.toString());

      const tokenAccount = await getAccount(connection, tokenAccountAddress);

      console.log("Token account:", tokenAccount);

      const amount = new Decimal(tokenAccount.amount.toString());

      const decimals = FIXED_SOLANA_MINT.decimals;
      const balance = amount.div(new Decimal(10).pow(decimals)).toString();

      console.log(
        `Token balance of ${FIXED_SOLANA_MINT.mintAddress} for ${solanaAddress} on Solana:`,
        balance
      );
      setBalance(Number(balance));
      resBalance = Number(balance);
    } catch (error) {
      console.error("Error fetching token balance:", error);
      setBalance(null);
    } finally {
      setLoading(false);
    }
    return resBalance;
  }, [solanaAddress, loading]);

  const manualAddToBalance = (amount: number) => {
    if (balance === null) {
      setBalance(Math.max(amount, 0));
    } else {
      setBalance(Math.max(balance + amount, 0));
    }
  }

  return {
    balance,
    loading,
    fetchTokenBalance,
    manualAddToBalance
  };
};
