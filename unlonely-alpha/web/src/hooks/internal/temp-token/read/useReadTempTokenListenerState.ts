import { useMemo } from "react";
import { ContractData } from "../../../../constants/types";
import { NULL_ADDRESS } from "../../../../constants";
import { useNetworkContext } from "../../../context/useNetwork";
import { useReadTempTokenTxs } from "./useReadTempTokenTxs";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { useReadTempTokenExternalEventListeners } from "./useReadTempTokenExternalEventListeners";

export const useReadTempTokenListenerState = ({
  tempTokenData,
  onMintEvent,
  onBurnEvent,
  onDurationIncreaseEvent,
  onAlwaysTradeableEvent,
}: {
  tempTokenData: {
    symbol: string;
    contractData: ContractData;
    creationBlockNumber: bigint;
  };
  onMintEvent: (totalSupply: bigint, highestTotalSupply: bigint) => void;
  onBurnEvent: (totalSupply: bigint) => void;
  onDurationIncreaseEvent: (newEndTimestamp: bigint) => void;
  onAlwaysTradeableEvent: () => void;
}) => {
  const { network } = useNetworkContext();
  const { localNetwork } = network;

  const baseClient = useMemo(
    () =>
      createPublicClient({
        chain: base,
        transport: http(
          "https://base-mainnet.g.alchemy.com/v2/aR93M6MdEC4lgh4VjPXLaMnfBveve1fC"
        ),
      }),
    []
  );

  const tempTokenContract: ContractData = useMemo(() => {
    if (tempTokenData) {
      return {
        address: tempTokenData.contractData.address as `0x${string}`,
        abi: tempTokenData.contractData.abi,
        chainId: localNetwork.config.chainId,
      };
    } else {
      return {
        address: NULL_ADDRESS,
        chainId: localNetwork.config.chainId,
        abi: undefined,
      };
    }
  }, [tempTokenData, localNetwork.config.chainId]);

  const readTempTokenTxs = useReadTempTokenTxs({
    tokenCreationBlockNumber: tempTokenData?.creationBlockNumber ?? BigInt(0),
    tokenSymbol: tempTokenData?.symbol ?? "",
    baseClient,
    tempTokenContract: tempTokenContract,
    onMintCallback: (totalSupply: bigint, highestTotalSupply: bigint) =>
      onMintEvent(totalSupply, highestTotalSupply),
    onBurnCallback: (totalSupply: bigint) => onBurnEvent(totalSupply),
  });

  useReadTempTokenExternalEventListeners({
    tempTokenContract: tempTokenContract,
    onReachThresholdCallback: () => undefined,
    onDurationIncreaseCallback: (newEndTimestamp: bigint) =>
      onDurationIncreaseEvent(newEndTimestamp),
    onAlwaysTradeableCallback: () => onAlwaysTradeableEvent(),
    onThresholdUpdateCallback: () => undefined,
    onSendRemainingFundsToWinnerCallback: () => undefined,
  });

  return {
    tempTokenContract,
    readTempTokenTxs,
  };
};
