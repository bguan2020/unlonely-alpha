import { useLazyQuery } from "@apollo/client";
import { GET_TEMP_TOKENS_QUERY } from "../../constants/queries";
import { GetTempTokensQuery, TempToken } from "../../generated/graphql";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNetworkContext } from "../../hooks/context/useNetwork";
import {
  Button,
  Flex,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
} from "@chakra-ui/react";
import { getTimeFromMillis } from "../../utils/time";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { formatUnits } from "viem";
import { useCacheContext } from "../../hooks/context/useCache";

const headers = ["rank", "token", "channel", "highest price", "time left"];

const ITEMS_PER_PAGE = 10;

const TempTokenLeaderboard = () => {
  const { network } = useNetworkContext();
  const { localNetwork, explorerUrl } = network;
  const { ethPriceInUsd } = useCacheContext();

  const visibleColumns = useBreakpointValue({
    base: [1, 3],
    sm: [0, 1, 3],
    md: [0, 1, 2, 3, 4],
    lg: [0, 1, 2, 3, 4],
  });

  const [getTempTokensQuery, { loading, data, error }] =
    useLazyQuery<GetTempTokensQuery>(GET_TEMP_TOKENS_QUERY, {
      fetchPolicy: "network-only",
    });

  const [page, setPage] = useState(0);
  const [nowInSeconds, setNowIsSeconds] = useState(
    Math.floor(Date.now() / 1000)
  );

  const dataset = useMemo(
    () =>
      (data?.getTempTokens ?? []).filter(
        (token): token is TempToken => token !== null
      ),
    [data]
  );

  const datasetSorted = useMemo(() => {
    return dataset
      .map((token) => {
        const n = token.highestTotalSupply;
        const n_ = Math.max(n - 1, 0);
        const priceForCurrent = Math.floor((n * (n + 1) * (2 * n + 1)) / 6);
        const priceForPrevious = Math.floor((n_ * (n_ + 1) * (2 * n_ + 1)) / 6);
        const newPrice = priceForCurrent - priceForPrevious;

        return {
          ...token,
          highestPrice: newPrice,
        };
      })
      .sort((a, b) => {
        const nA = a.highestPrice;
        const nB = b.highestPrice;
        if (nA !== nB) return nB - nA;
        return b.endUnixTimestamp - a.endUnixTimestamp;
      });
  }, [dataset]);

  const completedDataRows = useMemo(() => {
    return datasetSorted.map((token, index) => {
      return {
        data: [
          `${index + page * ITEMS_PER_PAGE + 1}`,
          token.symbol,
          token.channel.slug,
          `$${truncateValue(
            Number(formatUnits(BigInt(token.highestPrice), 18)) *
              Number(ethPriceInUsd),
            4
          )}`,
          token.isAlwaysTradeable
            ? "permanent"
            : getTimeFromMillis(
                Math.max(Number(token.endUnixTimestamp) - nowInSeconds, 0) *
                  1000,
                true,
                true
              ),
        ],
      };
    });
  }, [datasetSorted, ethPriceInUsd]);

  const rowsPaginated = useMemo(() => {
    return completedDataRows.slice(
      page * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
    );
  }, [completedDataRows, page]);

  const fetch = useCallback(() => {
    getTempTokensQuery({
      variables: {
        data: {
          chainId: localNetwork.config.chainId,
          fulfillAllNotAnyConditions: true,
        },
      },
    });
  }, [localNetwork]);

  useEffect(() => {
    fetch();
  }, [localNetwork]);

  useEffect(() => {
    const updateCountdown = () => {
      if (completedDataRows.length === 0) return;
      const now = Math.floor(Date.now() / 1000);
      setNowIsSeconds(now);
    };

    // Set the interval to update the countdown every X seconds
    const interval = setInterval(updateCountdown, 1 * 1000);

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, [completedDataRows]);

  return (
    <Flex
      direction="column"
      width="100%"
      bg="#131323"
      py="15px"
      borderRadius={"10px"}
    >
      <Text
        fontSize={{ base: "30px", lg: "40px" }}
        fontWeight="400"
        textAlign={"center"}
        fontFamily={"LoRes15"}
      >
        30 Minute Token Leaderboard
      </Text>
      {error ? (
        <Flex justifyContent={"center"}>
          <Text>Cannot fetch data</Text>
        </Flex>
      ) : loading ? (
        <Flex justifyContent={"center"} p="10px">
          <Spinner />
        </Flex>
      ) : (
        <>
          {dataset.length > 0 ? (
            <Flex direction="column" gap="10px">
              <TableContainer overflowX={"auto"} my="10px">
                <Table variant="unstyled">
                  <Thead>
                    <Tr>
                      {visibleColumns &&
                        visibleColumns.map((i) => (
                          <Th
                            textTransform={"lowercase"}
                            fontSize={["20px", "24px"]}
                            p="10px"
                            textAlign="center"
                            borderBottom="1px solid #615C5C"
                            key={i}
                          >
                            {headers[i]}
                          </Th>
                        ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rowsPaginated.map((row, rowIndex) => {
                      return (
                        <Tr key={rowIndex}>
                          {visibleColumns &&
                            visibleColumns.map((index) => (
                              <Td
                                _hover={
                                  visibleColumns[index] === 1 ||
                                  visibleColumns[index] === 2
                                    ? { background: "#615C5C", color: "white" }
                                    : undefined
                                }
                                onClick={() => {
                                  if (visibleColumns[index] === 1) {
                                    window.open(
                                      `${window.location.origin}/token/${datasetSorted[rowIndex].chainId}/${datasetSorted[rowIndex].tokenAddress}`,
                                      "_blank"
                                    );
                                  }
                                  if (visibleColumns[index] === 2) {
                                    window.open(
                                      `${window.location.origin}/channels/${row.data[2]}`,
                                      "_blank"
                                    );
                                  }
                                }}
                                fontSize={["20px", "24px"]}
                                p="10px"
                                textAlign="center"
                                key={index}
                              >
                                {row.data[index]}
                              </Td>
                            ))}
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
              <Flex justifyContent={"center"} gap="10px" alignItems={"center"}>
                <Button
                  height="25px"
                  onClick={() => {
                    setPage(page - 1);
                  }}
                  isDisabled={page === 0}
                >
                  previous
                </Button>
                <Text>{page + 1}</Text>
                <Button
                  height="25px"
                  onClick={() => {
                    setPage(page + 1);
                  }}
                  isDisabled={rowsPaginated.length < ITEMS_PER_PAGE}
                >
                  next
                </Button>
              </Flex>
            </Flex>
          ) : (
            <Flex direction="column" justifyContent="center" gap="5px">
              <Text textAlign={"center"}>No active tokens to show</Text>
              <Button mx="auto" onClick={fetch}>
                check again
              </Button>
            </Flex>
          )}
        </>
      )}
    </Flex>
  );
};

export default TempTokenLeaderboard;
