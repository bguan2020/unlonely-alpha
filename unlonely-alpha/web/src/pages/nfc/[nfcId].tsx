import { GetServerSidePropsContext } from "next";
import { gql, useQuery, useLazyQuery } from "@apollo/client";
import { Spinner, Flex, Text } from "@chakra-ui/react";
import { useEffect, useMemo } from "react";

import { NfcDetailQuery } from "../../generated/graphql";
import AppLayout from "../../components/layout/AppLayout";
import NfcDetailCard from "../../components/NFCs/NfcDetail";
import NfcList from "../../components/NFCs/NfcList";
import NFCNextHead from "../../components/layout/NFCNextHead";

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

const NfcDetail = ({ nfcId }: UrlParams) => {
  const [loadNFCData, { data, loading, error }] = useLazyQuery<NfcDetailQuery>(NFC_DETAIL_QUERY, {
    variables: { id: nfcId }
  });

  const {
    data: dataNFCs,
    loading: loadingNFCs,
    error: errorNFCs,
  } = useQuery(NFC_RECOMMENDATIONS_QUERY, {
    variables: {
      data: {
        limit: 9,
        orderBy: null,
      },
    },
  });

  useEffect(() => {
    // Trigger the query to load the nfc data when the page is loaded
    loadNFCData();
  }, []);

  const nfc = useMemo(() => data?.getNFC, [data]);
  const nfcs = dataNFCs?.getNFCFeed;

  return (
    <>
      {!loading && nfc && (
        <NFCNextHead nfc={nfc} />
      )}
      <AppLayout
        title={nfc?.title}
        image={nfc?.videoThumbnail}
        isCustomHeader={true}
      >
        <Flex justifyContent="center" mt="5rem" direction="column">
          {!nfc || loading ? (
            <Flex width="100%" justifyContent="center">
              <Spinner />
            </Flex>
          ) : (
            <Flex width="100%" justifyContent="center">
              <NfcDetailCard nfc={nfc} />
            </Flex>
          )}
          <Flex width="100%" justifyContent="center" mt="2rem">
            <Flex width="100%" justifyContent="center" direction="column">
              <Flex width="100%" justifyContent="center" mb="1rem">
                <Text fontSize="16px">Watch More NFCs!</Text>
              </Flex>
              <Flex width="100%" justifyContent="center">
                {loadingNFCs ? (
                  <Flex width="100%" justifyContent="center">
                    <Spinner />
                  </Flex>
                ) : (
                  <Flex
                    direction="row"
                    overflowX="scroll"
                    overflowY="hidden"
                    justifyContent="center"
                    m="auto"
                    width="90%"
                    height={{
                      base: "14rem",
                      sm: "18rem",
                      md: "18rem",
                      lg: "18rem",
                    }}
                  >
                    <NfcList nfcs={nfcs} />
                  </Flex>
                )}
              </Flex>
            </Flex>
          </Flex>
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

  return { props: { nfcId } };
}
