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
  Spinner,
} from "@chakra-ui/react";
import { formatUnits } from "viem";

import { useTradeTempTokenState } from "../../../hooks/internal/temp-token/write/useTradeTempTokenState";
import { truncateValue } from "../../../utils/tokenDisplayFormatting";
import { formatIncompleteNumber } from "../../../utils/validation/input";
import { useTempTokenContext } from "../../../hooks/context/useTempToken";
import {
  PRESALE_NOTIFICATION_URL_QUERY_PARAM,
  DEFAULT_TOKEN_TRADE_AMOUNT,
} from "../../../constants";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";

export const TempTokenExchange = () => {
  const { tempToken } = useTempTokenContext();
  const {
    userTempTokenBalance,
    gameState,
    tempTokenTxs,
    loadingCurrentOnMount,
  } = tempToken;
  const {
    isPreSaleOngoing,
    currentActiveTokenAddress,
    currentActiveTokenSymbol,
  } = gameState;
  const router = useRouter();

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

  const [claimedPreSaleTokens, setClaimedPreSaleTokens] =
    useState<boolean>(false);
  const [presaleWelcomeModalOpen, setPresaleWelcomeModalOpen] = useState(false);

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

  return (
    <Flex direction="column" justifyContent={"center"} gap="10px">
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
              you made it here early enough to claim 1000 tokens. make sure your
              wallet is connected before time runs out
            </Text>
          </Flex>
        ) : (
          <Flex direction="column" gap="10px">
            <Text fontSize="25px" textAlign={"center"}>
              too late, but...
            </Text>
            <Text>you can still join this game!</Text>
            <Text>
              come early next time a token launches to claim your tokens!
            </Text>
          </Flex>
        )}
      </TransactionModalTemplate>
      <Flex
        position="relative"
        gap="5px"
        alignItems={"center"}
        opacity={isPreSaleOngoing ? 0 : 1}
      >
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
                    ? String(DEFAULT_TOKEN_TRADE_AMOUNT)
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
          bg={isPreSaleOngoing ? "#00a862" : "#46a800"}
          isDisabled={
            (isPreSaleOngoing && claimedPreSaleTokens) ||
            !mint ||
            mintCostAfterFeesLoading ||
            Number(formatIncompleteNumber(amount)) <= 0
          }
          onClick={async () => {
            await mint?.().then(() => {
              if (isPreSaleOngoing) {
                setClaimedPreSaleTokens(true);
              }
            });
          }}
          p={"0px"}
          w="100%"
        >
          {!isPreSaleOngoing ? (
            <Flex direction="column">
              <Text>BUY</Text>
              <Text fontSize={"12px"} noOfLines={1} color="#eeeeee">
                {`(${truncateValue(
                  formatUnits(mintCostAfterFees, 18),
                  4
                )} ETH)`}
              </Text>
            </Flex>
          ) : claimedPreSaleTokens ? (
            <Text>CLAIMED</Text>
          ) : (
            <Flex direction="column">
              <Text>CLAIM</Text>
              <Text fontSize={"12px"} noOfLines={1} color="#eeeeee">
                {`(${truncateValue(
                  formatUnits(mintCostAfterFees, 18),
                  4
                )} ETH)`}
              </Text>
            </Flex>
          )}
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
          opacity={isPreSaleOngoing ? 0 : 1}
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
