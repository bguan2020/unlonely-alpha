import { useLazyQuery } from "@apollo/client";
import { GET_TEMP_TOKENS_QUERY } from "../../../constants/queries";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GetTempTokensQuery, TempToken } from "../../../generated/graphql";
import { Contract } from "../../../constants";
import { useNetworkContext } from "../../../hooks/context/useNetwork";
import {
  bondingCurveBigInt,
  getContractFromNetwork,
} from "../../../utils/contract";
import { useChannelContext } from "../../../hooks/context/useChannel";
import {
  Button,
  Flex,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { formatTimestampToDate } from "../../../utils/time";
import { usePublicClient } from "wagmi";
import TempTokenV1Abi from "../../../constants/abi/TempTokenV1.json";
import { useCacheContext } from "../../../hooks/context/useCache";
import { formatUnits } from "viem";
import { truncateValue } from "../../../utils/tokenDisplayFormatting";
import Link from "next/link";

const headers = ["$ticker", "price", "date"];
const ITEMS_PER_PAGE = 5;

export type DetailedTempToken = TempToken & { totalSupply?: bigint };

export const OwnerPastTokens = () => {
  const publicClient = usePublicClient();
  const { ethPriceInUsd } = useCacheContext();

  const { network } = useNetworkContext();
  const { localNetwork } = network;

  const { channel } = useChannelContext();
  const { channelQueryData } = channel;

  const [tokens, setTokens] = useState<DetailedTempToken[]>([]);
  const [page, setPage] = useState(0);

  const [getTempTokensQuery, { loading: getTempTokensLoading }] =
    useLazyQuery<GetTempTokensQuery>(GET_TEMP_TOKENS_QUERY, {
      fetchPolicy: "network-only",
    });

  const factoryContract = getContractFromNetwork(
    Contract.TEMP_TOKEN_FACTORY_V1,
    localNetwork
  );

  const tokensPaginated = useMemo(() => {
    return tokens.slice(ITEMS_PER_PAGE * page, ITEMS_PER_PAGE * (page + 1));
  }, [tokens, page]);

  const handleGetTempTokens = useCallback(async () => {
    try {
      const res = await getTempTokensQuery({
        variables: {
          data: {
            factoryAddress: factoryContract.address as `0x${string}`,
            chainId: localNetwork.config.chainId,
            ownerAddress: channelQueryData?.owner.address as `0x${string}`,
            fulfillAllNotAnyConditions: true,
          },
        },
      });
      const tokens = res.data?.getTempTokens;
      if (!tokens) return;
      const nonNullTokens = tokens.filter(
        (token): token is TempToken => token !== null
      );
      setTokens(nonNullTokens);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const fetchTokenTotalSupplies = async () => {
      if (!tokensPaginated.length) return;
      // check if first token has totalSupply defined, if so, that means the rest of the tokens have totalSupply defined so we can skip fetch
      if (tokensPaginated[0].totalSupply) return;
      if (!publicClient) return;
      // otherwise fetch totalSupply for all tokens and then update state
      const chainPromises = tokensPaginated.map((a) => {
        return publicClient.readContract({
          address: a.tokenAddress as `0x${string}`,
          abi: TempTokenV1Abi,
          functionName: "totalSupply",
        });
      });
      const results = await Promise.all(chainPromises);
      const newNonNullTokens: DetailedTempToken[] = tokensPaginated.map(
        (token, index) => {
          return {
            ...token,
            totalSupply: results[index] as unknown as bigint,
          };
        }
      );
      setTokens((prev) => {
        const newTokens = [...prev];
        newTokens.splice(
          ITEMS_PER_PAGE * page,
          ITEMS_PER_PAGE,
          ...newNonNullTokens
        );
        return newTokens;
      });
    };
    fetchTokenTotalSupplies();
  }, [tokensPaginated]);

  useEffect(() => {
    handleGetTempTokens();
  }, [handleGetTempTokens]);

  return (
    <Flex
      direction={"column"}
      gap="10px"
      maxHeight="100%"
      border={"1px solid white"}
      margin="0.5rem"
      padding="0.5rem"
    >
      <Flex justifyContent={"space-between"}>
        <Text fontSize="20px" fontWeight="bold" textAlign={"center"}>
          your tokens
        </Text>
        {tokens.length > ITEMS_PER_PAGE && (
          <Flex justifyContent={"center"} gap="10px" alignItems={"center"}>
            <Button
              height="25px"
              width="100px"
              onClick={() => {
                setPage(page - 1);
              }}
              isDisabled={page === 0}
            >
              prev
            </Button>
            <Text>{page + 1}</Text>
            <Button
              height="25px"
              width="100px"
              onClick={() => {
                setPage(page + 1);
              }}
              isDisabled={ITEMS_PER_PAGE * (page + 1) > tokens.length}
            >
              next
            </Button>
          </Flex>
        )}
      </Flex>
      {tokensPaginated.length > 0 ? (
        <TableContainer
          overflowX={"scroll"}
          overflowY={"scroll"}
          width="500px"
          height={"275px"}
        >
          <Table variant="unstyled">
            <Thead
              style={{
                position: "sticky",
                top: "0",
                background: "#05001f",
              }}
            >
              <Tr>
                {headers &&
                  headers.map((token, i) => (
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
              {tokensPaginated.map((row, rowIndex) => {
                const n = BigInt(row.highestTotalSupply);
                const n_ = n > BigInt(0) ? n - BigInt(1) : BigInt(0);
                const priceForCurrent = bondingCurveBigInt(n);
                const priceForPrevious = bondingCurveBigInt(n_);
                const basePrice = row.minBaseTokenPrice;
                const newPrice =
                  priceForCurrent - priceForPrevious + BigInt(basePrice);
                return (
                  <Tr
                    key={row.id}
                    _hover={{
                      bg: "#013eb9",
                      cursor: "pointer",
                    }}
                  >
                    <Td fontSize={["20px", "22px"]} textAlign="center" p="0">
                      <Link
                        target="_blank"
                        href={`${window.origin}/token/${row.chainId}/${row.tokenAddress}`}
                      >
                        <Flex p="12px 10px" justifyContent="center">
                          {row.symbol}
                        </Flex>
                      </Link>
                    </Td>
                    <Td fontSize={["20px", "22px"]} textAlign="center" p="0">
                      <Link
                        target="_blank"
                        href={`${window.origin}/token/${row.chainId}/${row.tokenAddress}`}
                      >
                        <Flex p="12px 10px" justifyContent="center">
                          {`$${truncateValue(
                            Number(formatUnits(newPrice, 18)) *
                              Number(ethPriceInUsd),
                            4
                          )}`}
                        </Flex>
                      </Link>
                    </Td>
                    <Td fontSize={["20px", "22px"]} textAlign="center" p="0">
                      <Flex p="12px 10px" justifyContent="center">
                        <Link
                          target="_blank"
                          href={`${window.origin}/token/${row.chainId}/${row.tokenAddress}`}
                        >
                          {formatTimestampToDate(
                            Math.floor(new Date(row.createdAt).getTime()),
                            true
                          )}
                        </Link>
                      </Flex>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (
        <>
          <Text>No tokens found, start by creating a new token</Text>
          {/* <Button
            onClick={handleGetTempTokens}
            isLoading={getTempTokensLoading}
          >
            refetch
          </Button> */}
        </>
      )}
    </Flex>
  );
};
