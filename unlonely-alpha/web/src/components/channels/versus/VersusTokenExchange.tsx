import { useMemo } from "react";
import {
  Flex,
  Input,
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
  Tooltip as ChakraTooltip,
  Text,
  PopoverArrow,
} from "@chakra-ui/react";
import { formatUnits, isAddress, isAddressEqual } from "viem";

import { useVersusTempTokenContext } from "../../../hooks/context/useVersusTempToken";
import { useTradeTempTokenState } from "../../../hooks/internal/temp-token/write/useTradeTempTokenState";
import { truncateValue } from "../../../utils/tokenDisplayFormatting";
import { formatIncompleteNumber } from "../../../utils/validation/input";
import { PRE_SALE_MAX_MINT_AMOUNT } from "../../../constants";

export const VersusTokenExchange = () => {
  const { gameState, tokenATxs, tokenBTxs } = useVersusTempTokenContext();

  const { focusedTokenToTrade, tokenA, tokenB, isPreSaleOngoing } = gameState;

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
    if (
      isAddress(tokenA.address) &&
      isAddress(focusedTokenToTrade?.address) &&
      isAddressEqual(
        focusedTokenToTrade?.address as `0x${string}`,
        tokenA.address as `0x${string}`
      )
    ) {
      return {
        tokenAddress: tokenA.address,
        tokenSymbol: tokenA.symbol,
        tokenTxs: tokenATxs.tempTokenTxs,
        userBalance: tokenATxs.userTempTokenBalance,
      };
    } else if (
      isAddress(tokenB.address) &&
      isAddress(focusedTokenToTrade?.address) &&
      isAddressEqual(
        focusedTokenToTrade?.address as `0x${string}`,
        tokenB.address as `0x${string}`
      )
    ) {
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
  }, [focusedTokenToTrade, tokenA, tokenB, tokenATxs, tokenBTxs]);

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

  return (
    <Flex direction="column" justifyContent={"center"} gap="10px">
      <Flex position="relative" gap="5px" alignItems={"center"} mx="auto">
        <Flex h="40px">
          {focusedTokenToTrade?.address &&
          isAddress(focusedTokenToTrade?.address) ? (
            <ChakraTooltip
              label={errorMessage}
              placement="bottom-start"
              isOpen={errorMessage !== undefined}
              bg="red.600"
            >
              <Input
                variant={errorMessage.length > 0 ? "redGlow" : "glow"}
                textAlign="center"
                value={amount}
                onChange={handleAmount}
                p="1"
                fontSize={"14px"}
              />
            </ChakraTooltip>
          ) : (
            <Text>Select a token above to trade</Text>
          )}
        </Flex>
        {focusedTokenToTrade?.address &&
          isAddress(focusedTokenToTrade?.address) && (
            <Popover trigger="hover" placement="top" openDelay={500}>
              <PopoverTrigger>
                <Button
                  bg={"#403c7d"}
                  color="white"
                  p={2}
                  height={"20px"}
                  _focus={{}}
                  _active={{}}
                  _hover={{
                    bg: "#8884d8",
                  }}
                  onClick={() => {
                    handleAmountDirectly(
                      isPreSaleOngoing
                        ? String(PRE_SALE_MAX_MINT_AMOUNT)
                        : isAddress(tokenA.address) &&
                          isAddressEqual(
                            focusedTokenToTrade?.address as `0x${string}`,
                            tokenA.address as `0x${string}`
                          )
                        ? tokenATxs.userTempTokenBalance.toString()
                        : isAddress(tokenB.address) &&
                          isAddressEqual(
                            focusedTokenToTrade?.address as `0x${string}`,
                            tokenB.address as `0x${string}`
                          )
                        ? tokenBTxs.userTempTokenBalance.toString()
                        : "0"
                    );
                  }}
                >
                  max
                </Button>
              </PopoverTrigger>
              <PopoverContent bg="#6c3daf" border="none" width="100%" p="2px">
                <PopoverArrow bg="#6c3daf" />
                <Text fontSize="12px" textAlign={"center"}>
                  {isPreSaleOngoing
                    ? "click to claim 1000 tokens"
                    : "click to show max temp tokens u currently own"}
                </Text>
              </PopoverContent>
            </Popover>
          )}
      </Flex>
      <Flex gap="2px" justifyContent={"center"} direction="column" mx="auto">
        <Button
          color="white"
          _focus={{}}
          _hover={{}}
          _active={{}}
          bg={
            focusedTokenToTrade?.address &&
            isAddress(tokenA.address) &&
            isAddress(focusedTokenToTrade?.address) &&
            isAddressEqual(
              focusedTokenToTrade?.address as `0x${string}`,
              tokenA.address as `0x${string}`
            )
              ? "rgba(255, 36, 36, 1)"
              : focusedTokenToTrade?.address &&
                isAddress(tokenB.address) &&
                isAddress(focusedTokenToTrade?.address) &&
                isAddressEqual(
                  focusedTokenToTrade?.address as `0x${string}`,
                  tokenB.address as `0x${string}`
                )
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
          p={"0px"}
          w="100%"
        >
          <Flex direction="column">
            <Text>BUY</Text>
            <Text fontSize={"12px"} noOfLines={1} color="#eeeeee">
              {`(${truncateValue(formatUnits(mintCostAfterFees, 18), 4)} ETH)`}
            </Text>
          </Flex>
        </Button>
        <Button
          color="white"
          _focus={{}}
          _hover={{}}
          _active={{}}
          bg={
            focusedTokenToTrade?.address &&
            isAddress(tokenA.address) &&
            isAddress(focusedTokenToTrade?.address) &&
            isAddressEqual(
              focusedTokenToTrade?.address as `0x${string}`,
              tokenA.address as `0x${string}`
            )
              ? "rgba(75, 0, 1, 1)"
              : focusedTokenToTrade?.address &&
                isAddress(tokenB.address) &&
                isAddress(focusedTokenToTrade?.address) &&
                isAddressEqual(
                  focusedTokenToTrade?.address as `0x${string}`,
                  tokenB.address as `0x${string}`
                )
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
          p={undefined}
          w="100%"
        >
          <Flex direction="column">
            <Text>{"SELL"}</Text>
            <Text fontSize={"12px"} noOfLines={1} color="#eeeeee">
              {`(${truncateValue(
                formatUnits(burnProceedsAfterFees, 18),
                4
              )} ETH)`}
            </Text>
          </Flex>
        </Button>
      </Flex>
    </Flex>
  );
};
