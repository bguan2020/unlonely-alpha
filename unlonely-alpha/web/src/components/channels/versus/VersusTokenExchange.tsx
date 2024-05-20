import { useEffect, useMemo, useState } from "react";
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
  Spinner,
} from "@chakra-ui/react";
import { formatUnits, isAddress, isAddressEqual } from "viem";

import { useVersusTempTokenContext } from "../../../hooks/context/useVersusTempToken";
import { useTradeTempTokenState } from "../../../hooks/internal/temp-token/write/useTradeTempTokenState";
import { truncateValue } from "../../../utils/tokenDisplayFormatting";
import { formatIncompleteNumber } from "../../../utils/validation/input";
import {
  PRESALE_NOTIFICATION_URL_QUERY_PARAM,
  PRE_SALE_MAX_MINT_AMOUNT,
} from "../../../constants";
import { useRouter } from "next/router";
import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";

export const VersusTokenExchange = () => {
  const { gameState, tokenATxs, tokenBTxs, loadingOnMount } =
    useVersusTempTokenContext();

  const { focusedTokenToTrade, tokenA, tokenB, isPreSaleOngoing } = gameState;

  const [claimedPreSaleTokensA, setClaimedPreSaleTokensA] =
    useState<boolean>(false);
  const [claimedPreSaleTokensB, setClaimedPreSaleTokensB] =
    useState<boolean>(false);
  const router = useRouter();
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
  const [presaleWelcomeModalOpen, setPresaleWelcomeModalOpen] = useState(false);

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
        cannotClose={loadingOnMount}
        hideFooter
      >
        {loadingOnMount ? (
          <Flex justifyContent="center">
            <Spinner />
          </Flex>
        ) : isPreSaleOngoing ? (
          <Flex direction="column" gap="10px">
            <Text fontSize="25px" textAlign={"center"}>
              hurray!
            </Text>
            <Text>
              you made it here early enough to claim 1000 tokens. select a token
              to redeem and make sure your wallet is connected before time runs
              out
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
      <Flex
        position="relative"
        gap="5px"
        alignItems={"center"}
        mx="auto"
        opacity={isPreSaleOngoing ? 0 : 1}
      >
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
                        : isFocusedTokenEqualToTokenA
                        ? tokenATxs.userTempTokenBalance.toString()
                        : isFocusedTokenEqualToTokenB
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
            isFocusedTokenEqualToTokenA
              ? "rgba(255, 36, 36, 1)"
              : isFocusedTokenEqualToTokenB
              ? "rgba(42, 217, 255, 1)"
              : "#ffffff"
          }
          isDisabled={
            (isPreSaleOngoing &&
              claimedPreSaleTokensA &&
              isFocusedTokenEqualToTokenA) ||
            (isPreSaleOngoing &&
              claimedPreSaleTokensB &&
              isFocusedTokenEqualToTokenB) ||
            !mint ||
            mintCostAfterFeesLoading ||
            Number(formatIncompleteNumber(amount)) <= 0 ||
            focusedTokenData.tokenAddress === ""
          }
          onClick={async () => {
            await mint?.().then(() => {
              if (isPreSaleOngoing) {
                if (isFocusedTokenEqualToTokenA) {
                  setClaimedPreSaleTokensA(true);
                } else if (isFocusedTokenEqualToTokenB) {
                  setClaimedPreSaleTokensB(true);
                }
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
          ) : (!claimedPreSaleTokensA && isFocusedTokenEqualToTokenA) ||
            (!claimedPreSaleTokensB && isFocusedTokenEqualToTokenB) ? (
            <Flex direction="column">
              <Text>CLAIM</Text>
              <Text fontSize={"12px"} noOfLines={1} color="#eeeeee">
                {`(${truncateValue(
                  formatUnits(mintCostAfterFees, 18),
                  4
                )} ETH)`}
              </Text>
            </Flex>
          ) : (
            <Text>CLAIMED</Text>
          )}
        </Button>
        <Button
          color="white"
          _focus={{}}
          _hover={{}}
          _active={{}}
          opacity={isPreSaleOngoing ? 0 : 1}
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
