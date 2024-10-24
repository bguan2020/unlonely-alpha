import { Button, Flex, Input, Text } from "@chakra-ui/react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState, useCallback } from "react";

import { filteredInput } from "../../../utils/validation/input";
import { FIXED_SOLANA_MINT } from "../../../constants";
import { isValidAddress } from "../../../utils/validation/wallet";

export const SolanaTokenTransfer = ({
  rpcUrl,
  balance,
  fetchTokenBalance,
}: {
  rpcUrl: string;
  balance: number | null;
  fetchTokenBalance: () => Promise<number | undefined>;
}) => {
  const { publicKey, sendTransaction, connected, connect } = useWallet();
  const [toAddress, setToAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const sendTokens = async () => {
    if (!connected || !publicKey) {
      console.error("No wallet connected");
      return;
    }
    try {
      await transferTokens(
        new Connection(rpcUrl),
        publicKey,
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
        Number(amount) * 10 ** 9
      );

      transaction.add(transferInstruction);

      try {
        const { blockhash } = await connection.getLatestBlockhash();

        // Set the recent blockhash and fee payer
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromWalletPublicKey;

        // Send the transaction using sendTransaction method
        const signature = await sendTransaction(transaction, connection);
        console.log(`Transaction sent with signature: ${signature}`);

        await new Promise((resolve) => setTimeout(resolve, 6000));

        const status = await connection.getSignatureStatus(signature, {
          searchTransactionHistory: true,
        });

        if (status.value?.confirmationStatus === "confirmed") {
          console.log(`Transaction confirmed with signature: ${signature}`);
          await fetchTokenBalance();
          const logs = await getTransactionLogs(signature, connection);
          console.log("Transaction logs:", logs);
        } else {
          console.warn("Transaction is not finalized yet:", status);
        }
      } catch (sendError) {
        console.error("Transaction failed during send:", sendError);
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

  const connectWallet = useCallback(async () => {
    if (!connected) {
      try {
        // Add a small delay before connecting
        await new Promise((resolve) => setTimeout(resolve, 100));
        await connect();
        console.log("Wallet connected successfully");
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    }
  }, [connect, connected]);

  useEffect(() => {
    connectWallet();
  }, [connectWallet]);

  return (
    <Flex direction="column">
      <Input
        placeholder="To Address"
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
      />
      <Input
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(filteredInput(e.target.value, true))}
      />
      {!connected && <Button onClick={connect}>Connect Solana</Button>}
      <Text>Available THOTH Balance: {balance}</Text>
      <Button
        onClick={sendTokens}
        isDisabled={
          Number(amount) === 0 ||
          !connected ||
          isValidAddress(toAddress) !== "solana" ||
          balance === null ||
          Number(amount) > balance
        }
      >
        Send THOTH
      </Button>
    </Flex>
  );
};
