import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../../apiClient/hooks";
import {
  UpdateTempTokenIsAlwaysTradeableMutation,
  UpdateTempTokenIsAlwaysTradeableMutationVariables,
} from "../../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const MUTATION = gql`
  mutation UpdateTempTokenIsAlwaysTradeable(
    $data: UpdateTempTokenIsAlwaysTradeableInput!
  ) {
    updateTempTokenIsAlwaysTradeable(data: $data)
  }
`;

const useUpdateTempTokenIsAlwaysTradeable = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdateTempTokenIsAlwaysTradeableMutation,
    UpdateTempTokenIsAlwaysTradeableMutationVariables
  >(MUTATION);

  const updateTempTokenIsAlwaysTradeable = useCallback(
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

        const res = mutationResult?.data?.updateTempTokenIsAlwaysTradeable;
        if (res) {
          console.log("updateTempTokenIsAlwaysTradeable success", res);
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log(
          "updateTempTokenIsAlwaysTradeable",
          JSON.stringify(e, null, 2)
        );
      }
    },
    [mutate, onError]
  );

  return { updateTempTokenIsAlwaysTradeable, loading };
};

export default useUpdateTempTokenIsAlwaysTradeable;
