import { useState, useEffect } from "react";
import { Log, isAddressEqual } from "viem";
import { useContractEvent } from "wagmi";
import { useChannelContext } from "../../context/useChannel";
import usePostTempToken from "../../server/temp-token/usePostTempToken";
import TempTokenAbi from "../../../constants/abi/TempTokenV1.json";
import { useNetworkContext } from "../../context/useNetwork";
import { Contract, NULL_ADDRESS, VersusTokenDataType } from "../../../constants";
import { getContractFromNetwork } from "../../../utils/contract";

const versusTokenDataInitial: VersusTokenDataType = {
  transferredLiquidityOnExpiration: BigInt(0),
  symbol: "",
  address: "",
  totalSupply: BigInt(0),
  isAlwaysTradeable: false,
  highestTotalSupply: BigInt(0),
  contractData: {
    address: NULL_ADDRESS,
    chainId: 0,
    abi: undefined,
  },
  creationBlockNumber: BigInt(0),
  endTimestamp: undefined,
};

export const useVersusFactoryExternalListeners = ({
  tokenA,
  tokenB,
  handleTokenA,
  handleTokenB,
  handleIsGameFinished,
  handleIsGameFinishedModalOpen,
  resetTempTokenTxs,
  handleOwnerMustTransferFunds,
  handleOwnerMustPermamint,
  handleLosingToken
}: {
  tokenA: VersusTokenDataType;
  tokenB: VersusTokenDataType;
  handleTokenA: (token: VersusTokenDataType) => void;
  handleTokenB: (token: VersusTokenDataType) => void;
  handleIsGameFinished: (isGameFinished: boolean) => void;
  handleIsGameFinishedModalOpen: (isOpen: boolean) => void;
  handleOwnerMustTransferFunds: (value: boolean) => void;
  handleOwnerMustPermamint: (value: boolean) => void;
  handleLosingToken: (token: VersusTokenDataType) => void;
  resetTempTokenTxs: () => void;
}) => {
  const { channel } = useChannelContext();
  const { handleRealTimeChannelDetails, channelQueryData, isOwner } = channel;
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const { postTempToken } = usePostTempToken({});

  const factoryContract = getContractFromNetwork(
    Contract.TEMP_TOKEN_FACTORY_V1,
    localNetwork
  );

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
    handleOwnerMustPermamint(false);
    handleOwnerMustTransferFunds(false);
    handleIsGameFinishedModalOpen(false);
    resetTempTokenTxs();

    if (isOwner) {
      try {
        await postTempToken({
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
        });
      } catch (e) {
        console.log(
          "detected TempTokenCreated event but cannot call posttemptoken on first token, may have been created already",
          e
        );
      }

      try {
        await postTempToken({
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
        });
      } catch (e) {
        console.log(
          "detected TempTokenCreated event but cannot call posttemptoken on second token, may have been created already",
          e
        );
      }
    }
    handleTokenA({
      transferredLiquidityOnExpiration: BigInt(0),
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
      transferredLiquidityOnExpiration: BigInt(0),
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
      handleTokenB({
        ...tokenB,
        transferredLiquidityOnExpiration: transferredLiquidity,
      })
      handleLosingToken(tokenB)
    }
    if (
      tokenB.address &&
      isAddressEqual(
        winningTokenAddress as `0x${string}`,
        tokenB.address as `0x${string}`
      )
    ) {
      handleTokenB({
        ...tokenB,
        isAlwaysTradeable: true,
      });
      handleTokenA({
        ...tokenA,
        transferredLiquidityOnExpiration: transferredLiquidity,
      })
      handleLosingToken(tokenA)
    }

    if (transferredLiquidity > BigInt(0)) {
      handleOwnerMustTransferFunds(false)
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
    handleOwnerMustPermamint(false)
  };
};
