import { ContractType, createCreatorClient } from "@zoralabs/protocol-sdk";
import { useState, useEffect } from "react";
import { Hex, SimulateContractParameters, TransactionReceipt } from "viem";
import {
  usePublicClient,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useNetworkContext } from "../context/useNetwork";
import { useUser } from "../context/useUser";
import { WriteCallbacks } from "../../constants/types";

export const useZoraCreate1155 = (
  contractObject?: ContractType,
  callbacks?: WriteCallbacks
) => {
  const { userAddress } = useUser();
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const publicClient = usePublicClient();

  const [parameters, setParameters] = useState<
    SimulateContractParameters | undefined
  >(undefined);
  const [parametersReady, setParametersReady] = useState<boolean>(false);

  const creatorClient = createCreatorClient({
    chainId: localNetwork.config.chainId,
    publicClient,
  });

  useEffect(() => {
    if (!userAddress || !contractObject) return;
    const init = async () => {
      setParametersReady(false);
      const { parameters } = await creatorClient.create1155({
        // by providing a contract creation config, the contract will be created
        // if it does not exist at a deterministic address
        contract: contractObject,
        token: {
          tokenMetadataURI: "ipfs://DUMMY/token.json",
        },
        // account to execute the transaction (the creator)
        account: userAddress,
      });
      setParameters(parameters);
      setParametersReady(true);
    };
    init();
  }, [userAddress, contractObject]);

  const prepObj = usePrepareContractWrite({
    ...parameters,
    onSuccess: () => {
      console.log("success");
    },
  });

  const {
    data: writeData,
    error: writeError,
    writeAsync,
  } = useContractWrite({
    ...prepObj.config,
    onSuccess(data: { hash: Hex }) {
      if (callbacks?.onWriteSuccess) callbacks?.onWriteSuccess(data);
    },
    onError(error: Error) {
      if (callbacks?.onWriteError) callbacks?.onWriteError(error);
    },
  });

  const {
    data: txData,
    error: txError,
    isLoading: isTxLoading,
    isSuccess: isTxSuccess,
  } = useWaitForTransaction({
    hash: writeData?.hash,
    onSuccess(data: TransactionReceipt) {
      if (callbacks?.onTxSuccess) callbacks?.onTxSuccess(data);
    },
    onError(error: Error) {
      if (callbacks?.onTxError) callbacks?.onTxError(error);
    },
  });

  useEffect(() => {
    prepObj.refetch();
  }, []);

  return {
    writeAsync,
    writeData,
    txData,
    isTxLoading,
    isTxSuccess,
    writeError,
    txError,
    refetch: prepObj.refetch,
    isRefetching: prepObj.isRefetching,
    prepareError: prepObj.error,
    parametersReady,
  };
};
