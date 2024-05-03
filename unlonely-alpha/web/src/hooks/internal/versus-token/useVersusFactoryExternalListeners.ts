import { useState, useEffect } from "react";
import { Log, isAddress, isAddressEqual } from "viem";
import { useContractEvent } from "wagmi";
import { useChannelContext } from "../../context/useChannel";
import usePostTempToken from "../../server/temp-token/usePostTempToken";
import TempTokenAbi from "../../../constants/abi/TempTokenV1.json";
import { useNetworkContext } from "../../context/useNetwork";
import {
  Contract,
  InteractionType,
  NULL_ADDRESS,
  VersusTokenDataType,
} from "../../../constants";
import { getContractFromNetwork } from "../../../utils/contract";
import { useUser } from "../../context/useUser";
import { useRouter } from "next/router";

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
  handleIsGameOngoing,
  handleIsGameFinished,
  handleIsGameFinishedModalOpen,
  resetTempTokenTxs,
  handleOwnerMustMakeWinningTokenTradeable,
  handleOwnerMustPermamint,
  handleWinningToken,
  handleLosingToken,
}: {
  tokenA: VersusTokenDataType;
  tokenB: VersusTokenDataType;
  handleTokenA: (token: VersusTokenDataType) => void;
  handleTokenB: (token: VersusTokenDataType) => void;
  handleIsGameOngoing: (isGameOngoing: boolean) => void;
  handleIsGameFinished: (isGameFinished: boolean) => void;
  handleIsGameFinishedModalOpen: (isOpen: boolean) => void;
  handleOwnerMustMakeWinningTokenTradeable: (value: boolean) => void;
  handleOwnerMustPermamint: (value: boolean) => void;
  handleWinningToken: (token: VersusTokenDataType) => void;
  handleLosingToken: (token: VersusTokenDataType) => void;
  resetTempTokenTxs: () => void;
}) => {
  const { userAddress, user } = useUser();

  const { channel, chat } = useChannelContext();
  const { addToChatbot } = chat;
  const { handleRealTimeChannelDetails, channelQueryData, isOwner } = channel;
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const { postTempToken } = usePostTempToken({});
  const router = useRouter();

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
    handleIsGameOngoing(true);
    handleOwnerMustPermamint(false);
    handleOwnerMustMakeWinningTokenTradeable(false);
    handleIsGameFinishedModalOpen(false);
    handleWinningToken(versusTokenDataInitial);
    handleLosingToken(versusTokenDataInitial);
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
        (isAddress(tokenA.address) &&
          isAddressEqual(
            log.args.winnerTokenAddress as `0x${string}`,
            tokenA.address as `0x${string}`
          )) ||
        (isAddress(tokenB.address) &&
          isAddressEqual(
            log.args.winnerTokenAddress as `0x${string}`,
            tokenB.address as `0x${string}`
          ))
    );
    const sortedLogs = filteredLogsByMatchingAddresses.sort(
      (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
    );
    if (sortedLogs.length === 0) return;
    const latestLog: any = sortedLogs[sortedLogs.length - 1];
    const winnerTokenAddress = latestLog?.args
      .winnerTokenAddress as `0x${string}`;
    const transferredLiquidity = latestLog?.args.transferredLiquidity as bigint;

    if (
      tokenA.address &&
      isAddressEqual(
        winnerTokenAddress as `0x${string}`,
        tokenA.address as `0x${string}`
      )
    ) {
      const _losingToken = {
        ...tokenB,
        transferredLiquidityOnExpiration: transferredLiquidity,
      };
      handleTokenB(_losingToken);
      handleLosingToken(_losingToken);
      const title = `The ${tokenA.symbol} token has won!`;
      addToChatbot({
        username: user?.username ?? "",
        address: userAddress ?? "",
        taskType:
          InteractionType.VERSUS_SET_WINNING_TOKEN_TRADEABLE_AND_TRANSFER_LIQUIDITY,
        title,
        description: "",
      });
    }
    if (
      tokenB.address &&
      isAddressEqual(
        winnerTokenAddress as `0x${string}`,
        tokenB.address as `0x${string}`
      )
    ) {
      const _losingToken = {
        ...tokenA,
        transferredLiquidityOnExpiration: transferredLiquidity,
      };
      handleTokenA(_losingToken);
      handleLosingToken(_losingToken);
      const title = `The ${tokenB.symbol} token has won!`;
      addToChatbot({
        username: user?.username ?? "",
        address: userAddress ?? "",
        taskType:
          InteractionType.VERSUS_SET_WINNING_TOKEN_TRADEABLE_AND_TRANSFER_LIQUIDITY,
        title,
        description: "",
      });
    }
    handleOwnerMustMakeWinningTokenTradeable(false);
    handleOwnerMustPermamint(true);
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
        (isAddress(tokenA.address) &&
          isAddressEqual(
            log.args.winnerTokenAddress as `0x${string}`,
            tokenA.address as `0x${string}`
          )) ||
        (isAddress(tokenB.address) &&
          isAddressEqual(
            log.args.winnerTokenAddress as `0x${string}`,
            tokenB.address as `0x${string}`
          ))
    );
    const sortedLogs = filteredLogsByMatchingAddresses.sort(
      (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
    );
    if (sortedLogs.length === 0) return;
    const latestLog: any = sortedLogs[sortedLogs.length - 1];
    const winnerTokenAddress = latestLog?.args
      .winnerTokenAddress as `0x${string}`;
    // const amount = latestLog?.args.amount as bigint;

    // if (
    //   tokenA.address &&
    //   isAddressEqual(
    //     winnerTokenAddress as `0x${string}`,
    //     tokenA.address as `0x${string}`
    //   )
    // ) {
    //   handleTokenB(versusTokenDataInitial);
    // }
    // if (
    //   tokenB.address &&
    //   isAddressEqual(
    //     winnerTokenAddress as `0x${string}`,
    //     tokenB.address as `0x${string}`
    //   )
    // ) {
    //   handleTokenA(versusTokenDataInitial);
    // }
    handleOwnerMustPermamint(false);

    if (isOwner && router.pathname.startsWith("/channels")) {
      let title = "";
      if (
        isAddress(tokenA.address) &&
        isAddressEqual(
          winnerTokenAddress as `0x${string}`,
          tokenA.address as `0x${string}`
        )
      ) {
        title = `The $${tokenA.symbol} token's price increased!`;
      }
      if (
        isAddress(tokenB.address) &&
        isAddressEqual(
          winnerTokenAddress as `0x${string}`,
          tokenB.address as `0x${string}`
        )
      ) {
        title = `The $${tokenB.symbol} token's price increased!`;
      }
      addToChatbot({
        username: user?.username ?? "",
        address: userAddress ?? "",
        taskType: InteractionType.VERSUS_WINNER_TOKENS_MINTED,
        title,
        description: "",
      });
    }
  };
};
