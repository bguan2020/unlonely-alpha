import { Goerli } from "./goerli";
import { Mainnet } from "./mainnet";
import { Base } from "./base";

export * from "./mainnet";
export * from "./goerli";
export * from "./baseGoerli";
export * from "./base";

export const NETWORKS = [Base, Mainnet, Goerli];
