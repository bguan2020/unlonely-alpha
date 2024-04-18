import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../../apiClient/hooks";
import {
  UpdateTempTokenHasHitTotalSupplyThresholdMutation,
  UpdateTempTokenHasHitTotalSupplyThresholdMutationVariables,
} from "../../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const MUTATION = gql`
  mutation UpdateTempTokenHasHitTotalSupplyThreshold(
    $data: UpdateTempTokenHasHitTotalSupplyThresholdInput!
  ) {
    updateTempTokenHasHitTotalSupplyThreshold(data: $data)
  }
`;

const useUpdateTempTokenHasHitTotalSupplyThreshold = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdateTempTokenHasHitTotalSupplyThresholdMutation,
    UpdateTempTokenHasHitTotalSupplyThresholdMutationVariables
  >(MUTATION);

  const updateTempTokenHasHitTotalSupplyThreshold = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              tokenAddressesSetTrue: data.tokenAddressesSetTrue as string[],
              tokenAddressesSetFalse: data.tokenAddressesSetFalse as string[],
              chainId: data.chainId as number,
            },
          },
        });

        const res =
          mutationResult?.data?.updateTempTokenHasHitTotalSupplyThreshold;
        if (res) {
          console.log("updateTempTokenHasHitTotalSupplyThreshold success", res);
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log(
          "updateTempTokenHasHitTotalSupplyThreshold",
          JSON.stringify(e, null, 2)
        );
      }
    },
    [mutate, onError]
  );

  return { updateTempTokenHasHitTotalSupplyThreshold, loading };
};

export default useUpdateTempTokenHasHitTotalSupplyThreshold;
