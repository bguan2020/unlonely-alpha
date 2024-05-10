import { useChannelContext } from "../../context/useChannel";
import { useNetworkContext } from "../../context/useNetwork";
import {
  Contract,
  VersusTokenDataType,
} from "../../../constants";
import { getContractFromNetwork } from "../../../utils/contract";
import { useUser } from "../../context/useUser";
import { useRouter } from "next/router";

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
  handleOwnerMustPermamint: (value: boolean | number) => void;
  handleWinningToken: (token: VersusTokenDataType) => void;
  handleLosingToken: (token: VersusTokenDataType) => void;
  resetTempTokenTxs: () => void;
}) => {
  const { userAddress, user } = useUser();

  const { channel, chat } = useChannelContext();
  const { addToChatbot } = chat;
  const { isOwner } = channel;
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const router = useRouter();

  const factoryContract = getContractFromNetwork(
    Contract.TEMP_TOKEN_FACTORY_V1,
    localNetwork
  );

  // /**
  //  * listen for incoming setWinningTokenTradeableAndTransferredLiquidity events from factory
  //  */

  // const [
  //   incomingSetWinningTokenTradeableAndTransferredLiquidityLogs,
  //   setIncomingSetWinningTokenTradeableAndTransferredLiquidityLogs,
  // ] = useState<Log[]>([]);

  // useContractEvent({
  //   address: factoryContract.address,
  //   abi: factoryContract.abi,
  //   eventName: "SetWinningTokenTradeableAndTransferredLiquidity",
  //   listener(logs) {
  //     console.log(
  //       "detected SetWinningTokenTradeableAndTransferredLiquidity event",
  //       logs
  //     );
  //     const init = async () => {
  //       setIncomingSetWinningTokenTradeableAndTransferredLiquidityLogs(logs);
  //     };
  //     init();
  //   },
  // });

  // useEffect(() => {
  //   if (incomingSetWinningTokenTradeableAndTransferredLiquidityLogs)
  //     handleSetWinningTokenTradeableAndTransferredLiquidityUpdate(
  //       incomingSetWinningTokenTradeableAndTransferredLiquidityLogs
  //     );
  // }, [incomingSetWinningTokenTradeableAndTransferredLiquidityLogs]);

  // const handleSetWinningTokenTradeableAndTransferredLiquidityUpdate = async (
  //   logs: Log[]
  // ) => {
  //   if (logs.length === 0) return;
  //   console.log(
  //     "handleSetWinningTokenTradeableAndTransferredLiquidityUpdate",
  //     logs
  //   );
  //   const filteredLogsByMatchingAddresses = logs.filter(
  //     (log: any) =>
  //       (isAddress(tokenA.address) &&
  //         isAddressEqual(
  //           log.args.winnerTokenAddress as `0x${string}`,
  //           tokenA.address as `0x${string}`
  //         )) ||
  //       (isAddress(tokenB.address) &&
  //         isAddressEqual(
  //           log.args.winnerTokenAddress as `0x${string}`,
  //           tokenB.address as `0x${string}`
  //         ))
  //   );
  //   const sortedLogs = filteredLogsByMatchingAddresses.sort(
  //     (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
  //   );
  //   if (sortedLogs.length === 0) return;
  //   const latestLog: any = sortedLogs[sortedLogs.length - 1];
  //   const winnerTokenAddress = latestLog?.args
  //     .winnerTokenAddress as `0x${string}`;
  //   const transferredLiquidity = latestLog?.args.transferredLiquidity as bigint;

  //   if (
  //     tokenA.address &&
  //     isAddressEqual(
  //       winnerTokenAddress as `0x${string}`,
  //       tokenA.address as `0x${string}`
  //     )
  //   ) {
  //     const _losingToken = {
  //       ...tokenB,
  //       transferredLiquidityOnExpiration: transferredLiquidity,
  //     };
  //     handleTokenB(_losingToken);
  //     handleLosingToken(_losingToken);
  //     const title = `The ${tokenA.symbol} token has won!`;
  //     addToChatbot({
  //       username: user?.username ?? "",
  //       address: userAddress ?? "",
  //       taskType:
  //         InteractionType.VERSUS_SET_WINNING_TOKEN_TRADEABLE_AND_TRANSFER_LIQUIDITY,
  //       title,
  //       description: "",
  //     });
  //   }
  //   if (
  //     tokenB.address &&
  //     isAddressEqual(
  //       winnerTokenAddress as `0x${string}`,
  //       tokenB.address as `0x${string}`
  //     )
  //   ) {
  //     const _losingToken = {
  //       ...tokenA,
  //       transferredLiquidityOnExpiration: transferredLiquidity,
  //     };
  //     handleTokenA(_losingToken);
  //     handleLosingToken(_losingToken);
  //     const title = `The ${tokenB.symbol} token has won!`;
  //     addToChatbot({
  //       username: user?.username ?? "",
  //       address: userAddress ?? "",
  //       taskType:
  //         InteractionType.VERSUS_SET_WINNING_TOKEN_TRADEABLE_AND_TRANSFER_LIQUIDITY,
  //       title,
  //       description: "",
  //     });
  //   }
  //   handleOwnerMustMakeWinningTokenTradeable(false);
  //   handleOwnerMustPermamint(true);
  // };

  /**
   * listen for FactoryMintedWinnerTokens event from the factory
   */

  // const [
  //   incomingFactoryMintedWinnerTokensLogs,
  //   setIncomingFactoryMintedWinnerTokensLogs,
  // ] = useState<Log[]>([]);

  // useContractEvent({
  //   address: factoryContract.address,
  //   abi: factoryContract.abi,
  //   eventName: "FactoryMintedWinnerTokens",
  //   listener(logs) {
  //     console.log("detected FactoryMintedWinnerTokens event", logs);
  //     const init = async () => {
  //       setIncomingFactoryMintedWinnerTokensLogs(logs);
  //     };
  //     init();
  //   },
  // });

  // useEffect(() => {
  //   if (incomingFactoryMintedWinnerTokensLogs)
  //     handleFactoryMintedWinnerTokensUpdate(
  //       incomingFactoryMintedWinnerTokensLogs
  //     );
  // }, [incomingFactoryMintedWinnerTokensLogs]);

  // const handleFactoryMintedWinnerTokensUpdate = async (logs: Log[]) => {
  //   if (logs.length === 0) return;
  //   console.log("handleFactoryMintedWinnerTokensUpdate", logs);
  //   const filteredLogsByMatchingAddresses = logs.filter(
  //     (log: any) =>
  //       (isAddress(tokenA.address) &&
  //         isAddressEqual(
  //           log.args.winnerTokenAddress as `0x${string}`,
  //           tokenA.address as `0x${string}`
  //         )) ||
  //       (isAddress(tokenB.address) &&
  //         isAddressEqual(
  //           log.args.winnerTokenAddress as `0x${string}`,
  //           tokenB.address as `0x${string}`
  //         ))
  //   );
  //   const sortedLogs = filteredLogsByMatchingAddresses.sort(
  //     (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
  //   );
  //   if (sortedLogs.length === 0) return;
  //   const latestLog: any = sortedLogs[sortedLogs.length - 1];
  //   const winnerTokenAddress = latestLog?.args
  //     .winnerTokenAddress as `0x${string}`;
  //   handleOwnerMustPermamint(false);

  //   if (isOwner && router.pathname.startsWith("/channels")) {
  //     let title = "";
  //     if (
  //       isAddress(tokenA.address) &&
  //       isAddressEqual(
  //         winnerTokenAddress as `0x${string}`,
  //         tokenA.address as `0x${string}`
  //       )
  //     ) {
  //       title = `The $${tokenA.symbol} token's price increased!`;
  //     }
  //     if (
  //       isAddress(tokenB.address) &&
  //       isAddressEqual(
  //         winnerTokenAddress as `0x${string}`,
  //         tokenB.address as `0x${string}`
  //       )
  //     ) {
  //       title = `The $${tokenB.symbol} token's price increased!`;
  //     }
  //     addToChatbot({
  //       username: user?.username ?? "",
  //       address: userAddress ?? "",
  //       taskType: InteractionType.VERSUS_WINNER_TOKENS_MINTED,
  //       title,
  //       description: "",
  //     });
  //   }
  // };
};
