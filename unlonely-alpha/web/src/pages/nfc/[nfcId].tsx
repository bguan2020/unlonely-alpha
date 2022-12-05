import { GetServerSidePropsContext } from "next";
import { gql, useQuery } from "@apollo/client";
import Head from "next/head";
import { Spinner, Flex, Text } from "@chakra-ui/react";

import { NfcDetailQuery } from "../../generated/graphql";
import AppLayout from "../../components/layout/AppLayout";
import NfcDetailCard from "../../components/NFCs/NfcDetail";
import NfcList from "../../components/NFCs/NfcList";
import centerEllipses from "../../utils/centerEllipses";

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
  const { data, loading, error } = useQuery<NfcDetailQuery>(NFC_DETAIL_QUERY, {
    variables: { id: nfcId },
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

  const nfc = data?.getNFC;
  const nfcs = dataNFCs?.getNFCFeed;

  return (
    <>
      {nfc ? (
        <Head>
          <title>{nfc.title} | NFC</title>
          <meta
            property="og:title"
            content={nfc.title ? `${nfc.title} | NFC` : "NFC"}
          />
          <meta
            name="description"
            content={`${
              nfc.owner.username
                ? nfc.owner.username
                : centerEllipses(nfc.owner.address, 7)
            }'s NFC | ${nfc.title}`}
          />
          <meta
            property="og:image"
            content={
              nfc.videoThumbnail
                ? nfc.videoThumbnail
                : "/images/social_banner.png"
            }
          />
          <meta
            property="og:url"
            content={`https://www.unlonely.app/nfc/${nfcId}`}
          />
        </Head>
      ) : null}
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
