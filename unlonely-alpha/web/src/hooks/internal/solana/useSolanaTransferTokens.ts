import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction } from "@solana/spl-token";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { FIXED_SOLANA_MINT } from "../../../constants";
import { useUser } from "../../context/useUser";
import { ConnectedSolanaWallet } from "@privy-io/react-auth";
import { isValidAddress } from "../../../utils/validation/wallet";

export const useSolanaTransferTokens = (
    { rpcUrl, onTransferSuccess, onTransferError }: 
    { rpcUrl: string, onTransferSuccess: () => void, onTransferError: (error: any) => void }
) => {

    const { activeWallet } = useUser();

    const sendTokens = async (toAddress: string, amount: string) => {
        if (!activeWallet) return;
        console.log("Sending tokens from:", activeWallet.address, "to:", toAddress, "Amount:", amount);
        try {
          await transferTokens(
            new Connection(rpcUrl),
            new PublicKey(activeWallet.address),
            new PublicKey(toAddress),
            new PublicKey(FIXED_SOLANA_MINT.mintAddress),
            Number(amount)
          );
        } catch (error) {
          console.error("Error sending tokens:", error);
        }
      };

    const transferTokens = async (
        connection: Connection,
        fromWalletPublicKey: PublicKey,
        toWalletPublicKey: PublicKey,
        mintAddress: PublicKey,
        amount: number
      ) => {
        if (!activeWallet || isValidAddress(activeWallet.address) !== "solana") return;
        try {
          // Get or create the associated token account for the sender
          const fromTokenAccount = await getAssociatedTokenAddress(
            mintAddress,
            fromWalletPublicKey
          );
    
          // Get or create the associated token account for the receiver
          const toTokenAccount = await getAssociatedTokenAddress(
            mintAddress,
            toWalletPublicKey
          );
    
          const transaction = new Transaction();
    
          const fromAccountInfo = await connection.getAccountInfo(fromTokenAccount);
          if (!fromAccountInfo) {
            const createFromAccountIx = createAssociatedTokenAccountInstruction(
              fromWalletPublicKey,
              fromTokenAccount,
              fromWalletPublicKey,
              mintAddress
            );
            transaction.add(createFromAccountIx);
          }
    
          // Create associated token account instruction if the receiver's token account does not exist
          const toAccountInfo = await connection.getAccountInfo(toTokenAccount);
          if (!toAccountInfo) {
            const createToAccountIx = createAssociatedTokenAccountInstruction(
              fromWalletPublicKey,
              toTokenAccount,
              toWalletPublicKey,
              mintAddress
            );
            transaction.add(createToAccountIx);
          }
    
          // Create the transfer instruction
          const transferInstruction = createTransferInstruction(
            fromTokenAccount,
            toTokenAccount,
            fromWalletPublicKey,
            Number(amount) * 10 ** FIXED_SOLANA_MINT.decimals
          );
    
          transaction.add(transferInstruction);
    
          try {
            const { blockhash } = await connection.getLatestBlockhash();
    
            // Set the recent blockhash and fee payer
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = fromWalletPublicKey;
    
            // Send the transaction using sendTransaction method
            const signature = await (activeWallet as ConnectedSolanaWallet).sendTransaction!(transaction, connection);
            console.log(`Transaction sent with signature: ${signature}`);
    
            await new Promise((resolve) => setTimeout(resolve, 6000));
    
            const status = await connection.getSignatureStatus(signature, {
              searchTransactionHistory: true,
            });
    
            if (status.value?.confirmationStatus === "confirmed") {
              console.log(`Transaction confirmed with signature: ${signature}`);
              onTransferSuccess();
              const logs = await getTransactionLogs(signature, connection);
              console.log("Transaction logs:", logs);
            } else {
              console.warn("Transaction is not finalized yet:", status);
            }
          } catch (sendError) {
            console.error("Transaction failed during send:", sendError);
            onTransferError(sendError);
            if (sendError instanceof Error && "logs" in sendError) {
              console.error("Transaction logs:", sendError.logs);
            }
          }
        } catch (error) {
          console.error("Error during token transfer:", error);
        }
      };
    
      const getTransactionLogs = async (
        transactionId: string,
        connection: Connection
      ) => {
        try {
          const transaction = await connection.getTransaction(transactionId, {
            maxSupportedTransactionVersion: 0,
          });
    
          if (transaction && transaction.meta) {
            return transaction.meta.logMessages;
          } else {
            console.log("Transaction not found or logs are unavailable.");
            return null;
          }
        } catch (error) {
          console.error("Error fetching transaction logs:", error);
          return null;
        }
      };

      return {
        sendTokens
      }
}