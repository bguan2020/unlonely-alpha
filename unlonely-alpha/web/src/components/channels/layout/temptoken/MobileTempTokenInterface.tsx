import { AblyChannelPromise } from "../../../../constants";
import { Flex, Text, Button } from "@chakra-ui/react";
import { useTempTokenContext } from "../../../../hooks/context/useTempToken";
import { TransactionModalTemplate } from "../../../transactions/TransactionModalTemplate";
import { useEffect, useMemo } from "react";
import { TempTokenChart } from "./TempTokenChart";
import { useInterfaceChartData } from "../../../../hooks/internal/temp-token/ui/useInterfaceChartData";
import { formatUnits, isAddress } from "viem";
import { useCacheContext } from "../../../../hooks/context/useCache";
import { truncateValue } from "../../../../utils/tokenDisplayFormatting";
import { MobileTempTokenExchange } from "../../temp/MobileTempTokenExchange";
import { bondingCurve } from "../../../../utils/contract";

export const MobileTempTokenInterface = ({
  ablyChannel,
  customHeight,
}: {
  ablyChannel: AblyChannelPromise;
  customHeight?: string;
}) => {
  const { ethPriceInUsd } = useCacheContext();

  const { tempToken } = useTempTokenContext();
  const {
    gameState,
    tempTokenTxs,
    currentTempTokenContract,
    tempTokenChartTimeIndexes,
    onSendRemainingFundsToWinnerEvent,
  } = tempToken;
  const {
    currentActiveTokenSymbol,
    currentActiveTokenTotalSupplyThreshold,
    currentActiveTokenMinBaseTokenPrice,
    isSuccessGameModalOpen,
    isPermanentGameModalOpen,
    isFailedGameState,
    handleIsGameFailed,
    handleIsSuccessGameModalOpen,
    handleIsPermanentGameModalOpen,
  } = gameState;

  const interfaceChartData = useInterfaceChartData({
    chartTimeIndexes: tempTokenChartTimeIndexes,
    txs: tempTokenTxs,
  });

  const priceOfThreshold = useMemo(() => {
    if (currentActiveTokenTotalSupplyThreshold === BigInt(0)) return 0;

    const n = currentActiveTokenTotalSupplyThreshold;
    const n_ = n > BigInt(0) ? n - BigInt(1) : BigInt(0);
    const priceForCurrent = BigInt(Math.floor(bondingCurve(Number(n))));
    const priceForPrevious = BigInt(Math.floor(bondingCurve(Number(n_))));
    const newPrice =
      priceForCurrent - priceForPrevious + currentActiveTokenMinBaseTokenPrice;
    return Number(newPrice);
  }, [
    currentActiveTokenTotalSupplyThreshold,
    currentActiveTokenMinBaseTokenPrice,
  ]);

  const priceOfThresholdInUsd = useMemo(
    () =>
      truncateValue(
        Number(formatUnits(BigInt(priceOfThreshold), 18)) *
          Number(ethPriceInUsd),
        4
      ),
    [priceOfThreshold, ethPriceInUsd]
  );

  // if  game had just finished, remove current token info
  useEffect(() => {
    if (
      isFailedGameState &&
      isAddress(currentTempTokenContract.address as `0x${string}`)
    ) {
      onSendRemainingFundsToWinnerEvent(
        currentTempTokenContract.address as `0x${string}`,
        true
      );
      handleIsGameFailed(false);
    }
  }, [isFailedGameState, currentTempTokenContract]);

  return (
    <>
      {
        <Flex
          direction={"column"}
          justifyContent={"space-between"}
          width="100%"
          gap={"5px"}
          h={customHeight ?? "100%"}
          p="10px"
        >
          <TransactionModalTemplate
            title="Success - token lives to see another day"
            isOpen={isSuccessGameModalOpen}
            handleClose={() => handleIsSuccessGameModalOpen(false)}
            bg={"#18162F"}
            hideFooter
          >
            <Text>
              This token reached today's price goal and will survive another 24
              hours! Make sure to come back when the streamer goes live again
              tomorrow to keep the token alive.
            </Text>
            <Flex justifyContent={"space-evenly"} gap="5px" my="15px" p={4}>
              <Button
                onClick={() => {
                  handleIsSuccessGameModalOpen(false);
                }}
              >
                Continue
              </Button>
            </Flex>
          </TransactionModalTemplate>
          <TransactionModalTemplate
            title="Congratulations! This token is now tradable!"
            isOpen={isPermanentGameModalOpen}
            handleClose={() => handleIsPermanentGameModalOpen(false)}
            bg={"#18162F"}
            hideFooter
          >
            <Text>This token will now be tradable from now on by itself</Text>
            <Flex justifyContent={"space-evenly"} gap="5px">
              <Button
                onClick={() => {
                  handleIsPermanentGameModalOpen(false);
                }}
              >
                Continue
              </Button>
            </Flex>
          </TransactionModalTemplate>
          <Flex justifyContent={"space-between"} alignItems={"center"}>
            <Text fontSize={"20px"} color="#c6c3fc" fontWeight="bold">
              ${currentActiveTokenSymbol}
            </Text>
          </Flex>
          <Flex gap="10px" flex="1" h="100%" direction="column">
            <TempTokenChart
              interfaceChartData={interfaceChartData}
              priceOfThresholdInUsd={priceOfThresholdInUsd}
              priceOfThreshold={priceOfThreshold}
            />
          </Flex>
          <Flex direction={"column"} height="150px">
            <MobileTempTokenExchange />
          </Flex>
        </Flex>
      }
    </>
  );
};
