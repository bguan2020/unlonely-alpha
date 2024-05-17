import {
  Flex,
  Text,
  Button,
  Tooltip as ChakraTooltip,
  Input,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import { formatUnits } from "viem";

import { useTradeTempTokenState } from "../../../hooks/internal/temp-token/write/useTradeTempTokenState";
import { truncateValue } from "../../../utils/tokenDisplayFormatting";
import { formatIncompleteNumber } from "../../../utils/validation/input";
import { useTempTokenContext } from "../../../hooks/context/useTempToken";
import { PRE_SALE_MAX_MINT_AMOUNT } from "../../../constants";

export const TempTokenExchange = () => {
  const { tempToken } = useTempTokenContext();
  const { userTempTokenBalance, gameState, tempTokenTxs } = tempToken;
  const {
    isPreSaleOngoing,
    currentActiveTokenAddress,
    currentActiveTokenSymbol,
  } = gameState;

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
                handleAmountDirectly(
                  isPreSaleOngoing
                    ? String(PRE_SALE_MAX_MINT_AMOUNT)
                    : userTempTokenBalance.toString()
                );
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
