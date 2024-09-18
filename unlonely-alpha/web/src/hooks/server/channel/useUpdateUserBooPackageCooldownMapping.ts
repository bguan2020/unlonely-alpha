import { useCallback, useState } from "react";
import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";

import { useAuthedMutation } from "../../../apiClient/hooks";
import {
  UpdateUserBooPackageCooldownMappingInput,
  UpdateUserBooPackageCooldownMappingMutation,
  UpdateUserBooPackageCooldownMappingMutationVariables,
} from "../../../generated/graphql";

const MUTATION = gql`
  mutation UpdateUserBooPackageCooldownMapping($data: UpdateUserBooPackageCooldownMappingInput!) {
  updateUserBooPackageCooldownMapping(data: $data) {
    address
    username
    booPackageCooldownMapping
  }
}
`;

const useUpdateUserBooPackageCooldownMapping = ({
  onError,
}: {
  onError?: (errors?: GraphQLErrors) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdateUserBooPackageCooldownMappingMutation,
    UpdateUserBooPackageCooldownMappingMutationVariables
  >(MUTATION);

  const updateUserBooPackageCooldownMapping = useCallback(
    async (data: UpdateUserBooPackageCooldownMappingInput) => {
      setLoading(true);

      const mutationResult = await mutate({ variables: { data } });

      if (
        mutationResult.errors ||
        !mutationResult.data ||
        !mutationResult.data.updateUserBooPackageCooldownMapping
      ) {
        onError && onError(mutationResult.errors);
        setLoading(false);
        return;
      }

      setLoading(false);
    },
    [mutate, onError]
  );

  return { updateUserBooPackageCooldownMapping, loading };
};

export default useUpdateUserBooPackageCooldownMapping;
