import { Button, Flex, Input } from "@chakra-ui/react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { filteredInput } from "../../utils/validation/input";

const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address); // Attempt to create a PublicKey object
    return true; // If no error is thrown, the address is valid
  } catch (error) {
    return false; // If an error is thrown, the address is invalid
  }
};

export const SolanaTokenTransfer = ({
  rpcUrl,
  balance,
  fetchTokenBalance,
}: {
  rpcUrl: string;
  balance: number | null;
  fetchTokenBalance: () => void;
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
        new PublicKey("FuvamNkNTNjDcnQeWyiAReUCHZ91gJhg59xuNemZ4p9f"),
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

  useEffect(() => {
    if (!connected) {
      console.log("Connecting wallet...", connect);
      connect().catch((error) => {
        console.error("Failed to connect wallet:", error);
      });
    }
  }, [connected, connect, toAddress]);

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
      {!connected && <Button onClick={connect}>Connect Phantom</Button>}
      <Button
        onClick={sendTokens}
        isDisabled={
          Number(amount) === 0 ||
          !connected ||
          !isValidSolanaAddress(toAddress) ||
          Number(amount) > balance!
        }
      >
        Send THOTH
      </Button>
    </Flex>
  );
};
