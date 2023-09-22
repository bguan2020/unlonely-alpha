import { BaseGoerli } from "./baseGoerli";
import { Goerli } from "./goerli";
import { Mainnet } from "./mainnet";

export * from "./mainnet";
export * from "./goerli";
export * from "./baseGoerli";

export const NETWORKS = [Mainnet, Goerli, BaseGoerli];
