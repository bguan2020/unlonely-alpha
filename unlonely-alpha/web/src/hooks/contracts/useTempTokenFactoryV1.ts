import { useCallback, useEffect, useState } from "react";
import { usePublicClient } from "wagmi";

import { NULL_ADDRESS } from "../../constants";
import { ContractData, WriteCallbacks } from "../../constants/types";
import { useWrite } from "./useWrite";
import { createCallbackHandler } from "../../utils/contract";

type TokenInfo = {
  tokenAddress: `0x${string}`;
  ownerAddress: `0x${string}`;
  name: string;
  symbol: string;
  endTimestamp: bigint;
  protocolFeeDestination: `0x${string}`;
  protocolFeePercent: bigint;
  streamerFeePercent: bigint;
};

const tokenInfoInitialState: TokenInfo = {
  tokenAddress: NULL_ADDRESS,
  ownerAddress: NULL_ADDRESS,
  name: "",
  symbol: "",
  endTimestamp: BigInt(0),
  protocolFeeDestination: NULL_ADDRESS,
  protocolFeePercent: BigInt(0),
  streamerFeePercent: BigInt(0),
};

export const useReadPublic = (contract: ContractData) => {
  const publicClient = usePublicClient();

  const [protocolFeeDestination, setProtocolFeeDestination] =
    useState<string>(NULL_ADDRESS);
  const [protocolFeePercent, setProtocolFeePercent] = useState<bigint>(
    BigInt(0)
  );
  const [subjectFeePercent, setSubjectFeePercent] = useState<bigint>(BigInt(0));

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setProtocolFeeDestination(NULL_ADDRESS);
      setProtocolFeePercent(BigInt(0));
      setSubjectFeePercent(BigInt(0));
      return;
    }
    const [protocolFeeDestination, protocolFeePercent, subjectFeePercent] =
      await Promise.all([
        publicClient.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: "defaultProtocolFeeDestination",
          args: [],
        }),
        publicClient.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: "defaultProtocolFeePercent",
          args: [],
        }),
        publicClient.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: "defaultStreamerFeePercent",
          args: [],
        }),
      ]);
    setProtocolFeeDestination(String(protocolFeeDestination));
    setProtocolFeePercent(BigInt(String(protocolFeePercent)));
    setSubjectFeePercent(BigInt(String(subjectFeePercent)));
  }, [contract.address, publicClient]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    protocolFeeDestination,
    protocolFeePercent,
    subjectFeePercent,
  };
};

export const useReadIsPaused = (contract: ContractData) => {
  const publicClient = usePublicClient();

  const [isPaused, setIsPaused] = useState<boolean>(false);

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setIsPaused(false);
      return;
    }
    const isPaused = await publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "isPaused",
      args: [],
    });
    setIsPaused(Boolean(isPaused));
  }, [contract.address, publicClient]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    isPaused,
  };
};

export const useReadMaxDuration = (contract: ContractData) => {
  const publicClient = usePublicClient();

  const [duration, setDuration] = useState<bigint>(BigInt(0));

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setDuration(BigInt(0));
      return;
    }
    const duration = await publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "maxDuration",
      args: [],
    });
    setDuration(BigInt(String(duration)));
  }, [contract.address, publicClient]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    maxDuration: duration,
  };
};

export const useReadTokenInfo = (
  contract: ContractData,
  tokenAddress: `0x${string}`
) => {
  const publicClient = usePublicClient();

  const [tokenInfo, setTokenInfo] = useState<TokenInfo>(tokenInfoInitialState);

  const getData = useCallback(async () => {
    if (!contract.address || !contract.abi || !publicClient) {
      setTokenInfo(tokenInfoInitialState);
      return;
    }
    const tokenInfo: any = await publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "getTokenInfo",
      args: [tokenAddress],
    });
    setTokenInfo({
      tokenAddress: tokenInfo[0] as `0x${string}`,
      ownerAddress: tokenInfo[1] as `0x${string}`,
      name: String(tokenInfo[2]),
      symbol: String(tokenInfo[3]),
      endTimestamp: BigInt(String(tokenInfo[4])),
      protocolFeeDestination: tokenInfo[5] as `0x${string}`,
      protocolFeePercent: BigInt(String(tokenInfo[6])),
      streamerFeePercent: BigInt(String(tokenInfo[7])),
    });
  }, [contract.address, publicClient]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    refetch: getData,
    tokenInfo,
  };
};

export const useCreateTempToken = (
  args: {
    name: string;
    symbol: string;
    duration: bigint;
    totalSupplyThreshold: bigint;
    preSaleDuration: bigint;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: createTempToken,
    writeData: createTempTokenData,
    txData: createTempTokenTxData,
    isTxLoading: isCreateTempTokenLoading,
  } = useWrite(
    contract,
    "createTempToken",
    [
      args.name,
      args.symbol,
      args.duration,
      args.totalSupplyThreshold,
      args.preSaleDuration,
    ],
    createCallbackHandler("useTempTokenFactoryV1 createTempToken", callbacks),
    { enabled: args.name.length > 0 && args.symbol.length > 0 }
  );

  return {
    createTempToken,
    createTempTokenData,
    createTempTokenTxData,
    isCreateTempTokenLoading,
  };
};

export const useCreateMultipleTempTokens = (
  args: {
    names: string[];
    symbols: string[];
    duration: bigint;
    totalSupplyThreshold: bigint;
    preSaleDuration: bigint;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: createMultipleTempTokens,
    writeData: createMultipleTempTokensData,
    txData: createMultipleTempTokensTxData,
    isTxLoading: isCreateMultipleTempTokensLoading,
  } = useWrite(
    contract,
    "createMultipleTempTokens",
    [
      args.names,
      args.symbols,
      args.duration,
      args.totalSupplyThreshold,
      args.preSaleDuration,
    ],
    createCallbackHandler(
      "useTempTokenFactoryV1 createMultipleTempTokens",
      callbacks
    ),
    { enabled: args.names.length > 0 && args.symbols.length > 0 }
  );

  return {
    createMultipleTempTokens,
    createMultipleTempTokensData,
    createMultipleTempTokensTxData,
    isCreateMultipleTempTokensLoading,
  };
};

export const useSetWinningTokenTradeableAndTransferLiquidity = (
  args: {
    winningTokenAddress: string;
    losingTokenAddress: string;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: setWinningTokenTradeableAndTransferLiquidity,
    writeData: setWinningTokenTradeableAndTransferLiquidityData,
    txData: setWinningTokenTradeableAndTransferLiquidityTxData,
    isTxLoading: isSetWinningTokenTradeableAndTransferLiquidityLoading,
    refetch: refetchSetWinningTokenTradeableAndTransferLiquidity,
  } = useWrite(
    contract,
    "setWinningTokenTradeableAndTransferLiquidity",
    [args.winningTokenAddress, args.losingTokenAddress],
    createCallbackHandler(
      "useTempTokenFactoryV1 setWinningTokenTradeableAndTransferLiquidity",
      callbacks
    )
  );

  return {
    setWinningTokenTradeableAndTransferLiquidity,
    setWinningTokenTradeableAndTransferLiquidityData,
    setWinningTokenTradeableAndTransferLiquidityTxData,
    isSetWinningTokenTradeableAndTransferLiquidityLoading,
    refetchSetWinningTokenTradeableAndTransferLiquidity,
  };
};

export const useMintWinnerTokens = (
  args: {
    winnerTokenAddress: string;
    amountOfTokens: bigint;
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: mintWinnerTokens,
    writeData: mintWinnerTokensData,
    txData: mintWinnerTokensTxData,
    isTxLoading: isMintWinnerTokensLoading,
  } = useWrite(
    contract,
    "mintWinnerTokens",
    [args.winnerTokenAddress, args.amountOfTokens],
    createCallbackHandler("useTempTokenFactoryV1 mintWinnerTokens", callbacks)
  );

  return {
    mintWinnerTokens,
    mintWinnerTokensData,
    mintWinnerTokensTxData,
    isMintWinnerTokensLoading,
  };
};

export const useSetTotalSupplyThresholdForTokens = (
  args: {
    _totalSupplyThreshold: bigint;
    tokenAddresses: string[];
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: setTotalSupplyThresholdForTokens,
    writeData: setTotalSupplyThresholdForTokensData,
    txData: setTotalSupplyThresholdForTokensTxData,
    isTxLoading: isSetTotalSupplyThresholdForTokensLoading,
  } = useWrite(
    contract,
    "setTotalSupplyThresholdForTokens",
    [args._totalSupplyThreshold, args.tokenAddresses],
    createCallbackHandler(
      "useTempTokenFactoryV1 setTotalSupplyThresholdForTokens",
      callbacks
    )
  );

  return {
    setTotalSupplyThresholdForTokens,
    setTotalSupplyThresholdForTokensData,
    setTotalSupplyThresholdForTokensTxData,
    isSetTotalSupplyThresholdForTokensLoading,
  };
};

export const useIncreaseEndTimestampForTokens = (
  args: {
    _additionalDurationInSeconds: bigint;
    tokenAddresses: string[];
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: increaseEndTimestampForTokens,
    writeData: increaseEndTimestampForTokensData,
    txData: increaseEndTimestampForTokensTxData,
    isTxLoading: isIncreaseEndTimestampForTokensLoading,
  } = useWrite(
    contract,
    "increaseEndTimestampForTokens",
    [args._additionalDurationInSeconds, args.tokenAddresses],
    createCallbackHandler(
      "useTempTokenFactoryV1 increaseEndTimestampForTokens",
      callbacks
    )
  );

  return {
    increaseEndTimestampForTokens,
    increaseEndTimestampForTokensData,
    increaseEndTimestampForTokensTxData,
    isIncreaseEndTimestampForTokensLoading,
  };
};

export const useSetAlwaysTradeableForTokens = (
  args: {
    tokenAddresses: string[];
  },
  contract: ContractData,
  callbacks?: WriteCallbacks
) => {
  const {
    writeAsync: setAlwaysTradeableForTokens,
    writeData: setAlwaysTradeableForTokensData,
    txData: setAlwaysTradeableForTokensTxData,
    isTxLoading: isSetAlwaysTradeableForTokensLoading,
  } = useWrite(
    contract,
    "setAlwaysTradeableForTokens",
    [args.tokenAddresses],
    createCallbackHandler(
      "useTempTokenFactoryV1 setAlwaysTradeableForTokens",
      callbacks
    )
  );

  return {
    setAlwaysTradeableForTokens,
    setAlwaysTradeableForTokensData,
    setAlwaysTradeableForTokensTxData,
    isSetAlwaysTradeableForTokensLoading,
  };
};
