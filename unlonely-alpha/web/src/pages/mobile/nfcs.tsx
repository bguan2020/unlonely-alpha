import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { useQuery } from "@apollo/client";
import { useRef } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";

import AppLayout from "../../components/layout/AppLayout";
import { WavyText } from "../../components/general/WavyText";
import { NfcFeedQuery } from "../../generated/graphql";
import { NFCComponent } from "../../components/mobile/NFCComponent";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { NFC_FEED_QUERY } from "../../constants/queries";

export default function Nfcs() {
  const { isIOS } = useUserAgent();
  const {
    data: dataNFCs,
    loading: loadingNFCs,
    error: errorNFCs,
  } = useQuery<NfcFeedQuery>(NFC_FEED_QUERY, {
    variables: {
      data: {
        limit: 35,
        orderBy: "createdAt",
      },
    },
  });

  const nfcs = dataNFCs?.getNFCFeed ?? [];

  const scrollRef = useRef<VirtuosoHandle>(null);

  return (
    <AppLayout isCustomHeader={false}>
      {!loadingNFCs ? (
        <Flex
          direction="column"
          justifyContent="center"
          width="100vw"
          position="relative"
          height="100%"
        >
          {nfcs.length > 0 ? (
            isIOS ? (
              <Virtuoso
                overscan={4}
                style={{
                  overflowY: "scroll",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  scrollSnapType: "y mandatory",
                }}
                className="hide-scrollbar"
                followOutput={"auto"}
                ref={scrollRef}
                data={nfcs}
                totalCount={nfcs.length}
                initialTopMostItemIndex={0}
                itemContent={(index, nfc) => (
                  <NFCComponent nfc={nfc} key={nfc?.id || index} />
                )}
              />
            ) : (
              <Box
                style={{
                  overflowY: "scroll",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  scrollSnapType: "y mandatory",
                }}
                className="hide-scrollbar"
              >
                {nfcs.map((nfc, index) => (
                  <NFCComponent nfc={nfc} key={nfc?.id || index} />
                ))}
              </Box>
            )
          ) : (
            <>
              <Flex justifyContent={"center"}>
                <Text color="white" textAlign={"center"}>
                  {"No NFCs to show. This may be a server issue."}
                </Text>
              </Flex>
            </>
          )}
        </Flex>
      ) : (
        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          direction="column"
          width="100%"
          height="calc(100vh - 103px)"
          fontSize="50px"
        >
          <Image
            src="/icons/icon-192x192.png"
            borderRadius="10px"
            height="96px"
          />
          <Flex>
            <WavyText text="..." />
          </Flex>
        </Flex>
      )}
    </AppLayout>
  );
}
