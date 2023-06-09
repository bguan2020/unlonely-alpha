export * from "./network";

export type WriteCallbacks = {
  onPrepareSuccess?: (data: any) => any;
  onPrepareError?: (error: any) => any;
  onWriteSuccess?: (data: any) => any;
  onWriteError?: (error: any) => any;
  onTxSuccess?: (data: any) => any;
  onTxError?: (error: any) => any;
};
