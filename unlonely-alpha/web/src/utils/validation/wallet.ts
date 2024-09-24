import { isAddressEqual, isAddress as isEthereumAddress } from "viem"; // Assuming "viem" is a library for Ethereum address validation
import { PublicKey } from "@solana/web3.js";

export const isValidAddress = (address: string): "ethereum" | "solana" | undefined => {
    // Check if the address is a valid Ethereum address
    if (isEthereumAddress(address)) {
        return "ethereum";
    }

    // Check if the address is a valid Solana address
    const key = new PublicKey(address);
    if (PublicKey.isOnCurve(key.toBytes())){
        return "solana";
    }

    return undefined;
};

export const areAddressesEqual = (a: string, b: string ) => {

    // if both are ethereum addresses, compare using viem's compare function, 
    // else treat them as solana addresses that are case sensitive
    if (isEthereumAddress(a) && isEthereumAddress(b)) return isAddressEqual(a, b)
    return a === b
}