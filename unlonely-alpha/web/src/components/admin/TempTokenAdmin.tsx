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
import { verifyTempTokenV1OnBase } from "../../utils/contract-verification/tempToken";

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
    updateTempTokenHasHitTotalSupplyThreshold,
    loading: updateTempTokenHasHitTotalSupplyThresholdLoading,
  } = useUpdateTempTokenHasHitTotalSupplyThreshold({
    onError: (e) => {
      console.log("useUpdateTempTokenHasHitTotalSupplyThreshold error", e);
    },
  });

  const {
    updateTempTokenHighestTotalSupply,
    loading: updateTempTokenHighestTotalSupplyLoading,
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
    setTotalSupplyThresholdForTokens,
    loading: isSetTotalSupplyThresholdForTokensLoading,
  } = useUpdateTotalSupplyThresholdState(
    tokenAddressesIncludedForOperation,
    handleGetTempTokens
  );

  const {
    booleanNumber,
    handleInputChange: handleBooleanNumberChange,
    setAlwaysTradeableForTokens,
    loading: isSetAlwaysTradeableForTokensLoading,
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
    await updateTempTokenHasHitTotalSupplyThreshold({
      tokenAddressesSetTrue,
      tokenAddressesSetFalse,
      chainId: localNetwork.config.chainId,
    });
    await handleGetTempTokens();
  }, [tokenAddressesIncludedForOperation, publicClient]);

  const handleTempTokenHighestTotalSupply = useCallback(async () => {
    const chainPromises = tokenAddressesIncludedForOperation.map((a) => {
      return publicClient.readContract({
        address: a as `0x${string}`,
        abi: TempTokenV1Abi,
        functionName: "highestTotalSupply",
      });
    });
    const results = await Promise.all(chainPromises);
    console.log("handleTempTokenHighestTotalSupply results", results);
    await updateTempTokenHighestTotalSupply({
      tokenAddresses: tokenAddressesIncludedForOperation,
      newTotalSupplies: results.map((r) => String(r)),
      chainId: localNetwork.config.chainId,
    });
    await handleGetTempTokens();
  }, [tokenAddressesIncludedForOperation, publicClient]);

  const handleCopy = () => {
    toast({
      title: "copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <>
      <Text
        fontSize="35px"
        fontFamily="Neue Pixel Sans"
        textDecoration={"underline"}
      >
        TempToken functions
      </Text>
      <Button
        onClick={async () =>
          await verifyTempTokenV1OnBase(
            "0xE6CD2E5BeA6255C91ea8Ca44b8b7FDDb07Ef1471",
            "00000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000006605fd830000000000000000000000004f3d3f2f895db524ac3944bdd17fe632473bca4a00000000000000000000000000000000000000000000000000470de4df82000000000000000000000000000000000000000000000000000000470de4df8200000000000000000000000000000000000000000000000000000000000001312d020000000000000000000000007a1fc55bcc17240d2fa6419eadecfabedf2dfcd0000000000000000000000000000000000000000000000000000000000000000574656d7031000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000574656d7031000000000000000000000000000000000000000000000000000000"
          )
        }
      >
        test verify
      </Button>
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
                  <Tr key={index}>
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
        isDisabled={updateTempTokenHasHitTotalSupplyThresholdLoading}
      >
        {updateTempTokenHasHitTotalSupplyThresholdLoading ? (
          <Spinner />
        ) : (
          "fetch"
        )}
      </Button>
      <Text fontSize="25px" fontFamily="Neue Pixel Sans">
        updateTempTokenHighestTotalSupply (select tokens from database, fetch
        from onchain, and update tokens on database)
      </Text>
      <Button
        onClick={handleTempTokenHighestTotalSupply}
        isDisabled={updateTempTokenHighestTotalSupplyLoading}
      >
        {updateTempTokenHighestTotalSupplyLoading ? <Spinner /> : "fetch"}
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
          onClick={setTotalSupplyThresholdForTokens}
          isDisabled={
            isSetTotalSupplyThresholdForTokensLoading || !newSupplyThreshold
          }
        >
          {isSetTotalSupplyThresholdForTokensLoading ? <Spinner /> : "send"}
        </Button>
      </Flex>
      <Text fontSize="25px" fontFamily="Neue Pixel Sans">
        updateTempTokenIsAlwaysTradeable (select tokens from database, update
        onchain, and update tokens on database)
      </Text>
      <Flex>
        <Input
          variant="glow"
          placeholder={"'1' for true / '0' for false"}
          value={booleanNumber}
          onChange={handleBooleanNumberChange}
        />
        <Button
          onClick={setAlwaysTradeableForTokens}
          isDisabled={isSetAlwaysTradeableForTokensLoading}
        >
          {isSetAlwaysTradeableForTokensLoading ? <Spinner /> : "send"}
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
