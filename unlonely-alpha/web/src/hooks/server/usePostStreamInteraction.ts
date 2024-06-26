import { useCallback, useState } from "react";
import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";

import {
  PostStreamInteractionMutation,
  PostStreamInteractionMutationVariables,
} from "../../generated/graphql";
import { useAuthedMutation } from "../../apiClient/hooks";

const POST_STREAM_INTERACTION_MUTATION = gql`
  mutation PostStreamInteraction($data: PostStreamInteractionInput!) {
    postStreamInteraction(data: $data) {
      id
    }
  }
`;

const usePostStreamInteraction = ({
  onError,
}: {
  onError?: (errors?: GraphQLErrors) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    PostStreamInteractionMutation,
    PostStreamInteractionMutationVariables
  >(POST_STREAM_INTERACTION_MUTATION);

  const postStreamInteraction = useCallback(
    async (data) => {
      setLoading(true);
      const mutationResult = await mutate({ variables: { data } });

      if (
        mutationResult.errors ||
        !mutationResult.data ||
        !mutationResult.data.postStreamInteraction
      ) {
        onError && onError(mutationResult.errors);
        setLoading(false);
        return;
      }

      setLoading(false);
    },
    [mutate, onError]
  );

  return { postStreamInteraction, loading };
};

export default usePostStreamInteraction;
