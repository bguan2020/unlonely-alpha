import { Chain } from "wagmi";

export type Network = Chain & {
  config: {
    name: string;
    chainId: number;
    isTestnet: boolean;
    contracts: {
      [key: string]: {
        address?: `0x${string}`;
        abi: any;
      };
    };
  };
};
