import { useMemo } from "react";
import { useVersusTempTokenContext } from "../../../hooks/context/useVersusTempToken";
import { formatUnits, isAddressEqual } from "viem";
import { useTradeTempTokenState } from "../../../hooks/internal/temp-token/write/useTradeTempTokenState";
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
import { truncateValue } from "../../../utils/tokenDisplayFormatting";
import { formatIncompleteNumber } from "../../../utils/validation/input";

export const VersusTokenExchange = () => {
  const { gameState, tokenA, tokenB } = useVersusTempTokenContext();

  const { focusedTokenToTrade } = gameState;

  const focusedTokenData = useMemo(() => {
    if (!focusedTokenToTrade) {
      return {
        tokenAddress: "",
        tokenSymbol: "",
        tokenTxs: [],
        userBalance: BigInt(0),
      };
    }
    if (
      isAddressEqual(
        focusedTokenToTrade?.address as `0x${string}`,
        tokenA.address as `0x${string}`
      )
    ) {
      return {
        tokenAddress: tokenA.address,
        tokenSymbol: tokenA.symbol,
        tokenTxs: tokenA.tempTokenTxs,
        userBalance: tokenA.userTempTokenBalance,
      };
    } else if (
      isAddressEqual(
        focusedTokenToTrade?.address as `0x${string}`,
        tokenB.address as `0x${string}`
      )
    ) {
      return {
        tokenAddress: tokenB.address,
        tokenSymbol: tokenB.symbol,
        tokenTxs: tokenB.tempTokenTxs,
        userBalance: tokenB.userTempTokenBalance,
      };
    } else {
      return {
        tokenAddress: "",
        tokenSymbol: "",
        tokenTxs: [],
        userBalance: BigInt(0),
      };
    }
  }, [focusedTokenToTrade]);

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
  });

  return (
    <Flex direction="column" justifyContent={"center"} gap="10px">
      <Flex position="relative" gap="5px" alignItems={"center"}>
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
            mx="auto"
            p="1"
            fontSize={"14px"}
          />
        </ChakraTooltip>
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
                handleAmountDirectly(focusedTokenData.userBalance.toString());
              }}
            >
              max
            </Button>
          </PopoverTrigger>
          <PopoverContent bg="#6c3daf" border="none" width="100%" p="2px">
            <PopoverArrow bg="#6c3daf" />
            <Text fontSize="12px" textAlign={"center"}>
              click to show max temp tokens u currently own
            </Text>
          </PopoverContent>
        </Popover>
      </Flex>
      <Flex gap="2px" justifyContent={"center"} direction="column">
        <Button
          color="white"
          _focus={{}}
          _hover={{}}
          _active={{}}
          bg="#46a800"
          isDisabled={
            !mint ||
            mintCostAfterFeesLoading ||
            Number(formatIncompleteNumber(amount)) <= 0
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
          bg="#fe2815"
          isDisabled={
            !burn ||
            burnProceedsAfterFeesLoading ||
            Number(formatIncompleteNumber(amount)) <= 0
          }
          onClick={burn}
          p={undefined}
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
    </Flex>
  );
};
