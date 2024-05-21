import { useState, useMemo } from "react";
import { formatUnits, isAddress, isAddressEqual } from "viem";
import { useVersusTempTokenContext } from "../../../hooks/context/useVersusTempToken";
import { useTradeTempTokenState } from "../../../hooks/internal/temp-token/write/useTradeTempTokenState";
import { Button, Flex, Input, Text } from "@chakra-ui/react";
import { useTempTokenTimerState } from "../../../hooks/internal/temp-token/ui/useTempTokenTimerState";
import { getTimeFromMillis } from "../../../utils/time";
import { truncateValue } from "../../../utils/tokenDisplayFormatting";
import { formatIncompleteNumber } from "../../../utils/validation/input";
import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";

export const MobileVersusTokenExchange = () => {
  const { gameState, tokenATxs, tokenBTxs } = useVersusTempTokenContext();

  const {
    focusedTokenToTrade,
    tokenA,
    tokenB,
    isPreSaleOngoing,
    ownerMustMakeWinningTokenTradeable,
    handleCanPlayToken,
    handleIsPreSaleOngoing,
    handleIsGameFinished,
  } = gameState;

  const [claimedPreSaleTokens, setClaimedPreSaleTokens] =
    useState<boolean>(false);
  const [claimedModalOpen, setClaimedModalOpen] = useState<boolean>(false);

  const isFocusedTokenEqualToTokenA = useMemo(() => {
    return (
      focusedTokenToTrade &&
      isAddress(tokenA.address) &&
      isAddress(focusedTokenToTrade?.address as `0x${string}`) &&
      isAddressEqual(
        focusedTokenToTrade?.address as `0x${string}`,
        tokenA.address as `0x${string}`
      )
    );
  }, [focusedTokenToTrade, tokenA]);

  const isFocusedTokenEqualToTokenB = useMemo(() => {
    return (
      focusedTokenToTrade &&
      isAddress(tokenB.address) &&
      isAddress(focusedTokenToTrade?.address as `0x${string}`) &&
      isAddressEqual(
        focusedTokenToTrade?.address as `0x${string}`,
        tokenB.address as `0x${string}`
      )
    );
  }, [focusedTokenToTrade, tokenB]);

  const focusedTokenData = useMemo(() => {
    if (
      !focusedTokenToTrade ||
      !focusedTokenToTrade?.address ||
      !isAddress(tokenA.address) ||
      !isAddress(tokenB.address)
    ) {
      return {
        tokenAddress: "",
        tokenSymbol: "",
        tokenTxs: [],
        userBalance: BigInt(0),
      };
    }
    if (isFocusedTokenEqualToTokenA) {
      return {
        tokenAddress: tokenA.address,
        tokenSymbol: tokenA.symbol,
        tokenTxs: tokenATxs.tempTokenTxs,
        userBalance: tokenATxs.userTempTokenBalance,
      };
    } else if (isFocusedTokenEqualToTokenB) {
      return {
        tokenAddress: tokenB.address,
        tokenSymbol: tokenB.symbol,
        tokenTxs: tokenBTxs.tempTokenTxs,
        userBalance: tokenBTxs.userTempTokenBalance,
      };
    } else {
      return {
        tokenAddress: "",
        tokenSymbol: "",
        tokenTxs: [],
        userBalance: BigInt(0),
      };
    }
  }, [
    isFocusedTokenEqualToTokenA,
    isFocusedTokenEqualToTokenB,
    tokenA,
    tokenB,
    tokenATxs,
    tokenBTxs,
  ]);

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
    tokenAddress: focusedTokenData.tokenAddress,
    tokenSymbol: focusedTokenData.tokenSymbol,
    tokenTxs: focusedTokenData.tokenTxs,
    isPreSaleOngoing,
  });

  const { durationLeftForPreSale } = useTempTokenTimerState({
    tokenEndTimestamp: tokenA.endTimestamp,
    preSaleEndTimestamp: tokenA.preSaleEndTimestamp,
    callbackOnExpiration: () => {
      handleCanPlayToken(false);
      handleIsGameFinished(true);
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
      {!focusedTokenToTrade ? (
        <>
          {!ownerMustMakeWinningTokenTradeable && (
            <Text>{`Select a token above to ${
              isPreSaleOngoing ? "claim" : "buy"
            }`}</Text>
          )}
        </>
      ) : isPreSaleOngoing ? (
        <>
          {!claimedPreSaleTokens ? (
            <>
              <Flex>
                {getTimeFromMillis(durationLeftForPreSale * 1000, true, true)}{" "}
                left to claim free tokens
              </Flex>
              <Button
                _hover={{}}
                _focus={{}}
                _active={{}}
                bg={
                  isFocusedTokenEqualToTokenA
                    ? "rgba(255, 36, 36, 1)"
                    : isFocusedTokenEqualToTokenB
                    ? "rgba(42, 217, 255, 1)"
                    : "#ffffff"
                }
                isDisabled={
                  !mint ||
                  mintCostAfterFeesLoading ||
                  focusedTokenData.tokenAddress === ""
                }
                onClick={async () => {
                  await mint?.().then(() => {
                    if (isPreSaleOngoing) {
                      setClaimedPreSaleTokens(true);
                      setClaimedModalOpen(true);
                    }
                  });
                }}
                w="100%"
              >
                Claim
              </Button>
            </>
          ) : (
            <>
              <Flex>You have already claimed your free tokens</Flex>
              <Button
                isDisabled
                w="100%"
                _hover={{}}
                _focus={{}}
                _active={{}}
                bg={
                  isFocusedTokenEqualToTokenA
                    ? "rgba(255, 36, 36, 1)"
                    : isFocusedTokenEqualToTokenB
                    ? "rgba(42, 217, 255, 1)"
                    : "#ffffff"
                }
              >
                Claimed!
              </Button>
            </>
          )}
        </>
      ) : (
        <>
          <Flex>
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
                {isFocusedTokenEqualToTokenA
                  ? `$${tokenA.symbol} `
                  : isFocusedTokenEqualToTokenB
                  ? `$${tokenB.symbol} `
                  : ""}
                balance:{" "}
                {isFocusedTokenEqualToTokenA
                  ? truncateValue(tokenATxs.userTempTokenBalance.toString())
                  : isFocusedTokenEqualToTokenB
                  ? truncateValue(tokenBTxs.userTempTokenBalance.toString())
                  : "0"}
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
                handleAmountDirectly(
                  isFocusedTokenEqualToTokenA
                    ? tokenATxs.userTempTokenBalance.toString()
                    : isFocusedTokenEqualToTokenB
                    ? tokenBTxs.userTempTokenBalance.toString()
                    : "0"
                );
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
              bg={
                isFocusedTokenEqualToTokenA
                  ? "rgba(255, 36, 36, 1)"
                  : isFocusedTokenEqualToTokenB
                  ? "rgba(42, 217, 255, 1)"
                  : "#ffffff"
              }
              isDisabled={
                !mint ||
                mintCostAfterFeesLoading ||
                Number(formatIncompleteNumber(amount)) <= 0 ||
                focusedTokenData.tokenAddress === ""
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
              bg={
                isFocusedTokenEqualToTokenA
                  ? "rgba(75, 0, 1, 1)"
                  : isFocusedTokenEqualToTokenB
                  ? "rgba(66, 101, 136, 1)"
                  : "#ffffff"
              }
              isDisabled={
                !burn ||
                burnProceedsAfterFeesLoading ||
                Number(formatIncompleteNumber(amount)) <= 0 ||
                focusedTokenData.tokenAddress === ""
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
