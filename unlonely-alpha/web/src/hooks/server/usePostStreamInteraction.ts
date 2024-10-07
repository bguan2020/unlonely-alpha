import { useCallback, useState } from "react";
import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";

import {
  PostStreamInteractionInput,
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
    async (data: PostStreamInteractionInput) => {
      setLoading(true);
      const mutationResult = await mutate({ variables: { data } });

      const res = mutationResult?.data?.postStreamInteraction;
      /* eslint-disable no-console */
      if (res) {
        console.log("success");
      } else {
        onError && onError();
      }

      return {
        res,
      };

      setLoading(false);
    },
    [mutate, onError]
  );

  return { postStreamInteraction, loading };
};

export default usePostStreamInteraction;
