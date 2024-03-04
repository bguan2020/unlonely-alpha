import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import { DeleteChannelMutation, DeleteChannelMutationVariables } from "../../generated/graphql";

type Props = {
  onSuccess?: () => void;
  onError?: (errors?: GraphQLErrors) => void;
};

const DELETE_CHANNEL_MUTATION = gql`
    mutation DeleteChannel($data: DeleteChannelInput!) {
      deleteChannel(data: $data) {
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

const useDeleteChannel = ({ onSuccess, onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<DeleteChannelMutation, DeleteChannelMutationVariables>(DELETE_CHANNEL_MUTATION);

  const deleteChannel = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              slug: data.slug,
              softDelete: data.softDelete,
            },
          },
        });

        const res = mutationResult?.data?.deleteChannel;
        /* eslint-disable no-console */
        if (res) {
          console.log("deleteChannel success");
          onSuccess && onSuccess();
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("deleteChannel", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { deleteChannel, loading };
};

export default useDeleteChannel;
