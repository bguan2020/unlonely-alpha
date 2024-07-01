import { useLazyQuery } from "@apollo/client";
import { GET_TEMP_TOKENS_QUERY } from "../../../constants/queries";
import { useCallback, useEffect, useState } from "react";
import { GetTempTokensQuery, TempToken } from "../../../generated/graphql";
import { Contract } from "../../../constants";
import { useNetworkContext } from "../../../hooks/context/useNetwork";
import { getContractFromNetwork } from "../../../utils/contract";
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

const headers = ["token", "highest price", "date"];

export const OwnerPastTokens = () => {
  const { network } = useNetworkContext();
  const { localNetwork } = network;

  const { channel } = useChannelContext();
  const { channelQueryData } = channel;

  const [tokens, setTokens] = useState<TempToken[]>([]);

  const [getTempTokensQuery, { loading: getTempTokensLoading }] =
    useLazyQuery<GetTempTokensQuery>(GET_TEMP_TOKENS_QUERY, {
      fetchPolicy: "network-only",
    });

  const factoryContract = getContractFromNetwork(
    Contract.TEMP_TOKEN_FACTORY_V1,
    localNetwork
  );

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
    handleGetTempTokens();
  }, [handleGetTempTokens]);

  return (
    <Flex direction={"column"} gap="10px" maxHeight="100%" overflowY={"scroll"}>
      {tokens.length > 0 ? (
        <TableContainer
          overflowX={"auto"}
          overflowY={"scroll"}
          height={"200px"}
        >
          <Table variant="unstyled">
            <Thead>
              <Tr>
                {tokens &&
                  tokens.map((token, i) => (
                    <Th
                      textTransform={"lowercase"}
                      fontSize={["20px", "24px"]}
                      p="10px"
                      textAlign="center"
                      borderBottom="1px solid #615C5C"
                      key={token.id}
                    >
                      {headers[i]}
                    </Th>
                  ))}
              </Tr>
            </Thead>
            <Tbody>
              {tokens.map((row, rowIndex) => {
                return (
                  <Tr key={row.id}>
                    <Td>{row.symbol}</Td>
                    <Td>0</Td>
                    <Td>{row.createdAt}</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (
        <>
          <Text>No tokens found, start by creating a new token</Text>
          <Button
            onClick={handleGetTempTokens}
            isLoading={getTempTokensLoading}
          >
            refetch
          </Button>
        </>
      )}
    </Flex>
  );
};
