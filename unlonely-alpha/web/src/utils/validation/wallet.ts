import { isAddress, isAddressEqual } from "viem";

const isEthereumAddress = (address: string) => {
    return isAddress(address);
}

export const isValidAddress = (address?: string): "ethereum" | "solana" | undefined => {
    
    if (!address) return undefined;
    
    // Check if the address is a valid Ethereum address
    if (isEthereumAddress(address)) {
        return "ethereum";
    }

    return undefined;
};

export const areAddressesEqual = (a: string, b: string ) => {

    // if both are ethereum addresses, compare using viem's compare function, 
    // else treat them as solana addresses that are case sensitive
    if (isEthereumAddress(a) && isEthereumAddress(b)) return isAddressEqual(a as `0x${string}`, b as `0x${string}`)
    return a === b
}