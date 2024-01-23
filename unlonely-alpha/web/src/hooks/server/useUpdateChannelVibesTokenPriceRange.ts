import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import {
  UpdateChannelVibesTokenPriceRangeMutation,
  UpdateChannelVibesTokenPriceRangeMutationVariables,
} from "../../generated/graphql";

const UPDATE_CHANNEL_VIBES_TOKEN_PRICE_RANGE_MUTATION = gql`
  mutation UpdateChannelVibesTokenPriceRange(
    $data: UpdateChannelVibesTokenPriceRangeInput!
  ) {
    updateChannelVibesTokenPriceRange(data: $data) {
      vibesTokenPriceRange
      id
    }
  }
`;

const useUpdateChannelVibesTokenPriceRange = ({
  onError,
}: {
  onError?: (errors?: GraphQLErrors) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdateChannelVibesTokenPriceRangeMutation,
    UpdateChannelVibesTokenPriceRangeMutationVariables
  >(UPDATE_CHANNEL_VIBES_TOKEN_PRICE_RANGE_MUTATION);

  const updateChannelVibesTokenPriceRange = useCallback(
    async (data) => {
      setLoading(true);

      const mutationResult = await mutate({ variables: { data } });

      if (
        mutationResult.errors ||
        !mutationResult.data ||
        !mutationResult.data.updateChannelVibesTokenPriceRange
      ) {
        onError && onError(mutationResult.errors);
        setLoading(false);
        return;
      }

      setLoading(false);
    },
    [mutate, onError]
  );

  return { updateChannelVibesTokenPriceRange, loading };
};

export default useUpdateChannelVibesTokenPriceRange;
