import { useLazyQuery } from "@apollo/client";
import {
  Button,
  Flex,
  IconButton,
  Input,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { useState, useCallback } from "react";
import { GET_TEMP_TOKENS_QUERY } from "../../constants/queries";
import { GetTempTokensQuery, TempToken } from "../../generated/graphql";
import { getTimeFromMillis } from "../../utils/time";
import { usePublicClient } from "wagmi";
import TempTokenV1Abi from "../../constants/abi/TempTokenV1.json";
import useUpdateTempTokenHasHitTotalSupplyThreshold from "../../hooks/server/temp-token/useUpdateTempTokenHasHitTotalSupplyThreshold";
import useUpdateTempTokenHighestTotalSupply from "../../hooks/server/temp-token/useUpdateTempTokenHighestTotalSupply";
import { useUpdateTotalSupplyThresholdState } from "../../hooks/internal/temp-token/useUpdateTotalSupplyThresholdState";
import { useNetworkContext } from "../../hooks/context/useNetwork";
import { useUpdateTempTokenIsAlwaysTradeableState } from "../../hooks/internal/temp-token/useUpdateTempTokenIsAlwaysTradeableState";
import { useUpdateEndTimestampForTokensState } from "../../hooks/internal/temp-token/useUpdateEndTimestampForTokensState";
import centerEllipses from "../../utils/centerEllipses";
import copy from "copy-to-clipboard";
import { FaRegCopy } from "react-icons/fa";
// import { verifyTempTokenV1OnBase } from "../../utils/contract-verification/tempToken";

type DetailedTempToken = TempToken & {
  totalSupplyThreshold: bigint;
};

export const TempTokenAdmin = () => {
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const publicClient = usePublicClient();
  const toast = useToast();
  const [getTempTokensQuery, { loading: getTempTokensLoading }] =
    useLazyQuery<GetTempTokensQuery>(GET_TEMP_TOKENS_QUERY, {
      fetchPolicy: "network-only",
    });

  const [activeTokens, setActiveTokens] = useState<
    DetailedTempToken[] | undefined
  >(undefined);
  const [
    tokenAddressesIncludedForOperation,
    setTokenAddressesIncludedForOperation,
  ] = useState<string[]>([]);

  const [
    loading_updateDb_hasHitTotalSupplyThreshold,
    set_loading_updateDb_hasHitTotalSupplyThreshold,
  ] = useState(false);

  const [
    loading_updateDb_highestTotalSupply,
    set_loading_updateDb_highestTotalSupply,
  ] = useState(false);

  /**
   * Fetch active tokens
   */

  const handleGetTempTokens = useCallback(async () => {
    try {
      const res = await getTempTokensQuery({
        variables: {
          data: {
            onlyActiveTokens: true,
            isAlwaysTradeable: true,
            fulfillAllNotAnyConditions: false,
          },
        },
      });
      const tokens = res.data?.getTempTokens;
      if (!tokens) return;
      const nonNullTokens = tokens.filter(
        (token): token is TempToken => token !== null
      );
      const chainPromises = nonNullTokens.map((a) => {
        return publicClient.readContract({
          address: a.tokenAddress as `0x${string}`,
          abi: TempTokenV1Abi,
          functionName: "totalSupplyThreshold",
        });
      });
      const results = await Promise.all(chainPromises);
      const newNonNullTokens: DetailedTempToken[] = nonNullTokens.map(
        (token, index) => {
          return {
            ...token,
            totalSupplyThreshold: results[index] as unknown as bigint,
          };
        }
      );
      setActiveTokens(newNonNullTokens);
      setTokenAddressesIncludedForOperation(
        nonNullTokens.map((token) => token.tokenAddress)
      );
    } catch (e) {
      console.error(e);
    }
  }, []);

  /**
   * Backend update function hooks
   */
  const {
    updateTempTokenHasHitTotalSupplyThreshold:
      call_updateDb_hasHitTotalSupplyThreshold,
  } = useUpdateTempTokenHasHitTotalSupplyThreshold({
    onError: (e) => {
      console.log("useUpdateTempTokenHasHitTotalSupplyThreshold error", e);
    },
  });

  const {
    updateTempTokenHighestTotalSupply: call_updateDb_highestTotalSupply,
  } = useUpdateTempTokenHighestTotalSupply({
    onError: (e) => {
      console.log("useUpdateTempTokenHighestTotalSupply error", e);
    },
  });

  /**
   * Contract / backend function hooks
   */

  const {
    newSupplyThreshold,
    handleInputChange: handleNewSupplyThresholdChange,
    setTotalSupplyThresholdForTokens:
      call_updateOnchainAndUpdateDb_totalSupplyThreshold,
    loading: loading_updateOnchainAndUpdateDb_totalSupplyThreshold,
  } = useUpdateTotalSupplyThresholdState(
    tokenAddressesIncludedForOperation,
    handleGetTempTokens
  );

  const {
    setAlwaysTradeableForTokens: call_updateOnchainAndUpdateDb_alwaysTradeable,
    loading: loading_updateOnchainAndUpdateDb_alwaysTradeable,
  } = useUpdateTempTokenIsAlwaysTradeableState(
    tokenAddressesIncludedForOperation,
    handleGetTempTokens
  );

  const {
    additionalSeconds,
    handleInputChange: handleAdditionalSecondsChange,
    increaseEndTimestampForTokens,
    loading: isIncreaseEndTimestampForTokensLoading,
  } = useUpdateEndTimestampForTokensState(
    tokenAddressesIncludedForOperation,
    handleGetTempTokens
  );

  /**
   * Read from contract and update database
   */
  const handleTempTokenHasHitTotalSupplyThreshold = useCallback(async () => {
    set_loading_updateDb_hasHitTotalSupplyThreshold(true);
    const chainPromises = tokenAddressesIncludedForOperation.map((a) => {
      return publicClient.readContract({
        address: a as `0x${string}`,
        abi: TempTokenV1Abi,
        functionName: "hasHitTotalSupplyThreshold",
      });
    });
    const results = await Promise.all(chainPromises);
    const tokenAddressesSetTrue: string[] = [];
    const tokenAddressesSetFalse: string[] = [];
    (results as unknown as boolean[]).forEach((result, index) => {
      if (result) {
        tokenAddressesSetTrue.push(tokenAddressesIncludedForOperation[index]);
      } else {
        tokenAddressesSetFalse.push(tokenAddressesIncludedForOperation[index]);
      }
    });
    console.log("handleTempTokenHasHitTotalSupplyThreshold results", results);
    await call_updateDb_hasHitTotalSupplyThreshold({
      tokenAddressesSetTrue,
      tokenAddressesSetFalse,
      chainId: localNetwork.config.chainId,
    });
    await handleGetTempTokens();
    set_loading_updateDb_hasHitTotalSupplyThreshold(false);
  }, [tokenAddressesIncludedForOperation, publicClient]);

  const handleTempTokenHighestTotalSupply = useCallback(async () => {
    set_loading_updateDb_highestTotalSupply(true);
    const chainPromises = tokenAddressesIncludedForOperation.map((a) => {
      return publicClient.readContract({
        address: a as `0x${string}`,
        abi: TempTokenV1Abi,
        functionName: "highestTotalSupply",
      });
    });
    const results = await Promise.all(chainPromises);
    console.log("handleTempTokenHighestTotalSupply results", results);
    await call_updateDb_highestTotalSupply({
      tokenAddresses: tokenAddressesIncludedForOperation,
      newTotalSupplies: results.map((r) => String(r)),
      chainId: localNetwork.config.chainId,
    });
    await handleGetTempTokens();
    set_loading_updateDb_highestTotalSupply(false);
  }, [tokenAddressesIncludedForOperation, publicClient]);

  const handleCopy = () => {
    toast({
      title: "copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  console.log(activeTokens);

  return (
    <>
      <Text
        fontSize="35px"
        fontFamily="Neue Pixel Sans"
        textDecoration={"underline"}
      >
        TempToken functions
      </Text>
      {/* <Button onClick={() => verifyTempTokenV1OnBase()}>test verify</Button> */}
      <Button
        color="white"
        bg="#2562db"
        _hover={{}}
        _focus={{}}
        _active={{}}
        onClick={handleGetTempTokens}
        isDisabled={getTempTokensLoading}
      >
        {getTempTokensLoading ? <Spinner /> : "fetch active tokens"}
      </Button>
      {activeTokens === undefined ? (
        <Text>Please fetch tokens first</Text>
      ) : activeTokens.length > 0 ? (
        <>
          <Text>Total: {activeTokens.length}</Text>
          <TableContainer>
            <Table>
              <Thead>
                <Tr>
                  <Th>symbol</Th>
                  <Th>tokenAddress</Th>
                  <Th>channelId</Th>
                  <Th>endTimestamp</Th>
                  <Th>highestTotalSupply</Th>
                  <Th>alwaysTradeable</Th>
                  <Th>SupplyThreshold</Th>
                  <Th>hasHitSupplyThreshold</Th>
                  <Th>hasRemainingFunds</Th>
                  <Th>include?</Th>
                </Tr>
              </Thead>
              <Tbody>
                {activeTokens.map((token, index) => (
                  <Tr
                    key={index}
                    bgColor={
                      tokenAddressesIncludedForOperation.includes(
                        token.tokenAddress
                      )
                        ? "unset"
                        : "#802b1c"
                    }
                  >
                    <Td>{token.symbol}</Td>
                    <Td>
                      {centerEllipses(token.tokenAddress, 15)}{" "}
                      <IconButton
                        aria-label={`copy-${token.tokenAddress}`}
                        color="white"
                        icon={<FaRegCopy />}
                        height="20px"
                        minWidth={"20px"}
                        bg="transparent"
                        _focus={{}}
                        _active={{}}
                        _hover={{}}
                        onClick={() => {
                          copy(token.tokenAddress);
                          handleCopy();
                        }}
                      />
                    </Td>
                    <Td>{token.channelId}</Td>
                    <Td>
                      {getTimeFromMillis(
                        (Number(token.endUnixTimestamp) -
                          Math.floor(Date.now() / 1000)) *
                          1000,
                        true,
                        true
                      )}
                    </Td>
                    <Td>{token.highestTotalSupply}</Td>
                    <Td>{token.isAlwaysTradeable ? "✅" : "❌"}</Td>
                    <Td>{String(token.totalSupplyThreshold)}</Td>
                    <Td>{token.hasHitTotalSupplyThreshold ? "✅" : "❌"}</Td>
                    <Td>{token.hasRemainingFundsForCreator ? "✅" : "❌"}</Td>
                    <Td>
                      <Button
                        color="white"
                        bg="#2562db"
                        _hover={{}}
                        _focus={{}}
                        _active={{}}
                        onClick={() => {
                          if (
                            !tokenAddressesIncludedForOperation.includes(
                              token.tokenAddress
                            )
                          ) {
                            setTokenAddressesIncludedForOperation([
                              ...tokenAddressesIncludedForOperation,
                              token.tokenAddress,
                            ]);
                          } else {
                            setTokenAddressesIncludedForOperation(
                              tokenAddressesIncludedForOperation.filter(
                                (t) => t !== token.tokenAddress
                              )
                            );
                          }
                        }}
                      >
                        {tokenAddressesIncludedForOperation.includes(
                          token.tokenAddress
                        )
                          ? "✅"
                          : "❌"}
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <Text>No active tokens</Text>
      )}
      <Text fontSize="25px" fontFamily="Neue Pixel Sans">
        updateTempTokenHasHitTotalSupplyThreshold (select tokens from database,
        fetch from onchain, and update tokens on database)
      </Text>
      <Button
        onClick={handleTempTokenHasHitTotalSupplyThreshold}
        isDisabled={loading_updateDb_hasHitTotalSupplyThreshold}
      >
        {loading_updateDb_hasHitTotalSupplyThreshold ? (
          <Spinner />
        ) : (
          "fetch and update"
        )}
      </Button>
      <Text fontSize="25px" fontFamily="Neue Pixel Sans">
        updateTempTokenHighestTotalSupply (select tokens from database, fetch
        from onchain, and update tokens on database)
      </Text>
      <Button
        onClick={handleTempTokenHighestTotalSupply}
        isDisabled={loading_updateDb_highestTotalSupply}
      >
        {loading_updateDb_highestTotalSupply ? <Spinner /> : "fetch and update"}
      </Button>
      <Text fontSize="25px" fontFamily="Neue Pixel Sans">
        updateTempTokenTotalSupplyThreshold (select tokens from database, update
        onchain, and update tokens on database)
      </Text>
      <Flex>
        <Input
          variant="glow"
          placeholder={"new threshold for all tokens"}
          value={newSupplyThreshold}
          onChange={handleNewSupplyThresholdChange}
        />
        <Button
          onClick={call_updateOnchainAndUpdateDb_totalSupplyThreshold}
          isDisabled={
            loading_updateOnchainAndUpdateDb_totalSupplyThreshold ||
            !newSupplyThreshold
          }
        >
          {loading_updateOnchainAndUpdateDb_totalSupplyThreshold ? (
            <Spinner />
          ) : (
            "send"
          )}
        </Button>
      </Flex>
      <Text fontSize="25px" fontFamily="Neue Pixel Sans">
        updateTempTokenIsAlwaysTradeable (select tokens from database, update
        onchain, and update tokens on database)
      </Text>
      <Flex>
        <Button
          onClick={call_updateOnchainAndUpdateDb_alwaysTradeable}
          isDisabled={loading_updateOnchainAndUpdateDb_alwaysTradeable}
        >
          {loading_updateOnchainAndUpdateDb_alwaysTradeable ? (
            <Spinner />
          ) : (
            "send"
          )}
        </Button>
      </Flex>
      <Text fontSize="25px" fontFamily="Neue Pixel Sans">
        updateEndTimestampForTokens (select tokens from database, update
        onchain, and update tokens on database)
      </Text>
      <Flex>
        <Input
          variant="glow"
          placeholder={"additional duration in seconds"}
          value={additionalSeconds}
          onChange={handleAdditionalSecondsChange}
        />
        <Button
          onClick={increaseEndTimestampForTokens}
          isDisabled={isIncreaseEndTimestampForTokensLoading}
        >
          {isIncreaseEndTimestampForTokensLoading ? <Spinner /> : "send"}
        </Button>
      </Flex>
    </>
  );
};
