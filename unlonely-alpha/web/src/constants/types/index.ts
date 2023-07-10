import { User } from "../../generated/graphql";

export * from "./network";

export type WriteCallbacks = {
  onPrepareSuccess?: (data: any) => any;
  onPrepareError?: (error: any) => any;
  onWriteSuccess?: (data: any) => any;
  onWriteError?: (error: any) => any;
  onTxSuccess?: (data: any) => any;
  onTxError?: (error: any) => any;
};

export type FetchBalanceResult = {
  decimals: number;
  formatted: string;
  symbol: string;
  value: bigint;
};

export type ChatBot = {
  username: string;
  address: string;
  taskType: string;
  title: string | null | undefined;
  description: string | null | undefined;
};

export type CustomUser = User & {
  tokenHolderRank: number;
};
