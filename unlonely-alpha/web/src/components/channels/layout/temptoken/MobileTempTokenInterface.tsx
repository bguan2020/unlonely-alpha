import {
  AblyChannelPromise,
  PRESALE_NOTIFICATION_URL_QUERY_PARAM,
} from "../../../../constants";
import { Flex, Text, Spinner, Button } from "@chakra-ui/react";
import { useTempTokenContext } from "../../../../hooks/context/useTempToken";
import { TransactionModalTemplate } from "../../../transactions/TransactionModalTemplate";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";
import { TempTokenChart } from "./TempTokenChart";
import { useInterfaceChartData } from "../../../../hooks/internal/temp-token/ui/useInterfaceChartData";
import { formatUnits, isAddress } from "viem";
import { useCacheContext } from "../../../../hooks/context/useCache";
import { truncateValue } from "../../../../utils/tokenDisplayFormatting";
import { MobileTempTokenExchange } from "../../temp/MobileTempTokenExchange";

export const MobileTempTokenInterface = ({
  ablyChannel,
  customHeight,
}: {
  ablyChannel: AblyChannelPromise;
  customHeight?: string;
}) => {
  const router = useRouter();
  const { ethPriceInUsd } = useCacheContext();

  const { tempToken } = useTempTokenContext();
  const {
    gameState,
    loadingCurrentOnMount,
    tempTokenTxs,
    currentTempTokenContract,
    tempTokenChartTimeIndexes,
    onSendRemainingFundsToWinnerEvent,
  } = tempToken;
  const {
    currentActiveTokenSymbol,
    currentActiveTokenTotalSupplyThreshold,
    isSuccessGameModalOpen,
    isFailedGameModalOpen,
    isPermanentGameModalOpen,
    isPreSaleOngoing,
    isFailedGameState,
    handleIsFailedGameModalOpen,
    handleIsGameFailed,
    handleIsSuccessGameModalOpen,
    handleIsPermanentGameModalOpen,
  } = gameState;

  const [presaleWelcomeModalOpen, setPresaleWelcomeModalOpen] = useState(false);

  const interfaceChartData = useInterfaceChartData({
    chartTimeIndexes: tempTokenChartTimeIndexes,
    txs: tempTokenTxs,
  });

  const priceOfThreshold = useMemo(() => {
    if (currentActiveTokenTotalSupplyThreshold === BigInt(0)) return 0;
    const n = Number(currentActiveTokenTotalSupplyThreshold);
    const n_ = Math.max(n - 1, 0);
    const priceForCurrent = Math.floor((n * (n + 1) * (2 * n + 1)) / 6);
    const priceForPrevious = Math.floor((n_ * (n_ + 1) * (2 * n_ + 1)) / 6);
    const newPrice = priceForCurrent - priceForPrevious;
    return newPrice;
  }, [currentActiveTokenTotalSupplyThreshold]);

  const priceOfThresholdInUsd = useMemo(
    () =>
      truncateValue(
        Number(formatUnits(BigInt(priceOfThreshold), 18)) *
          Number(ethPriceInUsd),
        4
      ),
    [priceOfThreshold, ethPriceInUsd]
  );

  useEffect(() => {
    if (router.query[PRESALE_NOTIFICATION_URL_QUERY_PARAM]) {
      setPresaleWelcomeModalOpen(true);
      const newPath = router.pathname;
      const newQuery = { ...router.query };
      delete newQuery[PRESALE_NOTIFICATION_URL_QUERY_PARAM];

      router.replace(
        {
          pathname: newPath,
          query: newQuery,
        },
        undefined,
        { shallow: true }
      );
    }
  }, [router]);

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
            isOpen={presaleWelcomeModalOpen}
            handleClose={() => setPresaleWelcomeModalOpen(false)}
            cannotClose={loadingCurrentOnMount}
            hideFooter
          >
            {loadingCurrentOnMount ? (
              <Flex justifyContent="center">
                <Spinner />
              </Flex>
            ) : isPreSaleOngoing ? (
              <Flex direction="column" gap="10px">
                <Text fontSize="25px" textAlign={"center"}>
                  hurray!
                </Text>
                <Text>
                  you made it here early enough to claim 1000 tokens. select a
                  token to redeem and make sure your wallet is connected before
                  time runs out
                </Text>
              </Flex>
            ) : (
              <Flex direction="column" gap="10px">
                <Text fontSize="25px" textAlign={"center"}>
                  too late, but...
                </Text>
                <Text>you can still join this VERSUS game!</Text>
                <Text>
                  come early next time a token launches to claim your tokens!
                </Text>
              </Flex>
            )}
          </TransactionModalTemplate>
          <TransactionModalTemplate
            title="Token didn't make it this time :("
            isOpen={isFailedGameModalOpen}
            handleClose={() => handleIsFailedGameModalOpen(false)}
            bg={"#18162F"}
            hideFooter
          >
            <Text>
              {
                "This token couldn't reach the price goal. All remaining liquidity will be sent to the streamer. Better luck next time!"
              }
            </Text>
            <Flex justifyContent={"space-evenly"} gap="5px" my="15px" p={4}>
              <Button
                onClick={() => {
                  handleIsFailedGameModalOpen(false);
                }}
              >
                Continue
              </Button>
            </Flex>
          </TransactionModalTemplate>
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
