import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import {
  UpdateNfcMutation,
  UpdateNfcMutationVariables,
} from "../../generated/graphql";
type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const UPDATE_NFC_MUTATION = gql`
  mutation UpdateNFC($data: UpdateNFCInput!) {
    updateNFC(data: $data) {
      id
    }
  }
`;

const useUpdateNFC = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdateNfcMutation,
    UpdateNfcMutationVariables
  >(UPDATE_NFC_MUTATION);

  const updateNFC = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              id: data.id,
              title: data.title,
              videoLink: data.videoLink,
              videoThumbnail: data.videoThumbnail,
              openseaLink: data.openseaLink,
            },
          },
        });

        const res = mutationResult?.data?.updateNFC;
        /* eslint-disable no-console */
        if (res) {
          console.log("success");
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("updateNFC", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { updateNFC, loading };
};

export default useUpdateNFC;
