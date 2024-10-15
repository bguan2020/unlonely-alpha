import { ContractType, createCreatorClient } from "@zoralabs/protocol-sdk";
import { useState, useEffect, useCallback } from "react";
import { SimulateContractParameters } from "viem";
import { usePublicClient } from "wagmi";
import { useNetworkContext } from "../context/useNetwork";
import { useUser } from "../context/useUser";
import { WriteCallbacks } from "../../constants/types";
import { useWrite } from "./useWrite";
import { createCallbackHandler } from "../../utils/contract";

export const useZoraCreate1155 = (
  contractObject?: ContractType,
  callbacks?: WriteCallbacks
) => {
  const { user } = useUser();
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const publicClient = usePublicClient();

  const [parameters, setParameters] = useState<
    SimulateContractParameters | undefined
  >(undefined);
  const [parametersReady, setParametersReady] = useState<boolean>(false);

  const creatorClient = publicClient ? createCreatorClient({
    chainId: localNetwork.config.chainId,
    publicClient,
  }) : undefined;

  const initParameters = useCallback(async () => {
    if (!user?.address || !contractObject || !creatorClient) return;
    setParametersReady(false);
    const { parameters } = await creatorClient.create1155({
      contract: contractObject,
      token: {
        tokenMetadataURI: "ipfs://DUMMY/token.json",
      },
      account: user?.address as `0x${string}`,
    });
    // Cast the parameters to the expected type
    setParameters(parameters as SimulateContractParameters);
    setParametersReady(true);
  }, [user?.address, contractObject, creatorClient]);

  useEffect(() => {
    initParameters();
  }, [initParameters]);

  const {
    writeAsync,
    writeData,
    txData,
    isTxLoading,
    isTxSuccess,
    writeError,
    txError,
    refetch,
    isRefetching,
    simulateError: prepareError,
  } = useWrite(
    {
      address: parameters?.address,
      abi: parameters?.abi,
      chainId: localNetwork.config.chainId,
    },
    parameters?.functionName ?? "",
    [ ...(parameters?.args ?? []) ],
    createCallbackHandler("useZoraCreate1155", callbacks),
    {
      value: parameters?.value,
      enabled: parametersReady,
    }
  );

  return {
    writeAsync,
    writeData,
    txData,
    isTxLoading,
    isTxSuccess,
    writeError,
    txError,
    refetch,
    isRefetching,
    prepareError,
    parametersReady,
  };
};
