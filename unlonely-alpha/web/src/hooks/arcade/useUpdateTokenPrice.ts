import { useCallback, useState } from "react";
import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";

import {
  UpdateCreatorTokenPriceMutation,
  UpdateCreatorTokenPriceMutationVariables,
} from "../../generated/graphql";
import { useAuthedMutation } from "../../apiClient/hooks";

const UPDATE_CREATOR_TOKEN_PRICE_MUTATION = gql`
  mutation UpdateCreatorTokenPrice($data: UpdateCreatorTokenPriceInput!) {
    updateCreatorTokenPrice(data: $data) {
      address
      price
    }
  }
`;

const useUpdateCreatorTokenPrice = ({
  onError,
}: {
  onError?: (errors?: GraphQLErrors) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
  UpdateCreatorTokenPriceMutation,
  UpdateCreatorTokenPriceMutationVariables
  >(UPDATE_CREATOR_TOKEN_PRICE_MUTATION);

  const updateCreatorTokenPrice = useCallback(
    async (data) => {
      setLoading(true);
      const mutationResult = await mutate({ variables: { data } });

      if (
        mutationResult.errors ||
        !mutationResult.data ||
        !mutationResult.data.updateCreatorTokenPrice
      ) {
        onError && onError(mutationResult.errors);
        setLoading(false);
        return;
      }

      setLoading(false);
    },
    [mutate, onError]
  );

  return { updateCreatorTokenPrice, loading };
};

export default useUpdateCreatorTokenPrice;
