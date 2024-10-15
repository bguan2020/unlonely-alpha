import { useCallback, useState } from "react";
import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";

import { useAuthedMutation } from "../../../apiClient/hooks";
import { UpdateStreamInteractionMutation, UpdateStreamInteractionMutationVariables, UpdateStreamInteractionInput } from "../../../generated/graphql";

const MUTATION = gql`
mutation UpdateStreamInteraction($data: UpdateStreamInteractionInput!) {
  updateStreamInteraction(data: $data) {
    softDelete
    updatedAt
    createdAt
    text
    interactionType
    id
  }
}
`;

const updateStreamInteraction = ({
  onError,
}: {
  onError?: (errors?: GraphQLErrors) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdateStreamInteractionMutation,
    UpdateStreamInteractionMutationVariables
  >(MUTATION);

  const updateStreamInteraction = useCallback(
    async (data: UpdateStreamInteractionInput) => {
      setLoading(true);

      const mutationResult = await mutate({ variables: { data } });

      if (
        mutationResult.errors ||
        !mutationResult.data ||
        !mutationResult.data.updateStreamInteraction
      ) {
        onError && onError(mutationResult.errors);
        setLoading(false);
        return;
      }

      setLoading(false);
    },
    [mutate, onError]
  );

  return { updateStreamInteraction, loading };
};

export default updateStreamInteraction;
