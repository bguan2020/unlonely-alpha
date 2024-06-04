import { useState } from "react";
import { Button, Flex, Input, Text } from "@chakra-ui/react";
import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";
import { useTempTokenContext } from "../../../hooks/context/useTempToken";
import { formatUnits } from "viem";
import { useTempTokenTimerState } from "../../../hooks/internal/temp-token/ui/useTempTokenTimerState";
import { useTradeTempTokenState } from "../../../hooks/internal/temp-token/write/useTradeTempTokenState";
import { getTimeFromMillis } from "../../../utils/time";
import { truncateValue } from "../../../utils/tokenDisplayFormatting";
import { formatIncompleteNumber } from "../../../utils/validation/input";
import { useScreenAnimationsContext } from "../../../hooks/context/useScreenAnimations";

export const MobileTempTokenExchange = () => {
  const { tempToken } = useTempTokenContext();
  const { userTempTokenBalance, gameState, tempTokenTxs } = tempToken;
  const {
    isPreSaleOngoing,
    currentActiveTokenAddress,
    currentActiveTokenSymbol,
    currentActiveTokenEndTimestamp,
    currentActiveTokenPreSaleEndTimestamp,
    handleIsGameFailed,
    handleIsFailedGameModalOpen,
    handleCanPlayToken,
    handleIsPreSaleOngoing,
  } = gameState;
  const { fireworks } = useScreenAnimationsContext();

  const [claimedPreSaleTokens, setClaimedPreSaleTokens] =
    useState<boolean>(false);
  const [claimedModalOpen, setClaimedModalOpen] = useState<boolean>(false);

  const {
    amount,
    handleAmount,
    handleAmountDirectly,
    mint,
    burn,
    mintCostAfterFees,
    mintCostAfterFeesLoading,
    burnProceedsAfterFees,
    burnProceedsAfterFeesLoading,
    errorMessage,
  } = useTradeTempTokenState({
    tokenAddress: currentActiveTokenAddress,
    tokenSymbol: currentActiveTokenSymbol,
    tokenTxs: tempTokenTxs,
    isPreSaleOngoing,
    callbackOnMintTxSuccess: () => {
      if (isPreSaleOngoing) {
        setClaimedPreSaleTokens(true);
        setClaimedModalOpen(true);
        fireworks();
      }
    },
  });

  const { durationLeftForPreSale } = useTempTokenTimerState({
    tokenEndTimestamp: currentActiveTokenEndTimestamp,
    preSaleEndTimestamp: currentActiveTokenPreSaleEndTimestamp,
    callbackOnExpiration: () => {
      handleCanPlayToken(false);
      handleIsGameFailed(true);
      handleIsFailedGameModalOpen(true);
    },
    callbackonPresaleEnd: () => {
      handleIsPreSaleOngoing(false);
    },
  });

  return (
    <Flex direction="column" justifyContent={"center"} gap="10px">
      <TransactionModalTemplate
        isOpen={claimedModalOpen}
        handleClose={() => setClaimedModalOpen(false)}
        hideFooter
      >
        <Flex direction="column" gap="10px">
          <Text fontSize="25px" textAlign={"center"}>
            Tokens claimed!
          </Text>
          <Text>
            keep an eye on the stream to see if your tokens pump. liquidity from
            the losing token will go into pumping the winning token.
          </Text>
        </Flex>
      </TransactionModalTemplate>
      {isPreSaleOngoing && (
        <Text fontSize="13px" color="#8e8e8eff">
          {getTimeFromMillis(durationLeftForPreSale * 1000, true, true)} left to
          claim free tokens
        </Text>
      )}
      {isPreSaleOngoing ? (
        <>
          {!claimedPreSaleTokens ? (
            <>
              <Button
                _hover={{}}
                _focus={{}}
                _active={{}}
                bg={"#8fee00"}
                color="black"
                isDisabled={!mint || mintCostAfterFeesLoading}
                onClick={mint}
                w="100%"
              >
                <Text fontSize="20px">FREE MONEY</Text>
              </Button>
            </>
          ) : (
            <>
              <Flex>You have already claimed your free tokens</Flex>
              <Button
                color="white"
                isDisabled
                w="100%"
                _hover={{}}
                _focus={{}}
                _active={{}}
                bg={"#5f5c9c"}
              >
                Claimed!
              </Button>
            </>
          )}
        </>
      ) : (
        <>
          <Flex gap="5px">
            <Flex direction="column">
              <Input
                variant={errorMessage.length > 0 ? "redGlow" : "glow"}
                textAlign="center"
                value={amount}
                onChange={handleAmount}
                p="1"
                fontSize={"14px"}
              />
              <Text color="#929292">
                ${currentActiveTokenSymbol}
                balance: {truncateValue(userTempTokenBalance.toString())}
              </Text>
            </Flex>
            <Button
              bg={"#403c7d"}
              color="white"
              p={2}
              _focus={{}}
              _active={{}}
              _hover={{
                bg: "#8884d8",
              }}
              onClick={() => {
                handleAmountDirectly(userTempTokenBalance.toString());
              }}
            >
              max
            </Button>
          </Flex>
          <Flex gap="2px" justifyContent={"space-evenly"}>
            <Button
              color="white"
              _focus={{}}
              _hover={{}}
              _active={{}}
              bg={"#00aa63"}
              isDisabled={
                !mint ||
                mintCostAfterFeesLoading ||
                Number(formatIncompleteNumber(amount)) <= 0
              }
              onClick={mint}
              w="100%"
            >
              <Flex direction="column">
                <Text>BUY</Text>
                <Text fontSize={"12px"} noOfLines={1} color="#eeeeee">
                  {`(${truncateValue(
                    formatUnits(mintCostAfterFees, 18),
                    4
                  )} ETH)`}
                </Text>
              </Flex>
            </Button>
            <Button
              color="white"
              _focus={{}}
              _hover={{}}
              _active={{}}
              bg={"rgba(255, 36, 36, 1)"}
              isDisabled={
                !burn ||
                burnProceedsAfterFeesLoading ||
                Number(formatIncompleteNumber(amount)) <= 0
              }
              onClick={burn}
              w="100%"
            >
              <Flex direction="column">
                <Text>SELL</Text>
                <Text fontSize={"12px"} noOfLines={1} color="#eeeeee">
                  {`(${truncateValue(
                    formatUnits(burnProceedsAfterFees, 18),
                    4
                  )} ETH)`}
                </Text>
              </Flex>
            </Button>
          </Flex>
        </>
      )}
    </Flex>
  );
};
