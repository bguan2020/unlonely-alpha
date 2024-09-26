import { useCallback, useState } from "react";
import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";

import { useAuthedMutation } from "../../../apiClient/hooks";
import {
  UpdateUserPackageCooldownMappingInput,
  UpdateUserPackageCooldownMappingMutation,
  UpdateUserPackageCooldownMappingMutationVariables,
} from "../../../generated/graphql";

const MUTATION = gql`
  mutation UpdateUserPackageCooldownMapping($data: UpdateUserPackageCooldownMappingInput!) {
  updateUserPackageCooldownMapping(data: $data) {
    address
    username
    packageCooldownMapping
  }
}
`;

const useUpdateUserPackageCooldownMapping = ({
  onError,
}: {
  onError?: (errors?: GraphQLErrors) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdateUserPackageCooldownMappingMutation,
    UpdateUserPackageCooldownMappingMutationVariables
  >(MUTATION);

  const updateUserPackageCooldownMapping = useCallback(
    async (data: UpdateUserPackageCooldownMappingInput) => {
      setLoading(true);

      const mutationResult = await mutate({ variables: { data } });

      if (
        mutationResult.errors ||
        !mutationResult.data ||
        !mutationResult.data.updateUserPackageCooldownMapping
      ) {
        onError && onError(mutationResult.errors);
        setLoading(false);
        return;
      }

      setLoading(false);
    },
    [mutate, onError]
  );

  return { updateUserPackageCooldownMapping, loading };
};

export default useUpdateUserPackageCooldownMapping;
