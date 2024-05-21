import { AblyChannelPromise, NULL_ADDRESS } from "../../../../constants";
import { Flex, Text, Spinner, Button } from "@chakra-ui/react";
import { useTempTokenContext } from "../../../../hooks/context/useTempToken";
import { TransactionModalTemplate } from "../../../transactions/TransactionModalTemplate";

// todo: refine this
export const MobileTempTokenInterface = ({
  ablyChannel,
  customHeight,
}: {
  ablyChannel: AblyChannelPromise;
  customHeight?: string;
}) => {
  const { tempToken } = useTempTokenContext();
  const {
    gameState,
    tempTokenChartTimeIndexes,
    initialTempTokenLoading,
    tempTokenTxs,
    currentTempTokenContract,
    lastInactiveTempTokenContract,
    onSendRemainingFundsToWinnerEvent,
  } = tempToken;
  const {
    currentActiveTokenEndTimestamp,
    currentActiveTokenAddress,
    currentActiveTokenSymbol,
    currentActiveTokenTotalSupplyThreshold,
    canPlayToken,
    isFailedGameState,
    isSuccessGameModalOpen,
    isFailedGameModalOpen,
    isPermanentGameModalOpen,
    lastInactiveTokenAddress,
    lastInactiveTokenBalance,
    lastInactiveTokenSymbol,
    handleIsGameFailed,
    handleIsFailedGameModalOpen,
    handleIsSuccessGameModalOpen,
    handleIsPermanentGameModalOpen,
    handleCanPlayToken,
  } = gameState;

  return (
    <>
      {currentActiveTokenAddress === NULL_ADDRESS ? (
        <Flex
          direction="column"
          alignItems="center"
          width="100%"
          gap="5px"
          justifyContent={"center"}
        >
          <Text>No active token detected for this channel yet</Text>
        </Flex>
      ) : initialTempTokenLoading &&
        currentActiveTokenAddress !== NULL_ADDRESS ? (
        <Flex
          direction="column"
          alignItems="center"
          width="100%"
          gap="5px"
          justifyContent={"center"}
        >
          <Text>loading Temp Token chart</Text>
          <Spinner size="md" />
        </Flex>
      ) : (
        <Flex
          direction={"column"}
          justifyContent={"space-between"}
          width="100%"
          gap={"5px"}
          h={customHeight ?? "100%"}
          p="10px"
        >
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
          <Flex gap="10px" flex="1" h="100%" direction="column"></Flex>
        </Flex>
      )}
    </>
  );
};
