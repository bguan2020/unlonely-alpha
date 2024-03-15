import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../../apiClient/hooks";
import {
  SoftDeleteChannelMutation,
  SoftDeleteChannelMutationVariables,
} from "../../../generated/graphql";

type Props = {
  onSuccess?: () => void;
  onError?: (errors?: GraphQLErrors) => void;
};

const DELETE_CHANNEL_MUTATION = gql`
  mutation SoftDeleteChannel($data: SoftDeleteChannelInput!) {
    softDeleteChannel(data: $data) {
      id
      streamKey
      livepeerPlaybackId
      livepeerStreamId
      slug
      name
      description
      owner {
        FCImageUrl
        lensImageUrl
        username
        address
      }
    }
  }
`;

const useSoftDeleteChannel = ({ onSuccess, onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    SoftDeleteChannelMutation,
    SoftDeleteChannelMutationVariables
  >(DELETE_CHANNEL_MUTATION);

  const softDeleteChannel = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              slug: data.slug,
            },
          },
        });

        const res = mutationResult?.data?.softDeleteChannel;
        /* eslint-disable no-console */
        if (res) {
          console.log("softDeleteChannel success");
          onSuccess && onSuccess();
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("softDeleteChannel", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { softDeleteChannel, loading };
};

export default useSoftDeleteChannel;
