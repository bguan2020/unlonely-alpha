import { GetServerSidePropsContext } from "next";
import { gql, useQuery } from "@apollo/client";

import { Text, Flex } from "@chakra-ui/layout";
import { Image, Spacer, Spinner } from "@chakra-ui/react";
import { NfcDetailQuery } from "../../generated/graphql";
import AppLayout from "../../components/layout/AppLayout";
import NfcDetailCard from "../../components/NFCs/NfcDetail";

const unlonelyAvatar = "https://i.imgur.com/MNArpwV.png";

type UrlParams = {
  nfcId: string;
};

const NFC_DETAIL_QUERY = gql`
  query NFCDetail($id: ID!) {
    getNFC(id: $id) {
      id
      title
      videoLink
      updatedAt
      owner {
        address
        FCImageUrl
        username
      }
    }
  }
`;

const NfcDetail = ({ nfcId }: UrlParams) => {
  const { data, loading, error } = useQuery<NfcDetailQuery>(
    NFC_DETAIL_QUERY,
    {
      variables: { id: nfcId },
    }
  );

  const nfc = data?.getNFC;

  return (
    <>
      <AppLayout>
        <Flex justifyContent="center" mt="5rem">
          {!nfc || loading ? (
            <Flex width="100%" justifyContent="center">
              <Spinner />
            </Flex>
          ) : (
            <NfcDetailCard nfc={nfc} />
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

  return { props: { nfcId } };
}
