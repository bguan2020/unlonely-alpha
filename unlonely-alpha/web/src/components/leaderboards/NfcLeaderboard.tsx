import { useLazyQuery } from "@apollo/client";
import { NFC_FEED_QUERY } from "../../constants/queries";
import { Nfc, NfcFeedQuery } from "../../generated/graphql";
import { useCallback, useEffect, useState } from "react";
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
  Image,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import centerEllipses from "../../utils/centerEllipses";
import trailString from "../../utils/trailString";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useZoraCollect1155 } from "../../hooks/contracts/useZoraCollect1155";
import { NfcClipMintInterface } from "../general/NfcClipMintInterface";

const headers = ["rank", "clip link + title", "clipped by", "channel", "mints"];

const ITEMS_PER_PAGE = 10;

const NfcLeaderboard = () => {
  const [getNfcFeed, { loading, error }] =
    useLazyQuery<NfcFeedQuery>(NFC_FEED_QUERY);

  const { collectorMint } = useZoraCollect1155();
  const [leaderboardRows, setLeaderboardRows] = useState<any[]>([]);
  const [fetchedUnderLimit, setFetchedUnderLimit] = useState(false);

  const visibleColumns = useBreakpointValue({
    base: [1, 3],
    sm: [0, 1, 3],
    md: [0, 1, 2, 3, 4],
    lg: [0, 1, 2, 3, 4],
  });

  const [page, setPage] = useState(0);
  const [pagesFetched, setPagesFetched] = useState(0);

  const fetch = useCallback(async () => {
    if (page < pagesFetched) return;
    const { data } = await getNfcFeed({
      variables: {
        data: {
          limit: ITEMS_PER_PAGE,
          offset: ITEMS_PER_PAGE * page,
          orderBy: "totalMints",
        },
      },
    });
    const cleanedData = data?.getNFCFeed?.filter(
      (nfc): nfc is Nfc => nfc !== null
    );
    const rows =
      cleanedData?.map((nfc, index) => {
        return {
          data: [
            `${ITEMS_PER_PAGE * page + index + 1}`,
            { title: nfc.title, thumbnail: nfc.videoThumbnail, id: nfc.id },
            nfc.owner.username
              ? trailString(nfc.owner.username, 25)
              : centerEllipses(nfc.owner.address, 13),
            nfc?.channel?.slug,
            {
              totalMints: nfc.totalMints,
              zoraLink: nfc.zoraLink,
              contract1155Address: nfc.contract1155Address,
              tokenId: nfc.tokenId,
            },
          ],
        };
      }) || [];
    setPagesFetched((prev) => prev + 1);
    setFetchedUnderLimit(rows.length < ITEMS_PER_PAGE);
    setLeaderboardRows((prev) => [...prev, ...rows]);
  }, [page]);

  useEffect(() => {
    fetch();
  }, [page]);

  return (
    <Flex
      direction="column"
      width="100%"
      bg="#131323"
      py="15px"
      borderRadius={"10px"}
    >
      <Text
        fontSize={{ base: "20px", lg: "24px" }}
        fontWeight="400"
        textAlign={"center"}
        fontFamily={"LoRes15"}
        onClick={() => {
          window.open(`${window.origin}/nfcs`, "_blank");
        }}
        _hover={{
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        clip leaderboard
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
          {leaderboardRows.length > 0 ? (
            <Flex direction="column" gap="10px" position="relative">
              <Button
                height="25px"
                width="100px"
                onClick={() => {
                  window.open(`${window.origin}/nfcs?sort=createdAt`, "_blank");
                }}
                position={"absolute"}
                bottom={"0"}
                right={"15px"}
              >
                see all
              </Button>
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
                    {leaderboardRows
                      .slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)
                      .map((row, rowIndex) => {
                        return (
                          <Tr key={rowIndex}>
                            <Td p="5px" textAlign="center">
                              {row.data[0]}
                            </Td>
                            <Td
                              p="5px"
                              _hover={{
                                cursor: "pointer",
                                bg: "#374eff",
                              }}
                              onClick={() => {
                                window.open(
                                  `${window.origin}/nfc/${row.data[1].id}`,
                                  "_blank"
                                );
                              }}
                            >
                              <Text textAlign={"center"}>
                                {trailString(row.data[1].title, 37)}
                              </Text>
                              <Flex justifyContent={"center"}>
                                <Image
                                  src={row.data[1].thumbnail}
                                  w={[`${16 * 10}px`, `${16 * 14}px`]}
                                  h={[`${9 * 10}px`, `${9 * 14}px`]}
                                />
                              </Flex>
                            </Td>
                            <Td p="5px" textAlign="center">
                              {row.data[2]}
                            </Td>
                            <Td
                              p="5px"
                              color={!row.data[3] ? "gray" : "unset"}
                              textAlign="center"
                              _hover={
                                row.data[3]
                                  ? {
                                      cursor: "pointer",
                                      bg: "#374eff",
                                    }
                                  : {}
                              }
                              onClick={() => {
                                if (!row.data[3]) return;
                                window.open(
                                  `${window.origin}/channels/${row.data[3]}`,
                                  "_blank"
                                );
                              }}
                            >
                              {row.data[3] || "n/a"}
                            </Td>
                            <Td p="5px" textAlign="center">
                              {row.data[4].totalMints}
                              {row.data[4].zoraLink && (
                                <Popover
                                  trigger="click"
                                  placement="bottom"
                                  openDelay={300}
                                >
                                  <PopoverTrigger>
                                    <ChevronDownIcon
                                      _hover={{
                                        cursor: "pointer",
                                        color: "#374eff",
                                      }}
                                    />
                                  </PopoverTrigger>
                                  <PopoverContent
                                    bg="#343dbb"
                                    border="none"
                                    width="100%"
                                    p="2px"
                                  >
                                    <PopoverArrow bg="#343dbb" />
                                    <NfcClipMintInterface
                                      mintCallback={async (
                                        contract1155Address,
                                        tokenId,
                                        n
                                      ) => {
                                        await collectorMint(
                                          contract1155Address as `0x${string}`,
                                          tokenId,
                                          n
                                        );
                                      }}
                                      contract1155Address={
                                        row.data[4].contract1155Address
                                      }
                                      tokenId={row.data[4].tokenId}
                                      zoraLink={row.data[4].zoraLink}
                                    />
                                  </PopoverContent>
                                </Popover>
                              )}
                            </Td>
                          </Tr>
                        );
                      })}
                  </Tbody>
                </Table>
              </TableContainer>
              <Flex justifyContent={"center"} gap="10px" alignItems={"center"}>
                <Button
                  height="25px"
                  width="100px"
                  onClick={() => {
                    setPage((prev) => prev - 1);
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
                    setPage((prev) => prev + 1);
                  }}
                  isDisabled={fetchedUnderLimit}
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

export default NfcLeaderboard;
