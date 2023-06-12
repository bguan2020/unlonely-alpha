import { useCallback, useState } from "react";
import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";

import {
  UpdateUserCreatorTokenQuantityMutation,
  UpdateUserCreatorTokenQuantityMutationVariables,
} from "../../generated/graphql";
import { useAuthedMutation } from "../../apiClient/hooks";

const UPDATE_USER_TOKEN_QUANTITY_MUTATION = gql`
  mutation UpdateUserCreatorTokenQuantity($data: UpdateUserCreatorTokenQuantityInput!) {
    updateUserCreatorTokenQuantity(data: $data) {
      quantity
      user { 
        address
      }
    }
  }
`;

const useUpdateUserCreatorTokenQuantity = ({
  onError,
}: {
  onError?: (errors?: GraphQLErrors) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdateUserCreatorTokenQuantityMutation,
    UpdateUserCreatorTokenQuantityMutationVariables
  >(UPDATE_USER_TOKEN_QUANTITY_MUTATION);

  const updateUserCreatorTokenQuantity = useCallback(
    async (data) => {
      setLoading(true);
      console.log(data, "hook");

      const mutationResult = await mutate({ variables: { data } });

      if (
        mutationResult.errors ||
        !mutationResult.data ||
        !mutationResult.data.updateUserCreatorTokenQuantity
      ) {
        onError && onError(mutationResult.errors);
        setLoading(false);
        return;
      }

      setLoading(false);
    },
    [mutate, onError]
  );

  return { updateUserCreatorTokenQuantity, loading };
};

export default useUpdateUserCreatorTokenQuantity;
