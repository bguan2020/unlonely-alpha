import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import {
  PostNfcMutation,
  PostNfcMutationVariables,
} from "../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const POST_NFC_MUTATION = gql`
  mutation PostNFC($data: PostNFCInput!) {
    postNFC(data: $data) {
      id
    }
  }
`;

const usePostNFC = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<PostNfcMutation, PostNfcMutationVariables>(
    POST_NFC_MUTATION
  );

  const postNFC = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              title: data.title,
              videoLink: data.videoLink,
              videoThumbnail: data.videoThumbnail,
              openseaLink: data.openseaLink,
              channelId: data.channelId,
            },
          },
        });

        const res = mutationResult?.data?.postNFC;
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
        console.log("postNFC", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { postNFC, loading };
};

export default usePostNFC;
