import { Flex, Image } from "@chakra-ui/react";
import { useQuery } from "@apollo/client";
import { useRef, useState } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";

import { NFC_FEED_QUERY } from ".";
import AppLayout from "../components/layout/AppLayout";
import { WavyText } from "../components/general/WavyText";
import { NfcFeedQuery } from "../generated/graphql";
import { NFCComponent } from "../components/mobile/NFCComponent";

export default function Nfcs() {
  const {
    data: dataNFCs,
    loading: loadingNFCs,
    error: errorNFCs,
  } = useQuery<NfcFeedQuery>(NFC_FEED_QUERY, {
    variables: {
      data: {
        orderBy: "createdAt",
      },
    },
  });

  const nfcs = dataNFCs?.getNFCFeed ?? [];

  const [loadingPage, setLoadingPage] = useState<boolean>(false);
  const scrollRef = useRef<VirtuosoHandle>(null);

  return (
    <AppLayout isCustomHeader={false}>
      {!loadingPage && !loadingNFCs ? (
        <Flex
          direction="column"
          justifyContent="center"
          width="100vw"
          position="relative"
          height="100%"
        >
          {nfcs.length > 0 && (
            <Virtuoso
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
          )}
        </Flex>
      ) : (
        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          direction="column"
          width="100%"
          height="calc(100vh - 115px)"
          fontSize="50px"
        >
          <Image src="/icons/icon-192x192.png" borderRadius="10px" />
          <Flex>
            <WavyText text="..." />
          </Flex>
        </Flex>
      )}
    </AppLayout>
  );
}
