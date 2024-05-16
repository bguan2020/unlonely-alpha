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
  const { localNetwork } = network;
  const { ethPriceInUsd } = useCacheContext();

  const visibleColumns = useBreakpointValue({
    base: [1, 3],
    sm: [0, 1, 3],
    md: [0, 1, 2, 3, 4, 5],
    lg: [0, 1, 2, 3, 4, 5],
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

  const datasetPaginated = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return dataset.slice(start, end);
  }, [dataset, page]);

  const calculatedHighestPrices = useMemo(() => {
    return datasetPaginated.map((token) => {
      const n = token.highestTotalSupply;
      const n_ = Math.max(n - 1, 0);
      const priceForCurrent = Math.floor((n * (n + 1) * (2 * n + 1)) / 6);
      const priceForPrevious = Math.floor((n_ * (n_ + 1) * (2 * n_ + 1)) / 6);
      const newPrice = priceForCurrent - priceForPrevious;
      return newPrice;
    });
  }, [datasetPaginated]);

  const sortedDataRows = useMemo(() => {
    return datasetPaginated
      .map((token, index) => {
        return {
          ...token,
          highestPrice: calculatedHighestPrices[index],
        };
      })
      .sort((a, b) => {
        const nA = a.highestPrice;
        const nB = b.highestPrice;
        if (nA !== nB) return nB - nA;
        return b.endUnixTimestamp - a.endUnixTimestamp;
      })
      .map((token, index) => {
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
          ],
        };
      });
  }, [datasetPaginated, calculatedHighestPrices, ethPriceInUsd]);

  const completedDataRows = useMemo(() => {
    return sortedDataRows.map((row, i) => {
      const timeLeft = getTimeFromMillis(
        Math.max(
          Number(datasetPaginated[i].endUnixTimestamp) - nowInSeconds,
          0
        ) * 1000,
        true,
        true
      );
      return {
        data: [...row.data, timeLeft],
      };
    });
  }, [sortedDataRows, nowInSeconds]);

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
                    {completedDataRows.map((row, rowIndex) => {
                      return (
                        <Tr
                          key={rowIndex}
                          _hover={{ background: "#615C5C", color: "white" }}
                          onClick={() => {
                            window.open(
                              `${window.location.origin}/channels/${row.data[2]}`,
                              "_blank"
                            );
                          }}
                        >
                          {visibleColumns &&
                            visibleColumns.map((index) => (
                              <Td
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
                  isDisabled={datasetPaginated.length < ITEMS_PER_PAGE}
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
