import { GetServerSidePropsContext } from "next";
import { gql, useQuery } from "@apollo/client";
import { Spinner, Flex, Text } from "@chakra-ui/react";
import { useMemo } from "react";

import { NfcDetailQuery } from "../../generated/graphql";
import AppLayout from "../../components/layout/AppLayout";
import NfcDetailCard from "../../components/NFCs/NfcDetail";
import NfcList from "../../components/NFCs/NfcList";
import NFCNextHead from "../../components/layout/NFCNextHead";
import { initializeApollo } from "../../apiClient/client";

type UrlParams = {
  nfcId: string;
};

const NFC_DETAIL_QUERY = gql`
  query NFCDetail($id: ID!) {
    getNFC(id: $id) {
      id
      title
      videoLink
      openseaLink
      videoThumbnail
      score
      liked
      updatedAt
      zoraLink
      owner {
        address
        FCImageUrl
        username
      }
    }
  }
`;

const NFC_RECOMMENDATIONS_QUERY = gql`
  query NFCRecommendations($data: NFCFeedInput!) {
    getNFCFeed(data: $data) {
      createdAt
      id
      videoLink
      videoThumbnail
      openseaLink
      score
      liked
      owner {
        username
        address
        FCImageUrl
        powerUserLvl
        videoSavantLvl
      }
      title
    }
  }
`;

const NfcDetail = ({
  nfcId,
  nfcData,
}: UrlParams & { nfcData: NfcDetailQuery }) => {
  const { data, loading, error } = useQuery(NFC_DETAIL_QUERY, {
    variables: {
      id: nfcId,
    },
  });
  const {
    data: dataNFCs,
    loading: loadingNFCs,
    error: errorNFCs,
  } = useQuery(NFC_RECOMMENDATIONS_QUERY, {
    variables: {
      data: {
        limit: 20,
        orderBy: "score",
      },
    },
  });
  const nfcSSR = useMemo(() => nfcData?.getNFC, [nfcData]);
  const nfc = useMemo(() => data?.getNFC, [data]);
  const nfcs = dataNFCs?.getNFCFeed;
  // randomize the order of the NFCs
  const randomizedNFCs = useMemo(() => {
    if (nfcs) {
      return [...nfcs].sort(() => Math.random() - 0.5);
    }
    return [];
  }, [nfcs]);

  return (
    <>
      {nfcSSR && <NFCNextHead nfc={nfcSSR} />}
      <AppLayout
        title={nfc?.title}
        image={nfc?.videoThumbnail}
        isCustomHeader={true}
      >
        <Flex justifyContent="center" direction="column">
          {loading || loadingNFCs ? (
            <>
              <Flex width="100%" justifyContent="center">
                <Spinner />
              </Flex>
              <Text textAlign={"center"}>loading...</Text>
            </>
          ) : (
            <>
              <Flex width="100%" justifyContent="center">
                <NfcDetailCard nfc={nfc} />
              </Flex>
              <Flex width="100%" justifyContent="center" mt="2rem">
                <Flex width="100%" justifyContent="center" direction="column">
                  <Flex width="100%" justifyContent="center" mb="1rem">
                    <Text fontSize="16px">Watch More NFCs!</Text>
                  </Flex>
                  <Flex width="100%" justifyContent="center">
                    <Flex
                      direction="row"
                      overflowX="scroll"
                      overflowY="hidden"
                      justifyContent="left"
                      m="auto"
                      width="90%"
                      height={{
                        base: "14rem",
                        sm: "18rem",
                        md: "18rem",
                        lg: "18rem",
                      }}
                    >
                      <NfcList nfcs={randomizedNFCs} />
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            </>
          )}
        </Flex>
      </AppLayout>
    </>
  );
};

export default NfcDetail;

export async function getServerSideProps(
  context: GetServerSidePropsContext<UrlParams>
) {
  const { nfcId } = context.params!;

  const apolloClient = initializeApollo(null, null);

  const { data } = await apolloClient.query({
    query: NFC_DETAIL_QUERY,
    variables: { id: nfcId },
  });

  return { props: { nfcId, nfcData: data } };
}
