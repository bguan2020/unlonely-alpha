import { useState, useEffect } from "react";
import { Log, isAddressEqual } from "viem";
import { useContractEvent } from "wagmi";
import { ContractData } from "../../../constants/types";
import { VersusTokenDataType, versusTokenDataInitial } from "../../context/useVersusTempToken";
import { useChannelContext } from "../../context/useChannel";
import usePostTempToken from "../../server/temp-token/usePostTempToken";
import TempTokenAbi from "../../../constants/abi/TempTokenV1.json";
import { useNetworkContext } from "../../context/useNetwork";

export const useVersusFactoryExternalListeners = ({factoryContract, tokenA, tokenB, handleTokenA, handleTokenB, handleIsGameFinished, resetTempTokenTxs} : {
    factoryContract: ContractData;
    tokenA: VersusTokenDataType;
    tokenB: VersusTokenDataType;
    handleTokenA: (token: VersusTokenDataType) => void;
    handleTokenB: (token: VersusTokenDataType) => void;
    handleIsGameFinished: (isGameFinished: boolean) => void;
    resetTempTokenTxs: () => void;
}) => {

    const { channel, chat } = useChannelContext();
    const { handleRealTimeChannelDetails, channelQueryData, isOwner } = channel;
    const { network } = useNetworkContext();
    const { localNetwork } = network;
    const { postTempToken } = usePostTempToken({});

  /**
   * listen for incoming multiple temp tokens created events from factory
   */

  const [
    incomingMultipleTempTokensCreatedLogs,
    setIncomingMultipleTempTokensCreatedLogs,
  ] = useState<Log[]>([]);

  useContractEvent({
    address: factoryContract.address,
    abi: factoryContract.abi,
    eventName: "MultipleTempTokensCreated",
    listener(logs) {
      console.log("detected MultipleTempTokensCreated event", logs);
      const init = async () => {
        setIncomingMultipleTempTokensCreatedLogs(logs);
      };
      init();
    },
  });

  useEffect(() => {
    if (incomingMultipleTempTokensCreatedLogs)
      handleMultipleTempTokensCreatedUpdate(
        incomingMultipleTempTokensCreatedLogs
      );
  }, [incomingMultipleTempTokensCreatedLogs]);

  const handleMultipleTempTokensCreatedUpdate = async (logs: Log[]) => {
    if (logs.length === 0) return;
    console.log(
      "handleMultipleTempTokensCreatedUpdate",
      logs,
      channelQueryData?.owner.address
    );
    const filteredLogsByOwner = logs.filter((log: any) =>
      isAddressEqual(
        log.args.owner as `0x${string}`,
        channelQueryData?.owner.address as `0x${string}`
      )
    );
    const sortedLogs = filteredLogsByOwner.sort(
      (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
    );
    if (sortedLogs.length === 0) return;
    const latestLog: any = sortedLogs[sortedLogs.length - 1];
    const newEndTimestamp = latestLog?.args.endTimestamp as bigint;
    const newTokenAddresses = latestLog?.args.tokenAddresses as `0x${string}`[];
    const newTokenSymbols = latestLog?.args.symbols as string[];
    const newTokenNames = latestLog?.args.names as string[];
    const newTokenCreationBlockNumber = latestLog?.args
      .creationBlockNumber as bigint;

    handleRealTimeChannelDetails({
      isLive: true,
    });

    handleIsGameFinished(false);
    resetTempTokenTxs();

    if (isOwner) {
      try {
        await Promise.all([
          postTempToken({
            tokenAddress: newTokenAddresses[0],
            symbol: newTokenSymbols[0],
            streamerFeePercentage: latestLog?.args.streamerFeePercent as bigint,
            protocolFeePercentage: latestLog?.args.protocolFeePercent as bigint,
            ownerAddress: latestLog?.args.owner as `0x${string}`,
            name: newTokenNames[0],
            endUnixTimestamp: newEndTimestamp,
            channelId: Number(channelQueryData?.id),
            chainId: localNetwork.config.chainId as number,
            highestTotalSupply: BigInt(0),
            creationBlockNumber: newTokenCreationBlockNumber,
            factoryAddress: factoryContract.address as `0x${string}`,
          }),
          postTempToken({
            tokenAddress: newTokenAddresses[1],
            symbol: newTokenSymbols[1],
            streamerFeePercentage: latestLog?.args.streamerFeePercent as bigint,
            protocolFeePercentage: latestLog?.args.protocolFeePercent as bigint,
            ownerAddress: latestLog?.args.owner as `0x${string}`,
            name: newTokenNames[1],
            endUnixTimestamp: newEndTimestamp,
            channelId: Number(channelQueryData?.id),
            chainId: localNetwork.config.chainId as number,
            highestTotalSupply: BigInt(0),
            creationBlockNumber: newTokenCreationBlockNumber,
            factoryAddress: factoryContract.address as `0x${string}`,
          }),
        ]);
      } catch (e) {
        console.log(
          "detected TempTokenCreated event but cannot call posttemptoken, may have been created already",
          e
        );
      }
    }
    handleTokenA({
      symbol: newTokenSymbols[0],
      address: newTokenAddresses[0],
      totalSupply: BigInt(0),
      isAlwaysTradeable: false,
      highestTotalSupply: BigInt(0),
      contractData: {
        address: newTokenAddresses[0],
        chainId: localNetwork.config.chainId,
        abi: TempTokenAbi,
      },
      creationBlockNumber: newTokenCreationBlockNumber,
      endTimestamp: newEndTimestamp,
    });
    handleTokenB({
      symbol: newTokenSymbols[1],
      address: newTokenAddresses[1],
      totalSupply: BigInt(0),
      isAlwaysTradeable: false,
      highestTotalSupply: BigInt(0),
      contractData: {
        address: newTokenAddresses[1],
        chainId: localNetwork.config.chainId,
        abi: TempTokenAbi,
      },
      creationBlockNumber: newTokenCreationBlockNumber,
      endTimestamp: newEndTimestamp,
    });
  };

  /**
   * listen for incoming setWinningTokenTradeableAndTransferredLiquidity events from factory
   */

  const [
    incomingSetWinningTokenTradeableAndTransferredLiquidityLogs,
    setIncomingSetWinningTokenTradeableAndTransferredLiquidityLogs,
  ] = useState<Log[]>([]);

  useContractEvent({
    address: factoryContract.address,
    abi: factoryContract.abi,
    eventName: "SetWinningTokenTradeableAndTransferredLiquidity",
    listener(logs) {
      console.log(
        "detected SetWinningTokenTradeableAndTransferredLiquidity event",
        logs
      );
      const init = async () => {
        setIncomingSetWinningTokenTradeableAndTransferredLiquidityLogs(logs);
      };
      init();
    },
  });

  useEffect(() => {
    if (incomingSetWinningTokenTradeableAndTransferredLiquidityLogs)
      handleSetWinningTokenTradeableAndTransferredLiquidityUpdate(
        incomingSetWinningTokenTradeableAndTransferredLiquidityLogs
      );
  }, [incomingSetWinningTokenTradeableAndTransferredLiquidityLogs]);

  const handleSetWinningTokenTradeableAndTransferredLiquidityUpdate = async (
    logs: Log[]
  ) => {
    if (logs.length === 0) return;
    console.log(
      "handleSetWinningTokenTradeableAndTransferredLiquidityUpdate",
      logs
    );
    const filteredLogsByMatchingAddresses = logs.filter(
      (log: any) =>
        isAddressEqual(
          log.args.winningTokenAddress as `0x${string}`,
          tokenA.address as `0x${string}`
        ) ||
        isAddressEqual(
          log.args.winningTokenAddress as `0x${string}`,
          tokenB.address as `0x${string}`
        )
    );
    const sortedLogs = filteredLogsByMatchingAddresses.sort(
      (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
    );
    if (sortedLogs.length === 0) return;
    const latestLog: any = sortedLogs[sortedLogs.length - 1];
    const winningTokenAddress = latestLog?.args
      .winningTokenAddress as `0x${string}`;
    const losingTokenAddress = latestLog?.args
      .losingTokenAddress as `0x${string}`;
    const transferredLiquidity = latestLog?.args.transferredLiquidity as bigint;

    if (
      tokenA.address &&
      isAddressEqual(
        winningTokenAddress as `0x${string}`,
        tokenA.address as `0x${string}`
      )
    ) {
      handleTokenA({
        ...tokenA,
        isAlwaysTradeable: true,
      });
    }
    if (
      tokenB.address &&
      isAddressEqual(
        winningTokenAddress as `0x${string}`,
        tokenB.address as `0x${string}`
      )
    ) {
      handleTokenB(
        {
          ...tokenB,
          isAlwaysTradeable: true,
        }
      );
    }
  };

  /**
   * listen for FactoryMintedWinnerTokens event from the factory
   */

  const [
    incomingFactoryMintedWinnerTokensLogs,
    setIncomingFactoryMintedWinnerTokensLogs,
  ] = useState<Log[]>([]);

  useContractEvent({
    address: factoryContract.address,
    abi: factoryContract.abi,
    eventName: "FactoryMintedWinnerTokens",
    listener(logs) {
      console.log("detected FactoryMintedWinnerTokens event", logs);
      const init = async () => {
        setIncomingFactoryMintedWinnerTokensLogs(logs);
      };
      init();
    },
  });

  useEffect(() => {
    if (incomingFactoryMintedWinnerTokensLogs)
      handleFactoryMintedWinnerTokensUpdate(
        incomingFactoryMintedWinnerTokensLogs
      );
  }, [incomingFactoryMintedWinnerTokensLogs]);

  const handleFactoryMintedWinnerTokensUpdate = async (logs: Log[]) => {
    if (logs.length === 0) return;
    console.log("handleFactoryMintedWinnerTokensUpdate", logs);
    const filteredLogsByMatchingAddresses = logs.filter(
      (log: any) =>
        isAddressEqual(
          log.args.winningTokenAddress as `0x${string}`,
          tokenA.address as `0x${string}`
        ) ||
        isAddressEqual(
          log.args.winningTokenAddress as `0x${string}`,
          tokenB.address as `0x${string}`
        )
    );
    const sortedLogs = filteredLogsByMatchingAddresses.sort(
      (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
    );
    if (sortedLogs.length === 0) return;
    const latestLog: any = sortedLogs[sortedLogs.length - 1];
    const winningTokenAddress = latestLog?.args
      .winningTokenAddress as `0x${string}`;
    const amount = latestLog?.args.amount as bigint;

    if (
      tokenA.address &&
      isAddressEqual(
        winningTokenAddress as `0x${string}`,
        tokenA.address as `0x${string}`
      )
    ) {
      handleTokenB(versusTokenDataInitial);
    }
    if (
      tokenB.address &&
      isAddressEqual(
        winningTokenAddress as `0x${string}`,
        tokenB.address as `0x${string}`
      )
    ) {
      handleTokenA(versusTokenDataInitial);
    }
  };

}