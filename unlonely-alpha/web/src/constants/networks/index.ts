import { BaseGoerli } from "./baseGoerli";
import { Goerli } from "./goerli";
import { Mainnet } from "./mainnet";
import { Base } from "./base";

export * from "./mainnet";
export * from "./goerli";
export * from "./baseGoerli";
export * from "./base";

// eslint-disable-next-line no-warning-comments
// TODO: base goerli back to last later
export const NETWORKS = [Base, Mainnet, Goerli, BaseGoerli];
